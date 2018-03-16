const EventEmitter = require('events');
const _ = require('lodash');

const configGoblin = require('../config');
const errors = require('./logger/errors');

const goblin = {
	config: configGoblin,
	db: {},
	goblinDataEmitter: new EventEmitter(),
	ambush: [],
	ambushEmitter: new EventEmitter(),
	hooks: {
		add: addHook,
		remove: removeHook,
		repository: []
	},
	saveDataTask: undefined
};

function addHook(event, callback){
	if(event && typeof(event) === 'string' && callback && typeof(callback) === 'function') {
		goblin.hooks.repository.push({event, callback});
	} else {
		throw configGoblin.logPrefix, errors.EVENT_RECORD;
	}
}

function removeHook(event, callback) {
	const searchObj = {event};

	if (callback !== undefined) {
		searchObj.callback = callback;
	}

	_.remove(goblin.hooks.repository, searchObj);
}

module.exports = goblin;