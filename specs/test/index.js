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
var util = require('util');
var thriftrw = require('thriftrw');

test('reify and uglify', function t(assert) {
    _.each([
        [
            specs.AStruct({
                name: 'Named',
                fields: [
                    specs.AField({id: 1, name: 'name', type: specs.AString})
                ]
            }),
            {name: 'lol'},
            thriftrw.TStruct([thriftrw.TField(thriftrw.TYPE.STRING, 1, new Buffer([108, 111, 108]))])
        ],
        [
            specs.AList(specs.AInt32),
            [1, 2, 3],
            thriftrw.TList(thriftrw.TYPE.I32, [1, 2, 3])
        ],
        [
            specs.AMap(specs.AString, specs.AInt32),
            {foo: 1, bar: 2},
            thriftrw.TMap(thriftrw.TYPE.STRING, thriftrw.TYPE.I32, [
                thriftrw.TPair(new Buffer([102, 111, 111]), 1),
                thriftrw.TPair(new Buffer([97, 98, 114]), 2)
            ])
        ],
        [
            specs.AMap(specs.AEnum([
                    {id: {name: 'foo'}, value: 1},
                    {id: {name: 'bar'}, value: 2}
                ]), specs.AInt32),
            {foo: 1, bar: 2},
            thriftrw.TMap(thriftrw.TYPE.I32, thriftrw.TYPE.I32, [
                thriftrw.TPair(new Buffer([102, 111, 111]), 1),
                thriftrw.TPair(new Buffer([97, 98, 114]), 2)
            ])
        ],
        [
            specs.AMap(specs.AInt32, specs.AString),
            {1: 'foo', 2: 'bar'},
            thriftrw.TMap(thriftrw.TYPE.I32, thriftrw.TYPE.STRING, [
                thriftrw.TPair(1, new Buffer([102, 111, 111])),
                thriftrw.TPair(2, new Buffer([97, 98, 114]))
            ])
        ],
        [
            specs.ASet(specs.AStruct({
                fields: [
                  specs.AField({id: 1, name: 'foo', type: specs.AInt32})
                ]
            })),
            [{foo: 1}, {foo: 2}],
            thriftrw.TList(
                thriftrw.TYPE.STRUCT, [
                  thriftrw.TStruct([thriftrw.TField(thriftrw.TYPE.I32, 1, 1)]),
                  thriftrw.TStruct([thriftrw.TField(thriftrw.TYPE.I32, 1, 2)])
                ]
            )
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

        var t = spec.uglify(val);
        if (t.err) {
            throw t.err;
        }
        var raw = t.value;
        debug('raw', util.inspect(raw, {colors: true, depth: 999}));

        var s = spec.reify(raw);
        if (s.err) {
            throw s.err;
        }
        var back = s.value;
        debug('back', util.inspect(back, {colors: true, depth: 999}));

        assert.deepEqual(back, val);


        if(pair[2]) {
            debugger;
            var rwObj = pair[2];
            var re = spec.reify(rwObj);
            var ug = spec.uglify(re.value);
            assert.deepEqual(rwObj, ug.value);
        }
    });
    assert.end();
});
