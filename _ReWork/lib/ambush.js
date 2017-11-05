const _ = require('lodash');
const JSONfn = require('json-fn');

const goblin = require('./goblin');
const Storage = require('./storage').ambush;
const logger = require('./errors');

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
	if(!object || Array.isArray(object) || typeof(object) !== 'object') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no data provided or data is not an object/Array.']);
	}
	
	if(!object.id || typeof(object.id) !== 'string') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no ID provided or ID is not a string.']);
	}
	
	if(!object.category || !Array.isArray(object.category)) {
		logger([goblin.config.logPrefix, 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.']);
	}
	
	if(!object.action || typeof(object.action) !== 'function') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no ACTION provided or ACTION is not a function.']);
	}

	object.description = object.description && typeof(object.description) === 'string' ? object.description : false;


	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {'id': object.id}));
	if(index === -1) {
		goblin.ambush.push(object);
		goblin.ambushEmitter.emit('change', {'type': 'add', 'value': object});
	} else {
		console.log(goblin.config.logPrefix, 'Ambush ADD error: This ambush function was registered before.');
	}
}

function remove(id) {
	// Validation
	if(!id || typeof(id) !== 'string') {
		logger([goblin.config.logPrefix, 'Ambush error: no ID provided or ID is not a string.']);
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
	if(!id || typeof(id) !== 'string') {
		logger([goblin.config.logPrefix, 'Ambush error: no ID provided or ID is not a string.']);
	}

	if(!object || Array.isArray(object) || typeof(object) !== 'object') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no data provided or data is not an object/Array.']);
	}

	if(object.id && typeof(object.id) !== 'string') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no ID provided or ID is not a string.']);
	}

	if(object.category && !Array.isArray(object.category)) {
		logger([goblin.config.logPrefix, 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.']);
	}

	if(object.action && typeof(object.action) !== 'function') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no ACTION provided or ACTION is not a function.']);
	}

	if(object.description) {
		object.description = (typeof(object.description) === 'string') ? object.description : false;
	}

	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));

	if(index !== -1) {
		var oldValue = goblin.ambush[index];
		goblin.ambush[index] = _.merge(goblin.ambush[index], object);
		goblin.ambushEmitter.emit('change', {'type': 'update', 'oldValue': oldValue, 'value': goblin.ambush[index]});
	} else {
		console.log(goblin.config.logPrefix, 'Ambush UPDATE error: This ambush function was not registered before.');
	}
}

function details(id){
	// Validation
	if(!id || typeof(id) !== 'string') {
		logger([goblin.config.logPrefix, 'Ambush error: no ID provided or ID is not a string.']);
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
	if(!id || typeof(id) !== 'string') {
		logger([goblin.config.logPrefix, 'Ambush error: no ID provided or ID is not a string.']);
	}
	if(callback && typeof(callback) !== 'function') {
		logger([goblin.config.logPrefix, 'Ambush saving error: no CALLBACK provided or CALLBACK is not a function.']);
	}
	// Action
	var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));

	if(index !== -1) {
		goblin.ambush[index].action(parameter, callback);
	} else {
		console.log(goblin.config.logPrefix, 'Ambush RUN error: no ambush function registered with that ID');
	}
}

function ambushChanged() {

	console.log('##############################');
	console.log('##############################');
	console.log('YEEEEEEHA!!! Ambush changed!!!');
	console.log('##############################');
	console.log('##############################');
	console.log(goblin.ambush);
	console.log('##############################');

	// Save a clean version of the functions, to avoid failures
    Storage.save(goblin.config.files.ambush, '', function(error) {
        if(error) {
            logger([goblin.config.logPrefix, 'Database cleaning before saving error in file System:', error]);
        }
        console.log('Db clean!!');

        // And now, save the real ambush functions
        Storage.save(goblin.config.files.ambush, JSONfn.stringify(goblin.ambush), function(error) {
            if(error) {
                logger([goblin.config.logPrefix, 'Database saving error in file System:', error]);
            }
        	console.log('Db updated!!');
        });
    });
    
    // Ambush Events External hooks to be added here in next release.
    // Filters Object: type, value, oldValue
}

// ToDo: Function to validate
/*
function validate(ambush, opts) {
	// Validate only the opts in 'opts' param for 'ambush'
}
*/


module.exports = Ambush;
