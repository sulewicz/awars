"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.ObjectDetailsUi = (function() {
    var ObjectDetailsUi = function() {
        var self = this;
    }

    ObjectDetailsUi.prototype = {
        __name: 'ObjectDetailsUi',
        constructor: ObjectDetailsUi,

        init: function() {
            var self = this, dom = aw.dom;
            self.simulator_object_detail_node = dom.createNode('simulator_object_detail_node', self.generateSimulatorMachineDetail, 'box');
            dom.addNode(self.simulator_object_detail_node);

            self.showObjectDetails(null);
        },

        destroy: function() {
            var self = this;
            self.simulator_object_detail_node.innerHTML = "";
            self.simulator_object_detail_node.parentNode.removeChild(self.simulator_object_detail_node);
            self.simulator_object_detail_node = null;
        },

        generateSimulatorMachineDetail: function(n) {
            // Team list
            var str = '<div></div><div><p>Select object for details.</p><img src="./img/select_machine_ico.png"></div>';
            n.innerHTML = str;
        },

        showObjectDetails: function(obj) {
            var self = this, list = self.simulator_object_detail_node.children[0], label = self.simulator_object_detail_node.children[1], extract = aw.js.extract;
            if (obj && obj._details) {
                var str = '<table><tbody>';
                for (var name in obj._details) {
                    if (obj._details.hasOwnProperty(name)) {
                        var val = (obj._details[name].prop) ? obj._details[name].format(extract(obj, obj._details[name].prop)) : extract(obj, obj._details[name]);
                        str += '<tr><td class="machine_detail_key">' + name + '</td><td class="machine_detail_value">' + val + '</td></tr>';
                    }
                }
                str += '</tbody></table>'
                list.innerHTML = str;
                list.style.display = "block";
                label.style.display = "none";
            } else {
                list.style.display = "none";
                label.style.display = "block";
            }
        }
    }

    return ObjectDetailsUi;
})();
