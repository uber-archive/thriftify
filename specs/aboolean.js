var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');

function ABoolean() {
    if (!(this instanceof ABoolean)) {
        return new ABoolean();
    }
    this.typeid = TYPE.BOOL;
}

ABoolean.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        throw new Error(util.format('ABoolean::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name));
    }
    return Boolean(tobj);
};

ABoolean.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'boolean') {
        throw new Error(util.format('ABoolean::uglify expects a boolean; received %s %s',
            typeof obj, obj.constructor.name));
    }
    return Number(obj);
};

module.exports.ABoolean = ABoolean;
