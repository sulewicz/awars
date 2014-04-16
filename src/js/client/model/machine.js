"use strict";

self.aw = self.aw || {};

aw.Machine = (function() {
    var MAX_HP = 100;
    var DIR_STR = ['North', 'East', 'South', 'West'];
    var NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3;

    var Machine = function(team) {
        var self = this;
        self.id = aw.utils.id(self);
        self.hp = MAX_HP;
        self.x = this.y = 0;
        self.dir = ~~(Math.random(1000)) % 4;
        self.team = team;
        self.scan_result = null;
    }

    Machine.prototype = {
        __name: 'Machine',
        constructor: Machine,

        takeHit: function(hp) {
            var self = this;
            self.hp -= hp;
            if (self.hp <= 0) {
                return true;
            }
        },

        turnStart: function() {
            var self = this;
            self.team.stopTransmission(self.id);
        },

        turnEnd: function() {
            var self = this;
            self.scan_result = null;
        },

        getIdx: function() {
            var self = this;
            return self.team.machines.indexOf(self);
        },

        _details: {
            "Team": { prop: "team.team_no", format: function(n) { return n + 1; } },
            "HP": "hp",
            "Direction": { prop: "dir", format: function(d) { return DIR_STR[d]; } },
            "Resources": "team.resources"
        }
    }
    Machine.MAX_HP = MAX_HP;
    return Machine;
})();
