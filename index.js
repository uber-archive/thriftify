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

var Spec = require('./compiler/spec');
var grammar = require('./grammar');
var thriftrw = require('thriftrw');
var bufrw = require('bufrw/interface');

function fromBufferResult(buffer, spec, typeName) {
    var typeResult = spec.getTypeResult(typeName);
    if (typeResult.err) {
        return typeResult;
    }
    var type = typeResult.value;
    var rawResult = bufrw.fromBufferResult(thriftrw.TStructRW, buffer);
    if (rawResult.err) {
        return rawResult;
    }
    var rawValue = rawResult.value;
    return type.reify(rawValue);
}

function toBufferResult(object, spec, typeName) {
    var typeResult = spec.getTypeResult(typeName);
    if (typeResult.err) {
        return typeResult;
    }
    var type = typeResult.value;
    var uglifiedResult = type.uglify(object);
    if (uglifiedResult.err) {
        return uglifiedResult;
    }
    var uglified = uglifiedResult.value;
    return bufrw.toBufferResult(thriftrw.TStructRW, uglified);
}

function fromBuffer(buffer, spec, typename) {
    return fromBufferResult(buffer, spec, typename).toValue();
}

function toBuffer(obj, spec, typename) {
    return toBufferResult(obj, spec, typename).toValue();
}

function createSpec(syntax) {
    var spec = new Spec();
    spec.processProgram(syntax);
    return spec;
}

function parseSpec(source) {
    var syntax = grammar.parse(source);
    return createSpec(syntax);
}

function readSpecSync(specFile) {
    var syntax = grammar.parseFileSync(specFile);
    return createSpec(syntax);
}

function readSpec(specFile, callback) {
    grammar.parseFile(specFile, handleSource);
    function handleSource(err, syntax) {
        if (err) {
            return callback(err);
        }
        var spec = createSpec(syntax);
        callback(null, spec);
    }
}

module.exports.fromBufferResult = fromBufferResult;
module.exports.toBufferResult = toBufferResult;
module.exports.fromBuffer = fromBuffer;
module.exports.toBuffer = toBuffer;
module.exports.readSpecSync = readSpecSync;
module.exports.readSpec = readSpec;
module.exports.parseSpec = parseSpec;

module.exports.newSpec = readSpecSync; // XXX deprecated
