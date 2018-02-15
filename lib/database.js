const _ = require('lodash');
const randomstring = require('randomstring');

const goblin = require('./goblin');
const Storage = require('./storage').database;
const logger = require('./logger');

const Database = {
	init: init,
	get: get,
	push: push,
	set: set,
	update: update
};


// Goblin Internal Events + Hooks Execution
goblin.goblinDataEmitter.on('change', goblinChanged);


/**
 * Initialize database.
 * 
 * @param {function} cb Callback function called when the database is initialized,
 * 						meaning the functions have been restored from file. The function
 * 						gets a parameter which is an error message if any.
 * @returns {void}
 */
function init(cb) {
	Storage.read(goblin.config.files.db, function(err, db) {
		if (!err) {
			goblin.db = db;
			return cb();
		}

		// Create file if not exist.
		if (err.message.indexOf('ENOENT:') > -1) {
			goblin.db = {};
			Storage.save(goblin.config.files.db, goblin.db, function(savingErr) {
				cb(savingErr);
			});
		} else {
			cb(err);
		}
	})
}

/**
 * Gets the data from a point in the nested tree. If you don't set a point then all db
 * will be returned.
 * 
 * @param {string} point The place where the data is stored. If there is no such place
 * 						 in the nested tree then it'll return undefined.
 * @returns {any} The stored data.
 */
function get(point) {
	if (point && typeof(point) === 'string') {
		var tree = point.split('.'),
			parent = goblin.db;

		for (var i = 0; i < tree.length; i++) {
			if(i !== tree.length-1) {
				if(typeof parent[tree[i]] === 'undefined') {
					// If there is no child here, won't be deeper. Return undefined
					return undefined;
				}
				parent = parent[tree[i]];
			} else {
				return parent[tree[i]];
			}
		}
	} else {
		return goblin.db;
	}
}

/**
 * Push data to a point in the database nested tree. If you don't set a point where to
 * store the data then it'll be stored in higher level, in that case the data can not
 * be an array. The first element of the DB has to be always an object.
 * 
 * @param {object | array} data The data to store in the database.
 * @param {string} point The place to store the data.
 * @returns {void}
 */
function push(data, point) {
	if (!point) {
		point = '';
	} else if (typeof(point) === 'string') {
		point = point + '.';
	} else {
		logger('DB_SAVE_INVALID_REFERENCE');
	}

	var newKey = point + randomstring.generate();
	set(data, newKey, true);
	goblin.goblinDataEmitter.emit('change', {
		type: 'push',
		value: data,
		key: newKey
	});
}

/**
 * Set data to a point in the database nested tree. If you don't set a point where to
 * store the data then it'll be stored in higher level, in that case the data can not
 * be an array. The first element of the DB has to be always an object.
 * 
 * @param {object | array} data The data to store in the database.
 * @param {string} point The place to store the data.
 * @param {bool} silent Internal use. When this is true this method doesn't trigger
 * 						events.
 * @returns {void}
 */
function set(data, point, silent) {
	if (!data || typeof(data) !== 'object') {
		return logger('DB_SAVE_INVALID_DATA');
	}

	if (point && typeof(point) === 'string') {
		var tree = point.split('.'),
			parent = goblin.db;

		for (var i = 0; i < tree.length; i++) {
			if (i !== tree.length - 1) {
				if (typeof parent[tree[i]] === 'undefined') {
					parent[tree[i]] = {};
				}

				parent = parent[tree[i]];
			} else {
				if (!silent) {
					goblin.goblinDataEmitter.emit('change', {
						type: 'set',
						value: data,
						oldValue: goblin.db[point],
						key: point
					});
				}

				parent[tree[i]] = data;
			}
		}
	} else {
		if (Array.isArray(data)) {
			return logger('DB_SAVE_ARRAY');
		}

		!silent && goblin.goblinDataEmitter.emit('change', {
			type: 'set',
			value: data,
			oldValue: goblin.db
		});

		goblin.db = data;
	}
}

/**
 * Update data to a point in the database nested tree. If you don't set a point where to
 * update the stored data then it'll replace all db, in that case the data can not
 * be an array. The first element of the DB has to be always an object.
 * 
 * @param {object | array} data The data to store in the database.
 * @param {string} point The place to store the data.
 * @returns {void}
 */
function update(data, point) {
	if (!data || typeof(data) !== 'object') {
		return logger('DB_SAVE_INVALID_DATA');
	}

	if (point && typeof(point) === 'string') {
		var tree = point.split('.'),
			parent = goblin.db;

		for (var i = 0; i < tree.length; i++) {
			if (i !== tree.length-1) {
				if (typeof parent[tree[i]] === 'undefined') {
					parent[tree[i]] = {};
				}
				parent = parent[tree[i]];
			} else {
				const oldValue = parent[tree[i]];
				parent[tree[i]] = _.merge({}, goblin.db, data);
				goblin.goblinDataEmitter.emit('change', {
					type: 'update',
					value: parent[tree[i]],
					oldValue: oldValue,
					key: point
				});
			}
		}
	} else {
		if (Array.isArray(data)) {
			return logger('DB_SAVE_ARRAY');
		}

		const oldValue = goblin.db;
		goblin.db = _.merge({}, goblin.db, data);
		goblin.goblinDataEmitter.emit('change', {
			type: 'update',
			value: goblin.db,
			oldValue: oldValue
		});
	}
}

function goblinChanged(details) {
	if (goblin.config.recordChanges) {
		Storage.save(goblin.config.files.db, goblin.db, function(err) {
			err && logger('DB_SAVE_FS', err);
		});
	}

	// Hooks management
	goblin.hooks.repository.forEach(function(hook) {
		if (hook.event ===  details.type || hook.event === 'change') {
			hook.callback({'value': details.value, 'oldValue': details.oldValue});
		}
	});
}

module.exports = Database;
