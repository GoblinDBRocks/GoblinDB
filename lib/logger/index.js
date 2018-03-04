const errors = require('./errors');
const mode = require('./mode');
const goblin = require('../goblin');

function goblinException(prefix, log) {
	this.prefix = prefix;
	this.log = log;

	this.toString = function() {
		return (this.prefix ? this.prefix + ': ' : '') + this.log;
	};
}

module.exports = function(code, error, type) {
	const currentMode = mode[goblin.config.mode];

	if (currentMode !== mode.production) {
		const prefix = goblin.config.logPrefix;
		const log = errors[code] || code;
		const exception = new goblinException(prefix, log);

		if (currentMode === mode.strict) {
			throw exception.toString();
		} else {
			if (error) {
				console[type || 'error'](exception.toString(), error);
			} else {
				console[type || 'error'](exception.toString());
			}
		}
	}
};