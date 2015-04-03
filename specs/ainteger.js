var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');

function AInteger(typeid) {
    if (!(this instanceof AInteger)) {
        return new AInteger(typeid);
    }
    this.typeid = typeid;
}

AInteger.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        throw new Error(util.format('AInteger::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name));
    }
    if ((tobj | 0) !== tobj) {
        throw new Error(util.format('AInteger::reify expects an integer; received float %s', tobj));
    }
    return tobj;
};

AInteger.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'number') {
        throw new Error(util.format('AInteger::uglify expects a number; received %s %s',
            typeof obj, obj.constructor.name));
    }
    if ((obj | 0 ) !== obj) {
        throw new Error(util.format('AInteger::uglify expects an integer; received float %s', obj));
    }
    return obj;
};

module.exports.AInteger = AInteger;
