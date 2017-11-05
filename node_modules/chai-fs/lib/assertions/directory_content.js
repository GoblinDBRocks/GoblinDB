module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var AssertionError = chai.AssertionError;
	var flag = utils.flag;
	var assert = chai.assert;

	var readdir = require('readdir-enhanced');
	var format = require('util').format;

	//-------------------------------------------------------------------------------------------------------------

	function directoryContentAssertion (label, expectedContents, msg) {
		var deep = Boolean(flag(this, 'deep'));
		var contains = Boolean(flag(this, 'contains'));
		var dir = flag(this, 'fs.path');
		var actualContents = flag(this, 'object');

		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		new chai.Assertion(expectedContents, preMsg + 'expected-value').is.an('array');

		actualContents.sort();
		expectedContents.sort();

		if (deep) {
			label = 'deep ' + label;
		}

		var pass, failMsg, failNegateMsg;
		try {
			if (contains) {
				failMsg = format("expected '%s' to contain %s #{exp}", dir, label);
				failNegateMsg = format("expected '%s' to not contain %s #{exp}", dir, label);
				new chai.Assertion(actualContents, msg).contains.members(expectedContents, msg);
			} else {
				failMsg = format("expected '%s' to have the same %s as #{exp}", dir, label);
				failNegateMsg = format("expected '%s' to not have the same %s as #{exp}", dir, label);
				new chai.Assertion(actualContents, msg).has.members(expectedContents, msg);
			}
			pass = true;
		}
		catch (err) {
			if (err instanceof AssertionError) {
				pass = false;
			}
			else {
				throw err;
			}
		}

		this.assert(
			pass
			, failMsg
			, failNegateMsg
			, expectedContents
			, actualContents
			, true 	// show diff
		);
	}

	function directoryContentChainingBehavior (filter) {
		var dir = flag(this, 'object');
		var deep = Boolean(flag(this, 'deep'));

		// Read the directory, possibly recursively.
		var contents = readdir.sync(dir, {
			deep: deep,				// deep vs shallow
			filter: filter, 	// Filter by files or directories
			sep: '/'					// Always use "/" path separators, so tests work consistently across platforms
		});

		// Replace the current assertion value (the directory path), with the
		// directory contents (array), so it can be chained with normal array assertions
		// (e.g. `content.have.lengthOf(5)` or `content.that.satisfy(criteria)`)
		utils.flag(this, 'object', contents);

		// Change the flags to reflect the new value
		flag(this, 'fs.isDirectory', false);
		flag(this, 'fs.directoryContent', true);
		flag(this, 'fs.path', dir);
	}

	function overwriteContentAssertion (_super) {
		return function dirContentMethod(expectedContents, msg) {
			if (flag(this, 'fs.directoryContent')) {
				directoryContentAssertion.call(this, 'contents', expectedContents, msg);
			} else {
				_super.apply(this, arguments);
			}
		};
	}

	function overwriteContentChainingBehavior (_super) {
		return function dirContentProperty() {
			if (flag(this, 'fs.isDirectory')) {
				directoryContentChainingBehavior.call(this, null);
			}
			else {
				_super.apply(this, arguments);
			}
		};
	}

	Assertion.overwriteChainableMethod('content', overwriteContentAssertion, overwriteContentChainingBehavior);
	Assertion.overwriteChainableMethod('contents', overwriteContentAssertion, overwriteContentChainingBehavior);

	Assertion.addChainableMethod('files',
		function(expectedFiles, msg) {
			directoryContentAssertion.call(this, 'files', expectedFiles, msg);
		},
		function() {
			directoryContentChainingBehavior.call(this, function fileFilter (stats) {
				return stats.isFile();
			});
		}
	);

	Assertion.addChainableMethod('subDirs',
		function(expectedSubDirs, msg) {
			directoryContentAssertion.call(this, 'sub-directories', expectedSubDirs, msg);
		},
		function() {
			directoryContentChainingBehavior.call(this, function dirFilter (stats) {
				return stats.isDirectory();
			});
		}
	);

	assert.directoryContent = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).with.contents(exp, msg);
	};
	assert.directoryFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).with.files(exp, msg);
	};
	assert.directorySubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).with.subDirs(exp, msg);
	};

	assert.notDirectoryContent = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.have.contents(exp, msg);
	};
	assert.notDirectoryFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.have.files(exp, msg);
	};
	assert.notDirectorySubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.have.subDirs(exp, msg);
	};

	assert.directoryDeepContent = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).with.deep.contents(exp, msg);
	};
	assert.directoryDeepFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).with.deep.files(exp, msg);
	};
	assert.directoryDeepSubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).with.deep.subDirs(exp, msg);
	};

	assert.notDirectoryDeepContent = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.have.deep.contents(exp, msg);
	};
	assert.notDirectoryDeepFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.have.deep.files(exp, msg);
	};
	assert.notDirectoryDeepSubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.have.deep.subDirs(exp, msg);
	};

	assert.directoryInclude = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.include.contents(exp, msg);
	};
	assert.directoryIncludeFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.include.files(exp, msg);
	};
	assert.directoryIncludeSubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.include.subDirs(exp, msg);
	};

	assert.notDirectoryInclude = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.include.contents(exp, msg);
	};
	assert.notDirectoryIncludeFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.include.files(exp, msg);
	};
	assert.notDirectoryIncludeSubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.include.subDirs(exp, msg);
	};

	assert.directoryDeepInclude = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.include.deep.contents(exp, msg);
	};
	assert.directoryDeepIncludeFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.include.deep.files(exp, msg);
	};
	assert.directoryDeepIncludeSubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.include.deep.subDirs(exp, msg);
	};

	assert.notDirectoryDeepInclude = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.include.deep.contents(exp, msg);
	};
	assert.notDirectoryDeepIncludeFiles = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.include.deep.files(exp, msg);
	};
	assert.notDirectoryDeepIncludeSubDirs = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.directory(msg).and.not.include.deep.subDirs(exp, msg);
	};
};
