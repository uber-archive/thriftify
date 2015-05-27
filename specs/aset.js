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
var AList = require('./alist').AList;
var Result = require('../result');
var SpecError = require('./error');
var bufrw = require('bufrw/interface');
var uniq = require('uniq');
var bufferEqual = require('buffer-equal');

function ASet(etype) {
    if (!(this instanceof ASet)) {
        return new ASet(etype);
    }
    this.typeid = TYPE.SET;
    this.etype = etype;
}

util.inherits(ASet, AList);

ASet.prototype.uglify = function uglify(list) {
    var self = this;
    if (!Array.isArray(list)) {
        return new Result(SpecError(
            'ASet::uglify expects an array; received type %s %s val %s',
            typeof list, list.constructor.name, util.inspect(list)));
    }

    var tlist = thriftrw.TList(this.etype.typeid);
    var listUglified = list.map(function uglify(item) {
       return self.etype.uglify(item);
    });

    // If there are any errors, return the first.
    var errors = listUglified.filter(function findErrors(item) {
        return Boolean(item.err);
    });
    if (errors.length) {
        var error = errors[0].err;
        error.annotate({
            type: 'aset'
        });
        return new Result(error);
    }

    var values = listUglified.map(function getValue(item) {
        return item.value;
    });

    tlist.elements = uniq(values, function compare(a, b) {
        var aAsBuffer = bufrw.toBufferResult(thriftrw.getRW(self.etype.typeid), a).value;
        var bAsBuffer = bufrw.toBufferResult(thriftrw.getRW(self.etype.typeid), b).value;
        if (bufferEqual(aAsBuffer, bAsBuffer)) {
           return 0;
        }
        return 1;
    });

    return new Result(null, tlist);
};

module.exports.ASet = ASet;
