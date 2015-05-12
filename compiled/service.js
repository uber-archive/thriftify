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

var util = require('util');

var CFunc = require('./cfunc');

module.exports = Service;

function Service(scope, def) {
    var self = this;
    self.name = def.id.name;
    self.funcNames = [];
    self.functions = [];

    if (scope.services[self.name]) {
        throw new Error(util.format(
            'service %s already exists',
            self.name));
    }
    scope.services[self.name] = self;

    for (var i = 0; i < def.functions.length; i++) {
        var func = def.functions[i];
        var funcName = func.id.name;
        if (self.funcNames.indexOf(funcName) >= 0) {
            throw new Error(util.format(
                'service %s function %s already exists',
                self.name, funcName));
        }
        var cfunc = new CFunc(scope, self.name, func);
        self.funcNames.push(cfunc.name);
        self.functions.push(cfunc);
    }
}

Service.prototype.wrapFunction = function wrapFunction(funcName, func) {
    var self = this;
    var cfunc = self.functions[funcName];
    if (!cfunc) {
        throw new Error('no such function declaration'); // TODO typed error
    }
    return cfunc.wrap(func);
};
