bit-mask.js
==============
An NPM for manipulating bit masks

Just a convenient abstraction for computing bitmasks, such as file permissions. 

    var BitMask = require('bit-mask');

Bit Masks
---------
Declare a new BitMask with an initial value

    var mask = new BitMask(value, [base]);
    
Set a particular bit with a boolean

    mask.setBit(position, value)
    
get the boolean value of a particular bit
    
    mask.getBit(position)
    
get the bits as a string of binary digits
    
    maks.bits()
    
Ownership Mask
--------------

Declare a new Ownership Mask with an initial value

    var mask = new BitMask.OwnershipMask(value);
    
Then you have all the functions from the BitMask plus you can get the permissions in a more readable way with:

    mask.hasPermission(context, permission)
    
where context is 'user', 'group' or 'world' and permission is 'read', 'write', 'execute' and a corresponding set:

    mask.setPermission(context, permission, value)
    
as well as a modify function which allows you to pass chmod style modifier strings as well as integer values.

    mask.modify('ugo+rwx')
    mask.modify(755);

Testing
-------

Run the tests at the project root with:

    mocha

Enjoy,

-Abbey Hawk Sparrow