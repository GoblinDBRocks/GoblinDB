module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var path = require('path');

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('basename', function (expected, msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}
		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');
		new chai.Assertion(expected, preMsg + 'expected-value').is.a('string');

		var actual = path.basename(obj);

		this.assert(
			actual === expected
			, "expected #{this} to have basename #{exp} but got #{act}"
			, "expected #{this} not to have basename #{exp} but got #{act}"
			, expected
			, actual
		);
	});
	assert.basename = function (val, exp, msg) {
		new chai.Assertion(val).to.have.basename(exp, msg);
	};
	assert.notBasename = function (val, exp, msg) {
		new chai.Assertion(val).to.not.have.basename(exp, msg);
	};

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('dirname', function (expected, msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}
		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');
		new chai.Assertion(expected, preMsg + 'expected-value').is.a('string');

		var actual = path.dirname(obj);

		this.assert(
			actual === expected
			, "expected #{this} to have dirname #{exp} but got #{act}"
			, "expected #{this} not to have dirname #{exp} but got #{act}"
			, expected
			, actual
		);
	});
	assert.dirname = function (val, exp, msg) {
		new chai.Assertion(val).to.have.dirname(exp, msg);
	};
	assert.notDirname = function (val, exp, msg) {
		new chai.Assertion(val).to.not.have.dirname(exp, msg);
	};

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('extname', function (expected, msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}
		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');
		new chai.Assertion(expected, preMsg + 'expected-value').is.a('string');

		var actual = path.extname(obj);

		this.assert(
			actual === expected
			, "expected #{this} to have extname #{exp} but got #{act}"
			, "expected #{this} not to have extname #{exp} but got #{act}"
			, expected
			, actual
		);
	});
	assert.extname = function (val, exp, msg) {
		new chai.Assertion(val).to.have.extname(exp, msg);
	};
	assert.notExtname = function (val, exp, msg) {
		new chai.Assertion(val).to.not.have.extname(exp, msg);
	};
};