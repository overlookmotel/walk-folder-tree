// --------------------
// walk-folder-tree module
// Tests
// --------------------

// modules
var chai = require('chai'),
	expect = chai.expect,
	walkFolderTree = require('../lib/');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* global describe, it */

describe('Tests', function() {
	it('Test', function() {
		expect(walkFolderTree).to.be.ok;
	});
});
