const EventEmitter = require('events');
const _ = require('lodash');

const configGoblin = require('./config');

const goblin = {
	config: configGoblin,
	db: {},
	goblinDataEmitter: new EventEmitter(),
	ambush: [],
	ambushEmitter: new EventEmitter(),
	hooks: {
		add: addHook,
		remove: removeHook,
		repositoy: []
	},
	saveDataTask: undefined
};


/* Internal functions */

function addHook(event, callback){
	if(event && typeof(event) === 'string' && callback && typeof(callback) === 'function'){
		goblin.hooks.repositoy.push({'event': event, 'callback': callback});
	} else {
		throw configGoblin.logPrefix, 'Event Error Record. Check your arguments:';
	}
}

function removeHook(event, callback){
	_.remove(goblin.hooks.repositoy, {'event': event, 'callback': callback});
}


module.exports = goblin;