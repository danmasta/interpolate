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
    params: undefined,
    warn: true,
    throw: false,
    default: '',
    help: false,
    regex: /\{\{([^{}]+)\}\}/g,
    replaceMissing: false,
    format: true,
    delimiter: '|'
};

const constants = {
    FORMATTERS: {
        padleft: (str, offset) => {
            return mapLine(str, (line, num) => {
                if (num === 0) {
                    return line;
                } else {
                    return line.padStart(line.length + offset);
                }
            });
        },
        padright: (str, offset) => {
            return mapLine(str, (line, num) => {
                if (num === 0) {
                    return line;
                } else {
                    return line.padEnd(line.length + offset);
                }
            });
        },
        lowercase: _.lowerCase,
        uppercase: _.upperCase,
        lower: _.tolower,
        upper: _.toUpper,
        camelcase: _.camelCase,
        kebabcase: _.kebabCase,
        snakecase: _.snakeCase,
        startcase: _.startCase,
        capitalize: _.capitalize,
        lowerfirst: _.lowerFirst,
        upperfirst: _.upperFirst,
        deburr: _.deburr,
        escape: _.escape,
        unescape: _.unescape,
        trim: _.trim
    }
};

function mapLine (str, fn) {

    let regex = /\r\n|\r|\n/g;
    let index = 0;
    let count = 0;
    let res = [];

    // Match lines while preserving original whitespace
    while ((match = regex.exec(str)) !== null) {
        res.push(fn(str.slice(index, regex.lastIndex), count));
        count++;
        index = regex.lastIndex;
    }

    // Add the rest of the string from the last match
    res.push(fn(str.slice(index), count));

    return res.join('');

}

class Interpolate {

    constructor (opts) {

        opts = _.defaults(opts, defaults);

        if (_.isString(opts.params)) {
            opts.params = Interpolate.parseParamString(opts.params);
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

            let pairs = str.split(',').map(str => {

                let index = -1;
                let key = undefined;
                let val = undefined;

                if (!str.length || str === '=') {
                    return undefined;
                }

                index = str.indexOf('=');

                if (index > -1) {
                    key = str.slice(0, index).trim();
                    if (index + 1 < str.length) {
                        val = str.slice(index + 1);
                    }
                } else {
                    key = str.slice(0).trim();
                }

                if (!key.length) {
                    return undefined;
                } else {
                    return [key, val];
                }

            });

            res = _.fromPairs(_.compact(pairs));

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

        return mapLine(str, (line, num) => {

            return line.replace(this.opts.regex, (match, key, offset) => {

                let fmt, val;

                [key, fmt] = key.trim().split(this.opts.delimiter);

                key = key.trim();
                fmt = fmt && _.toLower(fmt.trim());

                val = _.get(this.opts.params, key);

                if (fmt && this.opts.format) {
                    try {
                        val = constants.FORMATTERS[fmt](val, offset);
                    } catch (err) {
                        this._handleError('Failed to format value: %s - key: %s, formatter: %s', val, key, fmt);
                    }
                }

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

    static factory () {
        let Fn = this;
        return function interpolateFactory (...args) {
            return new Fn(...args);
        };
    }

    static parseStrFactory () {
        let Fn = this;
        return function interpolateFactory (str, opts) {
            if (_.isString(str)) {
                return new Fn(opts).parseStr(str);
            } else {
                return new Fn(str);
            }
        };
    }

    static parseFileFactory () {
        let Fn = this;
        return function interpolateFactory (opts) {
            return new Fn(opts).parseFile(opts.input, opts.output, opts.src);
        };
    }

}

module.exports = Interpolate;
