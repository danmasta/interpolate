const walk = require('@danmasta/walk');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require('util');

const mkdirpAsync = util.promisify(mkdirp);
const writeFileAsync = util.promisify(fs.writeFile);

const defaults = {
    input: undefined,
    output: undefined,
    src: undefined,
    string: undefined,
    env: false,
    params: null,
    warn: true,
    throw: false,
    default: '',
    help: false,
    regex: /\{\{([^{}]+)\}\}/g
};

class Interpolator {

    constructor (opts) {

        opts = _.defaults(opts, defaults);

        if (_.isString(opts.params)) {
            opts.params = Interpolator.parseParamString(opts.params);
        }

        if (opts.env) {
            opts.params = _.defaults(opts.params, process.env);
        }

        this.opts = opts;

    }

    static parseParamString (str) {

        let res = null;

        try {
            res = JSON.parse(str);
        } catch (e) {
            res = _.fromPairs(str.split(',').map(str => str.split('=')));
        }

        return res;

    }

    _handleError (...args) {

        let str = util.format(...args);

        if (this.opts.throw) {
            throw new Error(str);
        } else if (this.opts.warn) {
            process.stderr.write(str + '\n');
        }

    }

    parseStr (str) {

        return str.replace(this.opts.regex, (match, key, offset) => {

            let val = _.get(this.opts.params, key);

            if (val === undefined) {
                val = this.opts.default;
                this._handleError('Interpolate param key not found: %s', key);
            }

            return val;

        });

    }

    parseFile (input, output, src) {

        return walk.contents(input, { src }).map(file => {

            let out = path.resolve(output, file.relative || file.base);
            let dir = path.dirname(out);

            file.contents = this.parseStr(file.contents);

            return mkdirpAsync(dir).then(() => {
                return writeFileAsync(out, file.contents).then(() => {
                    return file;
                });
            });

        });

    }

}

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
