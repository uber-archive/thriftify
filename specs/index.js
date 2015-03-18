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

var APrimitive = require('./aprimitive').APrimitive;
module.exports.ABool = APrimitive(TYPE.BOOL);
module.exports.AByte = APrimitive(TYPE.BYTE);
module.exports.ADouble = APrimitive(TYPE.DOUBLE);
module.exports.AInt16 = APrimitive(TYPE.I16);
module.exports.AInt32 = APrimitive(TYPE.I32);
module.exports.AInt64 = APrimitive(TYPE.I64);
module.exports.AString = APrimitive(TYPE.STRING);

module.exports.AMap = require('./amap').AMap;
module.exports.AList = require('./alist').AList;
module.exports.AField = require('./astruct').AField;
module.exports.AStruct = require('./astruct').AStruct;
