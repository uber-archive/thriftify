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

var util = require('util');
var _ = require('lodash');
var specs = require('../specs');
var debug = require('debug')('compiler');

var BUILTIN_TYPES = {
    'binary': specs.ABinary,
    'string': specs.AString,
    'bool': specs.ABoolean,
    'byte': specs.AByte,
    'i16': specs.AInt16,
    'i32': specs.AInt32,
    'i64': specs.AInt64,
    'double': specs.ADouble
};

function Spec() {
    this.types = _.clone(BUILTIN_TYPES);
    this.servicesAndFunctions = {};
}

Spec.prototype.getType = function getType(name) {
    var type = this.types[name];
    if (!type) {
        throw new Error(util.format('type %s not found', name));
    }
    return type;
};

Spec.prototype.setType = function setType(name, type) {
    if (this.types[name]) {
        throw new Error(util.format('type %s already exists', name));
    }
    this.types[name] = type;
};

Spec.prototype.lookupType = function lookupType(t) {
    // TODO: handle const
    // TODO: handle typedef
    // TODO: handle Set
    if (t.type === 'Identifier') {
        return this.getType(t.name);
    } else if (t.type === 'List') {
        return specs.AList(this.lookupType(t.fieldType));
    } else if (t.type === 'Map') {
        return specs.AMap(this.lookupType(t.left), this.lookupType(t.right));
    } else {
        throw new Error(util.format('unknown type %s', t.type));
    }
};

Spec.prototype.parseField = function parseField(f) {
    var fieldName = f.id.name;
    var fieldType = this.lookupType(f.fieldType);
    var fieldId = f.fid;

    return specs.AField({id: fieldId, name: fieldName, type: fieldType});
};

Spec.prototype.processStruct = function processStruct(s) {
    debug('enter struct', s);
    var astruct = specs.AStruct({fields: _.map(s.fields, this.parseField.bind(this))});
    var name = s.id.name;
    this.setType(name, astruct);
};

Spec.prototype.processFunction = function processFunction(func, opts) {
    debug('enter function', func);
    var self = this;
    var funcName = func.id.name;

    if (_.includes(opts.functions, funcName)) {
        throw new Error(util.format('service %s function %s already exists', opts.serviceName, funcName));
    }
    opts.functions.push(funcName);

    var typePrefix = util.format('%s::%s', opts.serviceName, funcName);
    this.setType(
        util.format('%s_args', typePrefix),
        specs.AStruct({
            fields: _.map(func.fields, this.parseField.bind(this))
        }));

    var resultFields = [];
    if (func.ft !== 'void') {
        resultFields.push(
            specs.AField({id: 0, name: 'success', type: this.lookupType(func.ft)})
        );
    }
    if (func.throws) {
        _.each(func.throws.fields, function(i) {
            resultFields.push(self.parseField(i));
        });
    }

    // TODO: add exceptions in _result struct
    this.setType(util.format('%s_result', typePrefix),
        specs.AStruct({fields: resultFields}));
};

Spec.prototype.processEnum = function processEnum(e) {
    var name = e.id.name;
    var entity = new specs.AEnum(e.enumDefinitions);
    this.setType(name, entity);
};

Spec.prototype.processService = function processService(svc) {
    debug('enter service', svc);
    var serviceName = svc.id.name;
    if (_.has(this.servicesAndFunctions, serviceName)) {
        throw new Error(util.format('service %s already exists', serviceName));
    }
    this.servicesAndFunctions[serviceName] = [];

    var self = this;
    _.each(svc.functions, function(func) {
        self.processFunction(func, {
            serviceName: serviceName,
            functions: self.servicesAndFunctions[serviceName]
        });
    });
};

Spec.prototype.processProgram = function(root) {
    if (root.type !== 'Program') {
        throw new Error('expects type Program; received ' + root.type);
    }
    debug('program starts');
    var self = this;
    _.each(root.definitions, function(def) {
        switch (def.type) {
            case 'Exception':
                self.processStruct(def);
                break;
            case 'Struct':
                self.processStruct(def);
                break;
            case 'Service':
                self.processService(def);
                break;
            case 'Enum':
                self.processEnum(def);
                break;
            default:
                throw new Error('definition type is not supported' + def.type);
        }
    });
};

module.exports = Spec;
