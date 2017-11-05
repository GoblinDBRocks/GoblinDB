module.exports = function (chai, utils) {

	var Assertion = chai.Assertion;
	var flag = utils.flag;
	var assert = chai.assert;

	var fs = require('fs');
	var BitMask = require('bit-mask');

	// !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !
	//
	// implemented but disabled until I find a good cross-platform way to implement and test this
	//
	// !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !   !

	/* jshint -W026 */

	return;

	//-------------------------------------------------------------------------------------------------------------

	function statPermissionXNix(file, permission) {
		var stat = fs.statSync(file);
		var mask = new BitMask.OwnershipMask(stat.mode);
		var ret = mask.hasPermission('world', permission);
		ret = ret || (process.gid === stat.gid && mask.hasPermission('group', permission));
		ret = ret || (process.uid === stat.uid && mask.hasPermission('user', permission));
		return ret;
	}

	function canReadFile(file) {
		// BEH!
		if (process.platform === 'win32') {
			return true;
		}
		if (process.platform === 'darwin' || process.platform === 'linux') {
			return statPermissionXNix(file, 'read');
		}
		return false;
	}

	function canWriteFile(file) {
		// BEH!
		if (process.platform === 'win32') {
			return true;
		}
		if (process.platform === 'darwin' || process.platform === 'linux') {
			return statPermissionXNix(file, 'write');
		}
		return false;
	}

	function canExecuteFile(file) {
		// BEH!
		if (process.platform === 'win32') {
			return true;
		}
		if (process.platform === 'darwin' || process.platform === 'linux') {
			return statPermissionXNix(file, 'execute');
		}
		return false;
	}

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('readable', function (msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');
		new chai.Assertion(obj, preMsg + 'value').to.be.a.path();

		var pass = canReadFile(obj);

		this.assert(
			pass
			, "expected #{this} to be readable"
			, "expected #{this} not to be readable"
		);
	});
	assert.pathReadable = function (val, msg) {
		new chai.Assertion(val).to.be.readable(msg);
	};
	assert.notPathReadable = function (val, msg) {
		new chai.Assertion(val).to.not.be.readable(msg);
	};

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('writable', function (msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');
		new chai.Assertion(obj, preMsg + 'value').to.be.a.path();

		var pass = canWriteFile(obj);

		this.assert(
			pass
			, "expected #{this} to be writable"
			, "expected #{this} not to be writable"
		);
	});
	assert.pathWritable = function (val, msg) {
		new chai.Assertion(val).to.be.writable(msg);
	};
	assert.notPathWritable = function (val, msg) {
		new chai.Assertion(val).to.not.be.writable(msg);
	};

	//-------------------------------------------------------------------------------------------------------------

	Assertion.addMethod('executable', function (msg) {
		var preMsg = '';
		if (msg) {
			flag(this, 'message', msg);
			preMsg = msg + ': ';
		}

		var obj = this._obj;

		new chai.Assertion(obj, preMsg + 'value').is.a('string');
		new chai.Assertion(obj, preMsg + 'value').to.be.a.path();

		var pass = canExecuteFile(obj);

		this.assert(
			pass
			, "expected #{this} to be executable"
			, "expected #{this} not to be executable"
		);
	});
	assert.pathExecutable = function (val, msg) {
		new chai.Assertion(val).to.be.executable(msg);
	};
	assert.notPathExecutable = function (val, msg) {
		new chai.Assertion(val).to.not.be.executable(msg);
	};
};
