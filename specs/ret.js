function Result(error, value) {
    this.value = value;
    this.error = error;
    this.errorCtx = [];
}
module.exports.Result = Result;

module.exports.just = function just(value) {
    return new Result(null, value);
};

module.exports.error = function just(error) {
    return new Result(error, null);
};

module.exports.chain = function chain(r, ctx) {
    r.errorCtx.push(ctx);
    return r;
};
