var GDB = require('../index');
var http = require('http');

var goblinDB = GDB();

console.log('Fear the Goblin!');
console.log('Current Internal configuration:', goblinDB.getConfig());

goblinDB.on('change', function(changes){
    console.log('-- change detected!:', changes);
    console.log('====================');
});

var originalData = goblinDB.get();
console.log('originalData:', originalData);

goblinDB.set({'data': 'world!', 'data2': 'Hiiiii'});
goblinDB.update({'new data': 'hellooo....', 'new array': ['aaaa', true, 2], 'data': 'cambiado!'});

var currentData = goblinDB.get();
console.log('currentData:', currentData);

console.log('Let\'s make something fun....');
http.get('http://eventpoints.osweekends.com/api/events', function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        goblinDB.update({'events': JSON.parse(body)});
        console.log('Check', goblinDB.getConfig().files);
    });
}).on('error', function(e){
    console.log('Got an error: ', e);
});


console.log('Let\'s have some fun with advance features!');
console.log('Fun with ambush functions!');

goblinDB.ambush.add({
    id: 'testing-goblin',
    category: ['data', 'other-tag'],
    description: 'Optional details...',
    action: function(argument, callback){
        console.log('This is from the Function storage in Goblin:');
        console.log('Current Argument:', argument);
        callback('I can send data...');
    }
});

goblinDB.ambush.run('testing-goblin', 'I love Goblin', function(arg){
    console.log('This is from the callback: Now Running the Callback...');
    console.log('This is from the Function storage in Goblin:', arg);
});

goblinDB.ambush.update('testing-callback-function',{
    id: 'test',
    category: ['new thing...'],
    action: function(){},
});

console.log(goblinDB.ambush.list());
