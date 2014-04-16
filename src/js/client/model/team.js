"use strict";

self.aw = self.aw || {};

aw.Team = (function() {
    var Team = function(team_no) {
        var self = this;
        self.id = aw.utils.id(self);
        self.team_no = team_no;
        self.machines = [];
        self.constructors = [];
        self.resources = aw.Constants.START_RESOURCES;
        self.transmissions = {};
        self.time = 0;
    }

    Team.prototype = {
        __name: 'Team',
        constructor: Team,

        turnStart: function() {

        },

        turnEnd: function() {
            var self = this;
            self.time++;
        },

        startTransmission: function(machine_id, msg) {
            var self = this;
            self.transmissions[machine_id] = msg;
        },

        stopTransmission: function(machine_id) {
            var self = this;
            delete self.transmissions[machine_id];
        },

        getTransmissions: function() {
            var self = this, ret = [];
            for (machine_id in self.transmissions) {
                if (self.transmissions.hasOwnProperty(machine_id)) {
                    ret.push(self.transmissions[machine_id]);
                }
            }
            return ret;
        },

        getHP: function() {
            var self = this, m = self.machines, c = self.constructors, i, l, ret = 0;
            for (i = 0, l = m.length; i < l; i++) {
                ret += m[i].hp;
            }
            for (i = 0, l = c.length; i < l; i++) {
                ret += c[i].hp;
            }
            return ret;
        }
    }
    return Team;
})();
