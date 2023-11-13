# Interpolate
Simple template string interpolation for strings and files

Features:
* Easy to use
* Interpolate template strings: `{{VAR}}`
* Parses strings and files
* Can interpolate from parameters and/or environment variables
* Supports nested paths from complex parameters
* Includes cli tool and node api

## About
We needed a way to interpolate template variables from strings and files at build and/or run time. I wanted both a node api and cli tool to use for easy integration with jenkins, docker, or kubernetes, and also wanted the ability to interpolate with environment variables or manually specified parameters.

## Usage
Add interpolate as a dependency for your app and install via npm
```
npm install @danmasta/interpolate --save
```
Require the package in your app
```javascript
const interpolate = require('@danmasta/interpolate');
```

### Options
name | alias | type | description
-----|-------|------|------------
`input` | i | *`string`* | Directory or file path to use when reading files. Default is `undefined`
`output` | o | *`string`* | Directory to write parsed files to. Default is `undefined`
`src` |  | *`string`* | Glob pattern string to filter input file list, ex: `**/*.yml`. Default is `undefined`
`string` | s | *`string`* | Text string to parse. Default is `undefined`
`stdin` |  | *`boolean`* | Read input from stdin. Default is `false`
`env` | e | *`boolean`* | If true will also interpolate with environment variables. Default is `false`
`params` | p | *`object\|string`* | Object of key,value pairs to use for parameter matching. If string, it should either be a stringified json object, or a comma-separated key,value list: `"key1=1,key2=2"`. Default is `undefined`
`warn` | w | *`boolean`* | If true will write a message to `stderr` when a parameter is not found. Default is `true`
`throw` | t | *`boolean`* | If true will throw an error when a parameter is not found. Default is `false`
`default` | d | *`string`* | Default value to use when a parameter is not found. Default is `''`
`replaceMissing` | r | *`string`* | If false will not replace variables that are undefined. Default is `false`
`format` | f | *`string`* | Enables or disables formatter functions. Default is `true`
`delimiter` |  | *`string`* | What delimiter to use for parsing formatter names. Default is `'\|'`
`help` | h | *`boolean`* | View the cli help menu

### Methods
Name | Description
-----|------------
`parse(str, opts)` | Parses a string with optional opts
`file({ input, output, src })` | Parses a file or directory based on `opts.input`. Files are parsed then written to `opts.output`

## Envstr
This package includes an extra cli utility called `envstr`. It formats json or table style data into `key=val` pairs that can be easily consumed in bash scripts or exported as environment variables.

### Options
name | alias | type | description
-----|-------|------|------------
`string` | s | *`string`* | Text string to parse. Default is `undefined`
`stdin` |  | *`boolean`* | Read input from stdin. Default is `undefined`
`json` | j | *`boolean`* | Handle input as json. Default is `false`
`key` | k | *`string`* | If input is json, parse data at specified key. Default is `undefined`
`quotes` | q | *`boolean`* | If true add quotes around env values. Default is `false`
`newline` | n | *`string`* | Which character to use as newline delimeter. Default is `'\n'`
`include` | i | *`string`* | Which keys to include in output: `key1,key2`
`exclude` | e | *`string`* | Which keys to exclude from output: `key3,key4`
`caps` | c | *`string`* | If true capitalizes the output key name. Default is `false`
`export` | x | *`string`* | If true adds the `'export'` keyword in front of each output key. Default is `false`
`help` | h | *`boolean`* | View the cli help menu

## Examples
Parse a text string
```javascript
let params = {
    SRC_DIR: './src',
    BUILD_DIR: './build'
};

let str = '{{SRC_DIR}} -> {{BUILD_DIR}}';

console.log(interpolate(str, { params }));
```
Parse a directory of files via cli
```bash
interpolate --env -i deploy -o build/deploy --src **/*.(yml|yaml)
```
Convert json data to env str format
```bash
envstr -s '{"KEY1":true,"KEY2":false}' --json --quotes
```

## Testing
Testing is currently run using mocha and chai. To execute tests just run `npm run test`. To generate unit test coverage reports just run `npm run coverage`

## Contact
If you have any questions feel free to get in touch
