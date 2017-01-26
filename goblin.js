var configGoblin = require("./config");
var helpers = require("./goblin_helpers");
var fs = require('fs');
var _ = require('lodash');
var O = require('observed');
var randomstring = require("randomstring");

/* ---- Basic Goblin Skeleton ---- */
var goblin = {
    config: configGoblin,
    db:{},
    hooks: {
        add: null,
        remove: null,
        repositoy: []
    },
    saveDataTask: undefined
};

/* ---- Goblin Internal Functions ---- */

goblin.hooks.add = function(event, callback){
    if(event && typeof(event) === "string" && callback && typeof(callback) === "function"){
        goblin.hooks.repositoy.push({"event": event, "callback": callback});
    } else {
        throw configGoblin.logPrefix, 'Event Error Record. Check your arguments:';
    }
}
goblin.hooks.remove = function(event, callback){
    _.remove(goblin.hooks.repositoy, {"event": event, "callback": callback});
}

/* ---- Goblin Internal Events + Hooks Execution ---- */

var O = require('observed')
var eventEmitter = O(goblin)

//ee.on('change', function(){console.log("aaaaa")})


//console.log("holaaa...")
eventEmitter.on('change', function(changes){
    var err = false

    if (changes.path === "db") {
        // Recording data in the file
        if(goblin.config.recordChanges){
            fs.writeFile(goblin.config.file, JSON.stringify(goblin.db), function(error) {
                if(error) {
                    err = error;
                    throw configGoblin.logPrefix, 'Database saving error in file System:', err;
                }
            });
        }
        
        // Hooks management
        goblin.hooks.repositoy.forEach(function(hook){
            if(hook.event ===  changes.type || hook.event === "change"){
                hook.callback({"value": changes.value, "oldValue": changes.oldValue})
            }
        })

    } else {
        // changes in goblin (as objects) not tracket in this version
    }
});

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
        on: goblin.hooks.add,
        off: goblin.hooks.remove,
        getConfig: function(){
            return goblin.config;
        },
        updateConfig: function (data){
            goblin.config = _.merge({}, goblin.config, data);
        },
        stopStorage: function () {
            goblin.config.recordChanges = false;
        },
        startStorage: function () {
            goblin.config.recordChanges = true;
        },
        get: function (point) {
            if(point && typeof(point) === "string"){
                return goblin.db[point];
            } else {
                return goblin.db;
            }
        },
        push: function (data){
            var newKey = randomstring.generate();
            
            if(data && typeof(data) === "object"){
                goblin.db[newKey] = data;
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            }
        },
        set: function(data, point){
            if(point && typeof(point) === "string" && data && typeof(data) === "object"){
                goblin.db[point] = data;
            } else if (!point && data && typeof(data) === "object"){
                goblin.db = data;
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            };
        },
        update: function(data, point){
            if(point && typeof(point) === "string" && typeof(data) === "object"){
                goblin.db[point] = _.merge({}, goblin.db, data);
            } else if (!point && typeof(data) === "object"){
                goblin.db = _.merge({}, goblin.db, data);
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            }
        }
    }
    
}
