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

function ABoolean() {
    if (!(this instanceof ABoolean)) {
        return new ABoolean();
    }
    this.typeid = TYPE.BOOL;
}

ABoolean.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return ret.error(new Error(util.format('ABoolean::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    return ret.just(Boolean(tobj));
};

ABoolean.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'boolean') {
        return ret.error(new Error(util.format('ABoolean::uglify expects a boolean; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    return ret.just(Number(obj));
};

module.exports.ABoolean = ABoolean;
