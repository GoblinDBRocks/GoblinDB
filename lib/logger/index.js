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

	var currentMode = mode[goblin.config.mode];

	if (currentMode !== mode.production) {
		var prefix = goblin.config.logPrefix;
		var log = errors[code] || code;
		var exception = new goblinException(prefix, log);

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