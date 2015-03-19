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
var util = require('util');

function AMap(ktype, vtype) {
    if (!(this instanceof AMap)) {
        return new AMap(ktype, vtype);
    }
    this.typeid = TYPE.MAP;
    this.ktype = ktype;
    this.vtype = vtype;
}

AMap.prototype.reify = function reify(tmap) {
    if (this.ktype.typeid !== tmap.ktypeid) {
        throw new Error(util.format(
            'AMap::reify expects ktypeid %d; received %d',
            this.ktype.typeid, tmap.ktypeid));
    }
    if (this.vtype.typeid !== tmap.vtypeid) {
        throw new Error(util.format(
            'AMap::reify expects vtypeid %d; received %d',
            this.vtype.typeid, tmap.vtypeid));
    }

    var self = this;
    return _.reduce(tmap.pairs, function reduce(map, pair) {
        var key = self.ktype.reify(pair[0]);
        var val = self.vtype.reify(pair[1]);
        map[key] = val;
        return map;
    }, {});
};

AMap.prototype.uglify = function uglify(map) {
    var self = this;
    return _.reduce(map, function reduce(tmap, val, key) {
        tmap.pairs.push([self.ktype.uglify(key), self.vtype.uglify(val)]);
        return tmap;
    }, thriftrw.TMap(this.ktype.typeid, this.vtype.typeid));
};

module.exports.AMap = AMap;
