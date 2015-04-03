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
var ret = require('./ret');

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
        return ret.error(new Error(util.format('AMap::reify expects ktypeid %d; received %d',
            this.ktype.typeid, tmap.ktypeid)));
    }
    if (this.vtype.typeid !== tmap.vtypeid) {
        return ret.error(new Error(util.format('AMap::reify expects vtypeid %d; received %d',
            this.vtype.typeid, tmap.vtypeid)));
    }

    var map = {};
    for (var index = 0; index < tmap.pairs.length; index++) {
        var t;
        var pair = tmap.pairs[index];
        t = this.ktype.reify(pair.key);
        if (t.error) {
            return ret.chain(t, {
                type: 'amap',
                key: pair.key
            });
        }
        var key = t.value;
        if (owns.call(map, key)) {
            return ret.error(new Error(util.format('duplicate key %s', key)));
        }
        t = this.vtype.reify(pair.val);
        if (t.error) {
            return ret.chain(t, {
                type: 'amap',
                val: pair.val
            });
        }
        var val = t.value;
        map[key] = val;
    }
    return ret.just(map);
};

AMap.prototype.uglify = function uglify(map) {
    if (!map || typeof map !== 'object' || Object.getPrototypeOf(map) !== Object.prototype) {
        return ret.error(new Error(util.format('AMap::uglify expects a plain object; received type %s %s val %s',
            typeof map, map.constructor.name, util.inspect(map))));
    }
    var tmap = thriftrw.TMap(this.ktype.typeid, this.vtype.typeid);
    var keys = Object.keys(map);
    for (var index = 0; index < keys.length; index++) {
        var key = keys[index];
        var t = this.ktype.uglify(key);
        if (t.error) {
            return ret.chain(t, {
                type: 'amap',
                key: key
            });
        }
        var value = map[key];
        var s = this.vtype.uglify(value);
        if (s.error) {
            return ret.chain(s, {
                type: 'amap',
                value: value
            });
        }
        tmap.pairs[index] = TPair(t.value, s.value);
    }
    return ret.just(tmap);
};

module.exports.AMap = AMap;
