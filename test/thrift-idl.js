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

var idl = require('../compiler/grammar');
var fs = require('fs');
var path = require('path');
var test = require('tape');

var extension = '.thrift';
var filenames = fs.readdirSync(__dirname);
for (var index = 0; index < filenames.length; index++) {
    var filename = filenames[index];
    var fullFilename = path.join(__dirname, filename);
    if (filename.indexOf(extension, filename.length - extension.length) > 0) {
        var source = fs.readFileSync(fullFilename, 'ascii');
        test('parse ' + filename, function t(assert) {
            try {
                idl.parse(source);
                assert.end();
            } catch (err) {
                assert.end(err);
            }
        });
    }
}

