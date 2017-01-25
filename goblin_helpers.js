var configGoblin = require("./config");
var fs = require('fs');

function configValidation(configuration){
    configuration = typeof(configuration) === "object" ?  configuration : {};
    configuration.file = configuration.file ? configuration.file : "./goblin_bd.json";
    configuration.recordChanges = configuration.recordChanges || true;
    return configuration;
}

module.exports = {
    configValidation: configValidation
}
