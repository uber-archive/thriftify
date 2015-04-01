// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var _ = require('lodash');
var thriftrw = require('thriftrw');
var TField = thriftrw.TField;
var TYPE = thriftrw.TYPE;
var util = require('util');

function AField(opts) {
    if (!(this instanceof AField)) {
        return new AField(opts);
    }
    opts = opts || {};
    this.id = opts.id;
    this.name = opts.name;
    this.type = opts.type;
    this.required = opts.required || false;
    // TODO: handle defaultValue
    this.defaultValue = opts.defaultValue || null;
}

function AStruct(opts) {
    if (!(this instanceof AStruct)) {
        return new AStruct(opts);
    }
    this.typeid = TYPE.STRUCT;

    if (_.isUndefined(opts.fields)) {
        throw new Error('AStruct requires fields');
    }
    this.name = opts.name || null;
    this.fields = opts.fields;
    this.fieldsById = _.indexBy(this.fields, 'id');
    this.fieldsByName = _.indexBy(this.fields, 'name');
}

AStruct.prototype.reify = function reify(tstruct) {
    var self = this;
    return _.reduce(tstruct.fields, function reduce(result, tfield) {
        var afield = self.fieldsById[tfield.id];
        if (!afield) {
            return result;
        }
        if (afield.type.typeid !== tfield.typeid) {
            throw new Error(util.format(
                'AStruct::reify expects field %d typeid %d; received %d',
                tfield.id, afield.type.typeid, tfield.typeid));
        }
        result[afield.name] = afield.type.reify(tfield.val);
        return result;
    }, {});
};

function isNone(obj) {
    return _.isNull(obj) || _.isUndefined(obj);
}

AStruct.prototype.uglify = function uglify(struct) {
    if (!_.isPlainObject(struct)) {
        throw new Error(util.format('typename %s; expects plain object; received type %s constructor %s val %s',
            this.name, typeof struct, struct.constructor.name, util.inspect(struct)));
    }
    var self = this;
    // required fields
    _.each(this.fieldsByName, function(field) {
        if (field.required && isNone(struct[field.name])) {
            throw new Error(util.format('typename %s; missing required field %s',
                self.name, field.name));
        }
    });
    // uglify each field
    return _.reduce(struct, function(tstruct, val, name) {
        // ignore undefined and null fields because thrift doesn't allow null value
        if (isNone(val)) {
            return tstruct;
        }

        var afield = self.fieldsByName[name];
        if (!afield) {
            throw new Error(util.format('typename %s; unknown field %s', self.name, name));
        }
        try {
            var tfield = TField(afield.type.typeid, afield.id, afield.type.uglify(val));
        } catch (e) {
            throw new Error(util.format('typename %s; failed to uglify field name %s id %d typeid %d val %s; inner error %s',
                self.name, name, afield.id, afield.type.typeid, util.inspect(val), e.message));
        }
        tstruct.fields.push(tfield);
        return tstruct;
    }, thriftrw.TStruct());
};

module.exports.AField = AField;
module.exports.AStruct = AStruct;
