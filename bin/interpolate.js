#!/usr/bin/env node

const _ = require('lodash');
const Interpolator = require('../lib/interpolator');
const util = require('../lib/util');

const help = `Usage:
interpolate [...options]

Options:
--input           -i - File or directory path to read from
--output          -o - Directory to save output files
--src                - Glob pattern to filter input files for parsing: **/*.yml
--string          -s - Text string to parse
--env             -e - If true will also interpolate from envrionment variables
--params          -p - Stringified json object, or string of key,value pairs: key1=1,key2=2
--warn            -w - If true will print out warnings for missing parameters
--throw           -t - If true will throw errors for missing parameters
--default         -d - What value to use as default when a parameter is not found
--replace-missing -r - If false will not replace variables that are undefined
--help            -h - Show this help message

Examples:
interpolate -i ./deploy -o ./build --src **/*.(yml|yaml)`;

function runWithArgv () {

    let opts = util.optsFromArgv({
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
        regex: null,
        replaceMissing: 'r'
    });

    let interpolator = new Interpolator(opts);

    if (opts.help) {

        console.log(help);

    } else {

        if (opts.string) {
            console.log(interpolator.parseStr(opts.string));
        } else if (opts.input && opts.output) {
            interpolator.parseFile(opts.input, opts.output, opts.src);
        } else {
            console.log(help);
        }

    }

}

runWithArgv();
