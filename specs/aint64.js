var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var result = require('./result');

function AInt64() {
    if (!(this instanceof AInt64)) {
        return new AInt64();
    }
    this.typeid = TYPE.I64;
}

AInt64.prototype.reify = function reify(tobj) {
    if (!(tobj instanceof Buffer)) {
        return result.error(new Error(util.format('AInt64::reify expects a Buffer; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    if (tobj.length !== 8) {
        return result.error(new Error(util.format('i64 has to be a Buffer of length 8; received length %d',
            tobj.length)));
    }
    return result.just(tobj);
};

AInt64.prototype.uglify = function uglify(obj) {
    if (!(obj instanceof Buffer)) {
        return result.error(new Error(util.format('AString::uglify expects a Buffer; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    if (obj.length !== 8) {
        return result.error(new Error(util.format('i64 has to be a Buffer of length 8; received length %d',
            obj.length)));
    }
    return result.just(obj);
};

module.exports.AInt64 = AInt64;
