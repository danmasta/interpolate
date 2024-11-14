const path = require('path');
const fs = require('fs');
const { format } = require('util');
const { mkdirp } = require('mkdirp');
const walk = require('walk');
const _ = require('lodash');
const util = require('./util');

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

function mapLine (str, fn) {

    if (!_.isString(str)) {
        return str;
    }

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

function padleft (str, offset) {
    return mapLine(str, (line, num) => {
        if (num === 0) {
            return line;
        } else {
            return line.padStart(line.length + offset);
        }
    });
}

function padright (str, offset) {
    return mapLine(str, (line, num) => {
        if (num === 0) {
            return line;
        } else {
            return line.padEnd(line.length + offset);
        }
    });
}

const constants = {
    FORMATTERS: {
        padleft: padleft,
        padright: padright,
        pad: padleft,
        lowercase: _.lowerCase,
        uppercase: _.upperCase,
        lower: _.toLower,
        upper: _.toUpper,
        camel: _.camelCase,
        kebab: _.kebabCase,
        snake: _.snakeCase,
        start: _.startCase,
        capitalize: _.capitalize,
        lowerfirst: _.lowerFirst,
        upperfirst: _.upperFirst,
        deburr: _.deburr,
        escape: _.escape,
        unescape: _.unescape,
        trim: _.trim
    }
};

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

        } catch (err) {

            let pairs = str.split(',').map(str => {

                if (!_.isString(str) || !str.length || str === '=') {
                    return undefined;
                }

                let key, val;
                let index = str.indexOf('=');

                if (index > -1) {
                    key = str.slice(0, index).trim();
                    if (index + 1 < str.length) {
                        val = str.slice(index + 1);
                    }
                } else {
                    key = str.trim();
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

                [key, ...fmt] = key.trim().split(this.opts.delimiter);

                key = key.trim();
                val = _.get(this.opts.params, key);

                // Support nested interpolate values
                if (this.opts.regex.test(val)) {
                    val = this.parseStr(val);
                }

                if (fmt.length && this.opts.format) {
                    try {
                        _.each(fmt, (name) => {
                            val = constants.FORMATTERS[_.toLower(name.trim())](val, offset);
                        });
                    } catch (err) {
                        this._handleError('Failed to format value: %s - key: %s, formatter: %s\n%s', val, key, fmt, err.stack);
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

    parseFile (input, output, src) {

        return walk(input, { src }).each(file => {

            let dst = path.resolve(output, file.relative || file.base);
            let dir = path.dirname(dst);

            return mkdirp(dir).then(() => {
                return file.readStr().then(str => {
                    return fs.promises.writeFile(dst, this.parseStr(str));
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
