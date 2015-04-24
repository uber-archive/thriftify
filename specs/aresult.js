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
var util = require('util');
var Result = require('../result');
var SpecError = require('./error');
var AField = require('./astruct').AField;
var AStruct = require('./astruct').AStruct;
var bufrw = require('bufrw/interface');

function AResult(name, success, exceptions) {
    if (!(this instanceof AResult)) {
        return new AResult(name, success, exceptions);
    }
    var fields = [];
    if (success) {
        fields.push(new AField({
            id: 0,
            name: 'success',
            type: success
        }));
    }
    if (exceptions) {
        for (var i = 0; i < exceptions.length; i++) {
            fields.push(exceptions[i]);
        }
    }
    this.struct = new AStruct({
        name: name,
        fields: fields
    });
}

AResult.prototype.uglify = function uglify(result) {
    var name = null;
    for (var prop in result) {
        if (result[prop] !== null) {
            if (name !== null) {
                return new Result(new SpecError(util.format(
                    'typename %s; more than one result type given (first: %s second: %s)',
                    this.struct.name, name, prop)));
            }
            name = prop;
        }
    }
    var struct = {};
    if (name) {
        var field = this.struct.fieldsByName[name];
        if (!field) {
            return new Result(new SpecError(util.format(
                'typename %s; invalid result type name: %j',
                this.struct.name, name)));
        } else {
            struct[field.name] = result[name];
        }
    } else if (this.struct.fieldsByName.success) {
        return new Result(new SpecError(util.format(
            'typename %s; missing result data',
            this.struct.name)));
    }
    return this.struct.uglify(struct);
};

AResult.prototype.reify = function reify(tstruct) {
    var res = this.struct.reify(tstruct);
    if (res.err) return res;
    var tresult = res.value;

    var name = null;
    for (var prop in tresult) {
        if (tresult[prop] !== null) {
            if (name !== null) {
                return new Result(new SpecError(util.format(
                    'typename %s; more than one result type given (first: %s second: %s)',
                    this.struct.name, name, prop)));
            }
            name = prop;
        }
    }

    var result = {};
    if (name) {
        var field = this.struct.fieldsByName[name];
        if (!field) {
            return new Result(new SpecError(util.format(
                'typename %s; invalid result type name: %j',
                this.struct.name, name)));
        } else {
            result[field.name] = tresult[name];
        }
    } else if (this.struct.success) {
        return new Result(new SpecError(util.format(
            'typename %s; missing result data',
            this.struct.name)));
    }

    return new Result(null, result);
};

AResult.prototype.fromBuffer = function fromBuffer(buffer) {
    var self = this;
    var rawResult = bufrw.fromBufferResult(thriftrw.TStructRW, buffer);
    if (rawResult.err) {
        return rawResult;
    }
    var raw = rawResult.value;
    return self.reify(raw);
};

AResult.prototype.toBuffer = function toBuffer(value) {
    var self = this;
    var cookedResult = self.uglify(value);
    if (cookedResult.err) {
        return cookedResult;
    }
    var cooked = cookedResult.value;
    return bufrw.toBufferResult(thriftrw.TStructRW, cooked);
};

module.exports.AResult = AResult;
