"use strict";

self.aw = self.aw || {};

aw.TeamsTabUi = (function() {
    var TeamsTabUi = function(teams_count) {
        var self = this;
        self.teams_count = teams_count;
    }

    TeamsTabUi.prototype = {
        __name: 'TeamsTabUi',
        constructor: TeamsTabUi,
        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils;

            self.simulator_teams_node = dom.createNode('simulator_teams_node', self.generateSimulatorTeamsList, 'box');
            dom.addNode(self.simulator_teams_node);
            var nodes = [], children = self.simulator_teams_node.getElementsByTagName('td'), l = children.length;
            for (var i = 0; i < 4; i++) {
                var tab = children[i].children, na = tab[0], emptySlot = tab[1], details = tab[2], rows = details.children;
                nodes.push({
                    na: na,
                    emptySlot: emptySlot,
                    addTeamBtn: emptySlot.children[1],
                    details: details,
                    editTeamBtn:rows[0].children[0],
                    hp: rows[1].children[1],
                    machines: rows[2].children[1],
                    constructors: rows[3].children[1],
                    resources: rows[4].children[1],
                    addMachineBtn: rows[5].children[0].children[0],
                    delMachineBtn: rows[5].children[1].children[0],
                    delTeamBtn: rows[5].children[2].children[0]
                });
            }
            self.nodes = nodes;
            self.disableButtons();
            self.clearTeamList();
        },

        destroy: function() {
            var self = this;
            self.nodes = null;
            self.simulator_teams_node.innerHTML = "";
            self.simulator_teams_node.parentNode.removeChild(self.simulator_teams_node);
            self.simulator_teams_node = null;
        },

        generateSimulatorTeamsList: function(n) {
            var ret = '<table><tr>', i;
            for (i = 0; i < 4; i++) {
                ret += '<td class="simulator_teams_team">'
                    + '<div class="simulator_team_na"><p>Slot not available</p></div>'
                    + '<div class="simulator_team_emptySlot"><p>Click to add a team.</p><a href="javascript:void(0)" class="button simulator_teams_add_team" style="background-position: ' + (-aw.utils.TILE_SIZE * i) + 'px">+</a></div>'
                    + '<div class="simulator_team_details">'
                    + '<div class="header"><a href="javascript:void(0)" class="button simulator_teams_edit_team"><span class="simulator_teams_icon" style="background-position: ' + (-aw.utils.TILE_SIZE * i) + 'px"></span>Edit</a></div>'
                    + '<div class="row"><span class="simulator_teams_key simulator_teams_health">+</span><span class="simulator_teams_value"></span></div>'
                    + '<div class="row"><span class="simulator_teams_key"><img src="./img/machine_ico.png"></span><span class="simulator_teams_value"></span></div>'
                    + '<div class="row"><span class="simulator_teams_key"><img src="./img/constructor_ico.png"></span><span class="simulator_teams_value"></span></div>'
                    + '<div class="row"><span class="simulator_teams_key"><img src="./img/junk_ico.png"></span><span class="simulator_teams_value"></span></div>'
                    + '<div class="row">'
                    + '<span class="simulator_teams_key"><a href="javascript:void(0)" class="button simulator_teams_add_machine"></a></span>'
                    + '<span class="simulator_teams_value"><a href="javascript:void(0)" class="button simulator_teams_del_machine"></a></span>'
                    + '<span class="simulator_teams_key"><a href="javascript:void(0)" class="button simulator_teams_kill_team"></a></span>'
                    + '</div>'
                    + '</div>'
                    + '</td>';
            }
            ret += '</tr></table>';
            n.innerHTML = ret;
        },

        refreshStats: function(teams) {
            var self = this, team, i, nodes, dom = aw.dom, teams_count = self.teams_count;
            for (i = 0; i < teams_count; i++) {
                team = teams[i];
                nodes = self.nodes[i];
                if (team) {
                    dom.show('inline-block', nodes.details);
                    dom.hide(nodes.emptySlot);
                    nodes.hp.innerHTML = team.getHP();
                    nodes.machines.innerHTML = team.machines.length;
                    nodes.constructors.innerHTML = team.constructors.length;
                    nodes.resources.innerHTML = team.resources;
                } else {
                    nodes.hp.innerHTML = "0";
                    nodes.machines.innerHTML = "0";
                    nodes.constructors.innerHTML = "0";
                    nodes.resources.innerHTML = "0";
                    self.disableTeamButtons(i);
                }
            }

        },

        enableButtons: function() {
            var self = this, nodes = self.nodes, i, dom = aw.dom;
            for (i = 0; i < 4; i++) {
                dom.enable(nodes[i].addMachineBtn, nodes[i].delMachineBtn, nodes[i].delTeamBtn);
            }
        },

        disableTeamButtons: function(i) {
            var self = this, nodes = self.nodes, i, dom = aw.dom;
            dom.disable(nodes[i].addMachineBtn, nodes[i].delMachineBtn, nodes[i].delTeamBtn);
        },

        disableButtons: function() {
            var self = this, nodes = self.nodes, i, dom = aw.dom;
            for (i = 0; i < 4; i++) {
                self.disableTeamButtons(i);
            }
        },

        disableEmptySlots: function() {
            var self = this, nodes = self.nodes, i, dom = aw.dom, teams_count = self.teams_count;
            for (i = 0; i < teams_count; i++) {
                if (dom.isVisible(nodes[i].emptySlot)) {
                    dom.show('inline-block', nodes[i].na);
                    dom.hide(nodes[i].emptySlot);
                }
            }
        },

        clearTeamList: function() {
            var self = this, nodes = self.nodes, i, dom = aw.dom, teams_count = self.teams_count;
            for (i = 0; i < 4; i++) {
                dom.hide(nodes[i].details, nodes[i].na, nodes[i].emptySlot);
                if (i >= teams_count) {
                    dom.show('inline-block', nodes[i].na);
                } else {
                    dom.show('inline-block', nodes[i].emptySlot);
                }
            }
        }
    }

    return TeamsTabUi;
})();
