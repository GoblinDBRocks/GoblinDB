var configGoblin = require("./config");
var helpers = require("./goblin_helpers");
var fs = require('fs');
var _ = require('lodash');
var O = require('observed')

//var WatchJS = require("watchjs")
//var watch = WatchJS.watch;
//var Scheduled = require("scheduled");


/* ---- Basic Goblin Skeleton ---- */
var goblin = {
    config: configGoblin,
    db:{},
    hooks: {
        onRecordChanges: undefined
    },
    saveDataTask: undefined
};

/* ---- Goblin Internal Fucntions ---- */



/* ---- Goblin Internal Events + Hooks Execution ---- */

var O = require('observed')
var ee = O(goblin)

//ee.on('change', function(){console.log("aaaaa")})


//console.log("holaaa...")
ee.on('change', function(changes){
    //console.log("cambios detectados...", changes)
    var err = false

    if (changes.path === "db") {
        if(goblin.config.recordChanges){
            fs.writeFile(goblin.config.file, JSON.stringify(goblin.db), function(error) {
                if(error) {
                    err = error;
                    throw configGoblin.logPrefix, 'Database saving error in file System:', err;
                }
            });
        }
    
        if(goblin.hooks.onRecordChanges && typeof(goblin.hooks.onRecordChanges) === "function" ){
            err ? goblin.hooks.onRecordChanges(err) : goblin.hooks.onRecordChanges();
        }
    } else {
        // changes in goblin (as objects) not tracket in this version
    }
})

goblin.db = {"aaa": "bbb"}


/* ---- Goblin Module Exportation ---- */

module.exports = function(config){
    // Validations
    config = helpers.configValidation(config);
    goblin.config = _.merge({}, goblin.config, config);
    
    // Read current data
    if (fs.existsSync(goblin.config.file)) {
        goblin.db = JSON.parse(fs.readFileSync(goblin.config.file))
    } else {
        fs.writeFileSync(goblin.config.file, JSON.stringify({}));
    }
    
    return {
        getConfig: function(){
            return goblin.config;
        },
        setConfig: function (data){
            goblin.config = _.merge({}, goblin.config, data);
        },
        stopStorage: function () {
            goblin.config.recordChanges = false;
        },
        startStorage: function () {
            goblin.config.recordChanges = true;
        },
        get: function () {
            return goblin.db
        },
        set: function(data){
            if(typeof(data) === "object"){
                goblin.db = data;
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            }
        },
        update: function(data){
            if(typeof(data) === "object"){
                goblin.db = _.merge({}, goblin.db, data);
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            }
        }
    }
    
}
