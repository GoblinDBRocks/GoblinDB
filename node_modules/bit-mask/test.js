var should = require("should");
var request = require("request");
var BitMask = require('./bit-mask');
var OwnershipMask = BitMask.OwnershipMask;

describe('BitMask', function(){
    describe('> OwnershipMask', function(){
        var mask;
        
        before(function(){
            mask = new OwnershipMask('755');
        });
    
        it('user read [1]', function(){
            mask.getBit(0).should.equal(mask.hasPermission('user', 'read'));
            mask.getBit(0).should.equal(true);
            mask.hasPermission('user', 'read').should.equal(true);
        });
        
        it('user write [2]', function(){
            mask.getBit(1).should.equal(mask.hasPermission('user', 'write'));
            mask.getBit(1).should.equal(true);
            mask.hasPermission('user', 'write').should.equal(true);
        });
        
        it('user execute [3]', function(){
            mask.getBit(2).should.equal(mask.hasPermission('user', 'execute'));
            mask.getBit(2).should.equal(true);
            mask.hasPermission('user', 'execute').should.equal(true);
        });
        
        it('group read [4]', function(){
            mask.getBit(3).should.equal(mask.hasPermission('group', 'read'));
            mask.getBit(3).should.equal(true);
            mask.hasPermission('group', 'read').should.equal(true);
        });
        
        it('group write [5]', function(){
            mask.getBit(4).should.equal(mask.hasPermission('group', 'write'));
            mask.getBit(4).should.equal(false);
            mask.hasPermission('group', 'write').should.equal(false);
        });
        
        it('group execute [6]', function(){
            mask.getBit(5).should.equal(mask.hasPermission('group', 'execute'));
            mask.getBit(5).should.equal(true);
            mask.hasPermission('group', 'execute').should.equal(true);
        });
        
        it('world read [7]', function(){
            mask.getBit(6).should.equal(mask.hasPermission('world', 'read'));
            mask.getBit(6).should.equal(true);
        });
        
        it('world write [8]', function(){
            mask.getBit(7).should.equal(mask.hasPermission('world', 'write'));
            mask.getBit(7).should.equal(false);
            mask.hasPermission('world', 'write').should.equal(false);
        });
        
        it('world execute [9]', function(){
            mask.getBit(8).should.equal(mask.hasPermission('world', 'execute'));
            mask.getBit(8).should.equal(true);
            mask.hasPermission('world', 'execute').should.equal(true);
        });
    });
});