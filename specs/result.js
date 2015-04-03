function Result(error, result) {
    this.result = result;
    this.error = error;
    this.errorCtx = [];
}
module.exports.Result = Result;

module.exports.just = function just(result) {
    return new Result(null, result);
};

module.exports.error = function just(error) {
    return new Result(error, null);
};

module.exports.chain = function chain(r, ctx) {
    r.errorCtx.push(ctx);
    return r;
};
