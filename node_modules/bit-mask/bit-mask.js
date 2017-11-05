var prime = require('prime');
var type = require('prime/util/type');
var array = require('prime/es5/array');
var BitMask = prime({
    value : null,
    constructor : function(value, base){
        this.base = base || 10;
        if(value) this.value = parseInt(value, base);
    },
    setBit : function(position, value){
        if(this.getBit(position)){ //it's set
            if(!value){//clear
                this.value = (1 << position) ^ this.value;
            }// else it's already set!
        }else{ //not set
            if(value){
                this.value = (1 << position) | this.value;
            }// it's already not set!
        }
    },
    getBit : function(position){
        return !!((1 << (this.base-position) ) & this.value);
    },
    bits : function(){
        return this.value.toString(2);
    }
});
var OwnershipMask = prime({
    inherits : BitMask,
    contexts : ['user', 'group', 'world'],
    permissions : ['read', 'write', 'execute'],
    constructor : function(value){
        //BitMask.constructor.apply(this, [value, 8]);
        this.base = 8;
        if(value) this.value = parseInt(value, 8);
    },
    getPosition: function(context, permission){
        var groupIndex = this.contexts.indexOf(context.toLowerCase());
        if(groupIndex === -1) throw('Unrecognized context('+context+')!');
        var permissionIndex = this.permissions.indexOf(permission.toLowerCase());
        if(permissionIndex === -1) throw('Unrecognized permission('+permission+')!');
        return groupIndex*this.permissions.length + permissionIndex;
    },
    hasPermission: function(context, permission){
        var position = this.getPosition(context, permission);
        return this.getBit(position);
    },
    setPermission: function(context, permission, value){
        var position = this.getPosition(context, permission);
        return this.setBit(position, value);
    },
    modify: function(clause){
        var operator = false;
        var subjects = [];
        var ch;
        if(type(clause) == 'number') this.value = clause;
        for(var lcv=0; lcv < clause.length; lcv++){
            ch = clause.charAt(lcv);
            if(operator){
                var perm;
                switch(ch){
                    case 'r':
                        perm = 'read';
                        break;
                    case 'w':
                        perm = 'write';
                        break;
                    case 'x':
                        perm = 'execute';
                        break;
                }
                array.forEach(subjects, function(subject){
                    var value;
                    if(operator == '+') value = 1;
                    if(operator == '-') value = 0;
                    this.setPermission(subject, perm, value);
                }.bind(this));
            }else{
                switch(ch){
                    case 'u':
                        subjects.push('user');
                        break;
                    case 'g':
                        subjects.push('group');
                        break;
                    case 'o':
                        subjects.push('world');
                        break;
                    case '+':
                    case '-':
                        operator = ch;
                        break;
                }
            }
        }
    }
});
module.exports = BitMask;
module.exports.OwnershipMask = OwnershipMask;