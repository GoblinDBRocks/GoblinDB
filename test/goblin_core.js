var chai = require("chai"),
    expect = chai.expect,
    gutil = require('gulp-util'),
    fs = require('fs');

chai.use(require('chai-fs'));

var testDB = {db: "./test/testDB.json", ambush: "./test/testDB.goblin"}
var GDB = require("../goblin");
var goblinDB = GDB({"fileName": "./test/testDB"});


function cleanGoblin (callback) {
    goblinDB.set({})
    callback();
}

function waitDbContent(time, callback){
    setTimeout(function(){
        callback()
    }, time)
}

function cleanUp (file){
    fs.exists(file, function(exists) {
        if(exists) {
            fs.unlinkSync(file);
        } else {
            gutil.colors.red(`${file} not found, so not deleting.`);
        }
    });
}

describe("Ambush (Lambda) test", function(){
    var simpleFunction = {
        id: "testing-simple-function",
        category: ["test"],
        description: "This is a simple function",
        action: function(){
            return true;
        }
    };

    var argumentFunction = {
        id: "testing-argument-function",
        category: ["test", "test-argument"],
        description: "This is a function with arguments",
        action: function(argument){
            return argument;
        }
    };

    var fullFunction = {
        id: "testing-callback-function",
        category: ["test", "test-callback"],
        description: "This is a function with arguments and callback",
        action: function(argument, callback){
            callback(argument);
        }
    };
    
    describe("Methods:", function(){
        // Code...
        beforeEach(function(){
            // Code...
        });
        
        describe("add(): As Expected", function() {
            it("Simple function. No Arguments and No Callback", function() {
                goblinDB.ambush.add(simpleFunction);
                expect(goblinDB.ambush.details("testing-simple-function")).to.be.deep.equal(simpleFunction);
            });
            
            it("Function with Arguments. No Callback", function() {
                goblinDB.ambush.add(argumentFunction);
                expect(goblinDB.ambush.details("testing-argument-function")).to.be.deep.equal(argumentFunction);
            });  

            it("Function with Arguments and Callback", function() {
                goblinDB.ambush.add(fullFunction);
                expect(goblinDB.ambush.details("testing-callback-function")).to.be.deep.equal(fullFunction);
            });
        });
        
        describe("add(): Error Management", function() {
            it("No Arguments provided", function() {
                expect(function () { goblinDB.ambush.add() }).to.throw('Ambush saving error: no data provided or data is not an object/Array.');
            });
            it("Wrong Arguments provided: Array", function() {
                expect(function () { goblinDB.ambush.add([]) }).to.throw('Ambush saving error: no data provided or data is not an object/Array.');
            });
            it("Wrong Arguments provided: No ID", function() {
                expect(function () { goblinDB.ambush.add({
                    category: [],
                    action: function(){},
                })}).to.throw('Ambush saving error: no ID provided or ID is not a string.');
            });
            it("Wrong Arguments provided: No right ID type of data", function() {
                expect(function () { goblinDB.ambush.add({
                    id: 1,
                    category: [],
                    action: function(){},
                })}).to.throw('Ambush saving error: no ID provided or ID is not a string.');
            });
            it("Wrong Arguments provided: No CATEGORY", function() {
                expect(function () { goblinDB.ambush.add({
                    id: "test",
                    action: function(){},
                })}).to.throw('Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.');
            });
            it("Wrong Arguments provided: No right CATEGORY type of data", function() {
                expect(function () { goblinDB.ambush.add({
                    id: "test",
                    category: "",
                    action: function(){},
                })}).to.throw('Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.');
            });
            it("Wrong Arguments provided: No ACTION", function() {
                expect(function () { goblinDB.ambush.add({
                    id: "test",
                    category: [],
                })}).to.throw('Ambush saving error: no ACTION provided or ACTION is not a function.');
            });
            it("Wrong Arguments provided: No right ACTION type of data", function() {
                expect(function () { goblinDB.ambush.add({
                    id: "test",
                    category: [],
                    action: [],
                })}).to.throw('Ambush saving error: no ACTION provided or ACTION is not a function.');
            });
        });
        
        describe("Method remove(): As Expected", function() {
            it("Simple function. No Arguments and No Callback", function() {
                goblinDB.ambush.remove("testing-simple-function");
                expect(goblinDB.ambush.list().length).to.be.equal(2);
            });
            
            it("Function with Arguments. No Callback", function() {
                goblinDB.ambush.remove("testing-argument-function");
                expect(goblinDB.ambush.list().length).to.be.equal(1);
            });  

            it("Function with Arguments and Callback", function() {
                goblinDB.ambush.remove("testing-callback-function");
                expect(goblinDB.ambush.list().length).to.be.equal(0);
            });
        });
        
        describe("Method remove(): Error Management", function() {
            it("Wrong Arguments provided: No ID", function() {
                expect(function () { goblinDB.ambush.remove()}).to.throw('Ambush error: no ID provided or ID is not a string.');
            });
            it("Wrong Arguments provided: No right ID type of data", function() {
                expect(function () { goblinDB.ambush.remove({id: 1})}).to.throw('Ambush error: no ID provided or ID is not a string.');
            });
        });
        
        describe("Method update(): As Expected", function() {
            
            it("CONCEPT:", function(){
                goblinDB.ambush.add(simpleFunction);
                expect(goblinDB.ambush.list().length).to.be.equal(1);
            })
            it("CONCEPT-2:", function(){
                //goblinDB.ambush.add(simpleFunction);
                expect(goblinDB.ambush.list().length).to.be.equal(1);
            })
        });

        describe("Method update(): Error Management", function() {
            it("Wrong Arguments provided: No ID", function() {
                expect(function () { goblinDB.ambush.update()}).to.throw('Ambush error: no ID provided or ID is not a string.');
            });
            
            it("Wrong Arguments provided: No right ID type of data", function() {
                expect(function () { goblinDB.ambush.update(1)}).to.throw('Ambush error: no ID provided or ID is not a string.');
            });
            
            it("No Arguments provided", function() {
                expect(function () { goblinDB.ambush.update("testing-callback-function") }).to.throw('Ambush saving error: no data provided or data is not an object/Array.');
            });

            it("Wrong Arguments provided: Array", function() {
                expect(function () { goblinDB.ambush.update("testing-callback-function",[]) }).to.throw('Ambush saving error: no data provided or data is not an object/Array.');
            });
            
            it("Wrong Arguments provided: No right ID type of data", function() {
                expect(function () { goblinDB.ambush.update("testing-callback-function",{
                    id: 1,
                    category: [],
                    action: function(){},
                })}).to.throw('Ambush saving error: no ID provided or ID is not a string.');
            });
            
            it("Wrong Arguments provided: No right CATEGORY type of data", function() {
                expect(function () { goblinDB.ambush.update("testing-callback-function",{
                    id: "test",
                    category: 1,
                    action: function(){},
                })}).to.throw('Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.');
            });
            
            it("Wrong Arguments provided: No right ACTION type of data", function() {
                expect(function () { goblinDB.ambush.add({
                    id: "test",
                    category: [],
                    action: [],
                })}).to.throw('Ambush saving error: no ACTION provided or ACTION is not a function.');
            });
                        /**/
        });

        it("Method list(): As Expected", function() {
            // Code...
        });
        
        it("Method list(): As No Expected", function() {
            // Code...
        });
        
        it("Method deatils(): As Expected", function() {
            // Code...
        });

        it("Method deatils(): As No Expected", function() {
            // Code...
        });

        it("Method run(): As Expected", function() {
            // Code...
        });
        
        it("Method run(): As No Expected", function() {
            // Code...
        });
    });
});


describe("Database", function() {
    beforeEach(function(done) {
        cleanGoblin(done);
    });
    
    describe("Enviroment:", function(){
        describe("JSON Database:", function(){
            it("File creation for data", function() {
                expect(testDB.db).to.be.a.file()
            });
    
            it("File creation for Ambush (Lmabda)", function() {
                expect(testDB.ambush).to.be.a.file()
            });
        })

        describe("JSON Database:", function(){
            it("Content for data", function(done) {
                waitDbContent(10, function(){
                    expect(testDB.db).with.content("{}");
                    done();
                })
            });
            
            it("Content for Ambush (Lmabda)", function(done) {
                waitDbContent(10, function(){
                    expect(testDB.ambush).with.content("[]");
                    done();
                })
            });
        })
    })
    
    describe("Events:", function(){
        // In next release
    })
    
    describe("Methods:", function(){
        var demoContent = {"data-test": "testing content", "more-data-test": [123, true, "hello"]};
        beforeEach(function(){
            goblinDB.set(demoContent)
        });
        
        it("Method get(): All Data", function() {
            expect(goblinDB.get()).to.deep.equal(demoContent);
        });
        
        it("Method get(): Key Data", function() {
            expect(goblinDB.get("data-test")).to.deep.equal(demoContent["data-test"]);
        });
        
        it("Method set(): Replace All", function() {
            goblinDB.set({"hello": "there", "more-data": "yeah!"});
            
            expect(goblinDB.get()).to.deep.equal({"hello": "there", "more-data": "yeah!"});
        });
        it("Method set(): Replace Key Content", function() {
            goblinDB.set({"more": "details"}, "more-data");
            
            expect(goblinDB.get("more-data")).to.deep.equal({"more": "details"});
        }); 
        it("Method push(): Creation", function() {
            goblinDB.push({"more":"data"})
            
            expect(Object.keys(goblinDB.get()).length).to.be.equal(4);
        });
        it("Method getConfig(): Content", function() {

            expect(goblinDB.getConfig()).to.deep.equal({"fileName": "./test/testDB", "files": {"ambush": "./test/testDB.goblin", "db": "./test/testDB.json"}, logPrefix: '[GoblinDB]', recordChanges: true });
        });
        it("Method updateConfig(): Changes", function() {
            goblinDB.updateConfig({logPrefix: '[GoblinRocks!]', "extra": "extra-value"});
            
            expect(goblinDB.getConfig()).to.deep.equal({"fileName": "./test/testDB", "files": {"ambush": "./test/testDB.goblin", "db": "./test/testDB.json"}, logPrefix: '[GoblinRocks!]', extra: "extra-value", recordChanges: true });
        });
        it("Method stopStorage(): Changes", function() {
            goblinDB.stopStorage();
        
            expect(goblinDB.getConfig().recordChanges).to.be.equal(false);
        });
        it("Method startStorage(): Changes", function() {
            goblinDB.stopStorage();
            goblinDB.startStorage();
        
            expect(goblinDB.getConfig().recordChanges).to.be.equal(true);
        });
    })
    
    after(function() {
        cleanUp(testDB.db);
        cleanUp(testDB.ambush);
    });
});
