const _ = require('lodash');

const defaults = {
    quotes: false,
    json: false,
    key: null,
    newline: '\n'
};

class EnvStr {

    constructor (opts) {
        this.opts = opts = _.defaults(opts, defaults);
    }

    pairsToStr (pairs) {

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

        try {
            obj = JSON.parse(str.trim());
        } catch (err) {
            throw new Error('EnvStr json str is not valid json: ' + err.message);
        }

        return this.parseJsonObj(obj);

    }

}

module.exports = EnvStr;
