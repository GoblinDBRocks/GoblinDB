const fs = require('fs');

const fileSystem = {
	read: read,
	save: save
};

// ToDo: Make all funcs parameterly sync and async (def: sync)

function read(file, callback) {
	var db = {};

	if (fs.existsSync(file)) {
		db = JSON.parse(fs.readFileSync(file));
	}

	if(typeof(callback) === 'function') {
		callback(db);
	}

	return db;
}

function save(file, db, callback) {

	const write = fs.writeFileSync(file, JSON.stringify(db));

	if(typeof(callback) === 'function') {
		callback(null);
	}

	return write;
}


module.exports = fileSystem;
