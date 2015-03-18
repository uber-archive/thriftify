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

var _ = require('lodash');
var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;

function AList(etype) {
    if (!(this instanceof AList)) {
        return new AList(etype);
    }
    this.typeid = TYPE.LIST;
    this.etype = etype;
}

AList.prototype.reify = function reify(tlist) {
    if (this.etype.typeid !== tlist.etypeid) {
        return [];
    }
    var self = this;
    return _.reduce(tlist.elements, function reduce(list, ele) {
        list.push(self.etype.reify(ele));
        return list;
    }, []);
};

AList.prototype.uglify = function uglify(list) {
    var self = this;
    return _.reduce(list, function reduce(tlist, ele) {
        tlist.elements.push(self.etype.uglify(ele));
        return tlist;
    }, thriftrw.TList(this.etype.typeid));
};

module.exports.AList = AList;
