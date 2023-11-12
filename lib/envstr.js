const _ = require('lodash');

const defaults = {
    quotes: false,
    json: false,
    key: undefined,
    newline: '\n',
    exclude: undefined,
    include: undefined
};

class Envstr {

    constructor (opts) {

        opts = _.defaults(opts, defaults);

        if (_.isString(opts.exclude)) {
            opts.exclude = opts.exclude.split(',').map(str => str.trim());
        }

        if (_.isString(opts.include)) {
            opts.include = opts.include.split(',').map(str => str.trim());
        }

        this.opts = opts;

    }

    pairsToStr (pairs) {

        if (this.opts.include) {
            pairs = _.filter(pairs, pair => {
                return this.opts.include.indexOf(pair[0]) > -1;
            });
        }

        if (this.opts.exclude) {
            pairs = _.filter(pairs, pair => {
                return this.opts.exclude.indexOf(pair[0]) < 0;
            });
        }

        return _.join(_.map(pairs, pair => {
            return this.opts.quotes ? `${pair[0]}="${pair[1]}"` : `${pair[0]}=${pair[1]}`;
        }), this.opts.newline);

    }

    parseTableStr (str) {

        let pairs = str.trim().split(this.opts.newline).map(line => {
            line = line.trim().split(/[ ]/g);
            return [line[0], line.slice(1).join(' ').trim()];
        });

        return this.pairsToStr(pairs);

    }

    parseJsonObj (obj) {

        if (this.opts.key) {
            obj = _.get(obj, this.opts.key);
        }

        return this.pairsToStr(_.toPairs(obj));

    }

    parseJsonStr (str) {

        let obj = null;

        if (_.isString(str)) {
            str = str.trim();
            try {
                if (str.length) {
                    obj = JSON.parse(str.trim());
                } else {
                    return str;
                }
            } catch (err) {
                throw new Error('Envstr json str is not valid json: ' + err.message);
            }
        } else {
            throw new Error(`Envstr json str incorrect type: ${typeof str}: ${str}`);
        }

        return this.parseJsonObj(obj);

    }

}

module.exports = Envstr;
