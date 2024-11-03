#!/usr/bin/env node

const Interpolate = require('../lib/interpolate');
const util = require('../lib/util');

const help = `Usage:
interpolate [...options]

Options:
--input           -i - File or directory path to read from
--output          -o - Directory to save output files
--src                - Glob pattern to filter input files for parsing: **/*.yml
--string          -s - Text string to parse
--stdin            - - Read input from stdin
--env             -e - If true will also interpolate from envrionment variables
--params          -p - Stringified json object, or string of key,value pairs: key1=1,key2=2
--warn            -w - If true will print out warnings for missing parameters
--throw           -t - If true will throw errors for missing parameters
--default         -d - What value to use as default when a parameter is not found
--replace-missing -r - If false will not replace variables that are undefined
--format          -f - Enables or disables formatter functions
--delimeter          - What delimiter to use for parsing formatter names
--help            -h - Show this help message

Examples:
interpolate -i ./deploy -o ./build/deploy --src **/*.(yml|yaml)
`;

function runWithArgv () {

    let opts = util.optsFromArgv({
        input: 'i',
        output: 'o',
        src: null,
        string: 's',
        stdin: '-',
        env: 'e',
        params: 'p',
        warn: 'w',
        throw: 't',
        default: 'd',
        help: 'h',
        regex: null,
        replaceMissing: 'r',
        format: 'f',
        delimiter: null
    });

    let interpolate = new Interpolate(opts);

    if (opts.help) {

        process.stdout.write(help);

    } else {

        if (opts.stdin) {

            util.getStdin().then(str => {
                process.stdout.write(interpolate.parseStr(str));
            });

        } else if (opts.string) {

            process.stdout.write(interpolate.parseStr(opts.string));

        } else if (opts.input && opts.output) {

            // interpolate.parseFile(opts.input, opts.output, opts.src);

        } else {
            process.stdout.write(help);
        }

    }

}

runWithArgv();
