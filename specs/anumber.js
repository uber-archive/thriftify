var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');

function ANumber(typeid) {
    if (!(this instanceof ANumber)) {
        return new ANumber(typeid);
    }
    this.typeid = typeid;
}

ANumber.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        throw new Error(util.format('ANumber::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name));
    }
    return tobj;
};

ANumber.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'number') {
        throw new Error(util.format('ANumber::uglify expects a number; received %s %s',
            typeof obj, obj.constructor.name));
    }
    return obj;
};

module.exports.ANumber = ANumber;
