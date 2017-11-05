module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var fs = require('fs');

	//-------------------------------------------------------------------------------------------------------------

	//TODO add (utf8, base64, etc) flag chain props
	//TODO add Buffer compare/diff

  var contentMethod = function (expected, msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		var obj = this._obj;

		if (!flag(this, 'fs.isFile')) {
			new chai.Assertion(obj, preMsg + 'value').is.a('string');
			new chai.Assertion(obj, preMsg + 'value').to.be.a.path();
			new chai.Assertion(obj, preMsg + 'value').to.be.a.file();
		}

		new chai.Assertion(expected, preMsg + 'expected-value').is.a('string');

		var content = fs.readFileSync(obj, 'utf8');

		var pass = content === expected;

		this.assert(
			pass
			, "expected #{this} to have content #{exp} but got #{act}"
			, "expected #{this} not to have content #{exp}"
			, expected
			, content
		);
  };

  var chainingBehavior = function(){
    utils.flag(this, 'fs.content', true);
  };

	Assertion.addChainableMethod('content', contentMethod, chainingBehavior);
	Assertion.addChainableMethod('contents', contentMethod, chainingBehavior);

	assert.fileContent = function (val, exp, msg) {
		new chai.Assertion(val).to.have.content(exp, msg);
	};
	assert.notFileContent = function (val, exp, msg) {
		new chai.Assertion(val).to.not.have.content(exp, msg);
	};
};
