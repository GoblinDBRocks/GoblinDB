var configGoblin = require("./config"),
    fs = require('fs'),
    EventEmitter = require('events'),
    _ = require('lodash'),
    randomstring = require("randomstring"),
    JSONfn = require('json-fn');

/* --- Goblin Internal Events --- */

var ambushEmitter = new EventEmitter();
var goblinDataEmitter = new EventEmitter();


/* --- Goblin Tools --- */

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

ambushEmitter.on("change", function(){
    fs.writeFile(goblin.config.files.ambush, "", function(error) {
        if(error) {
            throw configGoblin.logPrefix, 'Database cleaning before saving error in file System:', error;
        }
        fs.writeFile(goblin.config.files.ambush, JSONfn.stringify(goblin.ambush), function(error) {
            if(error) {
                throw configGoblin.logPrefix, 'Database saving error in file System:', error;
            }
        });
    });
    
    // Ambush Events External hooks to be added here in next release.
    // Filters Object: type, value, oldValue
});



goblinDataEmitter.on("change", function(details){
    if(goblin.config.recordChanges){
        fs.writeFile(goblin.config.files.db, "", function(error) {
            if(error) {
                throw configGoblin.logPrefix, 'Database cleaning before saving error in file System:', error;
            }
            fs.writeFile(goblin.config.files.db, JSON.stringify(goblin.db), function(error) {
                if(error) {
                    throw configGoblin.logPrefix, 'Database saving error in file System:', error;
                }
            });
        });
    }

    // Hooks management
    goblin.hooks.repositoy.forEach(function(hook){
        if(hook.event ===  details.type || hook.event === "change"){
            hook.callback({"value": details.value, "oldValue": details.oldValue})
        }
    })
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
                    ambushEmitter.emit('change', {'type': 'add', 'value': object});
                } else {
                    console.log(configGoblin.logPrefix, 'Ambush ADD error: This ambush function was registered before.');
                }

            },
            remove: function(id){
                // Validation
                if(!id || typeof(id) !== "string") throw configGoblin.logPrefix, 'Ambush error: no ID provided or ID is not a string.';
                
                // Action
                ambushEmitter.emit('change', {'type': 'remove', 'oldValue': goblin.ambush[id]});
                
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
                    var oldValue = goblin.ambush[index];
                    goblin.ambush[index] = _.merge(goblin.ambush[index], object);
                    ambushEmitter.emit('change', {'type': 'update', 'oldValue': oldValue, 'value': goblin.ambush[index]});
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
                var tree = point.split('.'),
                    parent = goblin.db;

                for (var i = 0; i < tree.length; i++) {
                    if(i !== tree.length-1) {
                        if(typeof parent[tree[i]] === 'undefined') {
                            // If there is no child here, won't be deeper. Return undefined
                            return undefined;
                        }
                        parent = parent[tree[i]];
                    } else {
                        return parent[tree[i]];
                    }
                }
            } else {
                return goblin.db;
            }
        },
        push: function (data, point){
            if(!point) {
                point = '';
            } else if(typeof(point) === 'string') {
                point = point + '.';
            } else {
                throw configGoblin.logPrefix, 'Database saving error: Invalid reference point type provided to push. Only string allowed.'
            }

            var newKey = point + randomstring.generate();

            if(data && typeof(data) === "object"){
                setDeep(data, newKey, true);
                goblinDataEmitter.emit('change', {'type': 'push', 'value': data, 'key': newKey});
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            }
        },
        set: setDeep,
        update: function(data, point){
            if(point && typeof(point) === "string" && typeof(data) === "object") {
                var tree = point.split('.'),
                    parent = goblin.db;

                for (var i = 0; i < tree.length; i++) {
                    if(i !== tree.length-1) {
                        if(typeof parent[tree[i]] === 'undefined') {
                            parent[tree[i]] = {};
                        }
                        parent = parent[tree[i]];
                    } else {
                        var oldValue = parent[tree[i]];
                        parent[tree[i]] = _.merge({}, goblin.db, data);
                        goblinDataEmitter.emit('change', {'type': 'update', 'value': parent[tree[i]], 'oldValue': oldValue, 'key': point});
                    }
                }
            } else if (!point && typeof(data) === "object") {
                var oldValue = goblin.db;
                goblin.db = _.merge({}, goblin.db, data);
                goblinDataEmitter.emit('change', {'type': 'update', 'value': goblin.db, 'oldValue': oldValue});
            } else {
                throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
            }
        }
    }

}


function setDeep(data, point, silent){
    if(point && typeof(point) === "string" && data && typeof(data) === "object") {
        var tree = point.split('.'),
            parent = goblin.db;

        for (var i = 0; i < tree.length; i++) {
            if(i !== tree.length-1) {
                if(typeof parent[tree[i]] === 'undefined') {
                    parent[tree[i]] = {};
                }
                parent = parent[tree[i]];
            } else {
                if(!silent) {
                    goblinDataEmitter.emit('change', {'type': 'set', 'value': data, 'oldValue': goblin.db[point], 'key': point});
                }
                parent[tree[i]] = data;
            }
        }
    } else if (!point && data && typeof(data) === "object" && !Array.isArray(data)) {
        if(!silent) {
            goblinDataEmitter.emit('change', {'type': 'set', 'value': data, 'oldValue': goblin.db});
        }
        goblin.db = data;
    } else if (!point && data && (data instanceof Array)) {
        throw configGoblin.logPrefix, 'Database saving error: Setting all the db to an Array is forbiden. Database must be an object.';
    } else {
        throw configGoblin.logPrefix, 'Database saving error: no data provided or data is not an object/Array.';
    }
}