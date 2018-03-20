![shieldsIO](https://img.shields.io/github/issues/UlisesGascon/GoblinDB.svg)
![shieldsIO](https://img.shields.io/github/release/UlisesGascon/GoblinDB.svg)
![shieldsIO](https://img.shields.io/github/license/UlisesGascon/GoblinDB.svg)
![shieldsIO](https://img.shields.io/david/UlisesGascon/GoblinDB.svg)
[![Build Status](https://travis-ci.org/GoblinDBRocks/GoblinDB.svg?branch=master)](https://travis-ci.org/GoblinDBRocks/GoblinDB)

# [GoblinDB](http://goblindb.osweekends.com/)

![goblin](https://raw.githubusercontent.com/GoblinDBRocks/Art/master/high_resolution/goblin_db_logo-01.png)

### Fear the Goblin!

**An amazing, simple and fun database for humans**


### Goblin Philosophy

- Coding is fun, so databases must be fun too.
- Data is the king.
- Data should be stored in the system as a file whenever a change happens.
- Data storage in the system must be hackable.
- The database can lead or connect your server components.
- Events are great... because we are asynchronous.
- We prefer facts over promises: facts are there, promises maybe yes or not. In fact, we're talking about callbacks.
- Data is not the only stuff that can be store in a database.
- We prefer ambush functions over lambda functions. As you know... we're talking about anonymous functions.

### IMPORTANT!

GoblinDB is not ready for production. It'll be ready in a few days / 2 weeks...

**We will release a production ready version soon, please keep in touch**

### [Documentation](http://goblindb.osweekends.com/)

```javascript
const GDB = require("goblindb");

const goblinDB = GDB(function(dbError) {
    if (dbError) {
        throw dbError;
    }

    console.log("Fear the Goblin!")

    // Events supported
    goblinDB.on('change', function(changes){
        console.log("-- change detected!:", changes)
        console.log("====================")
    });

    // Read all Database...
    const originalData = goblinDB.get();
    console.log("originalData:", originalData);

    // Store data...
    goblinDB.set({"data": "world!", "data2": "Hiiiii"});

    // Update date...
    goblinDB.update({"new data": "hellooo....", "new array": ["aaaa", true, 2], "data": "cambiado!"})

    // Read all Database...
    const currentData = goblinDB.get();
    console.log("currentData:", currentData)
});
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

- [ ] Support to chain methods. [Issue 50](https://github.com/GoblinDBRocks/GoblinDB/issues/50)
- [ ] Add Pugins system. [Issue 12](https://github.com/GoblinDBRocks/GoblinDB/issues/12)
- [ ] Plugin documentation example. [Issue 56](https://github.com/GoblinDBRocks/GoblinDB/issues/56)
- [ ] Add basic query methods as a plugin. [Issue 54](https://github.com/GoblinDBRocks/GoblinDB/issues/54)
- [ ] Add Avance query methods as a plugin. [Issue 55](https://github.com/GoblinDBRocks/GoblinDB/issues/55)
- [ ] Add support to .once() method for events. [Issue 51](https://github.com/GoblinDBRocks/GoblinDB/issues/51)
- [ ] Add support to UID in events. [Issue 53](https://github.com/GoblinDBRocks/GoblinDB/issues/53)
- [ ] Add additional support to Backup Goblin with other databases like Firebase, Mongo... in real time as a plugin.[Issue 52](https://github.com/GoblinDBRocks/GoblinDB/issues/52)
- [x] Support multidimensional navigation in the database (.ref() method). Using get instead of .ref but same functionality. [Issue 17](https://github.com/GoblinDBRocks/GoblinDB/issues/17)
- [x] Additional events to support (config changes, etc...). 
- [x] Full documentation in JSDoc.
- [x] Gulp Tasks Improvement.
- [x] Test support for Events using Sinon.
- [x] Test refactor in order to separate more the test cases.


### Plugins

- __[GoblinSocket](https://github.com/CodingCarlos/GoblinSocket).__ *WebSocket interface for GoblinDB using SocketIO*

### Achievements

#### v.0.0.11 Meigas!
We've found bugs... bugs which didn't make sense, like meigas it looks like there is none but in the end there were some big bugs like db not storing data in the json and other similar "features" :trollface:

Wellcome to the new members of the team :heart: Andrés @drewler (The Galician Tigger), Santiago @trigoporres (El potro de Vallecas) and Alvaro @alvarogtx300 (El ausente :trollface:)

People which have contributed to this release:

[Sebastián Cabanas](https://github.com/Sediug) **Co-leader**

[Carlos Hernandez](https://github.com/CodingCarlos) **Co-leader**

[Ulises Gascón](https://github.com/UlisesGascon) **Evangelist and Consultant**

[Santiago Trigo Porres](https://github.com/trigoporres) **Contributor** :tada::tada:

[Andrés](https://github.com/drewler) **Contributor** :tada::tada:

[Alvaro](https://github.com/alvarogtx300) **Contributor** :tada::tada:



**Main target:**

- Version 1 candidate.
- Remove eval. Improved how data gets saved and loaded.
- Various code improvements.
- Events improvements.
- Add callback to goblin init method (now async loading json db files).
- Allow using a custom pointer symbol (you can use '/' for example, instead of '.' (default)). Configurable in init method config. [Issue 36](https://github.com/GoblinDBRocks/GoblinDB/issues/36) [Pull Request 42](https://github.com/GoblinDBRocks/GoblinDB/pull/42) Thanks to [Santiago Trigo Porres](https://github.com/trigoporres) :100:
- Add **delete** and **truncate** methods to database. [Issue 38](https://github.com/GoblinDBRocks/GoblinDB/issues/38) PR [Pull Request 34](https://github.com/GoblinDBRocks/GoblinDB/pull/34)
- Add error events hook. Now you can listen to `goblinDBInstance.on('error', callback...)`. [Issue 37](https://github.com/GoblinDBRocks/GoblinDB/issues/37) [Pull Request 43](https://github.com/GoblinDBRocks/GoblinDB/pull/43) Thanks to [Alvaro](https://github.com/alvarogtx300) :100:
- Add test cases for events. [Issue 8](https://github.com/GoblinDBRocks/GoblinDB/issues/8) [Pull Request 44](https://github.com/GoblinDBRocks/GoblinDB/pull/44)
- Add errors FAQ and improve messages adding links to the docs (in dev mode only). [Issue 14](https://github.com/GoblinDBRocks/GoblinDB/issues/14) [Pull Request 46](https://github.com/GoblinDBRocks/GoblinDB/pull/46) Thanks to [Andrés](https://github.com/drewler) :100:
- Add ambush functions events hooks.  Now you can listen to **ambush-change**, **ambush-add**, **ambush-update** and **ambush-remove**.
- Add support for detaching all events of the same type for all the callbacks associated. Ex. Detaching the listeners for 4 different callbacks on change event.

**Bug fixes:**

- Lots of bugs. I don't even now where to start haha. 

**Features:**

- Add methods **delete** and **truncate** to the database.
- Added a callback to Goblin **init** method which will be called when the db is ready to work (load data from file async).
- Allow using a custom pointer symbol. Now you can use ***'/'*** (firebase friendly).
- New code structure (feature only for developers), wich improve stability.
- Test improvements (feature only for developers), wich improve stability.

**Notices:**
- Great job and support from [Alvaro](https://github.com/alvarogtx300), [Santiago Trigo Porres](https://github.com/trigoporres) and [Andrés](https://github.com/drewler) (now in GoblinDB team) :tada::tada:
- This version is a good candidate for v0.1.0
- Evangelization process is going on (Talks, documentation, workshops...) Last event was T3chfest 2018 and all osw events :+1:
- We are looking for active evangelists, ping us ;-)

#### v.0.0.10. New Drakkar!

**Main target:**

- Refactor the main structure to improve maintainability.
- Improve all the test cases, to cover well all the code.

**Bug fixes:**

- Lot of bugs when adding or updating ambush functions.
- Improved error messages and reasons (some of them was not consistent).

**Features:**

- Travis added to the project
- Silence mode.
    - Production mode.
    - Development mode.
- New code structure (feature only for developers), wich improve stability.

**Notices:**
- Great job and support from @Sediug (now in GoblinDB team)
- Evangelization process has been started (Talks, documentation, workshops...)
- We are looking for active evangelists, ping us ;-)

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

----------------------------------

Dev status: [![Build Status](https://travis-ci.org/GoblinDBRocks/GoblinDB.svg?branch=dev)](https://travis-ci.org/GoblinDBRocks/GoblinDB)

