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

module.exports.CStruct = CStruct;
module.exports.CField = CField;

function CStruct(scope, def) {
    var self = this;
    self.name = def.id && def.id.name || '';
    self.fields = [];

    var fieldNames = Object.keys(def.fields);
    for (var i = 0; i < fieldNames.length; i++) {
        var fieldDef = def.fields[fieldNames[i]];
        self.fields[i] = new CField(scope, fieldDef);
    }

    self.typeid = thriftrw.TYPE.STRUCT;
    self.rw = new thriftrw.SpecStructRW(self.name, self.fields);

    if (self.name) {
        scope.types.define(self.name, self);
    }
}

CStruct.prototype.fromBuffer = function fromBuffer(buffer) {
    var self = this;
    return bufrw.fromBufferResult(self.rw, buffer);
};

CStruct.prototype.toBuffer = function toBuffer(value) {
    var self = this;
    return bufrw.toBufferResult(self.rw, value);
};

function CField(scope, def) {
    var T = scope.types.resolve(def.fieldType);

    var self = this;
    self.name = def.id.name;
    self.id = def.fid;
    self.typeid = T.typeid;
    self.rw = T.rw;

    // TODO: handle required and defaultValue
    self.required = false;
    self.defaultValue = null;
}
