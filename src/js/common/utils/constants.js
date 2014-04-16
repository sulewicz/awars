"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.Constants = (function() {
    var STEP_MACHINE = 'machine';
    var STEP_TEAM = 'team';
    var STEP_ALL = 'all';
    var MAX_AP = 3;
    return {
        STEP_MACHINE: STEP_MACHINE,
        STEP_TEAM: STEP_TEAM,
        STEP_ALL: STEP_ALL,
        STEP_MODES: [STEP_MACHINE, STEP_TEAM, STEP_ALL],
        MAX_AP: MAX_AP,
        START_RESOURCES: 100,
        MAX_MACHINES: 20,
        MAX_TRANSMISSION_LENGTH: 64,
        AP_SPEC: {
            error: MAX_AP,
            move: 1,
            turn: 1,
            melt: 1,
            fire: 1,
            hit: 1,
            build: 2,
            scan: 2,
            convert: 2,
            replicate: 3,
            repair: 2,
            log: 0
        },
        CONVERT_CHANCE: 1, // 1/3
        HIT_HP: 50,
        FIRE_HP: 25,
        FIRE_RANGE: 3,
        MACHINE_VALUE: 10,
        CONSTRUCTOR_VALUE: 500,
        WALL_VALUE: 5,
        MACHINE_COST: 100,
        WALL_COST: 5,
        REPAIR_COST: 30
    }
})();

if (typeof(module) !== 'undefined' && module.exports) {
    module.exports = aw.Constants;
}