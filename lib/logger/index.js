
const errors = require('./errors');
const configGoblin = require('../../config');


module.exports = function(code, error) {

	var prefix = configGoblin.logPrefix;
	var log = errors[code] || code;

	if(error && !prefix) {
		throw(log, error);
	} else if (error) {
		throw(prefix, log, error);
	} else if (prefix) {
		throw(prefix, log);
	} else {
		throw(log);
	}
};
