var configGoblin = require("./config");
var fs = require('fs');

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

module.exports = {
    configValidation: configValidation
}
