const walk = require('@danmasta/walk');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { format, promisify } = require('util');
const util = require('./util');

const mkdirpAsync = promisify(mkdirp);
const writeFileAsync = promisify(fs.writeFile);

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
    regex: /\{\{([^{}]+)\}\}/g,
    replaceMissing: false
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

        let str = format(...args);

        if (this.opts.throw) {
            throw new Error(str);
        } else if (this.opts.warn) {
            console.error(str);
        }

    }

    parseStr (str) {

        return str.replace(this.opts.regex, (match, key, offset) => {

            key = key.trim();

            let val = _.get(this.opts.params, key);

            if (val === undefined) {
                if (this.opts.replaceMissing) {
                    val = this.opts.default;
                } else {
                    val = match;
                }
                this._handleError('Interpolate param key not found: %s', key);
            }

            return val;

        });

    }

    parseFile (root, output, src) {

        return walk('./', { root, src }).contents().each(file => {

            let out = path.resolve(output, file.relative || file.base);
            let dir = path.dirname(out);

            return mkdirpAsync(dir).then(() => {
                return writeFileAsync(out, this.parseStr(file.contents)).then(() => {
                    return file;
                });
            });

        });

    }

}

module.exports = Interpolator;
