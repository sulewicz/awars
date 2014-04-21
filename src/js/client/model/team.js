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
