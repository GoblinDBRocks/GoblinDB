const chai = require('chai'),
    expect = chai.expect,
    gutil = require('gulp-util'),
    fs = require('fs');

// Plugins
require('mocha-sinon');
chai.use(require('chai-fs'));
let dbReady = false, restoreReady = false;
const testDB = {db: './test/testDB.json', ambush: './test/testDB.goblin'};
const restoreDB = {db: './test/data/restore.json', ambush: './test/data/restore.goblin'};
const GDB = require('../index');

const goblinDB = GDB({'fileName': './test/testDB', mode: 'strict'}, function(err) {
    err && console.error('ERROR INITIALIZING DB', err);
    dbReady = true;
});

const errors = require('../lib/logger/errors.js');

// Mute feature for console.log
// @see: http://stackoverflow.com/a/1215400
const consoleLogger = function(){
    let oldConsoleLog = null;
    const pub = {};

    pub.enable =  function enableLogger() {
        if (oldConsoleLog === null) {
            return;
        }

        console.log = oldConsoleLog;
    };

    pub.disable = function disableLogger() {
        oldConsoleLog = console.log;
        console.log = function() {};
    };

    return pub;
}();

function emptyAmbushFunctions() {
    const currentFunctions = goblinDB.ambush.list();
    currentFunctions.forEach(function(element) {
        goblinDB.ambush.remove(element);
    });
}

function cleanGoblin (callback) {
    goblinDB.set({});

    callback();
}

function cleanAmbush (callback) {
    const funcs = goblinDB.ambush.list();

    for(let i = 0; i < funcs.length; i++) {
        goblinDB.ambush.remove(funcs[i]);
    }

    callback();
}

function waitDbContent(time, callback) {
    setTimeout(function(){
        callback();
    }, time);
}

function cleanUp (file){
    fs.exists(file, function(exists) {
        if (exists) {
            fs.unlinkSync(file);
        } else {
            gutil.colors.red(`${file} not found, so not deleting.`);
        }
    });
}

function checkFileCreation(file, done) {
    const interval = setInterval(() => {
        if (dbReady) {
            fs.open(file, 'r', (err, fd) => {
                expect(err).to.equal(null);
                done();
            });
            
            clearInterval(interval);
        }
    }, 30);
}

/**/
describe('Database creation and restore:', function() {
    it('Database - File created successfully', function(done) {
        checkFileCreation(testDB.db, done);
    });

    it('Ambush (Lambda) - File created successfully', function(done) {
        checkFileCreation(testDB.ambush, done);
    });

    it('Database - Store an object in memory after read from file', function() {
        expect(typeof(goblinDB.get())).to.deep.equal('object');
    });

    it('Ambush (Lambda) - Store an array in memory after read from file', function() {
        expect(Array.isArray(goblinDB.ambush.list())).to.equal(true);
    });
});

describe('Ambush (Lambda) test', function() {
    let control;
    let simpleFunction = {
        id: 'testing-simple-function',
        category: ['test'],
        description: 'This is a simple function',
        action: function() {
            control = true;
        }
    };

    let argumentFunction = {
        id: 'testing-argument-function',
        category: ['test', 'test-argument'],
        description: 'This is a function with arguments',
        action: function(argument) {
            control = argument;
        }
    };

    let fullFunction = {
        id: 'testing-callback-function',
        category: ['test', 'test-callback'],
        description: 'This is a function with arguments and callback',
        action: function(argument, callback) {
            callback(argument);
        }
    };

    describe('Events:', () => {
        afterEach(function(done) {
            cleanAmbush(done);
        });

        it('on add', done => {
            goblinDB.on('ambush-add', result => {
                expect(result.value).to.deep.equal(simpleFunction);
                expect(result.oldValue).to.be.equal();
                done();
                goblinDB.off('ambush-add');
            });
            goblinDB.ambush.add(simpleFunction);
        });

        it('on remove', done => {
            goblinDB.on('ambush-remove', result => {
                goblinDB.off('ambush-remove');
                expect(result.value).to.be.equal();
                expect(result.oldValue[0].id).to.be.equal(simpleFunction.id);
                done();
            });
            goblinDB.ambush.add(simpleFunction);
            goblinDB.ambush.remove(simpleFunction.id);
        });

        it('on update', done => {
            goblinDB.on('ambush-update', result => {
                expect(result.value.category).to.deep.equal(['probando']);
                expect(result.oldValue.id).to.be.equal(simpleFunction.id);
                done();
                goblinDB.off('ambush-update');
            });
            goblinDB.ambush.add(simpleFunction);
            goblinDB.ambush.update(simpleFunction.id, {category: ['probando']});
        });

        it('on change', done => {
            let changes = 0;
            const cleaner = object => {
                return {
                    id: object.id,
                    category: object.category,
                    description: object.description
                };
            };

            goblinDB.on('ambush-change', result => {
                changes++;

                switch(changes) {
                    case 1:
                        expect(result.value).to.deep.equal(simpleFunction);
                        expect(result.oldValue).to.be.equal();
                        return;
                    case 2:
                        expect(result.value).to.deep.equal(argumentFunction);
                        expect(result.oldValue).to.be.equal();
                        return;
                    case 3:
                        expect(result.value).to.deep.equal(fullFunction);
                        expect(result.oldValue).to.be.equal();
                        return;
                    case 4:
                        expect(result.value).to.be.equal();
                        expect(result.oldValue.map(cleaner)).to.deep.equal([
                            simpleFunction,
                            argumentFunction,
                            fullFunction
                        ].map(cleaner));
                        return;
                    case 5:
                        expect(result.value.description).to.deep.equal('Changing description');
                        expect(result.oldValue.description).to.be.equal(fullFunction.description);
                }
                
                done();
                goblinDB.off('ambush-change');
            });

            goblinDB.ambush.add(simpleFunction);
            goblinDB.ambush.add(argumentFunction);
            goblinDB.ambush.add(fullFunction);
            goblinDB.ambush.remove(simpleFunction.id);
            goblinDB.ambush.update(fullFunction.id, {description: 'Changing description'});
        });

        it('on error', done => {
            goblinDB.on('error', result => {
                expect(result.msg).to.be.equal('[GoblinDB]: Ambush saving error: no data provided or data is not an object/Array.');
                done();
                goblinDB.off('error');
            });

            try {
                goblinDB.ambush.add([]);
            } catch(e) {
                console.error(e);
                goblinDB.off('error');
            }
        });
    });

    describe('Methods:', function() {

        describe('add(): As Expected', function() {
            it('Simple function. No Arguments and No Callback', function() {
                goblinDB.ambush.add(simpleFunction);
                expect(goblinDB.ambush.details('testing-simple-function')).to.be.deep.equal(simpleFunction);
            });

            it('Function with Arguments. No Callback', function() {
                goblinDB.ambush.add(argumentFunction);
                expect(goblinDB.ambush.details('testing-argument-function')).to.be.deep.equal(argumentFunction);
            });

            it('Function with Arguments and Callback', function() {
                goblinDB.ambush.add(fullFunction);
                expect(goblinDB.ambush.details('testing-callback-function')).to.be.deep.equal(fullFunction);
            });
        });

        describe('add(): Error Management', function() {
            it('No Arguments provided', function() {
                expect(function () { goblinDB.ambush.add(); }).to.throw(errors.AMBUSH_INVALID_DATA);
            });

            it('Wrong Arguments provided: Array', function() {
                expect(function () { goblinDB.ambush.add([]); }).to.throw(errors.AMBUSH_INVALID_DATA);
            });

            it('Wrong Arguments provided: No ID', function() {
                expect(function () { goblinDB.ambush.add({
                    category: [],
                    action: function(){},
                }); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No right ID type of data', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 1,
                    category: [],
                    action: function(){},
                }); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No CATEGORY', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 'test',
                    action: function(){},
                }); }).to.throw(errors.AMBUSH_INVALID_CATEGORY);
            });

            it('Wrong Arguments provided: No right CATEGORY type of data', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 'test',
                    category: '',
                    action: function(){},
                }); }).to.throw(errors.AMBUSH_INVALID_CATEGORY);
            });

            it('Wrong Arguments provided: No ACTION', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 'test',
                    category: [],
                }); }).to.throw(errors.AMBUSH_INVALID_ACTION);
            });

            it('Wrong Arguments provided: No right ACTION type of data', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 'test',
                    category: [],
                    action: [],
                }); }).to.throw(errors.AMBUSH_INVALID_ACTION);
            });

            it('Wrong ID: The id already exist in the database', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 'testing-simple-function',
                    category: ['test-category'],
                    action: function() {},
                });}).to.throw(errors.AMBUSH_PROVIDED_ID_ALREADY_EXIST);
            });
        });

        describe('remove(): As Expected', function() {
            it('Simple function. No Arguments and No Callback', function() {
                goblinDB.ambush.remove('testing-simple-function');
                expect(goblinDB.ambush.list().length).to.be.equal(2);
            });

            it('Function with Arguments. No Callback', function() {
                goblinDB.ambush.remove('testing-argument-function');
                expect(goblinDB.ambush.list().length).to.be.equal(1);
            });

            it('Function with Arguments and Callback', function() {
                goblinDB.ambush.remove('testing-callback-function');
                expect(goblinDB.ambush.list().length).to.be.equal(0);
            });
        });

        describe('remove(): Error Management', function() {
            it('Wrong Arguments provided: No ID', function() {
                expect(function () { goblinDB.ambush.remove(); }).to.throw(errors.AMBUSH_INVALID_ID);
            });
            it('Wrong Arguments provided: No right ID type of data', function() {
                expect(function () { goblinDB.ambush.remove({id: 1}); }).to.throw(errors.AMBUSH_INVALID_ID);
            });
        });

        describe('update(): As Expected', function() {
            it('Overwrite the function completely:', function(){
                var origin = {
                    id: 'testing-origin',
                    category: ['test'],
                    description: 'This is a simple function',
                    action: function(){
                        control = true;
                    }
                };

                var after = {
                    id: 'testing-after',
                    category: ['test-modified'],
                    description: 'This is a modified function',
                    action: function(){
                        control = 'modified';
                    }
                };

                goblinDB.ambush.add(origin);
                goblinDB.ambush.update('testing-origin', after);
                expect(goblinDB.ambush.details('testing-after')).to.be.deep.equal(after);
                goblinDB.ambush.remove('testing-after');

            });
            it('Overwrite the -ID- only:', function(){
                const origin = {
                    id: 'testing-origin',
                    category: ['test'],
                    description: 'This is a simple function',
                    action: function(){
                        control = true;
                    }
                };

                goblinDB.ambush.add(origin);
                goblinDB.ambush.update('testing-origin', {id: 'testing-after'});
                origin.id = 'testing-after';
                expect(goblinDB.ambush.details('testing-after')).to.be.deep.equal(origin);
                goblinDB.ambush.remove('testing-after');
            });
            it('Overwrite the -ACTION- only:', function(){
                const origin = {
                    id: 'testing-origin',
                    category: ['test'],
                    description: 'This is a simple function',
                    action: function(){
                        control = true;
                    }
                };
                const changeFactor = function(){
                    return 'Now... is different!';
                };

                goblinDB.ambush.add(origin);
                goblinDB.ambush.update('testing-origin', {action: changeFactor});
                origin.action = changeFactor;
                expect(goblinDB.ambush.details('testing-origin')).to.be.deep.equal(origin);
                goblinDB.ambush.remove('testing-origin');
            });

            it('Overwrite the -CATEGORY- only:', function(){
                const origin = {
                    id: 'testing-origin',
                    category: ['test'],
                    description: 'This is a simple function',
                    action: function(){
                        control = true;
                    }
                };
                const changeFactor = ['Hello-test'];

                goblinDB.ambush.add(origin);
                goblinDB.ambush.update('testing-origin', {category: changeFactor});
                origin.category = changeFactor;
                expect(goblinDB.ambush.details('testing-origin')).to.be.deep.equal(origin);
                goblinDB.ambush.remove('testing-origin');
            });

            it('Overwrite the -DESCRIPTION- only:', function(){
                const origin = {
                    id: 'testing-origin',
                    category: ['test'],
                    description: 'This is a simple function',
                    action: function(){
                        control = true;
                    }
                };
                const changeFactor = 'Hello-test';

                goblinDB.ambush.add(origin);
                goblinDB.ambush.update('testing-origin', {description: changeFactor});
                origin.description = changeFactor;
                expect(goblinDB.ambush.details('testing-origin')).to.be.deep.equal(origin);
                goblinDB.ambush.remove('testing-origin');
            });
        });

        describe('update(): Error Management', function() {
            before(function() {
                // Add testing-callback-function and testing-simple-function ambush for testing purpose
                goblinDB.ambush.add(fullFunction);
                goblinDB.ambush.add(simpleFunction);
            });
            after(function() {
                goblinDB.ambush.remove('testing-callback-function');
            });

            it('Wrong ID conflict Management', function (){
                expect(function () {
                    goblinDB.ambush.update('invented-id', {
                        category: ['intented-data']
                    });
                }).to.throw(errors.AMBUSH_UPDATE_INVALID_REFERENCE);
            });

            it('Wrong ID shall not add functions', function (){
                const currentList = goblinDB.ambush.list();
                let actualList;

                consoleLogger.disable();
                try {
                    goblinDB.ambush.update('invented-id', {category: ['intented-data']});
                } catch(e) {
                    actualList = goblinDB.ambush.list();
                }
                consoleLogger.enable();

                expect(currentList).to.be.deep.equal(actualList);
            });

            it('Wrong Arguments provided: No ID', function() {
                expect(function () { goblinDB.ambush.update(); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No right ID type of data', function() {
                expect(function () { goblinDB.ambush.update(1); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('No Arguments provided', function() {
                expect(function() {
                    goblinDB.ambush.update('testing-callback-function');
                }).to.throw(errors.AMBUSH_INVALID_DATA);
            });

            it('Wrong Arguments provided: Array', function() {
                expect(function() {
                    goblinDB.ambush.update('testing-callback-function', []);
                }).to.throw(errors.AMBUSH_INVALID_DATA);
            });

            it('Wrong Arguments provided: No right ID type of data', function() {
                expect(function () { goblinDB.ambush.update('testing-callback-function',{
                    id: 1,
                    category: [],
                    action: function(){},
                });}).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No right CATEGORY type of data', function() {
                expect(function () { goblinDB.ambush.update('testing-callback-function',{
                    id: 'test',
                    category: 1,
                    action: function(){},
                });}).to.throw(errors.AMBUSH_INVALID_CATEGORY);
            });

            it('Wrong Arguments provided: No right ACTION type of data', function() {
                expect(function () { goblinDB.ambush.add({
                    id: 'test',
                    category: [],
                    action: [],
                });}).to.throw(errors.AMBUSH_INVALID_ACTION);
            });

            it('Wrong ID: The id already exist in the database', function() {
                expect(function () { goblinDB.ambush.update('testing-simple-function', {
                    id: 'testing-callback-function'
                });}).to.throw(errors.AMBUSH_PROVIDED_ID_ALREADY_EXIST);
            });
        });

        describe('list(): As Expected', function() {
            it('Brings all the functions', function() {
                cleanAmbush(function() {
                    goblinDB.ambush.add(simpleFunction);
                    goblinDB.ambush.add(fullFunction);
                });
                expect(goblinDB.ambush.list().length).to.be.equal(2);
            });
            it('Brings all the functions filtered by category', function() {
                expect(goblinDB.ambush.list('test').length).to.be.equal(2);
                expect(goblinDB.ambush.list('test-callback').length).to.be.equal(1);
            });
        });

        describe('list(): Error Management', function() {
            it('Deal with no real category', function(){
                expect(goblinDB.ambush.list('test-invented').length).to.be.equal(0);
            });
            it('Wrong Arguments provided: No right CATEGORY type of data', function(){
                expect(goblinDB.ambush.list(123).length).to.be.equal(2);
            });
        });

        describe('details(): As Expected', function() {
            it('Brings all the details of an existing function', function() {
                expect(goblinDB.ambush.details('testing-simple-function')).to.be.deep.equal(simpleFunction);
            });
        });

        describe('details(): Error Management', function() {
            it('Wrong Arguments provided: No ID', function() {
                expect(function () { goblinDB.ambush.details(); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No right ID type of data', function() {
                expect(function () { goblinDB.ambush.details(1); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong ID: The requested id does not exist', function() {
                expect(function () { goblinDB.ambush.details('testing-invented') }).to.throw(errors.AMBUSH_NOT_STORED_ID);
            });
        });

        describe('run(): As Expected', function() {
            it('Simple function. No Arguments and No Callback', function() {
                control = false;
                goblinDB.ambush.run('testing-simple-function');
                expect(control).to.be.equal(true);
            });

            it('Function with Arguments. No Callback', function() {
                control = false;
                goblinDB.ambush.add(argumentFunction);
                goblinDB.ambush.run('testing-argument-function', true);
                expect(control).to.be.equal(true);
            });

            it('Function with Arguments and Callback', function() {
                control = false;
                goblinDB.ambush.run('testing-callback-function', true, function(arg){
                    control = arg;
                });
                expect(control).to.be.equal(true);
            });
        });

        describe('run(): Error Management', function() {
            it('Wrong ID conflict Management', function() {
                expect(function () { goblinDB.ambush.run('invented-id-function', false, console.log); }).to.throw(errors.AMBUSH_INVALID_REFERENCE);
            });

            it('Shall not run a removed function', function() {
                control = false;
                goblinDB.ambush.run('testing-callback-function', true, function(arg){
                    control = arg;
                });
                expect(control).to.be.equal(true);
                goblinDB.ambush.remove('testing-callback-function');
                expect(function () {
                    goblinDB.ambush.run('testing-callback-function', false, function(arg){
                        control = arg;
                    });
                }).to.throw(errors.AMBUSH_INVALID_REFERENCE);
                expect(control).to.be.equal(true);
            });

            it('Wrong Arguments provided: No ID', function() {
                expect(function () { goblinDB.ambush.run(); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No right ID type of data', function() {
                expect(function () { goblinDB.ambush.run(1); }).to.throw(errors.AMBUSH_INVALID_ID);
            });

            it('Wrong Arguments provided: No right CALLBACK type of data', function() {
                expect(function () { goblinDB.ambush.run('test', 'test-argument', 'callback'); }).to.throw(errors.AMBUSH_NO_CALLBACK);
            });
        });
    });
});
/**/

describe('Database', function() {
    beforeEach(function(done) {
        cleanGoblin(done);
    });
    beforeEach(function(done) {
        cleanAmbush(done);
    });
    beforeEach(function() {
        this.sinon.stub(console, 'error');
    });

    describe('Enviroment:', function() {
        describe('JSON Database:', function() {
            it('File creation for data', function() {
                expect(testDB.db).to.be.a.file()
            });

            it('File creation for Ambush (Lmabda)', function() {
                expect(testDB.ambush).to.be.a.file()
            });
        })

        describe('JSON Database:', function() {
            it('Content for data', function(done) {
                waitDbContent(10, function() {
                    expect(testDB.db).with.content('{}\n');
                    done();
                })
            });

            it('Content for Ambush (Lmabda)', function(done) {
                emptyAmbushFunctions();
                waitDbContent(10, function() {
                    expect(testDB.ambush).with.content('[]\n');
                    done();
                })
            });
        });
    });

    describe('Events:', () => {
        it('on set', done => {
            const v = {are: 'deep'};
            goblinDB.on('set', result => {
                expect(result.value).to.deep.equal(v);
                done();
                goblinDB.off('set');
            });
            goblinDB.set(v);
        });

        it('on push', done => {
            const v = {are: 'deep'};
            goblinDB.on('push', result => {
                expect(result.value).to.deep.equal(v);
                done();
                goblinDB.off('push');
            });
            goblinDB.push(v);
        });

        it('on update', done => {
            const v = {are: 'deep'};
            goblinDB.on('update', result => {
                expect(result.value).to.deep.equal('new-value');
                expect(result.oldValue).to.deep.equal('deep');
                done();
                goblinDB.off('update');
            });
            goblinDB.set(v);
            goblinDB.update('new-value', 'are');
        });

        it('on truncate', done => {
            goblinDB.on('truncate', result => {
                expect(result.value).to.deep.equal({});
                done();
                goblinDB.off('truncate');
            });
            goblinDB.truncate();
        });

        it('on delete', done => {
            const v = {test: 1};
            goblinDB.set(v, 'data');
            goblinDB.on('delete', result => {
                expect(result.value).to.deep.equal();
                expect(result.oldValue).to.deep.equal(v);
                done();
                goblinDB.off('delete');
            });
            goblinDB.delete('data');
        });

        it('on change', done => {
            let changes = 0;

            goblinDB.on('change', result => {
                changes++;

                if (changes === 3) {
                    expect(result.value).to.deep.equal({ prueba: 10 });
                    expect(result.oldValue).to.deep.equal();
                    done();
                    goblinDB.off('change');
                }
            });

            const v = {test: 1};
            goblinDB.set(v, 'data');
            goblinDB.delete('data');
            goblinDB.push({prueba: 10}, 'deep.data');
        });
    });

    describe('Methods:', function() {
        const demoContent = {
            'data-test': 'testing content',
            'more-data-test': [123, true, 'hello'],
            'to': {
                'delete': {
                    'nested': {
                        'here': 'finish'
                    }
                }
            }
        };
        
        beforeEach(function() {
            goblinDB.set(demoContent)
        });

        it('Method get(): All Data', function() {
            expect(goblinDB.get()).to.deep.equal(demoContent);
        });

        it('Method get(): Key Data', function() {
            expect(goblinDB.get('data-test')).to.deep.equal(demoContent['data-test']);
        });

        it('Method set(): Replace All', function() {
            goblinDB.set({'hello': 'there', 'more-data': 'yeah!'});
            expect(goblinDB.get()).to.deep.equal({'hello': 'there', 'more-data': 'yeah!'});
        });
        it('Method set(): Replace Key Content', function() {
            goblinDB.set({'more': 'details'}, 'more-data');
            expect(goblinDB.get('more-data')).to.deep.equal({'more': 'details'});
        });
        it('Method push(): Creation', function() {
            goblinDB.push({'more':'data'});
            expect(Object.keys(goblinDB.get()).length).to.be.equal(4);
        });
        it('Method update(): Update object', function() {
            goblinDB.update({'more':'data'}, 'data-test');
            goblinDB.update([1,2,3,4,5], 'more-data-test');
            goblinDB.update('nothing', 'to');
            expect(goblinDB.get()).to.deep.equal({
                'data-test': {'more':'data'},
                'more-data-test': [1,2,3,4,5],
                'to': 'nothing'
            });
        });
        it('Method update(): Throw error when invalid pointer (invalid tree node route).', function() {
            expect(() => {
                goblinDB.update('nothing', 'this-should-not-exist');
            }).to.throw(errors.DB_UPDATE_POIN_NOT_EXIST)
        });
        it('Deep method set(): Create a deep object', function() {
            goblinDB.set({are: 'deep'}, 'internal.references.in.goblin');
            expect(goblinDB.get('internal')).to.deep.equal({'references': {'in': {'goblin': {'are': 'deep'}}}}); // internal.references.in.goblin.are.deep
        });
        it('Deep method get(): Get a deep node', function() {
            expect(goblinDB.get('to.delete.nested.here')).to.deep.equal('finish');
        });
        it('Deep method push(): Push two objects deep', function() {
            goblinDB.push({'deeper':'than expected'}, 'internal.references.in.goblin.push');
            goblinDB.push({'cooler':'than expected'}, 'internal.references.in.goblin.push');
            expect(Object.keys(goblinDB.get('internal.references.in.goblin.push')).length).to.be.equal(2);
        });
        it('Method getConfig(): Content', function() {
            expect(goblinDB.getConfig()).to.deep.equal({
                fileName: './test/testDB',
                files: {
                    ambush: './test/testDB.goblin',
                    db: './test/testDB.json'
                },
                pointerSymbol: ".",
                logPrefix: '[GoblinDB]',
                recordChanges: true,
                mode: 'strict'
            });
        });
        it('Method updateConfig(): Changes', function() {
            goblinDB.updateConfig({logPrefix: 'GoblinRocks!'});
            expect(goblinDB.getConfig()).to.deep.equal({
                fileName: './test/testDB',
                files: {
                    ambush: './test/testDB.goblin',
                    db: './test/testDB.json'
                },
                pointerSymbol: ".",
                logPrefix: '[GoblinRocks!]',
                recordChanges: true,
                mode: 'strict'
            });
        });

        it('Method stopStorage(): Changes', function() {
            goblinDB.stopStorage();
            expect(goblinDB.getConfig().recordChanges).to.be.equal(false);
        });

        it('Method startStorage(): Changes', function() {
            goblinDB.stopStorage();
            goblinDB.startStorage();
            expect(goblinDB.getConfig().recordChanges).to.be.equal(true);
        });

        it('Deep method delete(): Delete a nested point', function() {
            expect(goblinDB.delete('to.delete.nested.here')).to.be.equal(true);
            expect(goblinDB.get('to.delete.nested')).to.deep.equal({});
        });

        it('Deep method delete(): Not delete when pointing to a invalid node', function() {
            expect(function () {
                deleted = goblinDB.delete('to.not.exist.nested.point');
            }).to.throw();
        });

        it('Deep method delete(): Not point do nothing.', function() {
            let deleted = false;

            expect(function () {
                deleted = goblinDB.delete();
            }).to.throw();
            expect(deleted).to.be.equal(false);
        });

        it('Deep method truncate(): Truncate all db.', function() {
            goblinDB.truncate();
            expect(goblinDB.get()).to.deep.equal({});
        });
    })

    describe('Mode:', function() {
        it('Stric mode: Expect to thow an error', function() {
            const strictGDB = GDB({'fileName': './test/testDB', mode: 'strict'});
            expect(function () { strictGDB.ambush.update(); }).to.throw();
        });

        it('Development mode: Expect to get console error', function() {
            const devGDB = GDB({'fileName': './test/testDB', mode: 'development'});
            devGDB.ambush.update();
            expect( console.error.calledOnce ).to.be.true;
        });

        it('Production mode: Expect nothing, neither to throw or call console error', function() {
            const prodGDB = GDB({'fileName': './test/testDB', mode: 'production'});

            expect( function() { prodGDB.ambush.update() }).to.not.throw();
            expect( console.error.calledOnce ).to.be.false;
        });
    });
    
    after(function() {
        cleanUp(testDB.db);
        cleanUp(testDB.ambush);
    });
});


describe('Restore from file', function() {
    const sumFnRestore = {
        id: 'testing-sum-fn',
        category: ['test-fn', 'test-sum'],
        description: 'This is a function that gets an array of numbers and send the sum via callback',
        action: function(numbers, callback) {
            callback(numbers.reduce((accumulated, curr) => accumulated + curr, 0));
        }
    };

    it('Database - Restored from file successfully', function(done) {
        const restoreDB = GDB(
            {
                fileName: './test/data/restore',
                mode: 'development'
            },
            function(err) {
                err && console.error('ERROR INITIALIZING RESTORE DB', err);
                
                expect(restoreDB.get('internal.references.in.goblin.are')).to.equal('deep');
                done();
            }
        );
    });

    it('Ambush (Lambda) - Restored from file successfully', function(done) {
        const restoreDB = GDB(
            {
                fileName: './test/data/restore',
                mode: 'development'
            },
            function(err) {
                err && console.error('ERROR INITIALIZING RESTORE DB', err);
                
                restoreDB.ambush.run(sumFnRestore.id, [90, 8, 5], function(result) {
                    expect(result).to.equal(103);
                });
                done();
            }
        );
    });
});