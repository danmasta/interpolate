#!/usr/bin/env node

const minimist = require('minimist');
const _ = require('lodash');
const interpolate = require('../index');

const help = `
Usage:
interpolate [...options]

Options:
--input   -i - File or directory path to read from
--output  -o - Directory to save output files
--src        - Glob pattern to filter input files for parsing: **/*.yml
--string  -s - Text string to parse
--env     -e - If true will also interpolate from envrionment variables
--params  -p - Stringified json object, or string of key,value pairs: key1=1,key2=2
--warn    -w - If true will print out warnings for missing parameters
--throw   -t - If true will throw errors for missing parameters
--default -d - What value to use as default when a parameter is not found
--help    -h - Show this help message

Examples:
interpolate -i ./deploy -o ./build --src **/*.(yml|yaml)
`;

function getOptsFromArgv () {

    let res = {};
    let argv = minimist(process.argv.slice(2));

    let opts = {
        input: 'i',
        output: 'o',
        src: null,
        string: 's',
        env: 'e',
        params: 'p',
        warn: 'w',
        throw: 't',
        default: 'd',
        help: 'h',
        regex: null
    };

    _.map(opts, (alias, key) => {
        res[key] = alias ? argv[alias] !== undefined ? argv[alias] : argv[key] : argv[key];
    });

    return res;

}

function runWithArgv () {

    let opts = getOptsFromArgv();
    let interpolator = new interpolate.Interpolator(opts);

    if (opts.help) {

        process.stdout.write(help);

    } else {

        if (opts.string) {
            process.stdout.write(interpolator.parseStr(opts.string));
        } else if (opts.input && opts.output) {
            interpolator.parseFile(opts.input, opts.output, opts.src);
        } else {
            process.stdout.write(help);
        }

    }

}

runWithArgv();
