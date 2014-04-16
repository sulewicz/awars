"use strict";

self.aw = self.aw || {};

aw.Game = (function() {
    var GAME_INITIALIZED_EVENT = "game_initialized_event";
    var GAME_STARTED_EVENT = "game_started_event";
    var GAME_PAUSED_EVENT = "game_paused_event";
    var GAME_ENDED_EVENT = "game_ended_event";
    var GAME_RESET_EVENT = "game_reset_event";
    var GAME_TEAM_ADDED_EVENT = "game_team_added_event";
    var GAME_CODE_ERROR_EVENT  = "game_code_error_event";
    var GAME_LOG_EVENT = "game_log_event";
    var GAME_TICK = "game_tick";

    var DELAY = 10;

    var takeOverNode = function(obj) {
        var node = obj._ui.node;
        obj._ui.node = null;
        return node;
    }

    var Game = function(map) {
        var self = this, js = aw.js;
        self.stepMode = aw.Constants.STEP_ALL;
        self.stepTeam = -1;
        self.stepMachine = -1;
        self._tick = js.bind(self.tick, self);
        self._syncOpsTick = js.bind(self.syncOpsTick, self);
        self.remove_anims = [];
        self.add_anims = [];
        self.sync_ops = [];
        self.stepping = true; // marker for step unlock

        self.world = new aw.World(map);
        self.ctx_factory = new aw.ContextFactory(self.world);
        self.anim_factory = new aw.AnimationsFactory();
        self.vm = new aw.VM(self.world, self.ctx_factory);
        aw.js.reg(self.vm, aw.VM.PROCESSED_EVENT, js.bind(self.process, self));
        self.running = false;
        self.frozen = false;
        self.initialized = false;
        self.reset();
    }

    Game.prototype = {
        __name: 'Game',
        constructor: Game,

        initGame: function(codes) {
            var self = this, team_i, i, team;
            for (team_i = 0; team_i < self.world.teams.length; team_i++) {
                team = self.world.teams[team_i];
                if (team) {
                    while (team.machines.length > 0) {
                        self.world.deleteMachine(team.machines[0]);
                    }
                    for (i = 0; i < 4; i++) {
                        self.world.addMachine(team_i);
                    }
                }
            }
            self.initialized = true;
            aw.js.emit(self, GAME_INITIALIZED_EVENT);
        },

        start: function(codes) {
            var self = this;
            if (!self.running && self.world.teamsCount>= 2) {
                if (!self.initialized) {
                    self.initGame();
                }
                self.updateCode(codes);
                self.running = true;
                setTimeout(self._tick, DELAY);
                aw.js.emit(self, GAME_STARTED_EVENT);
            }
        },
        
        updateCode: function(codes) {
            var self = this,  teams = self.world.teams, team;
            for (var i = 0, l = teams.length; i < l; i++) {
                team = teams[i];
                if (team) {
                    self.vm.updateCode(i, codes[i]);
                }
            }
        },

        pause: function() {
            var self = this;
            if (self.running) {
                self.running = false;
                self.frozen = false;
                aw.js.emit(self, GAME_PAUSED_EVENT);
            }
        },

        stop: function() {
            var self = this;
            for (var i = self.world.teams.length - 1; i >= 0; i--) {
                if (self.world.teams[i]) break;
            }
            self.running = false;
            self.frozen = false;
            self.vm.reset();
            aw.js.emit(self, GAME_ENDED_EVENT, i);
        },

        step: function(codes) {
            var self = this;
            if (!self.running && self.stepping) {
                if (!self.initialized) {
                    self.initGame(codes);
                }
                self.tick(true);
            }
        },
        
        freeze: function(f) {
            var self = this;
            if (self.running && f !== self.frozen) {
                if (!f) {
                    setTimeout(self._tick, DELAY);
                }
                self.frozen = f;
                return true;
            }
        },

        reset: function() {
            var self = this;
            if (!self.running) {
                self.initialized = false;
                self.frozen = false;
                self.vm.reset();
                self.world.reset();
                aw.js.emit(self, GAME_RESET_EVENT);
            }
        },

        setStepMode: function(mode, object) {
            var self = this;
            self.stepMode = mode;
            if (mode !== aw.Constants.STEP_ALL && object) {
                if (mode === aw.Constants.STEP_TEAM) {
                    self.stepTeam = (object.constructor == aw.Constructor) ? object.team_no : object.team.team_no;
                    self.stepMachine = -1;
                } else if (mode === aw.Constants.STEP_MACHINE) {
                    self.stepTeam = (object.constructor == aw.Constructor) ? object.team_no : object.team.team_no;
                    self.stepMachine = (object.constructor == aw.Machine) ? object.getIdx() : -1;
                }
            } else {
                self.stepTeam = -1;
                self.stepMachine = -1;
            }
        },

        tick: function(singleTick) {
            var self = this;
            self.stepping = true;
            if (self.world.teamsCount < 2) {
                self.stop();
            } else if ((self.running && !self.frozen) || (singleTick && self.stepping)) {
                self.stepping = false;
                self.vm.tick(self.stepMode, self.stepTeam, self.stepMachine);
            }
        },

        syncOpsTick: function() {
            var self = this, ops = self.sync_ops, op, i, l;
            if (ops.length == 0) {
                self.tick();
            } else {
                for (i = 0, l = ops.length; i < l; i++) {
                    op = ops[i];
                    switch (op.op) {
                        case 'addMachine':
                            if (self.world.teams[op.arg]) {
                                self.spawnMachine(op.arg);
                            }
                        break;
                        case 'delMachine':
                            if (self.world.teams[op.arg] && self.world.teams[op.arg].machines.length > 0) {
                                self.destroyMachine(self.world.teams[op.arg].machines[0], true, true);
                            }
                        break;
                        case 'delTeam':
                            if (self.world.teams[op.arg]) {
                                self.destroyTeam(op.arg, 'Forced destruction!');
                            }
                        break;
                    }
                }
                ops.length = 0;
                var anims = [];
                if (self.remove_anims.length > 0) {
                        anims.push(self.remove_anims);
                        self.remove_anims = [];
                }
                if (self.add_anims.length > 0) {
                    anims.push(self.add_anims);
                    self.add_anims = [];
                }
                aw.js.emit(self, GAME_TICK);
                if (anims.length > 0) {
                    aw.Animation.fire(anims, self._tick);
                } else {
                    setTimeout(self._tick, DELAY);
                }
            }
        },

        addSyncOp: function(op, arg) {
            var self = this;
            if (self.initialized) {
                self.sync_ops.push({op: op, arg: arg});
                if (!self.running) {
                    self.syncOpsTick();
                }
            }
        },

        addTeam: function(slot) {
            var self = this, w = self.world;
            if (!self.running) {
                w.addTeam(slot);
                aw.js.emit(self, GAME_TEAM_ADDED_EVENT, w.teamsCount, w.teamsCount < self.world.map.max_teams);
            }
        },

        // logic and animation part

        destroyObject: function(obj) {
            var self = this;
            if (obj.constructor == aw.Machine) {
                self.destroyMachine(obj, true, true);
            } else if (obj.constructor == aw.Constructor) {
                self.destroyConstructor(obj, true, true);
            } else {
                self.remove_anims.push(self.anim_factory.remove(takeOverNode(obj)));
                self.world.map.deleteObject(obj);
            }
        },

        destroyMachine: function(machine, checkTeam, leaveJunk) {
            var self = this, world = self.world, team = machine.team;
            self.vm.skipMachine(machine);

            self.remove_anims.push(self.anim_factory.destroy(takeOverNode(machine)));
            world.deleteMachine(machine);

            if (leaveJunk) {
                self.spawnJunk(machine.x, machine.y, aw.Constants.MACHINE_VALUE);
            }
            if (checkTeam && team.machines.length === 0) {
                self.destroyTeam(team.team_no, 'All robots destroyed!');
            }
        },

        convertMachine: function(machine, new_team_no) {
            var self = this, w = self.world, oldTeam = machine.team;
            self.vm.skipMachine(machine);
            w.moveMachine(machine, new_team_no);

            if (oldTeam.machines.length === 0) {
                self.destroyTeam(oldTeam.team_no, 'Last robot converted!');
            }
        },

        destroyTeam: function(team_no, reason) {
            var self = this, world = self.world, team = world.teams[team_no], i, l;
            while (team.constructors.length > 0) {
                self.destroyConstructor(team.constructors[0], false, true);
            }

            while (team.machines.length > 0) {
                self.destroyMachine(team.machines[0], false, true);
            }

            world.deleteTeam(team_no);
            aw.js.emit(self, GAME_LOG_EVENT, 'Team ' + (team_no + 1) + ' lost: ' + reason, 'system');
        },

        destroyConstructor: function(constructor, checkTeam, leaveJunk) {
            var self = this, world = self.world, team = world.teams[constructor.team_no], i, l;

            self.remove_anims.push(self.anim_factory.destroy(takeOverNode(constructor)));
            world.deleteConstructor(constructor);

            if (leaveJunk) {
                self.spawnJunk(constructor.x, constructor.y, aw.Constants.CONSTRUCTOR_VALUE);
            }
            if (checkTeam && team.constructors.length === 0) {
                self.destroyTeam(constructor.team_no, 'All constructors destroyed!');
            }
        },

        spawnJunk: function(x, y, value) {
            var self = this, world = self.world, junk = new aw.Junk(value), ui;
            junk.x = x;
            junk.y = y;
            ui = new aw.MapObjectUi(junk);
            ui.init();
            ui.node.style.display = "none";
            world.map._ui.map_node.appendChild(ui.node);
            ui.repaint();
            world.map.addObject(junk);

            self.add_anims.push(self.anim_factory.spawn(ui.node));
        },

        spawnMachine: function(team_no) {
            var self = this, w = self.world, machine, ui, pos;
            if ((pos = w.canAddMachine(team_no))) {
                machine = new aw.Machine(w.teams[team_no]);
                ui = new aw.MapObjectUi(machine);
                ui.init();
                ui.node.style.display = "none";
                w.map._ui.map_node.appendChild(ui.node);
                w.addMachineAt(machine, pos[0], pos[1]);
                ui.repaint();
                self.add_anims.push(self.anim_factory.spawn(ui.node));
                return machine;
            }
        },

        meltWall: function(x, y) {
            var self = this, w = self.world;
            self.add_anims.push(self.anim_factory.melt(w.map._ui.map_node, x, y));
            w.map.set(x, y, aw.Map.FLOOR);
            w.map._ui.repaint([x, y]);
            self.spawnJunk(x, y, aw.Constants.WALL_VALUE);
        },

        buildWall: function(x, y) {
            var self = this, w = self.world;
            self.add_anims.push(self.anim_factory.build(w.map._ui.map_node, x, y));
            w.map.set(x, y, aw.Map.WALL);
            w.map._ui.repaint([x, y]);
        },

        process: function(m, ops, last) {
            var self = this, w = self.world, anims = [], i, j, len, operation, arg, dirV, ap = aw.Constants.MAX_AP, cap, AP_SPEC = aw.Constants.AP_SPEC, getDirV = aw.utils.getDirVector, obj;
            if (ops) {
                for (i = 0, len = ops.length; i < len && ap > 0; i++) {
                    operation = ops[i];
                    cap = AP_SPEC[operation];
                    if (isFinite(cap)) {
                        ap -= cap;
                        if (ap >= 0) {
                            if (operation === 'error') {
                                i++;
                                arg = ops[i];
                                aw.js.emit(self, GAME_CODE_ERROR_EVENT, m.team.team_no, arg);
                                anims.push(self.anim_factory.error(w.map._ui.map_node, m.x, m.y));
                            } else if (operation === 'log') {
                                i++;
                                arg = ops[i];
                                aw.js.emit(self, GAME_LOG_EVENT, 'Team ' + (m.team.team_no + 1) + ': ' + arg);
                            } else if (operation === 'move') {
                                var nx, ny;
                                i++;
                                arg = (m.dir + ops[i]) % 4;
                                if (!isNaN(arg)) {
                                    dirV = getDirV(arg);
                                    nx = m.x + dirV[0];
                                    ny = m.y + dirV[1];
                                    if (w.map.isEmptyTile(nx, ny)) {
                                        obj = w.map.getObject(nx, ny);
                                        if (obj == null || obj.constructor == aw.Junk) {
                                            if (obj != null) {
                                                m.team.resources += obj.value;
                                                self.destroyObject(obj);
                                            }
                                            anims.push(self.anim_factory.move(m, m.x, m.y, nx, ny));
                                            m.x = nx;
                                            m.y = ny;
                                        }
                                    }
                                }
                            } else if (operation === 'turn') {
                                i++;
                                arg = (m.dir + ops[i]) % 4;
                                if (!isNaN(arg) && arg != m.dir) {
                                    anims.push(self.anim_factory.turn(m, m.dir, arg));
                                    m.dir = arg;
                                }
                            } else if (operation === 'melt') {
                                dirV = getDirV(m.dir);
                                nx = m.x + dirV[0];
                                ny = m.y + dirV[1];
                                if (w.map.get(nx, ny) === aw.Map.WALL) {
                                    self.meltWall(nx, ny);
                                }
                            } else if (operation === 'fire') {
                                dirV = getDirV(m.dir);
                                nx = m.x;
                                ny = m.y;
                                for (j = aw.Constants.FIRE_RANGE; j > 0; j--) {
                                    nx += dirV[0];
                                    ny += dirV[1];
                                    if (nx < 0 && nx >= w.map.size && ny < 0 && ny >= w.map.size) break;
    
                                    obj = w.map.getObject(nx, ny);
                                    if (obj != null) {
                                        if ((obj.constructor == aw.Constructor && obj.team_no !== m.team.team_no)
                                            || (obj.constructor == aw.Machine && obj.team.team_no !== m.team.team_no)) {
                                            if (obj.takeHit(aw.Constants.FIRE_HP)) {
                                                self.destroyObject(obj);
                                            }
                                            if (nx !== m.x || ny !== m.y) anims.push(self.anim_factory.shot(w.map._ui.map_node, m.x, m.y, nx, ny));
                                        }
                                        break;
                                    }
                                }
                                nx = Math.min(Math.max(nx, 0), w.map.size);
                                ny = Math.min(Math.max(ny, 0), w.map.size);
                            } else if (operation === 'hit') {
                                dirV = getDirV(m.dir);
                                nx = m.x + dirV[0];
                                ny = m.y + dirV[1];
                                obj = w.map.getObject(nx, ny);
                                if (obj != null) {
                                    if ((obj.constructor == aw.Constructor && obj.team_no !== m.team.team_no)
                                        || (obj.constructor == aw.Machine && obj.team.team_no !== m.team.team_no)) {
                                        if (obj.takeHit(aw.Constants.HIT_HP)) {
                                            self.destroyObject(obj);
                                        }
                                        anims.push(self.anim_factory.hit(m));
                                    }
                                }
                            } else if (operation === 'build') {
                                if (m.team.resources >= aw.Constants.WALL_COST) {
                                    dirV = getDirV(m.dir);
                                    nx = m.x + dirV[0];
                                    ny = m.y + dirV[1];
                                    if (w.map.canAddObject(nx, ny)) {
                                        self.buildWall(nx, ny);
                                        m.team.resources -= aw.Constants.WALL_COST;
                                    }
                                }
                            } else if (operation === 'scan') {
                                m.scan_result = w.scan(m);
                                anims.push(self.anim_factory.scan(w.map._ui.map_node, m.x, m.y));
                            } else if (operation === 'convert') {
                                if ((~~(Math.random() * 1000) % aw.Constants.CONVERT_CHANCE) === 0) {
                                    dirV = getDirV(m.dir);
                                    nx = m.x + dirV[0];
                                    ny = m.y + dirV[1];
                                    obj = w.map.getObject(nx, ny);
                                    if (obj != null && obj.constructor == aw.Machine && obj.team.team_no !== m.team.team_no) {
                                        var oldTeamNo = obj.team.team_no;
                                        self.convertMachine(obj, m.team.team_no);
                                        anims.push(self.anim_factory.convert(w.map._ui.map_node, m, obj, oldTeamNo));
                                    }
                                }
                            } else if (operation === 'replicate') {
                                if (m.team.resources >= aw.Constants.MACHINE_COST && m.team.machines.length < aw.Constants.MAX_MACHINES) {
                                    var machine = self.spawnMachine(m.team.team_no);
                                    if (machine) {
                                        m.team.resources -= aw.Constants.MACHINE_COST;
                                    }
                                }
                            } else if (operation === 'repair') {
                                if (m.team.resources >= aw.Constants.REPAIR_COST) {
                                    anims.push(self.anim_factory.repair(w.map._ui.map_node, m.x, m.y));
                                    m.hp = aw.Machine.MAX_HP;
                                    m.team.resources -= aw.Constants.REPAIR_COST;
                                }
                            }
                        }
    
                        if (self.remove_anims.length > 0) {
                            anims.push(self.remove_anims);
                            self.remove_anims = [];
                        }
                        if (self.add_anims.length > 0) {
                            anims.push(self.add_anims);
                            self.add_anims = [];
                        }
                    } else {
                        break;
                    }
                }
            } else {
                self.destroyTeam(m.team.team_no, 'Execution timeout!');
            }
            aw.js.emit(self, GAME_TICK);
            if (anims.length > 0) {
                aw.Animation.fire(anims, self._syncOpsTick);
            } else {
                setTimeout(self._syncOpsTick, DELAY);
            }

        }
    }

    Game.GAME_INITIALIZED_EVENT = GAME_INITIALIZED_EVENT;
    Game.GAME_STARTED_EVENT = GAME_STARTED_EVENT;
    Game.GAME_PAUSED_EVENT = GAME_PAUSED_EVENT;
    Game.GAME_ENDED_EVENT = GAME_ENDED_EVENT;
    Game.GAME_RESET_EVENT = GAME_RESET_EVENT;
    Game.GAME_TEAM_ADDED_EVENT = GAME_TEAM_ADDED_EVENT;
    Game.GAME_TICK = GAME_TICK;
    Game.GAME_CODE_ERROR_EVENT = GAME_CODE_ERROR_EVENT;
    Game.GAME_LOG_EVENT = GAME_LOG_EVENT;
    return Game;
})();
