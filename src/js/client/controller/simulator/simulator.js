"use strict";

self.aw = self.aw || {};

aw.Simulator = (function() {
    var EDIT_MAP_CLICKED = "edit_map_clicked";
    
    var Simulator = function(map) {
        var self = this;
        self.game = new aw.Game(map);
        self.ui_map = new aw.MapUi(map);
        self.ui_control = new aw.SimulatorControlUi();
        self.ui_object_details = new aw.ObjectDetailsUi();
        self.ui_code_editor = new aw.CodeEditorUi();
        self.ui_code_editor.globals = self.game.ctx_factory.getGlobals();
        self.ui_code_editor.locals = self.game.ctx_factory.getLocals();
        self.ui_hourglass = new aw.HourglassUi();
        self.ui_teams = new aw.TeamsTabUi(map.max_teams);
        aw.js.reg(self.ui_map, aw.MapUi.DYNAMIC_OBJECT_EVENT, function(obj) {
            self.objectClicked(obj);
        });
        self.ui_map_viewport = new aw.MapViewportUi(map);
        self.ui_console = new aw.ConsoleUi();
        self.trackedObject = null;
        self.stepMode = aw.Constants.STEP_MODES.length - 1;
    }

    Simulator.prototype = {
        __name: 'Simulator',
        constructor: Simulator,
        setup: function() {
            var self = this;
            self.ui_map.init();
            self.ui_control.init();
            self.ui_teams.init();
            self.ui_object_details.init();
            self.ui_code_editor.init();
            self.ui_hourglass.init();
            self.ui_map_viewport.init();
            self.ui_console.init();
            self.init();
        },

        destroy: function() {
            var self = this;
            self.ui_map.destroy();
            self.ui_control.destroy();
            self.ui_teams.destroy();
            self.ui_object_details.destroy();
            self.ui_hourglass.destroy();
            self.ui_code_editor.destroy();
            self.ui_map_viewport.destroy();
            self.ui_console.destroy();
        },

        init: function() {
            var self = this, dom = aw.dom, js = aw.js;
            self.registerSimulatorCallbacks();
            self.registerEditorCallbacks();
            self.registerTeamsTabCallbacks();
            self.ui_map.repaint();

            dom.disable(self.ui_control.start_btn_node, self.ui_control.pause_btn_node, self.ui_control.step_btn_node, self.ui_control.step_mode_btn_node, self.ui_control.reset_btn_node);

            js.reg(self.game, aw.Game.GAME_INITIALIZED_EVENT, js.bind(self.gameInitialized, self));
            js.reg(self.game, aw.Game.GAME_STARTED_EVENT, js.bind(self.gameStarted, self));
            js.reg(self.game, aw.Game.GAME_PAUSED_EVENT, js.bind(self.gamePaused, self));
            js.reg(self.game, aw.Game.GAME_RESET_EVENT, js.bind(self.gameReset, self));
            js.reg(self.game, aw.Game.GAME_ENDED_EVENT, js.bind(self.gameEnded, self));
            js.reg(self.game, aw.Game.GAME_TEAM_ADDED_EVENT, js.bind(self.gameTeamAdded, self));
            js.reg(self.game, aw.Game.GAME_TICK, js.bind(self.gameMachineProcessed, self));
            js.reg(self.game, aw.Game.GAME_CODE_ERROR_EVENT, js.bind(self.codeError, self));
            js.reg(self.game, aw.Game.GAME_LOG_EVENT, js.bind(self.codeLog, self));
            
        },

        registerSimulatorCallbacks: function() {
            var self = this, ui_control = self.ui_control, game = self.game, dom = aw.dom;
            dom.registerClick(ui_control.start_btn_node, function(e) {
                game.start(self.ui_code_editor.getCodes());
            });
            dom.registerClick(ui_control.pause_btn_node, function(e) {
                game.pause();
            });
            dom.registerClick(ui_control.step_btn_node, function(e) {
                game.step(self.ui_code_editor.getCodes());
            });
            dom.registerClick(ui_control.step_mode_btn_node, function(e) {
                self.stepMode = (self.stepMode + 1) % aw.Constants.STEP_MODES.length;
                game.setStepMode(aw.Constants.STEP_MODES[self.stepMode], self.trackedObject);
                ui_control.updateStepMode(self.stepMode);
            });
            dom.registerClick(ui_control.reset_btn_node, function(e) {
                game.reset();
            });
            dom.registerClick(ui_control.edit_map_btn_node, function(e) {
                aw.js.emit(self, EDIT_MAP_CLICKED);
            });
        },

        registerEditorCallbacks: function() {
            var self = this, ui_editor = self.ui_code_editor, game = self.game, dom = aw.dom, js = aw.js;
            
            js.reg(ui_editor, aw.CodeEditorUi.CODE_CHANGED_EVENT, js.bind(self.codeChanged, self));
            
            dom.registerClick(ui_editor.code_save_btn, function(e) {
                self.saveCode(ui_editor.getFileName());
            });
            dom.registerClick(ui_editor.code_save_as_btn, function(e) {
                self.saveCode(null);
            });
            dom.registerClick(ui_editor.code_load_btn, function(e) {
                self.loadCode();
            });

            ui_editor.save_file_node.addEventListener('change', function() {
                self.saveCode(this.value);
            }, true);

            ui_editor.open_file_node.addEventListener('change', function() {
                self.loadCode(this.value);
            }, true);
        },

        registerTeamsTabCallbacks: function() {
            var self = this, ui = self.ui_teams.nodes, dom = aw.dom, i, l;
            for (i = 0, l = ui.length; i < l; i++) {
                dom.registerClick(ui[i].addMachineBtn, (function(team_no) {
                    return function(e) {
                        self.addMachineBtnClicked(team_no);
                    }
                })(i));
                dom.registerClick(ui[i].delMachineBtn, (function(team_no) {
                    return function(e) {
                        self.delMachineBtnClicked(team_no);
                    }
                })(i));
                dom.registerClick(ui[i].delTeamBtn, (function(team_no) {
                    return function(e) {
                        self.delTeamBtnClicked(team_no);
                        self.ui_teams.disableTeamButtons(team_no);
                    }
                })(i));
                dom.registerClick(ui[i].addTeamBtn, (function(team_no) {
                    return function(e) {
                        self.addTeamBtnClicked(team_no);
                    }
                })(i));
                dom.registerClick(ui[i].editTeamBtn, (function(team_no) {
                    return function(e) {
                        self.editTeamBtn(team_no);
                    }
                })(i));
            }
        },

        loadCode: function(filename) {
            var self = this, ui = self.ui_code_editor, dom = aw.dom;
            if (filename) {
                fs.readFile(filename, function(err, data) {
                    if (err) {
                      alert('Could not read file "' + filename + '": ' + err);
                      return;
                    }

                    ui.setCode(String(data));
                    ui.setFileName(filename);
                  });
            } else {
                dom.triggerEvent(ui.open_file_node, 'click');
            }
        },

        saveCode: function(filename) {
            var self = this, ui = self.ui_code_editor, dom = aw.dom;
            if (filename) {
                fs.writeFile(filename, ui.getCode(), function(err) {
                    if (err) {
                      alert('Could not write to file "' + filename + '": ' + err);
                      return;
                    }

                    self.file_name = filename;
                    ui.setFileName(path.basename(filename));
                  });
            } else {
                dom.triggerEvent(ui.save_file_node, 'click');
            }
        },

        addTeamBtnClicked: function(i) {
            var self = this, game = self.game;
            game.addTeam(i);
            self.ui_code_editor.switchTo(i);
        },

        editTeamBtn: function(i) {
            var self = this;
            self.ui_code_editor.switchTo(i);
        },

        addMachineBtnClicked: function(i) {
            var self = this, game = self.game;
            game.addSyncOp('addMachine', i);
        },

        delMachineBtnClicked: function(i) {
            var self = this, game = self.game, machines = game.world.teams[i].machines;
            game.addSyncOp('delMachine', i);
        },

        delTeamBtnClicked: function(i) {
            var self = this, game = self.game;
            game.addSyncOp('delTeam', i);
        },
        
        codeChanged: function() {
            var self = this, game = self.game;
            if (game.running) {
                if (self.freeze_timeout && game.frozen) {
                    clearTimeout(self.freeze_timeout);
                } else {
                    self.freeze_timeout = null;
                    game.freeze(true);
                    self.ui_hourglass.show();
                }
                self.freeze_timeout = setTimeout(function() {
                    if (game.freeze(false)) {
                        self.game.updateCode(self.ui_code_editor.getCodes());
                    }
                    self.freeze_timeout = null;
                    self.ui_hourglass.hide();
                }, 1000);
            } else if (self.freeze_timeout) {
                clearTimeout(self.freeze_timeout);
                self.ui_hourglass.hide();
                self.freeze_timeout = null;
            }
        },

        codeError: function(team_no, error) {
            var self = this;
            self.ui_code_editor.error(team_no, error);
            self.ui_console.log('error', 'Team ' + (team_no + 1) + ': ' + error.msg + (error.line !== undefined ? (', at line: ' + error.line) : '' ));
        },
        
        codeLog: function(msg, type) {
            var self = this;
            self.ui_console.log(type || 'debug', msg);
        },

        gameInitialized: function() {
            var self = this;
            self.ui_teams.enableButtons();
            self.ui_teams.disableEmptySlots();
        },

        gameStarted: function() {
            var self = this, dom = aw.dom;
            dom.enable(self.ui_control.pause_btn_node, self.ui_control.step_mode_btn_node);
            dom.disable(self.ui_control.start_btn_node, self.ui_control.step_btn_node, self.ui_control.reset_btn_node, self.ui_control.edit_map_btn_node);
        },

        gamePaused: function() {
            var self = this, dom = aw.dom;
            dom.enable(self.ui_control.reset_btn_node, self.ui_control.step_btn_node, self.ui_control.step_mode_btn_node, self.ui_control.start_btn_node);
            dom.disable(self.ui_control.pause_btn_node);
        },

        gameEnded: function(team_no) {
            var self = this, dom = aw.dom;
            self.ui_teams.disableButtons();
            dom.enable(self.ui_control.reset_btn_node);
            dom.disable(self.ui_control.start_btn_node, self.ui_control.pause_btn_node, self.ui_control.step_btn_node, self.ui_control.step_mode_btn_node);
            self.gameMachineProcessed();
            self.ui_console.log('system', 'Team ' + (team_no + 1) + ' won!');
        },

        gameReset: function() {
            var self = this, dom = aw.dom;
            self.ui_teams.disableButtons();
            dom.enable(self.ui_control.edit_map_btn_node);
            dom.disable(self.ui_control.start_btn_node, self.ui_control.pause_btn_node, self.ui_control.reset_btn_node, self.ui_control.step_btn_node, self.ui_control.step_mode_btn_node);
            self.setTrackedObject(null);
            self.ui_map.repaint();
            self.ui_teams.clearTeamList();
            self.ui_console.log('system', 'Game reset!'); 
        },

        gameTeamAdded: function(count, canAddMore) {
            var self = this, dom = aw.dom;
            if (count >= 2) {
                dom.enable(self.ui_control.start_btn_node, self.ui_control.step_btn_node, self.ui_control.step_mode_btn_node);
            }

            self.ui_teams.refreshStats(self.game.world.teams);
        },

        gameMachineProcessed: function() {
            var self = this;
            if (self.trackedObject) {
                // check if still exists
                if ((self.trackedObject.constructor == aw.Machine && !self.trackedObject.team)
                    || (self.trackedObject.constructor == aw.Constructor && !self.game.world.teams[self.trackedObject.team_no])) {
                    self.setTrackedObject(null);
                } else {
                    self.ui_object_details.showObjectDetails(self.trackedObject);
                    self.ui_map_viewport.setViewport(self.trackedObject.x, self.trackedObject.y);
                }
            }
            self.ui_teams.refreshStats(self.game.world.teams);
        },

        objectClicked: function(obj) {
            var self = this;
            if (obj.constructor == aw.Machine || obj.constructor == aw.Constructor) {
                self.setTrackedObject(obj);
            }
        },

        setTrackedObject: function(obj) {
            var self = this;
            if (obj) {
                if (obj != self.trackedObject) {
                    self.game.setStepMode(aw.Constants.STEP_MODES[self.stepMode], obj);
                }
                self.trackedObject = obj;
                self.ui_object_details.showObjectDetails(obj);
                self.ui_map_viewport.setViewport(obj.x, obj.y);
            } else {
                self.ui_object_details.showObjectDetails(null);
                self.trackedObject = null;
                self.ui_map_viewport.repaint();
                self.game.setStepMode(aw.Constants.STEP_MODES[self.stepMode], self.trackedObject);
            }
        }
    }
    
    Simulator.EDIT_MAP_CLICKED = EDIT_MAP_CLICKED;
    return Simulator;
})();
