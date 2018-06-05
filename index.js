const _ = require('lodash');

const goblin = require('./lib/goblin');
const modes = require('./lib/logger/mode');
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
	goblin.config = initialConfiguration(goblin.config, config);

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
			return Object.assign({}, goblin.config);
		},
		updateConfig: function(newConfig) {
			goblin.config = updateConfiguration(goblin.config, newConfig);
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

function isNotEmptyString(element) {
	return element && typeof(element) === 'string';
}

function isBoolean(element) {
	return typeof(element) === 'boolean';
}

function isValidMode(mode) {
	return modes[mode] !== undefined;
}

function initialConfiguration(defaultConfiguration, externalConfiguration) {
	const updated = updateConfiguration(defaultConfiguration, externalConfiguration);

	if (!updated.files) {
		updated.files = {
			ambush: updated.fileName + '.goblin',
			db: updated.fileName + '.json'
		};
	}

	return updated;
}

function updateConfiguration(currentConfiguration, newConfiguration)  {
	if (
		typeof(newConfiguration) !== 'object' ||
		newConfiguration === null ||
		Object.keys(newConfiguration).length === 0
	) {
		return currentConfiguration;
	}
	
	const updatedConfig = Object.assign({}, currentConfiguration);

	if (isNotEmptyString(newConfiguration.fileName)) {
		updatedConfig.fileName = newConfiguration.fileName;
		updatedConfig.files = {
			ambush: newConfiguration.fileName + '.goblin',
			db: newConfiguration.fileName + '.json'
		};
	}

	if (isNotEmptyString(newConfiguration.pointerSymbol)) {
		updatedConfig.pointerSymbol = newConfiguration.pointerSymbol;
	}

	if (isBoolean(newConfiguration.recordChanges)) {
		updatedConfig.recordChanges = newConfiguration.recordChanges;
	}

	if (isValidMode(newConfiguration.mode)) {
		updatedConfig.mode = newConfiguration.mode;
	}
	// console.log(updateConfiguration, newConfiguration);
	if (isNotEmptyString(newConfiguration.logPrefix)) {
		updatedConfig.logPrefix = '[' + newConfiguration.logPrefix + ']'
	}

	return updatedConfig;
}

module.exports = GoblinExports;
