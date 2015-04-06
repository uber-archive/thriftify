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

var thriftrw = require('thriftrw');
var TField = thriftrw.TField;
var TYPE = thriftrw.TYPE;
var util = require('util');
var ret = require('./ret');

var validNameExpression = /^[$A-Z_][0-9A-Z_$]*$/i;

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

    if (opts.fields === undefined) {
        throw new Error('AStruct requires fields');
    }
    this.name = null;
    this.fields = opts.fields;
    this.fieldsById = {};
    this.fieldsByName = {};
    this.fieldNames = [];
    var allValidNames = true;
    for (var index = 0; index < this.fields.length; index++) {
        var field = this.fields[index];
        this.fieldsById[field.id] = field;
        this.fieldsByName[field.name] = field;
        this.fieldNames[index] = field.name;
        var validName = validNameExpression.test(field.name);
        allValidNames = allValidNames && validName;
    }

    this.name = opts.name || this.fieldNames.join('_');
    var validName = validNameExpression.test(this.name);
    allValidNames = allValidNames && validName;

    if (allValidNames) {
        this.structConstructor = createConstructor(this.name, this.fieldNames);
    } else {
        this.structConstructor = Object;
    }
}

function createConstructor(name, fieldNames) {
    var source;
    source = '(function Thriftify_' + name + '() {\n';
    for (var index = 0; index < fieldNames.length; index++) {
        var fieldName = fieldNames[index];
        source += '    this.' + fieldName + ' = null;\n';
    }
    source += '})\n';
    // eval is an operator that captures the lexical scope of the calling
    // function and deoptimizes the lexical scope.
    // By using eval in an expression context, it loses this second-class
    // capability and becomes a first-class function.
    // (0, eval) is one way to use eval in an expression context.
    return (0, eval)(source);
}

AStruct.prototype.typeid = TYPE.STRUCT;

AStruct.prototype.reify = function reify(tstruct) {
    var result = new this.structConstructor();
    for (var index = 0; index < tstruct.fields.length; index++) {
        var tfield = tstruct.fields[index];
        var afield = this.fieldsById[tfield.id];
        if (!afield) {
            continue;
        }
        if (afield.type.typeid !== tfield.typeid) {
            return ret.error(new Error(util.format(
                'AStruct::reify expects field %d typeid %d; received %d',
                tfield.id, afield.type.typeid, tfield.typeid)));
        }
        var t = afield.type.reify(tfield.val);
        if (t.error) {
            return ret.chain(t, {
                type: 'astruct',
                field: afield
            });
        }
        result[afield.name] = t.value;
    }
    return ret.just(result);
};

AStruct.prototype.uglify = function uglify(struct) {
    var tstruct = new thriftrw.TStruct();
    for (var index = 0; index < this.fields.length; index++) {
        var field = this.fields[index];
        var value = struct[field.name];
        if (value == null) {
            if (field.required) {
                return ret.error(new Error(util.format('typename %s; missing required field %s',
                    this.name, field.name)));
            }
        } else {
            var t = field.type.uglify(value);
            if (t.error) {
                return ret.chain(t, {
                    type: 'astruct',
                    field: field
                });
            }
            var tvalue = t.value;
            var tfield = new TField(field.type.typeid, field.id, tvalue);
            tstruct.fields.push(tfield);
        }
    }
    return ret.just(tstruct);
};

module.exports.AField = AField;
module.exports.AStruct = AStruct;
