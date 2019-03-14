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
`input` | i | *`string`* | Directory or file path to use when reading files
`output` | o | *`string`* | Directory to write parsed files to
`src` |  | *`string`* | Glob pattern string to filter input file list, ex: `**/*.yml`
`string` | s | *`string`* | Text string to parse
`env` | e | *`boolean`* | If true will also interpolate with environment variables. Default is `false`
`params` | p | *`object\|string`* | Object of key,value pairs to use for parameter matching. If string, it should either be a stringified json object, or a comma-separated key,value list: `"key1=1,key2=2"`. Default is `null`
`warn` | w | *`boolean`* | If true will write a message to `stderr` when a parameter is not found. Default is `true`
`throw` | t | *`boolean`* | If true will throw an error when a parameter is not found. Default is `false`
`default` | d | *`string`* | Default value to use when a parameter is not found. Default is `''`
`help` | h | *`boolean`* | View the cli help menu

### Methods
Name | Description
-----|------------
`Interpolator(opts)` | Interpolator class for creating a custom parser instance
`parse(str, opts)` | Parses a string with optional opts
`file({ input, output, src })` | Parses a file or directory based in `opts.input`. Files are parsed then written to `opts.output`

## Examples
Parse a text string
```javascript
let params = {
    SRC_DIR: './src',
    BUILD_DIR: './build'
};

let string = '{{SRC_DIR}} -> {{BUILD_DIR}}';

console.log(interpolator.parse(str, { params }));
```
Parse a directory of files via cli
```bash
interpolate --env -i ./deploy -o ./build --src **/*.(yml|yaml)
```

## Testing
Testing is currently run using mocha and chai. To execute tests just run `npm run test`. To generate unit test coverage reports just run `npm run coverage`

## Contact
If you have any questions feel free to get in touch
