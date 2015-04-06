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

function AInteger(typeid) {
    if (!(this instanceof AInteger)) {
        return new AInteger(typeid);
    }
    this.typeid = typeid;
}

AInteger.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return ret.error(new Error(util.format(
            'AInteger::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    if (Math.floor(tobj) !== tobj) {
        return ret.error(new Error(util.format(
            'AInteger::reify expects an integer; received float %s', tobj)));
    }
    return ret.just(tobj);
};

AInteger.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'number') {
        return ret.error(new Error(util.format(
            'AInteger::uglify expects a number; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    if (Math.floor(obj) !== obj) {
        return ret.error(new Error(util.format(
            'AInteger::uglify expects an integer; received float %s', obj)));
    }
    return ret.just(obj);
};

module.exports.AInteger = AInteger;
