const errors = require('./errors');
const mode = require('./mode');
const goblin = require('../goblin');

// Error Hooks Execution
goblin.errorEmitter.on('error', function (exception, error) {
	goblin.hooks.repository.forEach(function (hook) {
		if (hook.event === 'error') {
			hook.callback({msg: exception.toString(), error: error});
		}
	});
});

function goblinException(prefix, log) {
	this.prefix = prefix;
	this.log = log;

	this.toString = function() {
		return (this.prefix ? this.prefix + ': ' : '') + this.log;
	};
}

module.exports = function(code, error, type) {
	const currentMode = mode[goblin.config.mode];

	const prefix = goblin.config.logPrefix;
	const log = errors[code] || code;
	const exception = new goblinException(prefix, log);

	if (currentMode === mode.strict) {
		throw exception.toString();
	} else if (currentMode === mode.production) {
		if (error) {
			goblin.errorEmitter.emit('error', exception, error);
		} else {
			goblin.errorEmitter.emit('error', exception);
		}
	}
	else {
		if (error) {
			console[type || 'error'](exception.toString(), error);
		} else {
			console[type || 'error'](exception.toString());
		}
	}
};