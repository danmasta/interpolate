#!/usr/bin/env node

const Envstr = require('../lib/envstr');
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
--include -i - Which keys to include in output: key1,key2
--exclude -e - Which keys to exclude from output: key3,key4
--caps    -c - If true capitalizes the output key name
--export  -x - If true adds the 'export' keyword in front of each output key
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
        include: 'i',
        exclude: 'e',
        help: 'h',
        caps: 'c',
        export: 'x'
    });

    let envstr = new Envstr(opts);

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
