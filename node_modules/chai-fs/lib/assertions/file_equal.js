module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var fs = require('fs');
	var format = require('util').format;

	//-------------------------------------------------------------------------------------------------------------

	//TODO add (utf8, base64, etc) flag chain props
	//TODO add Buffer compare/diff


	Assertion.overwriteMethod('equal', function (_super) {
		return function assertContent (expected, msg) {
			if (flag(this, 'fs.isFile')) {
				var negated = Boolean(flag(this, 'negate'));
				var deep = flag(this, 'deep') ? 'deep ' : '';

				var obj = this._obj;
				var preMsg = '';
				if (msg) {
					flag(this, 'message', msg);
					preMsg = msg + ': ';
				}

				new chai.Assertion(expected, preMsg + 'expected-value').is.a('string');
				new chai.Assertion(expected, preMsg + 'expected-value').to.be.a.path();
				new chai.Assertion(expected, preMsg + 'expected-value').to.be.a.file();

				var actualContent = fs.readFileSync(obj, 'utf8');
				var expectedContent = fs.readFileSync(expected, 'utf8');

				var pass = actualContent === expectedContent;
				var expectedValue = expectedContent;
				var actualValue = actualContent;
				var details = '';

				if (deep) {
					//TODO move these to their own assertions (e.g. `mtime()`, `uid()`, etc.)
					var actualStats = fs.statSync(obj);
					var expectedStats = fs.statSync(expected);

					var comparisons = [
						{prop: 'uid', name: 'owner'},
						{prop: 'gid', name: 'group id'},
						{prop: 'mtime', name: 'last-modified time'},
						{prop: 'ctime', name: 'last-changed time'},
						{prop: 'birthtime', name: 'creation time'},
					];

					comparisons.some(function(comparison) {
						var prop = comparison.prop;
						var actualStat = actualStats[prop] && actualStats[prop].valueOf();
						var expectedStat = expectedStats[prop] && expectedStats[prop].valueOf();
						var statsMatch = actualStat === expectedStat;
						pass = pass && statsMatch;

						if (!statsMatch && !negated) {
							// We're doing a deep-equality check, and the file contents are the same,
							// but one of the stats is different. So, adjust the error message to be
							// more informative & useful.
							details = format(' (%ss are different)', comparison.name);
							expectedValue = expectedStats[prop];
							actualValue = actualStats[prop];
							return true;
						}
					});
				}

				this.assert(
					pass
					, format("expected #{this} to %sequal '%s'%s", deep, expected, details)
					, format("expected #{this} not to %sequal '%s'%s", deep, expected, details)
					, expectedValue
					, actualValue
					, true 	// show diff
				);
			} else {
				_super.apply(this, arguments);
			}
		};
	});

	assert.fileEqual = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.file(msg).and.equal(exp, msg);
	};

	assert.notFileEqual = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.file(msg).and.not.equal(exp, msg);
	};

	assert.fileDeepEqual = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.file(msg).and.deep.equal(exp, msg);
	};

	assert.notFileDeepEqual = function (val, exp, msg) {
		new chai.Assertion(val).to.be.a.file(msg).and.not.deep.equal(exp, msg);
	};
};
