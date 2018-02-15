const _ = require('lodash');

const goblin = require('./goblin');
const Storage = require('./storage').ambush;
const logger = require('./logger');

const Ambush = {
	init: init,
	add: add,
	remove: remove,
	update: update,
	details: details,
	list: list,
	run: run
};

// Goblin Internal Events + Hooks Execution
goblin.ambushEmitter.on('change', ambushChanged);

/**
 * Initialize ambush functions database. Try to read from the configured file route,
 * if the file don't exist then try to create it with the default db. 
 * 
 * @param {function} cb Callback function called when the ambush db is initialized,
 * 						meaning the functions have been restored from file. The function
 * 						gets a parameter which is an error message if any.
 * @returns {void}
 */
function init(cb) {
	Storage.read(goblin.config.files.ambush, function(err, db) {
		if (!err) {
			goblin.ambush = eval(db);
			return cb();
		}

		// Create file if not exist.
		if (err.message.indexOf('ENOENT:') > -1) {
			goblin.ambush = [];
			Storage.save(goblin.config.files.ambush, goblin.ambush, function(saveError) {
				cb(saveError);
			});
		} else {
			cb(err);
		}
	});
}

function add(object) {
	if (!isValidAmbush(object)) {
		return false;
	}

	object.description = cleanDescription(object.description);

	if (!belongToAStoredAmbush(object.id)) {
		goblin.ambush.push(object);
		goblin.ambushEmitter.emit('change', { type: 'add', value: object });
	} else {
		logger('AMBUSH_ADD_ERROR');
	}
}

function remove(id) {
	if (!isValidId(id)) {
		return false;
	}

	const oldValue = JSON.stringify(goblin.ambush);

	_.remove(goblin.ambush, function(current) {
		return current.id === id;
	});

	goblin.ambushEmitter.emit('change', {
		type: 'remove',
		oldValue: JSON.parse(oldValue)
	});
}

function update(id, object) {
	// Validations
	if (!isValidId(id)) {
		return false;
	}

	// Action
	const index = getIndexOfId(id);

	if (index > -1) {
		if (isValidAmbushOnUpdate(id, object)) {
			const newAmbush = _.merge(goblin.ambush[index], object);
			newAmbush.description = cleanDescription(newAmbush.description);

			// Set updated ambush
			goblin.ambush[index] = newAmbush;
			goblin.ambushEmitter.emit(
				'change',
				{
					type: 'update',
					oldValue: _.cloneDeep(goblin.ambush[index]),
					value: goblin.ambush[index]
				}
			);
		}
	} else {
		logger('AMBUSH_UPDATE_INVALID_REFERENCE');
	}

	return true;
}

function details(id) {
	if (!isValidId(id)) {
		return false;
	}

	const index = getIndexOfId(id);

	if (index === -1) {
		logger('AMBUSH_NOT_STORED_ID');
	}

	return goblin.ambush[index];
}

function list(category){
	let list = [];

	if (category && typeof(category) === 'string') {
		list = _(goblin.ambush).filter(function(current) {
			return _.includes(current.category, category);
		}).map('id').value();
	} else {
		list = _(goblin.ambush).map('id').value();
	}
	return list;

}

function run(id, parameter, callback) {
	if (!isValidId(id)) {
		return false;
	}

	if (callback && typeof(callback) !== 'function') {
		logger('AMBUSH_NO_CALLBACK');
	}

	const index = getIndexOfId(id);

	if (index > -1) {
		goblin.ambush[index].action(parameter, callback);
	} else {
		logger('AMBUSH_INVALID_REFERENCE');
	}
}

function ambushChanged() {
	Storage.save(goblin.config.files.ambush, goblin.ambush, function(err) {
		if (err) {
			logger('AMBUSH_SAVE_FS', err);
		}
	});

    // Ambush Events External hooks to be added here in next release.
    // Filters Object: type, value, oldValue
}

// Utils
function cleanDescription(description) {
	return (description && typeof(description) === 'string') ? description : false;
}

// Validators
function isValidAmbush(object) {
	return isValidObject(object) &&
		isValidId(object.id) &&
		isUniqueId(null, object.id) &&
		isValidCategory(object.category) &&
		isValidAction(object.action);
}

function isValidAmbushOnUpdate(id, object) {
	return isValidObject(object) &&
		isValidNotRequired(object.id, isValidId) &&
		isUniqueId(id, object.id) &&
		isValidNotRequired(object.category, isValidCategory) &&
		isValidNotRequired(object.action, isValidAction);
}

function isValidObject(object) {
	if (!object || Array.isArray(object) || typeof(object) !== 'object') {
		logger('AMBUSH_INVALID_DATA');
		return false;
	}

	return true;
}

function isValidId(id) {
	if (!id || typeof(id) !== 'string') {
		logger('AMBUSH_INVALID_ID');
		return false;
	}

	return true;
}

function isValidAction(action) {
	if (!action || typeof(action) !== 'function') {
		logger('AMBUSH_INVALID_ACTION');
		return false;
	}

	return true;
}

function isValidCategory(category) {
	if (!category || !Array.isArray(category)) {
		logger('AMBUSH_INVALID_CATEGORY');
		return false;
	}

	return true;
}

function isUniqueId(currentId, newId) {
	if (
		newId !== undefined &&
		currentId !== newId &&
		belongToAStoredAmbush(newId)
	) {
		logger('AMBUSH_PROVIDED_ID_ALREADY_EXIST');
		return false;
	}

	return true;
}

function isValidNotRequired(element, validatorCallback) {
	if (element !== undefined) {
		return validatorCallback(element);
	}

	return true;
}

function getIndexOfId(id) {
	return _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}))
}

function belongToAStoredAmbush(id) {
	return getIndexOfId(id) > -1
}

module.exports = Ambush;
