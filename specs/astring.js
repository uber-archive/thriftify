var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var ret = require('./ret');

function AString() {
    if (!(this instanceof AString)) {
        return new AString();
    }
    this.typeid = TYPE.STRING;
}

AString.prototype.reify = function reify(tobj) {
    if (!(tobj instanceof Buffer)) {
        return ret.error(new Error(util.format(
            'AString::reify expects a Buffer; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    return ret.just(tobj.toString('utf8'));
};

AString.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'string') {
        return ret.error(new Error(util.format(
            'AString::uglify expects a String; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    return ret.just(new Buffer(obj));
};

module.exports.AString = AString;
