// --------------------
// promisify-any module
// Generator tests
// --------------------

// modules
var chai = require('chai'),
	expect = chai.expect,
	Promise = require('bluebird'),
	walk = require('../lib/');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* jshint esnext: true */

module.exports = {
	generatorFn: function(path) {
		var paths = [];
		return walk(path, function*(params) {
			yield Promise.resolve();
			paths.push(params.path);
		}).then(function() {
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	}
};
