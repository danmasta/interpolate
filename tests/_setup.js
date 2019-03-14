const path = require('path');
const chai = require('chai');

beforeEach(function () {
    global.path = path;
    global.assert = chai.assert;
    global.expect = chai.expect;
    global.should = chai.should();
});
