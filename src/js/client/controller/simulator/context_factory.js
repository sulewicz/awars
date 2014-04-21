"use strict";

self.aw = self.aw || {};

aw.ContextFactory = (function() {
    var FRONT = 0, RIGHT = 1, BACK = 2, LEFT = 3;
    
    var ContextFactory = function(world) {
        var self = this;
        self.world = world;
        
        var MAX_AP = aw.Constants.MAX_AP;
        var AP_SPEC = aw.Constants.AP_SPEC;
        
        var move =  function(dir) {
            global.ops.push('move', dir);
        };
        var turn = function(dir) {
            global.ops.push('turn', dir);
        };
        var melt = function() {
            global.ops.push('melt');
        };
        var fire = function() {
            global.ops.push('fire');
        };
        var hit = function() {
            global.ops.push('hit');
        };
        var build = function() {
            global.ops.push('build');
        };
        var scan = function() {
            global.ops.push('scan');
        };
        var convert = function() {
            global.ops.push('convert');
        };
        var replicate = function() {
            global.ops.push('replicate');
        };
        var repair = function() {
            global.ops.push('repair');
        };
        var log = function(msg) {
            global.ops.push('log', msg);
        };
        
        
        self.createView = function(world, machine) {
            var x = machine.x, y = machine.y, tx, ty, dir = machine.dir, map = world.map, i, getDirV = aw.utils.getDirVector;
            var frontV = getDirV(dir), leftV = getDirV((dir + 3) % 4);
            var coors = [];
            tx = x + leftV[0], ty = y + leftV[1];
            for (i = 0; i < 2; i++) {
                coors.push(tx);
                coors.push(ty);
                tx += frontV[0], ty += frontV[1];
            }
            tx = x + frontV[0], ty = y + frontV[1];
            for (i = 0; i < 2; i++) {
                coors.push(tx);
                coors.push(ty);
                tx += frontV[0], ty += frontV[1];
            }
            tx = x - leftV[0], ty = y - leftV[1];
            for (i = 0; i < 2; i++) {
                coors.push(tx);
                coors.push(ty);
                tx += frontV[0], ty += frontV[1];
            }
            var vp = map.getViewport(machine, coors);
            return {
                left: vp.slice(0, 2),
                front: vp.slice(2, 4),
                right: vp.slice(4, 6)
            };
        };
        
        var GLOBALS = {
            FRONT: FRONT,
            RIGHT: RIGHT,
            BACK: BACK,
            LEFT: LEFT,
            FLOOR: aw.Map.FLOOR,
            WALL: aw.Map.WALL,
            CONSTRUCTOR: aw.Map.CONSTRUCTOR,
            ENEMY_CONSTRUCTOR: aw.Map.ENEMY_CONSTRUCTOR,
            MACHINE: aw.Map.MACHINE,
            ENEMY_MACHINE: aw.Map.ENEMY_MACHINE,
            JUNK: aw.Map.JUNK,
            HIT_HP: aw.Constants.HIT_HP,
            FIRE_HP: aw.Constants.FIRE_HP,
            FIRE_RANGE: aw.Constants.FIRE_RANGE,
            MACHINE_VALUE: aw.Constants.MACHINE_VALUE,
            CONSTRUCTOR_VALUE: aw.Constants.CONSTRUCTOR_VALUE,
            WALL_VALUE: aw.Constants.WALL_VALUE,
            MACHINE_COST: aw.Constants.MACHINE_COST,
            WALL_COST: aw.Constants.WALL_COST,
            REPAIR_COST: aw.Constants.REPAIR_COST,
            move: move,
            turn: turn,
            melt: melt,
            fire: fire,
            hit: hit,
            build: build,
            scan: scan,
            convert: convert,
            replicate: replicate,
            repair: repair,
            log: log
        }
        
        self.createContext = function(machine) {
            return {
                time: machine.team.time,
                scan_result: machine.scan_result,
                hp: machine.hp,
                machines_count: machine.team.machines.length,
                resources: machine.team.resources,
                view: this.createView(this.world, machine)
            }
        },
        
        self.getLocals = function() {
            return [ 'time', 'scan_result', 'hp', 'machines_count', 'resources', 'view' ].sort();
        }
        
        self.getGlobals = function() {
            var ret = [], key, val;
            for (key in GLOBALS) {
                if (GLOBALS.hasOwnProperty(key)) {
                    ret.push(key);
                }
            }
            return ret.sort();
        }
        
        self.createGlobals = function() {
            var ret = [], key, val;
            for (key in GLOBALS) {
                if (GLOBALS.hasOwnProperty(key)) {
                    val = GLOBALS[key];
                    ret.push("var", key, '=');
                    if (typeof(val) === "string") {
                        ret.push('"', val, '";');
                    } else {
                        ret.push(val, ';');
                    }
                }
            }
            return ret.join(' ');
        }
    }
    
    ContextFactory.prototype = {
        __name: 'ContextFactory',
        constructor: ContextFactory
    }
    
    return ContextFactory;
})();
