var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var ret = require('./ret');

function ABinary() {
    if (!(this instanceof ABinary)) {
        return new ABinary();
    }
    this.typeid = TYPE.STRING;
}

ABinary.prototype.reify = function reify(tobj) {
    if (!(tobj instanceof Buffer)) {
        return ret.error(new Error(util.format('ABinary::reify expects a Buffer; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    return ret.just(tobj);
};

ABinary.prototype.uglify = function uglify(obj) {
    if (!(obj instanceof Buffer)) {
        return ret.error(new Error(util.format('AString::uglify expects a Buffer; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    return ret.just(obj);
};

module.exports.ABinary = ABinary;
