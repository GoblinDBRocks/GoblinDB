module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var fs = require('fs');

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('path', function (msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');

		var pass = fs.existsSync(obj);

		this.assert(
			pass
			, "expected #{this} to exist"
			, "expected #{this} not to exist"
		);
	});
	assert.pathExists = function (val, msg) {
		new chai.Assertion(val).to.be.a.path(msg);
	};
	assert.notPathExists = function (val, msg) {
		new chai.Assertion(val).to.not.be.a.path(msg);
	};
};