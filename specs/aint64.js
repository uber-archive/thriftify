var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');

function AInt64() {
    if (!(this instanceof AInt64)) {
        return new AInt64();
    }
    this.typeid = TYPE.I64;
}

AInt64.prototype.reify = function reify(tobj) {
    if (!(tobj instanceof Buffer)) {
        throw new Error(util.format('AInt64::reify expects a Buffer; received %s %s',
            typeof tobj, tobj.constructor.name));
    }
    if (tobj.length !== 8) {
        throw new Error(util.format('i64 has to be a Buffer of length 8; received length %d',
            tobj.length));
    }
    return tobj;
};

AInt64.prototype.uglify = function uglify(obj) {
    if (!(obj instanceof Buffer)) {
        throw new Error(util.format('AString::uglify expects a Buffer; received %s %s',
            typeof obj, obj.constructor.name));
    }
    if (obj.length !== 8) {
        throw new Error(util.format('i64 has to be a Buffer of length 8; received length %d',
            obj.length));
    }
    return obj;
};

module.exports.AInt64 = AInt64;
