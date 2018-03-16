const _ = require('lodash');

const goblin = require('./lib/goblin');
const mode = require('./lib/logger/mode');
const Ambush = require('./lib/ambush');
const Database = require('./lib/database');

/**
 * Initialize Goblin DB with the data (if any) stored in the files 
 * 
 * @param {object} config Optional. Overwrite initial configuration.
 * 						  Ex. {@link @see './config.js'}
 * @param {function} cb Optional callback called when the database has finished restoring
 * 						data from files and it's ready to work. This callback takes only
 * 						one parameter which is the error message (if any) that happen in
 * 						the db initialization.
 * @returns {object} Goblin instance.
 */
function GoblinExports(config, cb) {
	if (!cb) {
		cb = function() {};
	}
	
	// Set configuration
	config = configValidation(config, goblin.config);
	goblin.config = _.merge({}, goblin.config, config);

	// Initialize current database
	Database.init(function(dbError) {
		if (dbError) {
			return cb(dbError);
		}

		// Initialize current Ambush Database
		Ambush.init(function(ambError) {
			cb(ambError);
		});
	});

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
		getConfig: function() {
			return goblin.config;
		},
		updateConfig: function(newConfig) {
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
		update: Database.update,
		delete: Database.delete,
		truncate: Database.truncate
	};
}

function configValidation(configuration, goblinConfiguration)  {
	configuration = typeof(configuration) === 'object' ?  configuration : {};
	configuration.fileName = configuration.fileName || goblinConfiguration.fileName;
	configuration.files = {
		ambush: configuration.fileName + '.goblin',
		db: configuration.fileName + '.json'
	};
  configuration.pointerSymbol = configuration.pointerSymbol || goblinConfiguration.pointerSymbol;
	configuration.recordChanges = configuration.recordChanges || goblinConfiguration.recordChanges;
	configuration.mode = configuration.mode || goblinConfiguration.mode;
	return configuration;
}

module.exports = GoblinExports;
