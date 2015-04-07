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
var util = require('util');
var Result = require('../result');
var SpecError = require('./error');

function AList(etype) {
    if (!(this instanceof AList)) {
        return new AList(etype);
    }
    this.typeid = TYPE.LIST;
    this.etype = etype;
}

AList.prototype.reify = function reify(tlist) {
    if (this.etype.typeid !== tlist.etypeid) {
        return new Result(SpecError(util.format(
            'AList::reify expects typeid %d; received %d',
            this.etype.typeid, tlist.etypeid)));
    }
    var list = [];
    for (var index = 0; index < tlist.elements.length; index++) {
        var element = tlist.elements[index];
        var t = this.etype.reify(element);
        if (t.error) {
            t.error.annotate({
                type: 'alist',
                index: index,
                element: element
            });
            return t;
        }
        list[index] = t.value;
    }
    return new Result(null, list);
};

AList.prototype.uglify = function uglify(list) {
    if (!Array.isArray(list)) {
        return new Result(SpecError(
            'AList::uglify expects an array; received type %s %s val %s',
            typeof list, list.constructor.name, util.inspect(list)));
    }
    var tlist = thriftrw.TList(this.etype.typeid);
    for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var t = this.etype.uglify(element);
        if (t.error) {
            t.error.annotate({
                type: 'alist',
                index: index,
                element: element
            });
            return t;
        }
        tlist.elements[index] = t.value;
    }
    return new Result(null, tlist);
};

module.exports.AList = AList;
