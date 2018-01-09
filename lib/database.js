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


/* Goblin Internal Events + Hooks Execution */

goblin.goblinDataEmitter.on('change', goblinChanged);


/* Internal functions */

function init() {
	goblin.db = Storage.read(goblin.config.files.db);

	if (!goblin.db) {
		goblin.db = {};
		Storage.save(goblin.config.files.db, JSON.stringify(goblin.db));
	} else if (typeof goblin.db === 'string') {
		console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
		goblin.db = JSON.parse(goblin.db);
	}

	return goblin.db;
}

function get(point) {
	if(point && typeof(point) === 'string') {
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

function push(data, point) {
	if(!point) {
		point = '';
	} else if(typeof(point) === 'string') {
		point = point + '.';
	} else {
		logger('DB_SAVE_INVALID_REFERENCE');
	}

	var newKey = point + randomstring.generate();

	if(data && typeof(data) === 'object') {
		set(data, newKey, true);
		goblin.goblinDataEmitter.emit('change', {'type': 'push', 'value': data, 'key': newKey});
	} else {
		logger('DB_SAVE_INVALID_DATA');
	}
}

function set(data, point, silent) {
	if(point && typeof(point) === 'string' && data && typeof(data) === 'object') {
		var tree = point.split('.'),
			parent = goblin.db;

		for (var i = 0; i < tree.length; i++) {
			if(i !== tree.length-1) {
				if(typeof parent[tree[i]] === 'undefined') {
					parent[tree[i]] = {};
				}
				parent = parent[tree[i]];
			} else {
				if(!silent) {
					goblin.goblinDataEmitter.emit('change', {'type': 'set', 'value': data, 'oldValue': goblin.db[point], 'key': point});
				}
				parent[tree[i]] = data;
			}
		}
	} else if (!point && data && typeof(data) === 'object' && !Array.isArray(data)) {
		if(!silent) {
			goblin.goblinDataEmitter.emit('change', {'type': 'set', 'value': data, 'oldValue': goblin.db});
		}
		goblin.db = data;
	} else if (!point && data && (data instanceof Array)) {
		logger('DB_SAVE_ARRAY');
	} else {
		logger('DB_SAVE_INVALID_DATA');
	}
}

function update(data, point) {
	if(point && typeof(point) === 'string' && typeof(data) === 'object') {
		var tree = point.split('.'),
			parent = goblin.db;

		for (var i = 0; i < tree.length; i++) {
			if(i !== tree.length-1) {
				if(typeof parent[tree[i]] === 'undefined') {
					parent[tree[i]] = {};
				}
				parent = parent[tree[i]];
			} else {
				const oldValue = parent[tree[i]];
				parent[tree[i]] = _.merge({}, goblin.db, data);
				goblin.goblinDataEmitter.emit('change', {'type': 'update', 'value': parent[tree[i]], 'oldValue': oldValue, 'key': point});
			}
		}
	} else if (!point && typeof(data) === 'object') {
		const oldValue = goblin.db;
		goblin.db = _.merge({}, goblin.db, data);
		goblin.goblinDataEmitter.emit('change', {'type': 'update', 'value': goblin.db, 'oldValue': oldValue});
	} else {
		logger('DB_SAVE_INVALID_DATA');
	}
}

function goblinChanged(details) {
	if(goblin.config.recordChanges) {
		// Save a clean version of the db, to avoid failures
		Storage.save(goblin.config.files.db, '', function(error) {
			if(error) {
				logger('DB_CLEAN_FS');
			}
			
			// And now, save the real db version
			Storage.save(goblin.config.files.db, JSON.stringify(goblin.db), function(error) {
				if(error) {
					logger('DB_SAVE_FS');
				}
			});
		});
	}

	// Hooks management
	goblin.hooks.repositoy.forEach(function(hook) {
		if(hook.event ===  details.type || hook.event === 'change') {
			hook.callback({'value': details.value, 'oldValue': details.oldValue});
		}
	});
}


/* Export module */

module.exports = Database;
