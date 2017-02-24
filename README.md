![shieldsIO](https://img.shields.io/github/issues/UlisesGascon/GoblinDB.svg)
![shieldsIO](https://img.shields.io/github/release/UlisesGascon/GoblinDB.svg)
![shieldsIO](https://img.shields.io/github/license/UlisesGascon/GoblinDB.svg)
![shieldsIO](https://img.shields.io/david/UlisesGascon/GoblinDB.svg)

# [GoblinDB](http://goblindb.osweekends.com/)

![goblin](https://raw.githubusercontent.com/GoblinDBRocks/Art/master/high_resolution/goblin_db_logo-01.png)

### Fear the Goblin!

**An amazing, simple and fun database for humans**


### Goblin Philosophy

- Coding is fun, so databases must be fun too.
- Data is the king.
- Data should be stored in the system as a file when a change happend.
- Data storage in the system must be hackable.
- The database can lead or connect your server components.
- Events are great... because we are asynchronous.
- We prefer facts over promises: facts are there, promises maybe yes or not. In fact, we're talking about callbacks.
- Data is not the only stuff that can be store in a database.
- We prefer ambush functions over lambda functions. As you know... we're talking about anonymous functions.

### [Documentation](http://goblindb.osweekends.com/)

```javascript
var GDB = require("goblindb");

var goblinDB = GDB();

console.log("Fear the Goblin!")

// Events supported
goblinDB.on('change', function(changes){
    console.log("-- change detected!:", changes)
    console.log("====================")
});

// Read all Database...
var originalData = goblinDB.get();
console.log("originalData:", originalData);

// Store data...
goblinDB.set({"data": "world!", "data2": "Hiiiii"});

// Update date...
goblinDB.update({"new data": "hellooo....", "new array": ["aaaa", true, 2], "data": "cambiado!"})

// Read all Database...
var currentData = goblinDB.get();
console.log("currentData:", currentData)
```

**[Check the official documentation in our website](http://goblindb.osweekends.com/)**


### Demo
You can run a demo in 4 steps!

1. Clone this repository
```bash
    git clone https://github.com/UlisesGascon/GoblinDB 
```

2. Enter in the folder
```bash
    cd GoblinDB
```

3. Install the dependencies
```bash
    npm install
```

4. Run *fear_the_goblin.js*
```bash
    node demo/fear_the_goblin.js
```

### Testing

You can test your changes...

```bash
npm test
```

### Future Implementations

- [ ] Support multidimensional navigation in the database (.ref() method).
- [ ] Support to chain methods.
- [ ] Puglin documentation exameple
- [ ] Add basic query methods as a plugin.
- [ ] Add Avance query methods as a plugin.
- [ ] Add support to .once() method for events.
- [ ] Add support to UID in events.
- [ ] Additional events to support (config changes, etc...).
- [ ] Add additional support to Backup goblin with other databases like Firebase, Mongo... in real time as a plugin.
- [ ] Full documentation in JSDoc.
- [ ] Gulp Tasks Improvement.
- [ ] Test support for Events using Sinon.
- [ ] Test refactor in order to separate more the test cases.


### Plugins

- __[GoblinSocket](https://github.com/CodingCarlos/GoblinSocket).__ *WebSocket interface for GoblinDB using SocketIO*

### Achievements

#### v.0.0.8

**Main target:**
- Improve architecture & compatibility

**Features:**
- Native Events now supported.
- No need to use Object.observe or proxy ECMA6 alternatives.

#### v.0.0.7

**Main target:**
- Ambush support

**Bugs Fixed:**
- No need to require http module, in documentation examples

**Features:**
- Database testing improved
- Added optional features like parameters and callbacks for Ambush (lambda) functions
- Added automatic save for Ambush
- Added .goblin extension in order to store ambush operations
- Added Testing to support ambush features
- Added goblin.ambush as container
- Added goblin.ambush.add(),
- Added goblin.ambush.remove(),
- Added goblin.ambush.update(),
- Added goblin.ambush.list(),
- Added goblin.ambush.details(),
- Added goblin.ambush.run()

#### v.0.0.6

- Readme improved

#### v.0.0.5

- [New Art](https://github.com/GoblinDBRocks/Art/)
- [New Organization](https://github.com/GoblinDBRocks/)

#### v.0.0.4

**Features:**
- Documentation improved

**Bugs Fixed**
- [Wrong route on npm install](https://github.com/UlisesGascon/GoblinDB/issues/3)
- [Database storage location](https://github.com/UlisesGascon/GoblinDB/issues/4)


#### v.0.0.3

**Notes:**
Just to solve issues with NPM.

#### v.0.0.2

**Main target:**
- Develop the basics key functionalities (methods)
- Key/Value operative database
- Event support
- Database recorded as file
- Minimum config setup

**Features:**
- Added support to JSDoc
- Added Gulp Tasks
- Added Basic Testing with Mocha, Chai and Istanbul
- Added .editorconfig
- Added esLint support
- Roadmap added
- Added File structure
- Added minimal validation
- Added basic documentation
- Added GoblinDB as Module
- Added GoglinDB Helpers as an independente module
- Added support to store the data on demand as JSON
- Added full support to events
- Added support to key changes in events
- Added Method on
- Added Method off
- Added Method getConfig
- Added Method setConfig
- Added Method stopStorage
- Added Method startStorage
- Added Method get
- Added Method push
- Added Method set
- Added Method update


#### v.0.0.1

**Features:**

**Notes:**
Just a "Hello world"

