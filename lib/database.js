const _ = require('lodash');
const randomstring = require('randomstring');

const goblin = require('./goblin');
const Storage = require('./storage').database;
const logger = require('./logger');

// Goblin Internal Events + Hooks Execution
goblin.goblinDataEmitter.on('change', function(details) {
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
});

/**
 * Initialize database.
 * 
 * @param {function} cb Callback function called when the database is initialized,
 * 						meaning the functions have been restored from file. The function
 * 						gets a parameter which is an error message if any.
 * @returns {void}
 */
function init(cb) {
	Storage.read(goblin.config.files.db, {}, function(err, db) {
		if (err) {
			return cb(err);
		}

		goblin.db = db;
		cb();
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
		const tree = point.split(goblin.config.pointerSymbol);
		let parent = goblin.db;

		for (let i = 0; i < tree.length; i++) {
			if(i !== tree.length-1) {
				if(parent[tree[i]] === undefined) {
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

	const newKey = point + randomstring.generate();
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

	data = makeInmutable(data);
	
	if (point && typeof(point) === 'string') {
		const tree = point.split(goblin.config.pointerSymbol);
		let parent = goblin.db;

		for (let i = 0; i < tree.length; i++) {
			if (i !== tree.length - 1) {
				if (parent[tree[i]] === undefined) {
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

		const oldValue = goblin.db;
		goblin.db = data;
		!silent && goblin.goblinDataEmitter.emit('change', {
			type: 'set',
			value: goblin.db,
			oldValue: oldValue
		});
	}
}


/**
 * Update data to a point in the database nested tree. If you don't set a point where to
 * update the stored data then it'll replace all db, in that case the data can not
 * be an array. The first element of the DB has to be always an object.
 * 
 * @param {any} data The data to store in the database.
 * @param {string} point The place to store the data.
 * @returns {void}
 */
function update(data, point) {
	if (!data || (!point && typeof(data) !== 'object')) {
		return logger('DB_SAVE_INVALID_DATA');
	}

	data = makeInmutable(data);

	if (point && typeof(point) === 'string') {
		const tree = point.split('.');
		let parent = goblin.db;
		
		for (let i = 0; i < tree.length; i++) {
			if (parent[tree[i]] === undefined) {
				return logger('DB_UPDATE_POIN_NOT_EXIST', 'Invalid point: ' + point);
			}

			if (i < tree.length - 1) {
				parent = parent[tree[i]];
			} else {
				const oldValue = parent[tree[i]];
				parent[tree[i]] = data;
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
		goblin.db = Object.assign({}, goblin.db, data);
		goblin.goblinDataEmitter.emit('change', {
			type: 'update',
			value: goblin.db,
			oldValue: oldValue
		});
	}
}

/**
 * Deletes the content stored where point indicates.
 * 
 * @param {string} point The place where the data is stored.
 * @returns {bool} Success
 */
function deleteFn(point) {
	if (point && typeof(point) === 'string') {
		const tree = point.split('.');
		let source = goblin.db;

		return tree.every((node, i) => {
			if (source[node] === undefined) {
				logger('DB_DELETE_INVALID_POINT', node);
				return false;
			}

			if (i === tree.length - 1) {
				let oldValue = source[node];

				if (Array.isArray(source)) {
					source.splice(node, 1);
					return true;
				}

				if (delete source[node]) {
					goblin.goblinDataEmitter.emit('change', {
						type: 'delete',
						value: undefined,
						oldValue: oldValue
					});

					return true;
				} else {
					return false;
				}
			}

			source = source[node];
			return true;
		});
	}

	logger('DB_DELETE_MISSING_POINT');
	return false;
}

/**
 * Truncate all db data and restore it to default (an empty object).
 * 
 * @returns {void} Nothing
 */
function truncate() {
	const oldValue = Object.assign({}, goblin.db);
	goblin.db = {};
	goblin.goblinDataEmitter.emit('change', {
		type: 'truncate',
		value: goblin.db,
		oldValue: oldValue
	});
}


/**
 * Private. Check if an element is an object and creates a new memory ref for that object
 * to preserve inmutability. 
 *
 * @param {any} element The element to test agains.
 * @return {any} A new memory ref in the case it's an object.
 */
function makeInmutable(element) {
	if (element && typeof(element) === 'object') {
		if (Array.isArray(element)) {
			return [...element];
		} else {
			return Object.assign({}, element);
		}
	}

	return element;
}

module.exports = {
	init: init,
	get: get,
	push: push,
	set: set,
	update: update,
	delete: deleteFn,
	truncate: truncate
};
