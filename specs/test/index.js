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

var specs = require('../');
var _ = require('lodash');
var test = require('tape');
var debug = require('debug')('test');

test('reify and uglify', function t(assert) {
    _.each([
        [
            specs.AStruct({
                fields: [
                    specs.AField({id: 1, name: 'name', type: specs.AString})
                ]
            }),
            {name: 'lol'}
        ],
        [
            specs.AList(specs.AInt32),
            [1, 2, 3]
        ],
        [
            specs.AStruct({
                fields: [
                    specs.AField({id: 1, name: 'a', type: specs.AString}),
                    specs.AField({id: 2, name: 'b', type: specs.AInt32}),
                    specs.AField({
                        id: 3,
                        name: 'x',
                        type: specs.AStruct({
                            fields: [
                                specs.AField({id: 1, name: 'c', type: specs.AString}),
                                specs.AField({id: 2, name: 'd', type: specs.AString})
                            ]
                        })
                    })
                ]
            }),
            {a: 'hello', b: 123, x: {c: '[', d: ']'}}
        ]
    ], function each(pair) {
        var spec = pair[0];
        var val = pair[1];

        var raw = spec.uglify(val);
        debug('raw', raw);
        var back = spec.reify(raw);
        debug('back', back);

        assert.deepEqual(val, back);
    });
    assert.end();
});
