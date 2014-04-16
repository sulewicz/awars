"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.VM = (function() {
    var PROCESSED_EVENT = 'processed_event';

    var VM = function(world, ctx_factory) {
        var self = this;
        self.world = world;
        self.ctx_factory = ctx_factory;
        self.sandboxes = [null, null, null, null];
    }

    VM.prototype = {
        __name: 'VM',
        constructor: VM,

        compile: function(code_src) {
            var fullCode = '(function() { var global = {};' + this.ctx_factory.createGlobals() + 'return { main: ' + code_src + ', global: global}; })()';
            return (function(fullCode, errorCode) {
                try {
                    return eval(fullCode);
                } catch (e) {
                    return (function() { var global = {}; return { main: function() { global.ops.push('error', { msg: e.message }); }, global: global}; })()
                }
            })(fullCode);
        },

        tick: function(stepMode, overrideTeamIdx, overrideMachineIdx) {
            var self = this, team, machine, last;
            // TODO: make sure that turnEnd and turnStart is called when explicitly defining team and machine
            if (overrideTeamIdx >= 0) {
                self.teamIdx = overrideTeamIdx;
            }
            if (overrideMachineIdx >= 0) {
                self.machineIdx = overrideMachineIdx;
            }
            while ((team = self.world.teams[self.teamIdx]) == null) {
                self.machineIdx = 0;
                self.teamIdx = (self.teamIdx + 1) % self.world.teams.length;
            }
            if (self.machineIdx >= team.machines.length) {
                self.machineIdx = 0;
            }
            if (self.machineIdx === 0 || stepMode === aw.Constants.STEP_MACHINE) {
                team.turnStart();
            }
            machine = team.machines[self.machineIdx];
            machine.turnStart();
            var ctx = self.ctx_factory.createContext(machine);
            self.sandboxes[self.teamIdx].invoke(ctx, function(ops) {
                machine.turnEnd();
                if (stepMode !== aw.Constants.STEP_MACHINE) {
                    self.machineIdx++;
                    if (self.machineIdx >= team.machines.length) {
                        team.turnEnd();
                        last = true;
                        self.machineIdx = 0;
                        if (stepMode !== aw.Constants.STEP_TEAM) {
                            self.teamIdx++;
                            if (self.teamIdx >= self.world.teams.length) {
                                self.teamIdx = 0;
                            }
                        }
                    }
                } else { // STEP_MACHINE
                    team.turnEnd();
                }
                aw.js.emit(self, PROCESSED_EVENT, machine, ops, last);
            });
        },
        
        updateCode: function(i, codeSrc) {
            var self = this;
            if (!self.sandboxes[i]) {
                self.sandboxes[i] = new aw.Sandbox();
            }
            var fullCode = '(function() { var global = {};' + self.ctx_factory.createGlobals() + 'return { main: ' + codeSrc + ', global: global}; })()';
            self.sandboxes[i].init(fullCode);
        },
        
        resetCodes: function() {
            var self = this, sandboxes = self.sandboxes, sandbox;
            for (var i = 0, l = sandboxes.length; i < l; i++) {
                sandbox = sandboxes[i];
                if (sandbox) {
                    sandbox.destroy();
                    sandboxes[i] = null;
                }
            }
        },

        skipMachine: function(machine) {
            var self = this, team_id = machine.team.team_no, idx = machine.getIdx();
            if (self.teamIdx === team_id && idx < self.machineIdx) {
                self.machineIdx--;
            }
        },

        reset: function() {
            var self = this, len;
            self.teamIdx = 0;
            self.machineIdx = 0;
            self.resetCodes();
        }
    }
    VM.PROCESSED_EVENT = PROCESSED_EVENT;
    return VM;
})();
