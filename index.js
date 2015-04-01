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
var grammar = require('./compiler/grammar');
var thriftrw = require('thriftrw');
var bufrw = require('bufrw');

function fromBuffer(buffer, spec, typename) {
    var type = spec.getType(typename);
    var raw = bufrw.fromBuffer(thriftrw.TStructRW, buffer);
    var obj = type.reify(raw);
    return obj;
}

function fromBufferSafe(buffer, spec, typename, cb) {
    var obj;
    try {
        obj = fromBuffer(buffer, spec, typename);
    } catch (e) {
        return cb(e);
    }
    cb(null, obj);
}

function toBuffer(obj, spec, typename) {
    var type = spec.getType(typename);
    var raw = type.uglify(obj);
    var buf = bufrw.toBuffer(thriftrw.TStructRW, raw);
    return buf;
}

function toBufferSafe(obj, spec, typename, cb) {
    var buf;
    try {
        buf = toBuffer(obj, spec, typename);
    } catch (e) {
        return cb(e);
    }
    cb(null, buf);
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

module.exports.fromBuffer = fromBuffer;
module.exports.fromBufferSafe = fromBufferSafe;
module.exports.toBuffer = toBuffer;
module.exports.toBufferSafe = toBufferSafe;
module.exports.readSpecSync = readSpecSync;
module.exports.readSpec = readSpec;
module.exports.parseSpec = parseSpec;

module.exports.newSpec = readSpecSync; // XXX deprecated
