var GDB = require("./goblin");
var http = require("http");

var goblinDB = GDB();

console.log("Fear the Goblin!")

var datosOriginales = goblinDB.get();
console.log("datosOriginales:", datosOriginales);

goblinDB.set({"dato": "mundo!", "dato2": "que hazeee"});
goblinDB.update({"dato nuevo": "holaa....", "nuevo array": ["aaaa", true], "dato": "cambiado!"})

var datosActuales = goblinDB.get();
console.log("datosActuales:", datosActuales)

console.log("Let's make something fun....")
http.get("http://eventpoints.osweekends.com/api/events", function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        goblinDB.update({"eventos de la semana": JSON.parse(body)});
        console.log("Check", goblinDB.getConfig().file);
    });
}).on('error', function(e){
    console.log("Got an error: ", e);
});