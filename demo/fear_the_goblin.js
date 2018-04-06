const GDB = require('../index');
const https = require('https');

const demoConfig = {
    fileName: 'demo'
};

const httpsOptions = {
    hostname: 'api.github.com',
    path: '/orgs/GoblinDBRocks/events',
    headers: { 'User-Agent': 'Mozilla/5.0' }
};

const goblinDB = GDB(demoConfig, err => {
    goblinDB.set({});

    console.info('Fear the Goblin!');
    console.info('Current Internal configuration:', goblinDB.getConfig());

    goblinDB.on('change', function(changes){
        console.info('-- change detected!:', changes);
        console.info('====================');
    });

    const originalData = goblinDB.get();
    console.info('originalData:', originalData);

    goblinDB.set({'data': 'world!', 'data2': 'Hiiiii'}, 'elemento.elemento.elemento');
    goblinDB.update({'new data': 'hellooo....', 'new array': ['aaaa', true, 2], 'data': 'cambiado!'});

    const currentData = goblinDB.get();
    console.info('currentData:', currentData);

    console.info('*****************************');
    console.info('Let\'s make something fun....');
    https.get(httpsOptions, res => {
        let body = '';

        res.on('data', chunk => {
            body += chunk;
        });

        res.on('end', () => {
            goblinDB.off('change');
            goblinDB.update({'gh-events': JSON.parse(body)});
            console.info('*****************************');
            console.info('*****************************');
            console.info(
                'Check the key gh-events in the following file',
                goblinDB.getConfig().files.db
            );
            console.info('*****************************');
            console.info('*****************************');
        });
    }).on('error', e => {
        console.info('Got an error: ', e);
    });

    console.info('*****************************');
    console.info('Let\'s have some fun with advance features!');
    console.info('Fun with ambush functions!');

    goblinDB.ambush.add({
        id: 'testing-goblin',
        category: ['data', 'other-tag'],
        description: 'Optional details...',
        action: (argument, callback) => {
            console.info('This is from the Function storage in Goblin:');
            console.info('Current Argument:', argument);
            callback('I can send data...');
        }
    });
    
    goblinDB.ambush.run('testing-goblin', 'I love Goblin', arg => {
        console.info('*****************************');
        console.info('This is from the callback: Now Running the Callback...');
        console.info('This is from the Function storage in Goblin:', arg);
    });

    goblinDB.ambush.update('testing-goblin',{
        category: ['new thing...'],
        action: (a, b, c) => {
            if (c) {
                console.info(`${ a } * ${ b } * ${ c } = `, a * b * c);
            } else {
                console.info(`${ a } * ${ b } = `, a * b);
            }
        },
    });

    console.info(goblinDB.ambush.list());

    console.info('*****************************');
    console.info('Check ambush that apply a math operation');
    goblinDB.ambush.run('testing-goblin', 5, 2);
    goblinDB.ambush.details('testing-goblin').action(9, 2, 3);
});