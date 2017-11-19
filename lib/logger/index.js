
const errors = require('./errors');


module.exports = function(prefix, error) {
	

	var log = errors[prefix] || prefix;

	if(error) {
		throw(log, error);
	} else {
		throw(log);
	}
};
