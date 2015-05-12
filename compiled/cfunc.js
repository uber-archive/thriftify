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

var CStruct = require('./cstruct').CStruct;
var CUnion = require('./cunion').CUnion;

module.exports = CFunc;

function CFunc(scope, serviceName, def) {
    var self = this;
    self.name = def.id.name;
    var prefix = serviceName + '::' + self.name;
    self.args = new CStruct(scope, {
        id: {
            name: prefix + '_args',
        },
        fields: def.fields
    });
    self.result = new CUnion(scope, {
        id: {
            name: prefix + '_result',
        },
        fields: resultFields(def)
    });
}

CFunc.prototype.wrap = function wrap(func) {
    var self = this;
    function thriftifyWrapper(buffer, callback) {
        var res = self.args.fromBufer(buffer);
        if (res.err) return callback(res.err, null);
        func(res.value, encodeResult);
        function encodeResult(err, name, value) {
            if (err) {
                // TODO: try to map err to declared throws
                callback(err, null);
            } else {
                var res = self.result.toBuffer([name || 'success', value]);
                callback(res.err, res.value);
            }
        }
    }
};

function resultFields(def) {
    var fields = def.throws || [];
    var ret = resultFieldDef(def);
    if (ret) fields.unshift(ret);
    return fields;
}

function resultFieldDef(def) {
    if (def.ft !== 'void') {
        return {
            fid: 0,
            id: {
                name: 'success',
            },
            fieldType: def.ft
        };
    } else {
        return null;
    }
}
