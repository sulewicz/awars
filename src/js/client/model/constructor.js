"use strict";

self.aw = self.aw || {};

aw.Constructor = (function() {
    var MAX_HP = 500;

    var Constructor = function(team_no) {
        var self = this;
        self.id = aw.utils.id(self);
        self.x = self.y = 0;
        self.hp = MAX_HP;
        self.team_no = team_no;
    }

    Constructor.prototype = {
        __name: 'Constructor',
        constructor: Constructor,

        copy: function() {
            return new Constructor(this.team_no);
        },

        takeHit: function(hp) {
            var self = this;
            self.hp -= hp;
            if (self.hp <= 0) {
                return true;
            }
        },

        _details: {
            "Team": { prop: "team_no", format: function(n) { return n + 1; } },
            "HP": "hp"
        }
    }

    Constructor.MAX_HP = MAX_HP;
    return Constructor;
})();
