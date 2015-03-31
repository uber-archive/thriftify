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
var assert = require('assert');
var specs = require('../specs');

var BUILTIN_TYPES = {
    'string': specs.AString,
    'bool': specs.ABool,
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

    return specs.AField(fieldId, fieldName, fieldType);
};

Spec.prototype.processFunction = function processFunction(obj, ctx) {
    var self = this;
    var serviceName = ctx.service;
    var funcName = obj.id.name;

    if (_.includes(this.servicesAndFunctions[serviceName], serviceName)) {
        throw new Error(util.format(
            'service %s function %s already exists', serviceName, funcName));
    }
    this.servicesAndFunctions[serviceName].push(funcName);

    var typePrefix = util.format('%s::%s', serviceName, funcName);
    this.setType(util.format('%s_args', typePrefix),
        specs.AStruct(_.map(obj.fields, this.parseField.bind(this))));

    var resultFields = [];
    if (obj.ft !== 'void') {
        resultFields.push(specs.AField(0, 'success', this.lookupType(obj.ft)));
    }
    if (obj.throws) {
        _.each(obj.throws.fields, function(i) {
            resultFields.push(self.parseField(i));
        });
    }

    // TODO: add exceptions in _result struct
    this.setType(util.format('%s_result', typePrefix),
        specs.AStruct(resultFields));
};

Spec.prototype.processStruct = function processStruct(obj) {
    var astruct = specs.AStruct(_.map(obj.fields, this.parseField.bind(this)));
    var name = obj.id.name;
    this.setType(name, astruct);
};

Spec.prototype.processService = function processService(obj, ctx) {
    var serviceName = obj.id.name;
    if (_.has(this.servicesAndFunctions, serviceName)) {
        throw new Error(util.format('service %s already exists', serviceName));
    }
    ctx.service = serviceName;
    this.servicesAndFunctions[serviceName] = [];
};

Spec.prototype.process = function process(obj, ctx) {
    if (obj.type === 'Service') {
        this.processService(obj, ctx);
    } else if (obj.type === 'function') {
        this.processFunction(obj, ctx);
    } else if (obj.type === 'Exception') {
        this.processStruct(obj, ctx);
    } else if (obj.type === 'Struct') {
        this.processStruct(obj, ctx);
    }
};

Spec.prototype.walk = function walk(obj, ctx) {
    assert(typeof obj === 'object');

    if (_.isPlainObject(obj)) {
        ctx = _.clone(ctx) || {};
        this.process(obj, ctx);
    }

    var self = this;
    // obj is either object or array
    _.each(obj, function each(val) {
        if (typeof val === 'object') {
            self.walk(val, ctx);
        }
    });
};

module.exports = Spec;
