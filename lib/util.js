const minimist = require('minimist');
const _ = require('lodash');

const types = {
    'true': true,
    'false': false,
    'null': null,
    'undefined': undefined,
    'NaN': NaN
};

function isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function toNativeType (val) {
    return val in types ? types[val] : isNumeric(val) ? parseFloat(val) : val;
}

function optsFromArgv (opts) {

    let res = {};

    let argv = _.transform(minimist(process.argv.slice(2)), (res, val, key) => {

        val = toNativeType(val);

        // Support '-' arg for stdin
        if (key === '_') {
            if (val[0] === '-') {
                res['-'] = true;
                val.shift();
            }
            if (val.length) {
                res[key] = val;
            }
        } else {
            if (val === '-') {
                res['-'] = true;
                val = true;
            }
            res[_.camelCase(key)] = val;
        }

    });

    _.map(opts, (alias, key) => {
        res[key] = alias ? argv[alias] !== undefined ? argv[alias] : argv[key] : argv[key];
    });

    return res;

}

function getStdin () {

    return new Promise((resolve, reject) => {

        let res = '';

        process.stdin.on('data', chunk => {
            res += chunk;
        });

        process.stdin.on('end', () => {
            resolve(res);
        });

    });

}

exports.isNumeric = isNumeric;
exports.toNativeType = toNativeType;
exports.optsFromArgv = optsFromArgv;
exports.getStdin = getStdin;
