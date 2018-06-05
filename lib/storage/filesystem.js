const JSONfn = require('json-fn');
const fse = require('fs-extra');
const fs = require('fs');

const writeQueue = {};
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
 * @returns {void} Nothing.
 */
function read(file, defaults, cb) {
	try {
		ensure(file, defaults, function(err) {
			if (err) {
				return cb(err, null);
			}

			fse.readJson(file, cb);
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
 * @returns {void} Nothing.
 */
function save(file, db, cb) {
	// Race condition - https://github.com/nodejs/node-v0.x-archive/issues/3958
	// Save only last call.
	if (writeQueue[file]) {
		writeQueue[file].db = db;
		writeQueue[file].callbacks.push(cb);
        writeQueue[file].version.version++;
		return;
	} else {
		writeQueue[file] = { callbacks: [cb], db,  version: 1};
	}

    writeToFile(file);
}

/**
 * Save db data to a file from the write queue.
 * 
 * @param {string} file File path.
 * @returns {void} Nothing
 */
function writeToFile(file) {
	if (!writeQueue[file]) {
		return;
	}

    // If not already saving then save, but using the object we make sure to take only
    // the last changes.
    // Truncate - https://stackoverflow.com/questions/35178903/overwrite-a-file-in-node-js
    fs.truncate(file, err => {
        const beforeSaveVersion = writeQueue[file].version;
        fse.outputJson(file, writeQueue[file].db, err => {
			// Something has been saved while the filesystem was writing to file then
			// save again
            if (beforeSaveVersion !== writeQueue[file].version) {
                writeToFile(file);
            }

            resolveAllWriteQueueCallbacks(file, err);
            delete writeQueue[file];
        });
    });
}
/**
 * Internal. Check if the file exist and if don't then create the file with the same
 * content as default (or {} if default is falsy).
 * 
 * @param {string} file File path .
 * @param {object} defaults Default value if it has to create the file. 
 * @param {function} cb Callback called when the path existance was validated. Takes one
 *						argument, the error (if any).
 * @returns {void} Nothing.
 */
function ensure(file, defaults, cb) {
	fse.pathExists(file, (err, exists) => {
		if (err) {
			return cb(err);
		}

		if (exists) {
			return cb();
		}

		fse.outputJson(file, defaults || {}, cb);
	});
}

/**
 * Internal. Call to every callback of a the write queue for a file.
 * 
 * @param {string} file File path .
 * @param {string} error Error message or null.
 * @returns {void} Nothing.
 */
function resolveAllWriteQueueCallbacks(file, error) {
	writeQueue[file].callbacks.forEach(cb => cb(error));
}

module.exports = fileSystem;
