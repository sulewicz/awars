"use strict";

self.aw = self.aw || {};

aw.Junk = (function() {
    var Junk = function(value) {
        var self = this;
        self.x = self.y = 0;
        self.id = aw.utils.id(self);
        self.value = value;
    }
    
    Junk.prototype = {
        __name: 'Junk',
        constructor: Junk,
        
        copy: function() {
            return new Junk(this.value);
        }
    }
    return Junk;
})();
