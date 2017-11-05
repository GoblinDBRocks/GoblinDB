module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var fs = require('fs');

	//-------------------------------------------------------------------------------------------------------------

	//TODO add (utf8, base64, etc) flag chain props
	//TODO add Buffer compare/diff


	Assertion.overwriteMethod('match', function (_super) {
		return function assertContent (expected, msg) {
			if (flag(this, 'fs.content')) {

				var obj = this._obj;
				var preMsg = '';
				if (msg) {
					flag(this, 'message', msg);
					preMsg = msg + ': ';
				}

				if (!flag(this, 'fs.isFile')) {
					new chai.Assertion(obj, preMsg + 'value').is.a('string');
					new chai.Assertion(obj, preMsg + 'value').to.be.a.path();
					new chai.Assertion(obj, preMsg + 'value').to.be.a.file();
				}

				new chai.Assertion(expected, preMsg + 'expected-value').is.an
					.instanceof(RegExp);

				var content = fs.readFileSync(obj, 'utf8');

				var pass = expected.test(content);

				this.assert(
					pass
					, "expected #{this} to have content matching #{exp} but got #{act}"
					, "expected #{this} not to have content matching #{exp}"
					, expected
					, content
				);
			} else {
				_super.apply(this, arguments);
			}
		};
	});
	assert.fileContentMatch = function (val, exp, msg) {
		new chai.Assertion(val).content.match(exp, msg);
	};
	assert.notFileContentMatch = function (val, exp, msg) {
		new chai.Assertion(val).not.content.match(exp, msg);
	};
};
