// Error logger

module.exports = {
	'EVENT_RECORD': 'Event Error Record. Check your arguments.',
	'DB_SAVE_INVALID_REFERENCE': 'Database saving error: Invalid reference point type provided to push. Only string allowed.',
	'DB_SAVE_INVALID_DATA': 'Database saving error: no data provided or data is not an object/Array.',
	'DB_SAVE_ARRAY': 'Database saving error: Setting all the db to an Array is forbiden. Database must be an object.',
	'DB_CLEAN_FS': 'Database cleaning before saving error in file System.',
	'DB_SAVE_FS': 'Database saving error in file System.',
	'AMBUSH_NO_CALLBACK': 'Ambush execution warning: no CALLBACK provided or CALLBACK is not a function.',
	'AMBUSH_INVALID_REFERENCE':'Ambush RUN error: no ambush function registered with that ID',
	'AMBUSH_CLEAN_FS': 'Ambush cleaning before saving error in file System.',
	'AMBUSH_SAVE_FS': 'Ambush saving error in file System.',
	'AMBUSH_INVALID_DATA': 'Ambush saving error: no data provided or data is not an object/Array.',
	'AMBUSH_INVALID_ID': 'Ambush saving error: no ID provided or ID is not a string.',
	'AMBUSH_INVALID_CATEGORY': 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.',
	'AMBUSH_INVALID_ACTION': 'Ambush saving error: no ACTION provided or ACTION is not a function.',
	'AMBUSH_UPDATE_INVALID_REFERENCE': 'Ambush saving error: the provided id does not belong to any stored ambush function',
	'AMBUSH_PROVIDED_ID_ALREADY_EXIST': 'Ambush add / update error: the provided id belong to a stored ambush function',
	'AMBUSH_ADD_ERROR': 'Ambush ADD error: This ambush function was registered before.',
	'AMBUSH_NOT_STORED_ID': 'Ambush error: The provided ID doesn not belong to any stored ambush function.'
};

