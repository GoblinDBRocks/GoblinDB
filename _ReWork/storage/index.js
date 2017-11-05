const fileSystem = require('./filesystem');

const Storage = {
	database: fileSystem,
	ambush: fileSystem
};


module.exports = Storage;
