const JSONfn = require('json-fn');
const fs = require('fs-extra');

const fileSystem = {
	read: read,
	save: save
};

/**
 * Reads from a JSON file (if the file / path doesn't exist then create that path) and
 * gets file content.
 * 
 * @param {string} file File path 
 * @param {object} defaults Default value if it has to create the file. 
 * @param {function} cb Callback called when file readed. Takes two arguments, the first
 * 						one is the error (if any) and the second one is the file content.
 */
function read(file, defaults, cb) {
	try {
		ensure(file, defaults, function(err) {
			if (err) {
				return cb(err, null);
			}

			fs.readJson(file, (err, db) => {
				cb(err, db);
			});
		});
	} catch(e) {
		cb(e, null);
	}
}

/**
 * Save JSON content into a file (if the path doesn't exist then create that path).
 * 
 * @param {string} file File path 
 * @param {object} db Data to store into the file.
 * @param {function} cb Callback called when file readed. Takes one argument, the error
 * 						(if any).
 */
function save(file, db, cb) {
	fs.outputJson(
		file, db,
		{
			replacer: function(key, value) {
				if (typeof(value) === 'function') {
					return JSONfn.stringify(value);
				}

				return value;
			}
		},
		cb
	);
}

/**
 * Internal. Check if the file exist and if don't then create the file with the same
 * content as default (or {} if default is falsy).
 * 
 * @param {string} file File path .
 * @param {object} defaults Default value if it has to create the file. 
 * @param {function} cb Callback called when the path existance was validated. Takes one
 *						argument, the error (if any).
 */
function ensure(file, defaults, cb) {
	fs.pathExists(file, (err, exists) => {
		if (err) {
			return cb(err);
		}

		if (exists) {
			return cb();
		}

		fs.outputJson(file, defaults || {}, cb);
	});
}

module.exports = fileSystem;
