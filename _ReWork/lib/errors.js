// Error logger


module.exports = function(errors) {
	console.error(errors);
	throw(errors);
};
