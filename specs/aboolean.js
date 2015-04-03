var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var result = require('./result');

function ABoolean() {
    if (!(this instanceof ABoolean)) {
        return new ABoolean();
    }
    this.typeid = TYPE.BOOL;
}

ABoolean.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return result.error(new Error(util.format('ABoolean::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    return result.just(Boolean(tobj));
};

ABoolean.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'boolean') {
        return result.error(new Error(util.format('ABoolean::uglify expects a boolean; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    return result.just(Number(obj));
};

module.exports.ABoolean = ABoolean;
