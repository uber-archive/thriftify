'use strict';

var test = require('tape');

var thriftify = require('../index.js');

test('thriftify is a function', function t(assert) {
    assert.equal(typeof thriftify, 'function');

    assert.end();
});

test('thriftify is not implemented', function t(assert) {
    assert.throws(function throwIt() {
        thriftify();
    }, /Not Implemented/);

    assert.end();
});
