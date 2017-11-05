module.exports = function (chai, utils) {
	/* jshint -W030 */
	var Assertion = chai.Assertion;
	var flag = utils.flag;

	//-------------------------------------------------------------------------------------------------------------

	// easy-overwrite chained prop depedning on earlier check
	// example; expect(v).to.be.a.directory().and.not.empty

	Assertion._overwritePropFlags = {};

	Assertion.addOverwritePropertyFlag = function addOverwritePropertyFlag(prop, flag, func) {
		if (!Assertion._overwritePropFlags.hasOwnProperty(prop)) {
			Assertion._overwritePropFlags[prop] = [];
		}
		Assertion._overwritePropFlags[prop].push({prop: prop, flag: flag, func: func});
	};

	//TODO weird static/instance hybrid.. refactor too get rid of this
	Assertion.handleOverwritePropertyFlag = function handleOverwritePropertyFlag(prop, obj) {
		if (Assertion._overwritePropFlags.hasOwnProperty(prop)) {
			var arr = Assertion._overwritePropFlags[prop];
			for (var i = 0, ii = arr.length; i < ii; i++) {
				var data = arr[i];

				if (flag(this, data.flag) === true) {
					data.func.call(this, obj);
					return true;
				}
			}
		}
		return false;
	};

	//-------------------------------------------------------------------------------------------------------------

};