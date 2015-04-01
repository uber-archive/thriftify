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
var TYPE = thriftrw.TYPE;

module.exports.ABoolean = require('./aboolean').ABoolean();

var ANumber = require('./anumber').ANumber;
module.exports.AByte = ANumber(TYPE.BYTE);
module.exports.ADouble = ANumber(TYPE.DOUBLE);
module.exports.AInt16 = ANumber(TYPE.I16);
module.exports.AInt32 = ANumber(TYPE.I32);

module.exports.AInt64 = require('./aint64').AInt64();

module.exports.AString = require('./astring').AString();
module.exports.ABinary = require('./abinary').ABinary();

module.exports.AMap = require('./amap').AMap;
module.exports.AList = require('./alist').AList;
module.exports.AField = require('./astruct').AField;
module.exports.AStruct = require('./astruct').AStruct;
module.exports.AEnum = require('./aenum').AEnum;
