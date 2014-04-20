"use strict";

self.aw = self.aw || {};

aw.World = (function() {
    var FRONT = 0, RIGHT = 1, BACK = 2, LEFT = 3;
    var NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3;

    var World = function(map) {
        var self = this, i, l;
        self.teams = [];
        for (i = 0, l = map.max_teams; i < l; i++) self.teams[i] = null;
        self.teamsCount = 0;
        self.map = map;
        self.map.snapshot();
    }

    World.prototype = {
        __name: 'World',
        constructor: World,

        addTeam: function(slot) {
            var self = this, team = new aw.Team(slot);
            self.teams[slot] = team;
            self.teamsCount++;
            team.constructors = self.map.getConstructors(team.team_no);
        },

        deleteTeam: function(i) {
            var self = this, team = self.teams[i];
            if (team != null) {
                while (team.machines.length > 0) {
                    self.deleteMachine(team.machines[0]);
                }
                self.teams[i] = null;
                self.teamsCount--;
            }
        },

        canAddMachine: function(team_no) {
            var self = this, c = self.teams[team_no].constructors, i, len, cx, cy, x, y, size = self.map.size;
            for (i = 0, len = c.length; i < len; i++) {
                cx = c[i].x;
                cy = c[i].y;
                for (x = Math.max(0, cx - 1); x <= Math.min(size - 1, cx + 1); x++) {
                    for (y = Math.max(0, cy - 1); y <= Math.min(size - 1, cy + 1); y++) {
                        if (self.map.canAddObject(x, y)) {
                            return [x, y];
                        }
                    }
                }
            }
            return null;
        },

        addMachine: function(team_no) {
            var self = this, pos;
            if ((pos = self.canAddMachine(team_no))) {
                self.addMachineAt(new aw.Machine(self.teams[team_no]), pos[0], pos[1]);
            }
        },

        addMachineAt: function(machine, x, y, dir) {
            var self = this, machine;
            machine.x = x;
            machine.y = y;
            if (dir !== undefined) {
                machine.dir = dir;
            }
            self.teams[machine.team.team_no].machines.push(machine);
            self.map.addObject(machine);
        },

        moveMachine: function(m, new_team_no) {
            var self = this, team = m.team, i = team.machines.indexOf(m);
            if (i >= 0) {
                team.machines.splice(i, 1);
                team = self.teams[new_team_no];
                if (team) {
                    m.team = team;
                    team.machines.push(m);
                }
            }
        },

        deleteMachine: function(m) {
            var self = this, team = m.team, i = team.machines.indexOf(m);
            if (i >= 0) {
                m.team = null;
                self.map.deleteObject(m);
                team.machines.splice(i, 1);
            }
        },

        deleteConstructor: function(c) {
            var self = this, team = self.teams[c.team_no];
            self.map.deleteObject(c);
            team.constructors.splice(team.constructors.indexOf(c), 1);
        },

        scan: function(machine) {
            var self = this, map = self.map, x1, y1, x2, y2, SCAN_RADIUS = 5, i, l, o, ret = [], dir, rel_dir;
            x1 = machine.x - SCAN_RADIUS;
            x2 = machine.x + SCAN_RADIUS;
            y1 = machine.y - SCAN_RADIUS;
            y2 = machine.y + SCAN_RADIUS;
            for (i = 0, l = self.map.dynamic_objects.length; i < l; i++) {
                o = self.map.dynamic_objects[i];
                if (o.x >= x1 && o.x <= x2 && o.y >= y1 && o.y <= y2 && o != machine) {
                    if (Math.abs(o.x - machine.x) > Math.abs(o.y - machine.y)) {
                        dir = (o.x < machine.x) ? WEST : EAST;
                    } else {
                        dir = (o.y < machine.y) ? NORTH : SOUTH;
                    }
                    rel_dir = ((dir + 4) - machine.dir) % 4; // TODO: test this
                    ret.push({
                        object: self.map.objectToConst(o, machine.team.team_no),
                        distance: Math.abs(o.x - machine.x) + Math.abs(o.y - machine.y),
                        dir: rel_dir
                    })
                }
            }
            ret.sort(function(a, b) { return a.distance - b.distance; });
            return ret;
        },

        reset: function() {
            var self = this, i, l;
            for (i = 0, l = self.teams.length; i < l; i++) {
                self.deleteTeam(i);
            }
            self.teams = [];
            for (i = 0, l = self.map.max_teams; i < l; i++) self.teams[i] = null;
            self.teamsCount = 0;
            self.map.restoreSnapshot();
        }
    }
    return World;
})();
