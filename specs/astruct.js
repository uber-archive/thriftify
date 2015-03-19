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
var TYPE = thriftrw.TYPE;
var assert = require('assert');
var util = require('util');

function AField(id, name, type, required) {
    if (!(this instanceof AField)) {
        return new AField(id, name, type);
    }
    this.id = id;
    this.name = name;
    this.type = type;
    // TODO: handle required
    this.required = required || false;
}

function AStruct(fields) {
    if (!(this instanceof AStruct)) {
        return new AStruct(fields);
    }
    this.typeid = TYPE.STRUCT;
    this.fields = fields || [];
    this.fieldsById = _.indexBy(fields, 'id');
    this.fieldsByName = _.indexBy(fields, 'name');
}

AStruct.prototype.reify = function reify(tstruct) {
    var self = this;
    return _.reduce(tstruct.fields, function reduce(result, tfield) {
        var afield = self.fieldsById[tfield[1]];
        if (!afield) {
            return result;
        }
        if (afield.type.typeid !== tfield[0]) {
            throw new Error(
                'AStruct::reify expects field %d typeid %d; received %d',
                tfield[1], afield.type.typeid, tfield[0]);
        }
        result[afield.name] = afield.type.reify(tfield[2]);
        return result;
    }, {});
};

AStruct.prototype.uglify = function uglify(struct) {
    assert(_.isPlainObject(struct));
    var self = this;
    return _.reduce(struct, function reduce(tstruct, val, name) {
        var afield = self.fieldsByName[name];
        if (!afield) {
            throw new Error(util.format('unknown field name %s', name));
        }
        var tfield = [afield.type.typeid, afield.id, afield.type.uglify(val)];
        tstruct.fields.push(tfield);
        return tstruct;
    }, thriftrw.TStruct());
};

module.exports.AField = AField;
module.exports.AStruct = AStruct;
