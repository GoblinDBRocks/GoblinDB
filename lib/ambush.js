const _ = require('lodash');
const JSONfn = require('json-fn');

const goblin = require('./goblin');
const Storage = require('./storage').ambush;
const logger = require('./logger');

/**
 * Ambush function data object.
 * 
 * @typedef {object} Ambush
 * @property {string} id Id of the ambush function.
 * @property {string} description Optional. Describe what the action does.
 * @property {array} category Optional. Category/ies to filter ambush functions later.
 * @property {function} action Action perform by this ambush function when calling method
 * 							   run() {@see #run}
 */

// Goblin Internal Events + Hooks Execution
goblin.ambushEmitter.on('change', function(details) {
	Storage.save(goblin.config.files.ambush, compileFn(goblin.ambush), function(err) {
		err && logger('AMBUSH_SAVE_FS', err);
	});

   	// Hooks management
	goblin.hooks.repository.forEach(function(hook) {
		if (hook.event === 'ambush-' + details.type || hook.event === 'ambush-change') {
			hook.callback({'value': details.value, 'oldValue': details.oldValue});
		}
	});
});


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
	Storage.read(goblin.config.files.ambush, [], function(err, db) {
		if (err) {
			return cb(err);
		}

		goblin.ambush = restoreFn(db);
		cb();

	});
}

/**
 * Parse functions when loading file restoring then to js valid objects.
 * 
 * @param {array} db Ambush functions db
 * @returns {arrat} Parsed db ready to use.
 */
function restoreFn(db) {
	return db.map(function(amb) {
		return Object.assign({}, amb, {action: JSONfn.parse(amb.action)});
	});
}

/**
 * Turn actions in every ambush function into valid json strings.
 * 
 * @param {array} db Ambush functions db.
 * @returns {arrat} Compiled db ready to save.
 */
function compileFn(db) {
	return db.map(function(amb) {
		return Object.assign({}, amb, {action: JSONfn.stringify(amb.action)});
	});

	return result;
}

/**
 * Store a new ambush function. Validates id doesn't exist already, etc.
 * 
 * @param {Ambush} object Ambush function data.
 * @returns {void} Nothing.
 */
function add(object) {
	if (!_isValidAmbush(object)) {
		return false;
	}

	object.description = _cleanDescription(object.description);

	if (!_belongToAStoredAmbush(object.id)) {
		goblin.ambush.push(object);
		goblin.ambushEmitter.emit('change', { type: 'add', value: object });
	} else {
		logger('AMBUSH_ADD_ERROR');
	}
}

/**
 * Remove an ambush function from the database.
 * 
 * @param {string} id Ambush function id.
 * @returns {void} Nothing.
 */
function remove(id) {
	if (!_isValidId(id)) {
		return false;
	}

	const oldValue = JSONfn.clone(goblin.ambush);

	_.remove(goblin.ambush, function(current) {
		return current.id === id;
	});

	goblin.ambushEmitter.emit('change', {
		type: 'remove',
		oldValue: oldValue
	});
}

/**
 * Updates an ambush function.
 * 
 * @param {string} id Ambush function id.
 * @param {Ambush} object Ambush function data.
 * @returns {bool} If updated or not.
 */
function update(id, object) {
	// Validations
	if (!_isValidId(id)) {
		return false;
	}

	// Action
	const index = _getIndexOfId(id);

	if (index > -1) {
		if (_isValidAmbushOnUpdate(id, object)) {
			const newAmbush = _.merge(goblin.ambush[index], object);
			newAmbush.description = _cleanDescription(newAmbush.description);

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

/**
 * Gets an ambush function data.
 * 
 * @param {string} id Ambush function id.
 * @returns {Ambush} Ambush function data.
 */
function details(id) {
	if (!_isValidId(id)) {
		return false;
	}

	const index = _getIndexOfId(id);

	if (index === -1) {
		return logger('AMBUSH_NOT_STORED_ID');
	}

	return goblin.ambush[index];
}

/**
 * List all ambush function ids that match the passed category. If actegory is a falsy
 * then all ambush functions will be listed.
 * 
 * @param {string} category Ambush function category.
 * @returns {array} Ids of the ambush functions of that category.
 */
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

/**
 * Run an ambush function action.
 * 
 * @param {string} id Ambush function id.
 * @param {any} parameter First parameter for the ambush function action.
 * @param {function} callback Second parameter for the ambush function action.
 * @returns {array} Ids of the ambush functions of that category.
 */
function run(id, parameter, callback) {
	if (!_isValidId(id)) {
		return false;
	}

	if (callback && typeof(callback) !== 'function') {
		logger('AMBUSH_NO_CALLBACK');
	}

	const index = _getIndexOfId(id);

	if (index > -1) {
		goblin.ambush[index].action(parameter, callback);
	} else {
		logger('AMBUSH_INVALID_REFERENCE');
	}
}

// Internal Functions

/**
 * Validate description returning the description only if valid and false otherwise.
 * 
 * @param {string} id Ambush function id.
 * @returns {(string | bool)} The description string if valid or false.
 */
function _cleanDescription(description) {
	return (description && typeof(description) === 'string') ? description : false;
}

/**
 * Validates ambush function data object on create.
 * 
 * @param {Ambush} object Ambush function data.
 * @returns {bool} If it's valid or not.
 */
function _isValidAmbush(object) {
	return _isValidObject(object) &&
		_isValidId(object.id) &&
		_isUniqueId(null, object.id) &&
		_isValidCategory(object.category) &&
		_isValidAction(object.action);
}

/**
 * Validates ambush function data object on update.
 * 
 * @param {string} id Ambush function id.
 * @param {Ambush} object Ambush function data.
 * @returns {bool} If it's valid or not.
 */
function _isValidAmbushOnUpdate(id, object) {
	return _isValidObject(object) &&
		_isValidNotRequired(object.id, _isValidId) &&
		_isUniqueId(id, object.id) &&
		_isValidNotRequired(object.category, _isValidCategory) &&
		_isValidNotRequired(object.action, _isValidAction);
}

/**
 * Tells if the passed element is a valid object (not an array).
 * 
 * @param {object} object The object to be validated.
 * @returns {bool} If it's valid or not.
 */
function _isValidObject(object) {
	if (!object || Array.isArray(object) || typeof(object) !== 'object') {
		logger('AMBUSH_INVALID_DATA');
		return false;
	}

	return true;
}

/**
 * Validates passed if is a string and it's not empty.
 * 
 * @param {string} id Ambush function id.
 * @returns {bool} If it's valid or not.
 */
function _isValidId(id) {
	if (!id || typeof(id) !== 'string') {
		logger('AMBUSH_INVALID_ID');
		return false;
	}

	return true;
}

/**
 * Validates passed action checking if it's a function.
 * 
 * @param {function} action Ambush function action.
 * @returns {bool} If it's valid or not.
 */
function _isValidAction(action) {
	if (!action || typeof(action) !== 'function') {
		logger('AMBUSH_INVALID_ACTION');
		return false;
	}

	return true;
}

/**
 * Validates passed category.
 * 
 * @param {array} category Ambush function categories.
 * @returns {bool} If it's valid or not.
 */
function _isValidCategory(category) {
	if (!category || !Array.isArray(category)) {
		logger('AMBUSH_INVALID_CATEGORY');
		return false;
	}

	return true;
}

/**
 * Validates an id doesn't belong to an already stored ambush function. When updating
 * an ambush function id check if the new id it's already in use.
 * 
 * @param {string} currentId Ambush function current id.
 * @param {string} newId Ambush function new id.
 * @returns {bool} If it already exist or not.
 */
function _isUniqueId(currentId, newId) {
	if (
		newId !== undefined &&
		currentId !== newId &&
		_belongToAStoredAmbush(newId)
	) {
		logger('AMBUSH_PROVIDED_ID_ALREADY_EXIST');
		return false;
	}

	return true;
}

/**
 * Takes two arguments, one of then is the element that may or may not exist and the
 * other one is the validation function to apply over it when it exist.
 * 
 * @param {any} element The element to be validated.
 * @param {function} validatorCallback The validator to apply over that element.
 * @returns {bool} True if there's no element or pass validation, false otherwise.
 */
function _isValidNotRequired(element, validatorCallback) {
	if (element !== undefined) {
		return validatorCallback(element);
	}

	return true;
}

/**
 * Gets the index of an stored ambush function given its id (or -1 if not exist).
 * 
 * @param {string} id Ambush function id.
 * @returns {int} Index of the ambush function or -1.
 */
function _getIndexOfId(id) {
	return _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}))
}

/**
 * Check if the passed id belongs to an stored ambush function.
 * 
 * @param {string} id Ambush function id.
 * @returns {bool} If exist or not.
 */
function _belongToAStoredAmbush(id) {
	return _getIndexOfId(id) > -1
}

module.exports = {
	init: init,
	add: add,
	remove: remove,
	update: update,
	details: details,
	list: list,
	run: run
};
