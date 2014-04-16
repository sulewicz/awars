"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.SimulatorControlUi = (function() {
    var SimulatorControlUi = function() {
        var self = this;
    }

    SimulatorControlUi.prototype = {
        __name: 'SimulatorControlUi',
        constructor: SimulatorControlUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children;

            self.simulator_controls_node = dom.createNode('simulator_controls_node', self.generateSimulatorControls, 'box');
            children = self.simulator_controls_node.children;
            self.start_btn_node = children[0];
            self.pause_btn_node = children[1];
            self.reset_btn_node = children[2];
            self.step_btn_node = children[3];
            self.step_mode_btn_node = children[4];
            self.edit_map_btn_node = children[5];
            dom.addNode(self.simulator_controls_node);
        },

        destroy: function() {
            var self = this;
            self.simulator_controls_node.innerHTML = "";
            self.simulator_controls_node.parentNode.removeChild(self.simulator_controls_node);
            self.simulator_controls_node = null;
            self.start_btn_node = null;
            self.pause_btn_node = null;
            self.reset_btn_node = null;
            self.step_btn_node = null;
            self.step_mode_btn_node = null;
            self.edit_map_btn_node = null;
        },

        generateSimulatorControls: function(n) {
            // Toolkit buttons
            var str = '<a class="button" id="simulator_start" href="javascript:void(0)">Start</a>'
                + '<a class="button" id="simulator_pause" href="javascript:void(0)">Pause</a>'
                + '<a class="button" id="simulator_reset" href="javascript:void(0)">Reset</a>'
                + '<a class="button" id="simulator_step" href="javascript:void(0)">Step</a>'
                + '<a class="button" id="simulator_step_mode" href="javascript:void(0)">Step All</a>'
                + '<a class="button" id="simulator_edit_map" href="javascript:void(0)">Edit Map</a>';
            n.innerHTML = str;
        },

        updateStepMode: function(mode) {
            var self = this, LABELS = ['Step Machine', 'Step Team', 'Step All'];
            self.step_mode_btn_node.innerHTML = LABELS[mode];
        }
    }
    return SimulatorControlUi;
})();
