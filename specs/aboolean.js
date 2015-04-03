var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var ret = require('./ret');

function ABoolean() {
    if (!(this instanceof ABoolean)) {
        return new ABoolean();
    }
    this.typeid = TYPE.BOOL;
}

ABoolean.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return ret.error(new Error(util.format('ABoolean::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    return ret.just(Boolean(tobj));
};

ABoolean.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'boolean') {
        return ret.error(new Error(util.format('ABoolean::uglify expects a boolean; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    return ret.just(Number(obj));
};

module.exports.ABoolean = ABoolean;
