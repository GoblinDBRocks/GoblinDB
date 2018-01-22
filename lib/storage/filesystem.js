const fs = require('fs');
const jsonfile = require('jsonfile');

const fileSystem = {
	read: read,
	save: save
};

function read(file) {
	return new Promise(function(resolve) {
		try {
			jsonfile.readFile(file, function(err, db) {
				if (err) resolve({}, false);
				resolve(db, true);
			});
		} catch(e) {
			resolve({}, false);
		}
	});
}

function save(file, db) {
	return new Promise(function(resolve) {
		try {
			jsonfile.writeFile(file, db, {flag: 'w+'}, function(err) {
				if (err) resolve(false);
				resolve(true);
			});
		} catch(e) {
			resolve(false);
		}
	});
}


module.exports = fileSystem;
