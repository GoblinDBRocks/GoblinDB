var chai = require("chai"),
    expect = chai.expect,
    gutil = require('gulp-util'),
    fs = require('fs');

chai.use(require('chai-fs'));

var testDB = "./test/testDB.goblin"
var GDB = require("../goblin");
var goblinDB = GDB({"file": testDB});


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
    describe("Methods:", function(){
        // Code...
        beforeEach(function(){
            // Code...
        });
        
        it("Method add(): As Expected", function() {
            // Code...
        });
        
        it("Method add(): As No Expected", function() {
            // Code...
        });
        
        it("Method remove(): As Expected", function() {
            // Code...
        });
        
        it("Method remove(): As No Expected", function() {
            // Code...
        });
        
        it("Method update(): As Expected", function() {
            // Code...
        });

        it("Method update(): As No Expected", function() {
            // Code...
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


describe("Database tests", function() {
    beforeEach(function(done) {
        cleanGoblin(done);
    });
    
    describe("Enviroment:", function(){
        it("JSON Database: file creation", function() {
            expect(testDB).to.be.a.file()
        });
        
        it("JSON Database: content", function(done) {
            waitDbContent(10, function(){
                expect(testDB).with.content("{}");
                done();
            })
        });
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

            expect(goblinDB.getConfig()).to.deep.equal({ logPrefix: '[GoblinDB]', file: testDB, recordChanges: true });
        });
        it("Method updateConfig(): Changes", function() {
            goblinDB.updateConfig({logPrefix: '[GoblinRocks!]', "extra": "extra-value"});
            
            expect(goblinDB.getConfig()).to.deep.equal({ logPrefix: '[GoblinRocks!]', extra: "extra-value", file: testDB, recordChanges: true });
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
        cleanUp(testDB);
    });
});
