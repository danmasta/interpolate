const Interpolator = require('./lib/interpolator');

function parse (str, opts) {
    let interpolator = new Interpolator(opts);
    return interpolator.parseStr(str);
}

function file (opts) {
    let interpolator = new Interpolator(opts);
    return interpolator.parseFile(opts.input, opts.output, opts.src);
}

exports.Interpolator = Interpolator;
exports.parse = parse;
exports.file = file;
