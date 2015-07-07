// --------------------
// walk-folder-tree module
// Tests
// --------------------

// modules
var pathModule = require('path'),
	Promise = require('bluebird'),
	generatorSupported = require('generator-supported'),
	chai = require('chai'),
	expect = chai.expect,
	walk = require('../lib/');

var generatorTests;
if (generatorSupported) generatorTests = require('./generators.test.inc.js');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* global describe, it, before, beforeEach */

var path = pathModule.join(__dirname, 'example');

describe('walk can be called with', function() {
	it('(path)', function() {
		return walk(path);
	});

	it('(path, options)', function() {
		return walk(path, {return: true}).then(function(paths) {
			paths = paths.map(function(params) {return params.path;});
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	});

	it('(path, fn)', function() {
		var paths2 = [];
		return walk(path, function(params) {
			paths2.push(params.path);
		}).then(function() {
			expect(paths2).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	});

	it('(path, options, fn)', function() {
		var paths2 = [];
		return walk(path, {return: true}, function(params) {
			paths2.push(params.path);
		}).then(function(paths) {
			paths = paths.map(function(params) {return params.path;});
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
			expect(paths2).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	});

	it('(path, fn, options)', function() {
		var paths2 = [];
		return walk(path, function(params) {
			paths2.push(params.path);
		}, {return: true}).then(function(paths) {
			paths = paths.map(function(params) {return params.path;});
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
			expect(paths2).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	});

	it('(options) with path and fn options attributes', function() {
		var paths2 = [];
		return walk({
			path: path,
			fn: function(params) {
				paths2.push(params.path);
			},
			return: true
		}).then(function(paths) {
			paths = paths.map(function(params) {return params.path;});
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
			expect(paths2).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	});
});

describe('fn can be', function() {
	var paths;

	beforeEach(function() {
		paths = [];
	});

	it('sync', function() {
		return runTest(function(params) {
			paths.push(params.path);
		});
	});

	it('async with callback', function() {
		return runTest(function(params, cb) {
			paths.push(params.path);
			cb();
		});
	});

	it('promise-returning', function() {
		return runTest(function(params) {
			return Promise.resolve().then(function() {
				paths.push(params.path);
			});
		});
	});

	if (generatorTests) {
		it('generator', function() {
			generatorTests.generatorFn(path);
		});
	} else {
		it.skip('generator');
	}

	function runTest(fn) {
		return walk(path, fn).then(function() {
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	}
});

describe('Params', function() {
	var paramsArr = [];
	before(function() {
		return walk(path, function(params) {
			paramsArr.push(params);
		});
	});

	it('path = path relative to root', function() {
		var paths = paramsArr.map(function(params) {return params.path;});
		expect(paths).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
	});

	it('fullPath = full path', function() {
		var paths = paramsArr.map(function(params) {return params.fullPath;});
		var expectedPaths = ['a.txt', 'b', 'b/c.txt', 'b/d.txt'].map(function(thisPath) {return pathModule.join(path, thisPath);});
		expect(paths).to.deep.equal(expectedPaths);
	});

	it('name = filename', function() {
		var names = paramsArr.map(function(params) {return params.name;});
		expect(names).to.deep.equal(['a.txt', 'b', 'c.txt', 'd.txt']);
	});

	it('directory = true if folder', function() {
		var isDirs = paramsArr.map(function(params) {return params.directory;});
		expect(isDirs).to.deep.equal([false, true, false, false]);
	});

	it('stat = Stats object', function() {
		paramsArr.forEach(function(params) {
			expect(params.stat.isDirectory).to.be.ok;
		});
	});
});

describe('Options', function() {
	var paths;

	beforeEach(function() {
		paths = [];
	});

	it('recurse', function() {
		return runTest({recurse: false}).then(function() {
			expect(paths).to.deep.equal(['a.txt', 'b']);
		});
	});

	it('filterFiles', function() {
		return runTest({filterFiles: /^[^c]/}).then(function() {
			expect(paths).to.deep.equal(['a.txt', 'b', 'b/d.txt']);
		});
	});

	it('filterFolders', function() {
		return runTest({filterFolders: /^[^b]/}).then(function() {
			expect(paths).to.deep.equal(['a.txt']);
		});
	});

	it('return', function() {
		return runTest({return: true}).then(function(paths2) {
			paths2 = paths2.map(function(params) {return params.path;});
			expect(paths2).to.deep.equal(['a.txt', 'b', 'b/c.txt', 'b/d.txt']);
		});
	});

	it('sort', function() {
		return runTest({sort: function(a, b) {
			if (a < b) return 1;
			if (b > a) return -1;
			return 0;
		}}).then(function() {
			expect(paths).to.deep.equal(['b', 'a.txt', 'b/d.txt', 'b/c.txt']);
		});
	});

	function runTest(options) {
		return walk(path, options, function(params) {
			paths.push(params.path);
		});
	}
});
