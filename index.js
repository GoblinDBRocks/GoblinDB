const _ = require('lodash');

const goblin = require('./lib/goblin');
const mode = require('./lib/logger/mode');
const Ambush = require('./lib/ambush');
const Database = require('./lib/database');


function GoblinExports(config) {

	// Set configuration
	config = configValidation(config);
	goblin.config = _.merge({}, goblin.config, config);

	// Initialize current database
	Database.init();

	// Initialize current Ambush Database
	Ambush.init();

	return {
		ambush: {
			add: Ambush.add,
			remove: Ambush.remove,
			update: Ambush.update,
			details: Ambush.details,
			list: Ambush.list,
			run: Ambush.run
		},
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

function configValidation(configuration) {
	configuration = typeof(configuration) === 'object' ?  configuration : {};
	configuration.fileName = configuration.fileName ? configuration.fileName : 'goblin_db';
	configuration.files = {
		ambush: configuration.fileName + '.goblin',
		db: configuration.fileName + '.json'
	};
	configuration.recordChanges = configuration.recordChanges || true;
	configuration.mode = mode[configuration.mode] ? configuration.mode : 'production';

	return configuration;
}


module.exports = GoblinExports;
