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
var TYPE = require('thriftrw/TYPE');

module.exports = CEnum;

function CEnum(scope, def) {
    var self = this;
    self.name = self.id.name;
    self.typeid = TYPE.I32;
    self.rw = bufrw.Base(
        bufrw.UInt32BE.byteLength,
        readEnumFrom,
        writeEnumInto);
    self.rw.width = bufrw.UInt32BE.width;
    self.namesToValues = {};
    self.valuesToNames = {};

    var definitions = def.enumDefinitions;

    var value = 0;
    for (var index = 0; index < definitions.length; index++) {
        var definition = definitions[index];
        var name = definition.id.name;
        value = definition.value !== null ? definition.value : value;
        if (self.namesToValues[name] !== undefined) {
            throw new Error('Can\'t create enum with duplicate name ' + name + ' for value ' + value);
        }
        if (value > 0x7fffffff) {
            throw new Error('Can\'t create enum with value out of bounds ' + value + ' for name ' + name);
        }
        self.namesToValues[name] = value;
        self.valuesToNames[value] = name;
        value++;
    }

    scope.types.define(self.name, self);

    function readEnumFrom(buffer, offset) {
        return self.readFrom(buffer, offset);
    }

    function writeEnumInto(value, buffer, offset) {
        return self.writeInto(value, buffer, offset);
    }
}

CEnum.prototype.readFrom = function readFrom(buffer, offset) {
    var self = this;
    var res = bufrw.UInt32BE.readFrom(buffer, offset);
    if (!res.err) {
        res.value = self.valuesToNames[res.value];
        if (res.value === undefined) {
            res.err = new Error('invalid enum value'); // TODO: typed error
        }
    }
    return res;
};

CEnum.prototype.writeInto = function writeInto(value, buffer, offset) {
    var self = this;
    value = self.namesToValues[value];
    if (value === undefined) {
        return bufrw.WriteResult.error(new Error('invalid enum name'), offset); // TODO: typed error
    } else {
        return bufrw.UInt32BE.writeInto(value, buffer, offset);
    }
};
