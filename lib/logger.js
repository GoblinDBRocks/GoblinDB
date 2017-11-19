
const errors = require('./errors');


module.exports = function(prefix, error) {
	

	var log = errors[prefix] || prefix;

	if(error) {
		// console.error(log, error);
		throw(log, error);
	} else {
		// console.error(log);
		throw(log);
	}
};
