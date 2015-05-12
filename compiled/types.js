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

var bufrw = require('bufrw');
var thriftrw = require('thriftrw');
var util = require('util');

var TYPE = thriftrw.TYPE;

module.exports = Types;

var TBooleanRW = thriftrw.BooleanRW;
var TSpecListRW = thriftrw.SpecListRW;

function Types() {
    var self = this;
    self.byName = {};

    self.byName.bool = {
        name: 'bool',
        typeid: TYPE.BOOL,
        rw: TBooleanRW
    };

    self.byName.byte = {
        name: 'byte',
        typeid: TYPE.BYTE,
        rw: bufrw.UInt8
    };

    self.byName.i16 = {
        name: 'i16',
        typeid: TYPE.I16,
        rw: bufrw.Int16BE
    };

    self.byName.i32 = {
        name: 'i32',
        typeid: TYPE.I32,
        rw: bufrw.Int32BE
    };

    self.byName.i64 = {
        name: 'i64',
        typeid: TYPE.I64,
        rw: bufrw.FixedWidth(8)
    };

    self.byName.double = {
        name: 'double',
        typeid: TYPE.DOUBLE,
        rw: bufrw.DoubleBE
    };

    self.byName.binary = {
        name: 'binary',
        typeid: TYPE.STRING,
        rw: bufrw.VariableBuffer(bufrw.UInt32BE)
    };

    self.byName.string = {
        name: 'string',
        typeid: TYPE.STRING,
        rw: bufrw.String(bufrw.UInt32BE)
    };
}

Types.prototype.getByName = function getByName(name) {
    var self = this;
    var type = self.byName[name];
    if (!type) {
        throw new Error(util.format('type %s not found', name));
    }
    return type;
};

Types.prototype.define = function define(name, type) {
    var self = this;
    if (self.byName[name]) {
        throw new Error(util.format('type %s already exists', name));
    }
    self.byName[name] = type;
    return type;
};

Types.prototype.resolve = function resolve(def) {
    var self = this;
    switch (def.type) {

        case 'Identifier':
            return self.getByName(def.name);

        case 'List': // List<T>
            var T = self.resolve(def.fieldType);
            return new CList(T);

        case 'Map': // Map<K, V>
            var K = self.resolve(def.left);
            var V = self.resolve(def.right);
            return new CMap(K, V);

        // TODO:
        // - const
        // - typedef
        // - Set

        default:
            throw new Error(util.format('unknown type %s', def.type));
    }
};

function CList(T) {
    this.name = 'List<' + T.name + '>';
    this.typeid = TYPE.LIST;
    this.rw = new TSpecListRW(T);
}

function CMap(K, V) {
    this.name = 'Map<' + K.name + ', ' + V.name + '>';
    this.typeid = TYPE.MAP;
    if (K.name === 'string') {
        this.maprw = new thriftrw.SpecMapObjRW(K, V);
    } else {
        this.maprw = new thriftrw.SpecMapPairsRW(K, V);
    }
    // TODO use es6-map version:
    // this.maprw = new thriftrw.SpecMapRW(FIXME_MAP_CONS, K, V);
}
