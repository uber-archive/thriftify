var thriftrw = require('thriftrw');
var TYPE = thriftrw.TYPE;
var util = require('util');
var result = require('./result');

function ADouble() {
    if (!(this instanceof ADouble)) {
        return new ADouble();
    }
    this.typeid = TYPE.DOUBLE;
}

ADouble.prototype.reify = function reify(tobj) {
    if (typeof tobj !== 'number') {
        return result.error(new Error(util.format('ADouble::reify expects a number; received %s %s',
            typeof tobj, tobj.constructor.name)));
    }
    return result.just(tobj);
};

ADouble.prototype.uglify = function uglify(obj) {
    if (typeof obj !== 'number') {
        return result.error(new Error(util.format('ADouble::uglify expects a number; received %s %s',
            typeof obj, obj.constructor.name)));
    }
    return result.just(obj);
};

module.exports.ADouble = ADouble;
