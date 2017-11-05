const _ = require('lodash');
// const JSONfn = require('json-fn');

const goblin = require('./goblin');
const Database = require('./database');



function GoblinExports(config){

	// Set configuration
	config = configValidation(config);
	goblin.config = _.merge({}, goblin.config, config);

	// Initialize current database
	Database.init();

	// Initialize current Ambush Database
	// goblin.ambush = Storage.ambush.init(goblin.config.files.ambush);

	return {
		/*ambush: {
			add: function(object){
				// Validation
				if(!object || Array.isArray(object) || typeof(object) !== "object") throw configGoblin.logPrefix, 'Ambush saving error: no data provided or data is not an object/Array.';
				if(!object.id || typeof(object.id) !== "string") throw configGoblin.logPrefix, 'Ambush saving error: no ID provided or ID is not a string.';
				if(!object.category || !Array.isArray(object.category)) throw configGoblin.logPrefix, 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.';
				if(!object.action || typeof(object.action) !== "function") throw configGoblin.logPrefix, 'Ambush saving error: no ACTION provided or ACTION is not a function.';
				object.description = object.description && typeof(object.description) === "string" ? object.description : false;
				// Action
				var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {"id": object.id}));
				if(index === -1) {
					goblin.ambush.push(object);
					goblin.ambushEmitter.emit('change', {'type': 'add', 'value': object});
				} else {
					console.log(configGoblin.logPrefix, 'Ambush ADD error: This ambush function was registered before.');
				}

			},
			remove: function(id){
				// Validation
				if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
				
				// Action
				goblin.ambushEmitter.emit('change', {'type': 'remove', 'oldValue': goblin.ambush[id]});
				
				_.remove(goblin.ambush, function(current) {
					return current.id === id;
				});
				
				
			},
			update: function(id, object){
				// Validations
				if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
				if(!object || Array.isArray(object) || typeof(object) !== "object") throw configGoblin.logPrefix, 'Ambush saving error: no data provided or data is not an object/Array.';
				if(object.id){
					if(typeof(object.id) !== "string") throw configGoblin.logPrefix, 'Ambush saving error: no ID provided or ID is not a string.';
				}
				if(object.category){
					if(!Array.isArray(object.category)) throw configGoblin.logPrefix, 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.';
				}
				if(object.action){
					if(typeof(object.action) !== "function") throw configGoblin.logPrefix, 'Ambush saving error: no ACTION provided or ACTION is not a function.';
				}
				if(object.description){
					object.description = (typeof(object.description) === "string") ? object.description : false;
				}
			  // Action
				var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));

				if(index !== -1) {
					var oldValue = goblin.ambush[index];
					goblin.ambush[index] = _.merge(goblin.ambush[index], object);
					goblin.ambushEmitter.emit('change', {'type': 'update', 'oldValue': oldValue, 'value': goblin.ambush[index]});
				} else {
					console.log(configGoblin.logPrefix, 'Ambush UPDATE error: This ambush function was not registered before.');
				}
			},
			details: function(id){
				// Validation
				if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
				// Action
				var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));
				return goblin.ambush[index]
			},
			list: function(category){
				var list = [];
				if(category && typeof(category) === "string"){
					list = _(goblin.ambush).filter(function(current){
						return _.includes(current.category, category);
					}).map('id').value();
				} else {
					list = _(goblin.ambush).map('id').value();
				}
				return list;

			},
			run: function(id, parameter, callback){
				// Validation
				if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
				if(callback){
					if(typeof(callback) !== "function") throw configGoblin.logPrefix, 'Ambush saving error: no CALLBACK provided or CALLBACK is not a function.';
				}
				// Action
				var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));

				if(index !== -1) {
					goblin.ambush[index].action(parameter, callback);
				} else {
					console.log(configGoblin.logPrefix, 'Ambush RUN error: no ambush function registered with that ID');
				}
			}
		},*/
		on: goblin.hooks.add,
		off: goblin.hooks.remove,
		getConfig: function(){
			return goblin.config;
		},
		updateConfig: function(newConfig){
			goblin.config = _.merge({}, goblin.config, newConfig);
		},
		stopStorage: function() {
			goblin.config.recordChanges = false;
		},
		startStorage: function() {
			goblin.config.recordChanges = true;
		},
		get: Database.get,
		push: Database.push,
		set: Database.set,
		update: Database.update
	};
}

function configValidation(configuration){
	configuration = typeof(configuration) === 'object' ?  configuration : {};
	configuration.fileName = configuration.fileName ? configuration.fileName : './goblin_db';
	configuration.files = {
		ambush: configuration.fileName + '.goblin',
		db: configuration.fileName + '.json'
	};
	configuration.recordChanges = configuration.recordChanges || true;

	return configuration;
}


module.exports = GoblinExports;
