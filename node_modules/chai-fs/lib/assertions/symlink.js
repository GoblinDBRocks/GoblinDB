module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var fs = require('fs');

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('symlink', function (msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');

		// This doesn't work for broken symlinks (target doesn't exist), but
		// technically it's still a symlink so should pass
		// new chai.Assertion(obj, preMsg + 'value').to.be.a.path();

		var pass = false;
		try {
			pass = fs.lstatSync(obj).isSymbolicLink();
		} catch (err) {
			if (err.code === 'ENOENT') {
				// This will always fail
				new chai.Assertion(obj, preMsg + 'value').to.be.a.path();
 			}
			throw err;
		}

		this.assert(
			pass
			, "expected #{this} to be a symlink"
			, "expected #{this} not to be a symlink"
		);
	});
	assert.isSymlink = function (val, msg) {
		new chai.Assertion(val).to.be.a.symlink(msg);
	};
	assert.notIsSymlink = function (val, msg) {
		new chai.Assertion(val).to.not.be.a.symlink(msg);
	};
};
