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
	if(!isValidAmbush(object)) {
		return false;
	}

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

function update(id, object){
	// Validations
	if(!isValidId(id)) {
		return false;
	} 

	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id: id}));

	if(index > -1) {
		var oldValue = _.cloneDeep(goblin.ambush[index]);
		var newAmbush = _.merge(goblin.ambush[index], object);

		if(isValidAmbush(newAmbush)) {
			goblin.ambush[index] = newAmbush;
			goblin.ambushEmitter.emit('change', {'type': 'update', 'oldValue': oldValue, 'value': goblin.ambush[index]});
		} else {
			logger('AMBUSH_UPDATE_INVALID_DATA');
		}
	} else {
		logger('AMBUSH_UPDATE_INVALID_REFERENCE');
	}

	return true;
}

function details(id){
	// Validation
	if(!isValidId(id)) {
		return false;
	}

	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));
	return goblin.ambush[index];
}

function list(category){
	var list = [];
	if(category && typeof(category) === 'string'){
		list = _(goblin.ambush).filter(function(current){
			return _.includes(current.category, category);
		}).map('id').value();
	} else {
		list = _(goblin.ambush).map('id').value();
	}
	return list;

}

function run(id, parameter, callback){
	// Validation
	if(!isValidId(id)) {
		logger('AMBUSH_INVALID_REFERENCE');
		return false;
	}
	if(callback && typeof(callback) !== 'function') {
		logger('AMBUSH_NO_CALLBACK');
	}

	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));

	if(index !== -1) {
		goblin.ambush[index].action(parameter, callback);
	} else {
		logger('AMBUSH_INVALID_REFERENCE');
	}
}

function ambushChanged() {
	// Save a clean version of the functions, to avoid failures
    Storage.save(goblin.config.files.ambush, '', function(error) {
        if(error) {
            logger('AMBUSH_CLEAN_FS');
        }

        // And now, save the real ambush functions
        Storage.save(goblin.config.files.ambush, JSONfn.stringify(goblin.ambush), function(error) {
            if(error) {
                logger('AMBUSH_SAVE_FS');
            }
        });
    });
    
    // Ambush Events External hooks to be added here in next release.
    // Filters Object: type, value, oldValue
}


/* Validators */

function isValidAmbush(object) {

	let valid = true;

	if(!object || Array.isArray(object) || typeof(object) !== 'object') {
		logger('AMBUSH_INVALID_DATA');
		valid = false;
	}
	
	if(!object.id || typeof(object.id) !== 'string') {
		logger('AMBUSH_INVALID_ID');
		valid = false;
	}
	
	if(!object.category || !Array.isArray(object.category)) {
		logger('AMBUSH_INVALID_CATEGORY');
		valid = false;
	}
	
	if(!object.action || typeof(object.action) !== 'function') {
		logger('AMBUSH_INVALID_ACTION');
		valid = false;
	}

	object.description = (object.description && typeof(object.description) === 'string') ? object.description : false;

	return valid;
}

function isValidId(id) {
	let valid = true;

	if(!id || typeof(id) !== 'string') {
		logger('AMBUSH_INVALID_ID');
		valid = false;
	}

	return valid;
}


module.exports = Ambush;
