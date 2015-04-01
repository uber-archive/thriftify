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
var tape = require('tape');

tape('round trip an enum', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: 'ME3_D1'};
    var buffer = thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    var outStruct = thriftify.fromBuffer(buffer, enumSpec, 'MyStruct');
    assert.deepEquals(outStruct, inStruct);
    assert.end();
});

tape('first enum is 0 by default', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: 'ME3_0'};
    var buffer = thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    var expected = new Buffer([
        0x08, 0x00, // struct
        0x03, // field number 3
        0x00, 0x00, 0x00, 0x00, // value 0
        0x00
    ]);
    assert.deepEqual(buffer, expected);
    assert.end();
});

tape('count resumes from previous enum', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: 'ME3_N1'};
    var buffer = thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    var expected = new Buffer([
        0x08, 0x00, // type struct, index 0
        0x03, // field~1 3
        0xff, 0xff, 0xff, 0xff, // value~4 -1
        0x00, // value 0
    ]);
    assert.deepEqual(buffer, expected);
    assert.end();
});

tape('duplicate name permitted', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: 'ME3_D0'};
    var buffer = thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    var expected = new Buffer([
        0x08, 0x00, // type struct, index 0
        0x03, // field~1 3
        0x00, 0x00, 0x00, 0x00, // value~4 0
        0x00, // value 0
    ]);
    assert.deepEqual(buffer, expected);
    assert.end();
});

tape('duplicate name returns in normal form', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: 'ME3_D0'};
    var buffer = thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    var outStruct = thriftify.fromBuffer(buffer, enumSpec, 'MyStruct');
    assert.deepEqual(outStruct, {
        me3_d1: 'ME3_D0'
    });
    assert.end();
});

tape('throws on name collision', function t(assert) {
    assert.throws(function throws() {
        thriftify.readSpecSync(path.join(__dirname, 'enum-collision.thrift'));
    });
    assert.end();
});

tape('throws on overflow', function t(assert) {
    assert.throws(function throws() {
        thriftify.readSpecSync(path.join(__dirname, 'enum-overflow.thrift'));
    });
    assert.end();
});

tape('can\'t encode non-name', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: -1};
    assert.throws(function () {
        var buffer = thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    });
    assert.end();
});

tape('can\'t encode unknown name', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var inStruct = {me3_d1: 'BOGUS'};
    assert.throws(function () {
        thriftify.toBuffer(inStruct, enumSpec, 'MyStruct');
    });
    assert.end();
});

tape('can\'t decode unknown number', function t(assert) {
    var enumSpec = thriftify.readSpecSync(path.join(__dirname, 'enum.thrift'));
    var buffer = new Buffer([
        0x08, 0x00, // struct
        0x03, // field number 3
        0x00, 0x00, 0x00, 0x0b, // value 11
        0x00
    ]);
    assert.throws(function () {
        thriftify.fromBuffer(buffer, enumSpec, 'MyStruct');
    });
    assert.end();
});
