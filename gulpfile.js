'use strict';

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    debug = require('gulp-debug'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    jsdoc = require('gulp-jsdoc3');

gulp.task('jsdoc', function(cb) {
    var config = require('./docs/jsdoc.json');
    gulp.src(['./docs/README.md', './**/*.js', '!./gulp-tasks/**', '!./docs/**', '!./dist/**', '!./node_modules/**', '!./test/**.js', '!gulpfile.js', '!./coverage'], {read: false})
    .pipe(debug({title: 'JSDoc (Scope):'}))
    .pipe(jsdoc(config, cb));
});

gulp.task('test', function (cb) {
    gulp.src(['./src/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire()) 
    .on('finish', function () {
        gulp.src(['./test/*.js'])
        .pipe(mocha())
	.pipe(istanbul.writeReports())
	.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
	.on('end', cb);
    });
});

gulp.task('lint', function() {
    var filesToLint = [
        '**/*.{html,js}',
        '!tests/protractor.conf.js',
        '!dist/**/*',
        '!docs/**/*',
        '!node_modules/**/*',
        '!tmp/**/*',
        '!coverage/**/*'
    ];

    return gulp.src(filesToLint)
            .pipe(debug({title: 'eslint (Scope):'}))
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
});