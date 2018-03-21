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

function goblinException(prefix, code, log) {
	this.prefix = prefix;
	this.log = log;

	this.toString = function() {
		return (this.prefix ? this.prefix + ': ' : '') + this.log;
	};
	this.faqString = function() {
		return 'Check the F.A.Q. at https://github.com/GoblinDBRocks/GoblinDB/wiki/Errors#' +
		code.toLowerCase() + ' for more information. 👺';
	};
}

module.exports = function(code, error, type) {
	const currentMode = mode[goblin.config.mode];

	const prefix = goblin.config.logPrefix;
	const log = errors[code] || code;
	const exception = new goblinException(prefix, code, log);

	// Always emit error event
	goblin.errorEmitter.emit('error', exception, error || {});
	if (currentMode === mode.strict) {
		throw exception.toString();
	} else if (currentMode === mode.development) {
		console[type || 'error'](exception.toString(), exception.faqString(), error ? error : ''	);
	}
};
