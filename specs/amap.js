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
var TPair = thriftrw.TPair;
var TYPE = thriftrw.TYPE;
var util = require('util');
var owns = Object.prototype.hasOwnProperty;

function AMap(ktype, vtype) {
    if (!(this instanceof AMap)) {
        return new AMap(ktype, vtype);
    }
    this.typeid = TYPE.MAP;

    if (ktype.typeid !== TYPE.STRING) {
        throw new Error('key type has to be TYPE.STRING; received %d', ktype.typeid);
    }
    this.ktype = ktype;
    this.vtype = vtype;
}

AMap.prototype.reify = function reify(tmap) {
    if (this.ktype.typeid !== tmap.ktypeid) {
        throw new Error(util.format('AMap::reify expects ktypeid %d; received %d',
            this.ktype.typeid, tmap.ktypeid));
    }
    if (this.vtype.typeid !== tmap.vtypeid) {
        throw new Error(util.format('AMap::reify expects vtypeid %d; received %d',
            this.vtype.typeid, tmap.vtypeid));
    }

    var map = {};
    for (var index = 0; index < tmap.pairs.length; index++) {
        var pair = tmap.pairs[index];
        var key = this.ktype.reify(pair.key);
        if (owns.call(map, key)) {
            throw new Error(util.format('duplicate key %s', key));
        }
        var val = this.vtype.reify(pair.val);
        map[key] = val;
    }
    return map;
};

AMap.prototype.uglify = function uglify(map) {
    if (!map || typeof map !== 'object' || Object.getPrototypeOf(map) !== Object.prototype) {
        throw new Error(util.format('AMap::uglify expects a plain object; received type %s %s val %s',
            typeof map, map.constructor.name, util.inspect(map)));
    }
    var tmap = thriftrw.TMap(this.ktype.typeid, this.vtype.typeid);
    var keys = Object.keys(map);
    for (var index = 0; index < keys.length; index++) {
        var key = keys[index];
        var value = map[key];
        tmap.pairs[index] = TPair(this.ktype.uglify(key), this.vtype.uglify(value));
    }
    return tmap;
};

module.exports.AMap = AMap;
