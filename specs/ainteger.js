var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var ret = require('./ret');

function AInteger(typeid) {
    if (!(this instanceof AInteger)) {
        return new AInteger(typeid);
    }
    this.typeid = typeid;
}

AInteger.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return ret.error(new Error(util.format(
            'AInteger::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    if (Math.floor(tobj) !== tobj) {
        return ret.error(new Error(util.format(
            'AInteger::reify expects an integer; received float %s', tobj)));
    }
    return ret.just(tobj);
};

AInteger.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'number') {
        return ret.error(new Error(util.format(
            'AInteger::uglify expects a number; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    if (Math.floor(obj) !== obj) {
        return ret.error(new Error(util.format(
            'AInteger::uglify expects an integer; received float %s', obj)));
    }
    return ret.just(obj);
};

module.exports.AInteger = AInteger;
