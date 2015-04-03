var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var result = require('./result');

function AInteger(typeid) {
    if (!(this instanceof AInteger)) {
        return new AInteger(typeid);
    }
    this.typeid = typeid;
}

AInteger.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return result.error(new Error(util.format(
            'AInteger::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    if (Math.floor(tobj) !== tobj) {
        return result.error(new Error(util.format(
            'AInteger::reify expects an integer; received float %s', tobj)));
    }
    return result.just(tobj);
};

AInteger.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'number') {
        return result.error(new Error(util.format(
            'AInteger::uglify expects a number; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    if (Math.floor(obj) !== obj) {
        return result.error(new Error(util.format(
            'AInteger::uglify expects an integer; received float %s', obj)));
    }
    return result.just(obj);
};

module.exports.AInteger = AInteger;
