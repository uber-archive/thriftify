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

var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var ret = require('./ret');

function AInt64() {
    if (!(this instanceof AInt64)) {
        return new AInt64();
    }
    this.typeid = TYPE.I64;
}

AInt64.prototype.reify = function reify(tobj) {
    if (!(tobj instanceof Buffer)) {
        return ret.error(new Error(util.format('AInt64::reify expects a Buffer; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    if (tobj.length !== 8) {
        return ret.error(new Error(util.format('i64 has to be a Buffer of length 8; received length %d',
            tobj.length)));
    }
    return ret.just(tobj);
};

AInt64.prototype.uglify = function uglify(obj) {
    if (!(obj instanceof Buffer)) {
        return ret.error(new Error(util.format('AString::uglify expects a Buffer; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    if (obj.length !== 8) {
        return ret.error(new Error(util.format('i64 has to be a Buffer of length 8; received length %d',
            obj.length)));
    }
    return ret.just(obj);
};

module.exports.AInt64 = AInt64;
