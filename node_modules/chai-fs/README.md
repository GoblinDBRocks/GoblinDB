# chai-fs

[![Build Status](https://secure.travis-ci.org/chaijs/chai-fs.png?branch=master)](http://travis-ci.org/chaijs/chai-fs) [![Dependency Status](https://david-dm.org/chaijs/chai-fs.svg)](https://david-dm.org/chaijs/chai-fs) [![devDependency Status](https://david-dm.org/chaijs/chai-fs/dev-status.svg)](https://david-dm.org/chaijs/chai-fs#info=devDependencies) [![NPM version](https://badge.fury.io/js/chai-fs.png)](http://badge.fury.io/js/chai-fs)

[Chai](http://chaijs.com/) assertion [plugin](http://chaijs.com/plugins/chai-fs) for the Node.js filesystem API. Uses `path` and synchronous `fs` to assert files and directories.

All assertions are available in `expect`, `should` and `assert` style, and support the optional, message parameter.

## Usage

### server-side

Install from npm:

    $ npm install chai-fs

Have chai use the chai-fs module:

    var chai = require('chai');
    chai.use(require('chai-fs'));

### browser-side

No file system.

## Assertions

### basename()

Assert the return value of `path.basename(path)`

	expect(path).to.have.basename(name, ?msg);
	expect(path).to.not.have.basename(name, ?msg);

	path.should.have.basename(name, ?msg);
	path.should.not.have.basename(name, ?msg);

	assert.basename(path, name, ?msg);
	assert.notBasename(path, name, ?msg);


### dirname()

Assert the return value of `path.dirname(path)`

	expect(path).to.have.dirname(name, ?msg);
	expect(path).to.not.have.dirname(name, ?msg);

	path.should.have.dirname(name, ?msg);
	path.should.not.have.dirname(name, ?msg);

	assert.dirname(path, name, ?msg);
	assert.notDirname(path, name, ?msg);


### extname()

Assert the return value of `path.extname(path)`

	expect(path).to.have.extname(name, ?msg);
	expect(path).to.not.have.extname(name, ?msg);

	path.should.have.extname(name, ?msg);
	path.should.not.have.extname(name, ?msg);

	assert.extname(path, name, ?msg);
	assert.notExtname(path, name, ?msg);


### path()

Assert the path exists.

Uses `fs.existsSync()`.

	expect(path).to.be.a.path(?msg);
	expect(path).to.not.be.a.path(?msg);

	path.should.be.a.path(?msg);
	path.should.not.be.a.path(?msg);

	assert.pathExists(path, ?msg);
	assert.notPathExists(path, ?msg);


Use of Chai's `exist`-chain would've been nice *but* has issues with negations and the message parameter. So don't do that.

### directory()

Assert the path exists and is a directory.

Uses `fs.statSync().isDirectory()`

	expect(path).to.be.a.directory(?msg);
	expect(path).to.not.be.a.directory(?msg);

	path.should.be.a.directory(?msg);
	path.should.not.be.a.directory(?msg);

	assert.isDirectory(path,  ?msg);
	assert.notIsDirectory(path, ?msg);

### directory().and.empty

Assert the path exists, is a directory and contains zero items.

	expect(path).to.be.a.directory(?msg).and.empty;
	expect(path).to.be.a.directory(?msg).and.not.empty;

	path.should.be.a.directory(?msg).and.empty;
	path.should.be.a.directory(?msg).and.not.empty;

	assert.isEmptyDirectory(path, ?msg);
	assert.notIsEmptyDirectory(path, ?msg);

* Chains after `directory()`
* Uses `fs.readdirSync().length === 0`.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `directory()`.

### directory().with.contents([...])

Assert the path exists, is a directory and has specific contents (files, sub-directories, symlinks, etc).

	expect(path).to.be.a.directory(?msg).with.contents(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.have.contents(array, ?msg);
	expect(path).to.be.a.directory(?msg).with.deep.contents(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.have.deep.contents(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.include.contents(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.include.contents(array, ?msg);

	path.should.be.a.directory(?msg).with.contents(array, ?msg);
	path.should.be.a.directory(?msg).and.not.have.contents(array, ?msg);
	path.should.be.a.directory(?msg).with.deep.contents(array, ?msg);
	path.should.be.a.directory(?msg).and.not.have.deep.contents(array, ?msg);
	path.should.be.a.directory(?msg).and.include.contents(array, ?msg);
	path.should.be.a.directory(?msg).and.not.include.contents(array, ?msg);

	assert.directoryContent(path, array, ?msg);
	assert.notDirectoryContent(path, array, ?msg);
	assert.directoryDeepContent(path, array, ?msg);
	assert.notDirectoryDeepContent(path, array, ?msg);
	assert.directoryInclude(path, array, ?msg);
	assert.notDirectoryInclude(path, array, ?msg);

* The paths of contents are relative to the directory
* Only the top level contents are included, unless `.deep` is in the chain
* If `.include` or `.contain` is in the chain, then the directory must contain _at least_ the specified contents, but may contain more
* You can use `.content()` or `.contents()`. They're both the same.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `directory()`.

### directory().with.files([...])

Assert the path exists, is a directory and contains specific files.

	expect(path).to.be.a.directory(?msg).with.files(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.have.files(array, ?msg);
	expect(path).to.be.a.directory(?msg).with.deep.files(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.have.deep.files(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.include.files(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.include.files(array, ?msg);

	path.should.be.a.directory(?msg).with.files(array, ?msg);
	path.should.be.a.directory(?msg).and.not.have.files(array, ?msg);
	path.should.be.a.directory(?msg).with.deep.files(array, ?msg);
	path.should.be.a.directory(?msg).and.not.have.deep.files(array, ?msg);
	path.should.be.a.directory(?msg).and.include.files(array, ?msg);
	path.should.be.a.directory(?msg).and.not.include.files(array, ?msg);

	assert.directoryFiles(path, array, ?msg);
	assert.notDirectoryFiles(path, array, ?msg);
	assert.directoryDeepFiles(path, array, ?msg);
	assert.notDirectoryDeepFiles(path, array, ?msg);
	assert.directoryIncludeFiles(path, array, ?msg);
	assert.notDirectoryIncludeFiles(path, array, ?msg);

* The file paths are relative to the directory
* Only the top level files are included, unless `.deep` is in the chain
* If `.include` or `.contain` is in the chain, then the directory must contain _at least_ the specified files, but may contain more
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `directory()`.

### directory().with.subDirs([...])

Assert the path exists, is a directory and contains specific sub-directories.

	expect(path).to.be.a.directory(?msg).with.subDirs(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.have.subDirs(array, ?msg);
	expect(path).to.be.a.directory(?msg).with.deep.subDirs(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.have.deep.subDirs(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.include.subDirs(array, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.include.subDirs(array, ?msg);

	path.should.be.a.directory(?msg).with.subDirs(array, ?msg);
	path.should.be.a.directory(?msg).and.not.have.subDirs(array, ?msg);
	path.should.be.a.directory(?msg).with.deep.subDirs(array, ?msg);
	path.should.be.a.directory(?msg).and.not.have.deep.subDirs(array, ?msg);
	path.should.be.a.directory(?msg).and.include.subDirs(array, ?msg);
	path.should.be.a.directory(?msg).and.not.include.subDirs(array, ?msg);

	assert.directorySubDirs(path, array, ?msg);
	assert.notDirectorySubDirs(path, array, ?msg);
	assert.directoryDeepSubDirs(path, array, ?msg);
	assert.notDirectoryDeepSubDirs(path, array, ?msg);
	assert.directoryIncludeSubDirs(path, array, ?msg);
	assert.notDirectoryIncludeSubDirs(path, array, ?msg);

* The paths of contents are relative to the starting directory
* Only the top level sub-directories are included, unless `.deep` is in the chain
* If `.include` or `.contain` is in the chain, then the directory must contain _at least_ the specified sub-directories, but may contain more
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `directory()`.

### directory().with.contents.that.satisfy(fn)

You can chain `.contents`, `.files`, and `.subDirs` with any Chai.js assertion that can operate on an array, including `.lengthOf()`, `.satisfy()`, `.members()`, etc.

	expect(path).to.be.a.directory().and.content.is.an('array');

	expect(path).to.be.a.directory().and.files.have.lengthOf(5);

	path.should.be.a.directory().with.subDirs.that.include.members(['subDir1', 'subDir2']);

	path.should.be.a.directory().with.files.that.satisfy(function(files) {
	  return files.every(function(file) {
	    return file.substr(-4) === '.txt';
	  });
	})

* The paths of contents are relative to the directory
* Only the top level contents are included, unless `.deep` is in the chain
* You can use `.content()` or `.contents()`. They're both the same.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `directory()`.

### directory().and.equal(otherPath)

Assert that _both_ paths exist, are directories and contain the same contents (files, sub-directories, symlinks, etc).

	expect(path).to.be.a.directory(?msg).and.equal(otherPath, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.equal(otherPath, ?msg);
	expect(path).to.be.a.directory(?msg).and.deep.equal(otherPath, ?msg);
	expect(path).to.be.a.directory(?msg).and.not.deep.equal(otherPath, ?msg);

	path.should.be.a.directory(?msg).and.equal(otherPath, ?msg);
	path.should.be.a.directory(?msg).and.not.equal(otherPath, ?msg);
	path.should.be.a.directory(?msg).and.deep.equal(otherPath, ?msg);
	path.should.be.a.directory(?msg).and.not.deep.equal(otherPath, ?msg);

	assert.directoryEqual(path, otherPath, ?msg);
	assert.notDirectoryEqual(path, otherPath, ?msg);
	assert.directoryDeepEqual(path, otherPath, ?msg);
	assert.notDirectoryDeepEqual(path, otherPath, ?msg);

* Only the top level contents are compared, unless `.deep` is in the chain
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `directory()`.

### file()

Assert the path exists and is a file.

Uses `fs.statSync().isFile()`

	expect(path).to.be.a.file(?msg);
	expect(path).to.not.be.a.file(?msg);

	path.should.be.a.file(?msg);
	path.should.not.be.a.file(?msg);

	assert.isFile(path, ?msg);
	assert.notIsFile(path, ?msg);

### file().and.empty

Assert the path exists, is a file and has zero size.

	expect(path).to.be.a.file(?msg).and.empty;
	expect(path).to.be.a.file(?msg).and.not.empty;

	path.should.be.a.file(?msg).and.empty;
	path.should.be.a.file(?msg).and.not.empty;

	assert.isEmptyFile(path, ?msg);
	assert.notIsEmptyFile(path, ?msg);

* Chains after `file()`
* Uses `fs.statSync().size === 0`.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `file()`.

### file().with.content(str)

Assert the path exists, is a file and has specific content.

	expect(path).to.be.a.file(?msg).with.content(data, ?msg);
	expect(path).to.be.a.file(?msg).and.not.have.content(data, ?msg);

	path.should.be.a.file(?msg).with.content(data, ?msg);
	path.should.be.a.file(?msg).and.not.have.content(data, ?msg);

	assert.fileContent(path, data, ?msg);
	assert.notFileContent(path, data, ?msg);

* Reads file as utf8 text (could update to support base64, binary Buffer etc).
* You can use `.content()` or `.contents()`. They're both the same.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `file()`.

### file().with.contents.that.match(/xyz/)

Assert the path exists, is a file and has contents that match the regular expression.

	expect(path).to.be.a.file(?msg).with.contents.that.match(/xyz/, ?msg);
	expect(path).to.be.a.file(?msg).and.not.have.contents.that.match(/xyz/, ?msg);

	path.should.be.a.file(?msg).with.contents.that.match(/xyz/, ?msg);
	path.should.be.a.file(?msg).and.not.have.contents.that.match(/xyz/, ?msg);

	assert.fileContentMatch(path, /xyz/, ?msg);
	assert.notFileContentMatch(path, /xyz/, ?msg);

* Reads file as utf8 text (could update to support base64, binary Buffer etc).
* You can use `.content` or `.contents`. They're both the same.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `file()`.

### file().and.equal(otherPath)

Assert that _both_ paths exist, are files and contain the same content

	expect(path).to.be.a.file(?msg).and.equal(otherPath, ?msg);
	expect(path).to.be.a.file(?msg).and.not.equal(otherPath, ?msg);

	path.should.be.a.file(?msg).and.equal(otherPath, ?msg);
	path.should.be.a.file(?msg).and.not.equal(otherPath, ?msg);

	assert.fileEqual(path, otherPath, ?msg);
	assert.notFileEqual(path, otherPath, ?msg);

* Reads both files as utf8 text (could update to support base64, binary Buffer etc).
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `file()`.

### file().and.deep.equal(otherPath)

Assert that _both_ paths exist, are files, contain the same content, and have the same attributes, including:

 * owner (`stats.uid`)
 * group (`stats.gid`)
 * creation time (`stats.birthtime`)
 * last-modified time (`stats.mtime`)
 * last-changed time (`stats.ctime`)


	expect(path).to.be.a.file(?msg).and.deep.equal(otherPath, ?msg);
	expect(path).to.be.a.file(?msg).and.not.deep.equal(otherPath, ?msg);

	path.should.be.a.file(?msg).and.deep.equal(otherPath, ?msg);
	path.should.be.a.file(?msg).and.not.deep.equal(otherPath, ?msg);

	assert.fileDeepEqual(path, otherPath, ?msg);
	assert.notFileDeepEqual(path, otherPath, ?msg);

* Reads both files as utf8 text (could update to support base64, binary Buffer etc).
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `file()`.
* last-access time (`stats.atime`) is _not_ included in the comparison, since just reading this value (via `fs.stat()`) causes it to change on some operating systems, which could result in unstable tests

### file().with.json

Assert the path exists, is a file and contains json parsable text.

	expect(path).to.be.a.file(?msg).with.json;
	expect(path).to.be.a.file(?msg).with.not.json;

	path.should.be.a.file(?msg).with.json;
	path.should.be.a.file(?msg).with.not.json;

	assert.jsonFile(path, ?msg);
	assert.notJsonFile(path, ?msg);

* Chains after `file()`
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `file()`.
* The `with` chain is just syntax sugar.

### file().using.json.schema(obj)

Assert the path exists, is a file, contains json parsable text conforming to given JSON-Schema.

	expect(path).to.be.a.file(?msg).with.json.using.schema(obj);
	expect(path).to.be.a.file(?msg).with.json.not.using.schema(obj);

	path.should.be.a.file(?msg).with.json.using.schema(obj);
	path.should.be.a.file(?msg).with.json.not.using.schema(obj);

	assert.jsonSchemaFile(path, schema,?msg);
	assert.notJsonSchemaFile(path, schema, ?msg);

* Chains after `file().with.json`
* The schema parameter must be a valid JSON-Schema v4.
* Depends on the [chai-json-schema](https://github.com/chaijs/chai-json-schema) plugin to be separately activated with `chai.use()`.
* To negate this using `expect/should` you chain the `.not`-negation ***after*** the regular `json`.
* The `with` and `using` chains are just syntax sugar.

###  Planned assertions

There are some ideas for future assertions saved [in this document](https://github.com/chaijs/chai-fs/tree/master/docs/planned.md).

## History

* 0.1.0 - Added content.match feature (thanks @legendary-mich)
* 0.0.2 - Plugin release
* 0.0.1 - Alpha release

## Contributing

Contributions are welcome. Please follow the code, test and style patterns and keep JSHint happy. Please make sure things work on all platforms, or at least Widows/Mac/Linux.

## Build & test

Install development dependencies in your git checkout:

    $ npm install

You need the global [grunt](http://gruntjs.com) command:

    $ npm install grunt-cli -g

Build and run tests:

    $ grunt

See the `Gruntfile` for additional commands.

### :wrench: Test generator

This plugin uses a prototype of an "assertion plugin test generator" to generates tests for all aspects of the assertions while keeping the specs DRY.

The pattern splits the test into a style declaration tree and a set of variation on 3 types of test scenarios. The generator then combines ('multiplies') every scenario variation with the style tree data to get good coverage of all cases.

The style tree defines ways to use an assertion: first level is the style: expect/should and assert. Then it defines both the normal use and the negation, then divides those into different invocations patterns for each style. So you can test with/without message, or as a chained method or property etc.

The tests are ways to specify assertions and the test expectations.

* `valid`  - test expected to pass (but fail the negation)
* `invalid` - test expected to fail (but pass the negation).
* `error` - test expected to always fail (even when negated), because the data is invalid (eg: bad data type, missing parameters etc).

The report field is used the verify the error message if the test fails. It supports a simple template format using the assertion data object.

#### Why?

This looks a bit complex and cumbersome but it does allow to quickly add large amount of detailed tests for all assertions. So far it seems to work empowering so I might extract this to a separate npm module later.

Note it will generate a large amount of case variations so a small error in the code or your test setup can explode the suite wit a many failing assertions. Look closely at which tests are failing to see what is causing what.

## License

Copyright (c) 2013 Bart van der Schoor

Licensed under the MIT license.
