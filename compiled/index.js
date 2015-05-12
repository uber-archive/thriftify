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

// TODO: unjank func scope wrt service

var CEnum = require('./cenum');
var CField = require('./cstruct').CField;
var CFunc = require('./cfunc');
var CStruct = require('./cstruct').CStruct;
var CUnion = require('./cunion').CUnion;
var Scope = require('./scope');
var Service = require('./service');

module.exports.CEnum = CEnum;
module.exports.CField = CField;
module.exports.CFunc = CFunc;
module.exports.CStruct = CStruct;
module.exports.CUnion = CUnion;
module.exports.Scope = Scope;
module.exports.Service = Service;
module.exports.compile = compile;

function compile(root) {
    if (root.type !== 'Program') {
        throw new Error('expects type Program; received ' + root.type);
    }
    var scope = new Scope();
    root.definitions.forEach(function each(def) {
        processDef(scope, def);
    });
    return scope;
}

function processDef(scope, def) {
    switch (def.type) {
        case 'Service':
            return new Service(scope, def);

        case 'Exception':
            return new CStruct(scope, def);

        case 'Struct':
            return new CStruct(scope, def);

        case 'Union':
            return new CUnion(scope, def);

        case 'Enum':
            return new CEnum(scope, def);

        default:
            throw new Error('definition type is not supported ' + def.type);
    }
}
