const jsonfile = require('jsonfile');

const fileSystem = {
	read: read,
	save: save
};

function read(file, cb) {
	try {
		jsonfile.readFile(file, function(err, db) {
			cb(err, db);
		});
	} catch(e) {
		cb(e, null);
	}
}

function save(file, db, cb) {
	try {
		jsonfile.writeFile(file, db, {flag: 'w+'}, function(err) {
			cb(err);
		});
	} catch(e) {
		cb(e);
	}
}


module.exports = fileSystem;
