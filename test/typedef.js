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

var path = require('path');
var thriftify = require('../');
var test = require('tape');

test('It should support typedefs', function t(assert) {
    var typedefSpec = thriftify.readSpecSync(path.join(__dirname, 'typedef.thrift'));
    var inStruct = {
        bar: 'DONT PANIC'
    };
    var buffer = thriftify.toBuffer(inStruct, typedefSpec, 'MyStruct');
    var outStruct = thriftify.fromBuffer(buffer, typedefSpec, 'MyStruct');
    assert.deepEquals(outStruct, inStruct);
    assert.end();
});

test('It should throw a not implemented error for compound typedefs', function t(assert) {
    assert.throws(function() {
        var typedefSpec = thriftify.readSpecSync(path.join(__dirname, 'typedef-compound.thrift'));
    }, /NotImplemented/);
    assert.end();
});

test('It should not add a typedef for an invalid type', function t(assert) {
    assert.throws(function testTypedef() {
        thriftify.readSpecSync(path.join(__dirname, 'typedef-invalid.thrift'));
    });
    assert.end();
});
