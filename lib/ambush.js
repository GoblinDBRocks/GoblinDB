const _ = require('lodash');
const JSONfn = require('json-fn');

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


/* Goblin Internal Events + Hooks Execution */

goblin.ambushEmitter.on('change', ambushChanged);


/* Internal functions */

function init() {
	try {
		goblin.ambush = eval(JSONfn.parse(Storage.read(goblin.config.files.ambush)));
	} catch(e) {
		console.log('error getting new ambush xD');
		goblin.ambush = null;
	}

	if(!goblin.ambush) {
		goblin.ambush = [];
		Storage.save(goblin.config.files.ambush, JSONfn.stringify(goblin.ambush));
	}

	return goblin.ambush;
}

function add(object) {
	// Validation
	if (!isValidAmbush(object)) {
		return false;
	}
	object.description = cleanDescription(object.description);

	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {'id': object.id}));
	if(index === -1) {
		goblin.ambush.push(object);
		goblin.ambushEmitter.emit('change', {'type': 'add', 'value': object});
	} else {
		// console.log(goblin.ambush);
		console.log(goblin.config.logPrefix, 'Ambush ADD error: This ambush function was registered before.');
	}
}

function remove(id) {
	// Validation
	if(!isValidId(id)) {
		return false;
	}

	const oldValue = JSON.stringify(goblin.ambush);

	_.remove(goblin.ambush, function(current) {
		// Action
		return current.id === id;
	});

	goblin.ambushEmitter.emit('change', {'type': 'remove', 'oldValue': JSON.parse(oldValue)});

}

function update(id, object) {
	// Validations
	if (!isValidId(id)) {
		return false;
	}

	// Action
	const index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id: id}));

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
	// Validation
	if(!isValidId(id)) {
		return false;
	}

	// Action
	const index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));
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
	// Validation
	if (!isValidId(id)) {
		logger('AMBUSH_INVALID_REFERENCE');
		return false;
	}

	if (callback && typeof(callback) !== 'function') {
		logger('AMBUSH_NO_CALLBACK');
	}

	// Action
	const index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));

	if (index !== -1) {
		goblin.ambush[index].action(parameter, callback);
	} else {
		logger('AMBUSH_INVALID_REFERENCE');
	}
}

function ambushChanged() {
	// Save a clean version of the functions, to avoid failures
    Storage.save(goblin.config.files.ambush, '', function(error) {
        if (error) {
            logger('AMBUSH_CLEAN_FS');
        }

        // And now, save the real ambush functions
        Storage.save(goblin.config.files.ambush, JSONfn.stringify(goblin.ambush), function(error) {
            if (error) {
                logger('AMBUSH_SAVE_FS');
            }
        });
    });

    // Ambush Events External hooks to be added here in next release.
    // Filters Object: type, value, oldValue
}

/* Utils */

function cleanDescription(description) {
	return (description && typeof(description) === 'string') ? description : false;
}

/* Validators */

function isValidAmbush(object) {
	return isValidObject(object) &&
		isValidId(object.id) &&
		isUniqueId(null, object.id) &&
		isValidCategory(object.category) &&
		isValidAction(object.action);
}

function isValidAmbushOnUpdate(id, object) {
	return isValidObject(object) &&
		(object.id === undefined || isValidId(object.id)) &&
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
		_.indexOf(goblin.ambush, _.find(goblin.ambush, {newId})) > -1
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

module.exports = Ambush;
