#!/usr/bin/env node

const _ = require('lodash');
const EnvStr = require('../lib/envstr');
const util = require('../lib/util');

const help = `Usage:
envstr [...options]

Options:
--string  -s - Text string to parse
--stdin      - Read input from stdin
--json    -j - Handle input as json
--key     -k - If input is json, parse data at specified key
--quotes  -q - If true add quotes around env values
--newline -n - Which character to use as newline delimeter. Default is '\\n'
--help    -h - Show this help message

Examples:
envstr -s '{"KEY1":true,"KEY2":false}' --json --quotes
`;

function runWithArgv () {

    let opts = util.optsFromArgv({
        string: 's',
        stdin: null,
        json: 'j',
        key: 'k',
        quotes: 'q',
        newline: 'n',
        help: 'h'
    });

    let envstr = new EnvStr(opts);

    if (opts.help) {

        process.stdout.write(help);

    } else {

        if (opts.string) {
            if (opts.json) {
                process.stdout.write(envstr.parseJsonStr(opts.string));
            } else {
                process.stdout.write(envstr.parseTableStr(opts.string));
            }
        } else if (opts.stdin) {
            util.getStdin().then(str => {
                if (opts.json) {
                    process.stdout.write(envstr.parseJsonStr(str));
                } else {
                    process.stdout.write(envstr.parseTableStr(str));
                }
            });
        } else {
            process.stdout.write(help);
        }

    }

}

runWithArgv();
