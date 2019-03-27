#!/usr/bin/env node

const _ = require('lodash');
const EnvStr = require('../lib/envstr');
const util = require('../lib/util');

const help = `Usage:
envstr [...options]

Options:
--string  -s - Text string to parse
--stdin      - Read from stdin
--json    -j - Handle input as json
--key     -k - If input is json, parse data at specified key
--quotes  -q - If true add quotes around env values
--newline -n - Which character to use as newline delimeter. Default is '\\n'
--help    -h - Show this help message

Examples:
envstr -s '{"KEY1":true,"KEY2":false}' --json --quotes`;

function getStdin () {

    let res = '';

    process.stdin.on('data', chunk => {
        res += chunk;
    });

    return new Promise((resolve, reject) => {
        process.stdin.on('end', () => {
            resolve(res);
        });
    });

}

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

        console.log(help);

    } else {

        if (opts.string) {
            if (opts.json) {
                console.log(envstr.parseJsonStr(opts.string));
            } else {
                console.log(envstr.parseTableStr(opts.string));
            }
        } else if (opts.stdin) {
            getStdin().then(str => {
                if (opts.json) {
                    console.log(envstr.parseJsonStr(str));
                } else {
                    console.log(envstr.parseTableStr(str));
                }
            });
        } else {
            console.log(help);
        }

    }

}

runWithArgv();
