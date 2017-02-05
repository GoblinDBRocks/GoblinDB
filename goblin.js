var configGoblin = require("./config");
var fs = require('fs');
var _ = require('lodash');
var O = require('observed');
var randomstring = require("randomstring");
var JSONfn = require('json-fn');

function configValidation(configuration){
    configuration = typeof(configuration) === "object" ?  configuration : {};
    configuration.fileName = configuration.fileName ? configuration.fileName : "./goblin_db";
    configuration.files = {
        ambush: configuration.fileName+".goblin",
        db: configuration.fileName+".json"
    }
    configuration.recordChanges = configuration.recordChanges || true;
    return configuration;
}

/* ---- Basic Goblin Skeleton ---- */
var goblin = {
    config: configGoblin,
    db:{},
    ambush:[],
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

eventEmitter.on('change', function(changes){
    var err = false
    if (changes.path === "ambush") {
        fs.writeFile(goblin.config.files.ambush, JSONfn.stringify(goblin.ambush), function(error) {
            if(error) {
                err = error;
                throw configGoblin.logPrefix, 'Database saving error in file System:', err;
            }
        });
    }
    if (changes.path === "db") {
        // Recording data in the file
        if(goblin.config.recordChanges){
            fs.writeFile(goblin.config.files.db, JSON.stringify(goblin.db), function(error) {
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

    }
});

/* ---- Goblin Module Exportation ---- */

module.exports = function(config){
    // Validations
    config = configValidation(config);
    goblin.config = _.merge({}, goblin.config, config);
    
    // Read current database
    if (fs.existsSync(goblin.config.files.db)) {
        goblin.db = JSON.parse(fs.readFileSync(goblin.config.files.db))
    } else {
        fs.writeFileSync(goblin.config.files.db, JSON.stringify({}));
    }

    // Read current Ambush Database
    if (fs.existsSync(goblin.config.files.ambush)) {
        goblin.ambush = eval(JSONfn.parse(fs.readFileSync(goblin.config.files.ambush)))
    } else {
        fs.writeFileSync(goblin.config.files.ambush, JSON.stringify([]));
    }
    
    return {
        ambush: {
            add: function(object){
                // Validation
                if(!object || Array.isArray(object) || typeof(object) !== "object") throw configGoblin.logPrefix, 'Ambush saving error: no data provided or data is not an object/Array.';
                if(!object.id || typeof(object.id) !== "string") throw configGoblin.logPrefix, 'Ambush saving error: no ID provided or ID is not a string.';
                if(!object.category || !Array.isArray(object.category)) throw configGoblin.logPrefix, 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.';
                if(!object.action || typeof(object.action) !== "function") throw configGoblin.logPrefix, 'Ambush saving error: no ACTION provided or ACTION is not a function.';
                object.description = object.description && typeof(object.description) === "string" ? object.description : false;
                // Action
                var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {"id": object.id}));
                if(index === -1) {
                    goblin.ambush.push(object);
                } else {
                    console.log(configGoblin.logPrefix, 'Ambush ADD error: This ambush function was registered before.');
                }
                
            },
            remove: function(id){
                // Validation
                if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
                
                // Action
                _.remove(goblin.ambush, function(current) {
                    return current.id === id;
                });
            },
            update: function(id, object){
              // Validations
                if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
                if(!object || Array.isArray(object) || typeof(object) !== "object") throw configGoblin.logPrefix, 'Ambush saving error: no data provided or data is not an object/Array.';
                if(object.id){
                    if(typeof(object.id) !== "string") throw configGoblin.logPrefix, 'Ambush saving error: no ID provided or ID is not a string.';
                }
                if(object.category){
                    if(!Array.isArray(object.category)) throw configGoblin.logPrefix, 'Ambush saving error: no CATEGORY provided or CATEGORY is not an Array.';
                }
                if(object.action){
                    if(typeof(object.action) !== "function") throw configGoblin.logPrefix, 'Ambush saving error: no ACTION provided or ACTION is not a function.';
                }
                if(object.description){
                    object.description = (typeof(object.description) === "string") ? object.description : false;
                }
              // Action
                var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));
                
                if(index !== -1) {
                    goblin.ambush[index] = _.merge(goblin.ambush[index], object);;
                } else {
                    console.log(configGoblin.logPrefix, 'Ambush UPDATE error: This ambush function was not registered before.');
                }
            },
            details: function(id){
              // Validation
                if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
              // Action
                var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));
                return goblin.ambush[index]
            },
            list: function(category){
                var list = [];
                if(category && typeof(category) === "string"){
                    list = _(goblin.ambush).filter(function(current){
                        return _.includes(current.category, category);
                    }).map('id').value();
                } else {
                    list = _(goblin.ambush).map('id').value();
                }
                return list;
                
            },
            run: function(id, parameter, callback){
              // Validation
                if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
                if(callback){
                    if(typeof(callback) !== "function") throw configGoblin.logPrefix, 'Ambush saving error: no CALLBACK provided or CALLBACK is not a function.';
                }
              // Action
                var index = _.indexOf(goblin.ambush, _.find(goblin.ambush, {id}));
                
                if(index !== -1) {
                    goblin.ambush[index].action(parameter, callback);
                } else {
                    console.log(configGoblin.logPrefix, 'Ambush RUN error: no ambush function registered with that ID');
                }
            }
        },
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
