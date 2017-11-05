module.exports = function (chai, utils) {

	require('./util')(chai, utils);
	require('./extend')(chai, utils);

	require('./assertions/content')(chai, utils);
	require('./assertions/content_match')(chai, utils);
	require('./assertions/name')(chai, utils);
	require('./assertions/path')(chai, utils);
	require('./assertions/file')(chai, utils);
	require('./assertions/file_equal')(chai, utils);
	require('./assertions/directory')(chai, utils);
	require('./assertions/directory_content')(chai, utils);
	require('./assertions/directory_equal')(chai, utils);
	require('./assertions/mode')(chai, utils);
	require('./assertions/symlink')(chai, utils);

};
