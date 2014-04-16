"use strict";

self.aw = self.aw || {};

aw.MapEditorToolkitUi = (function() {
    var MapEditorToolkitUi = function() {
        var self = this;
        self.toolkit_selection = -1;
        self.maps_names = null;
        var dynamic_objects = [ new aw.MapObjectUi(new aw.Junk(10)) ];
        for (var i = 0; i < 4; i++) {
            dynamic_objects.push(new aw.MapObjectUi(new aw.Constructor(i)));
        }
        self.dynamic_objects = dynamic_objects;
    }
    
    MapEditorToolkitUi.prototype = {
        __name: 'MapEditorToolkitUi',
        constructor: MapEditorToolkitUi,
        
        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;
            self.toolkit_node = dom.createNode('map_toolkit', js.bind(self.generateMapToolkit, self), 'box');
            self.buttons_nodes = self.toolkit_node.getElementsByTagName('div');
            
            self.selector_node = dom.createNode('map_selector', self.generateMapSelector, 'box');
            children = self.selector_node.children;
            self.map_select_node = children[0];
            self.save_btn_node = children[1];
            self.delete_btn_node = children[2];
            self.clean_btn_node = children[3];
            self.simulate_btn_node = children[4];
            
            dom.addNode(self.toolkit_node);
            dom.addNode(self.selector_node);
        },
        
        destroy: function() {
            var self = this;
            self.toolkit_node.innerHTML = "";
            self.toolkit_node.parentNode.removeChild(self.toolkit_node);
            self.buttons_nodes = null;
            self.toolkit_node = null;
            
            self.selector_node.innerHTML = "";
            self.selector_node.parentNode.removeChild(self.selector_node);
            self.map_select_node = null;
            self.save_btn_node = null;
            self.delete_btn_node = null;
            self.clean_btn_node = null;
            self.simulate_btn_node = null;
            self.selector_node = null;
        },
        

        select: function(newSel) {
            var self = this, dom = aw.dom, buttons_nodes = this.buttons_nodes;
            var BTN_SELECTED = 'tlk_btn_sel';
            if (self.toolkit_selection >= 0) {
                dom.removeClass(buttons_nodes[self.toolkit_selection], BTN_SELECTED);
            }
            dom.addClass(buttons_nodes[newSel], BTN_SELECTED);
            self.toolkit_selection = newSel;
        },
        
        getSelectedObject: function() {
            var self = this, toolkit_selection = self.toolkit_selection, cssMapLen = aw.MapUi.CSS_MAP.length;
            if (toolkit_selection < 0) {
                return null;
            }
            if (toolkit_selection >= cssMapLen) {
                return self.dynamic_objects[toolkit_selection - cssMapLen].obj.copy();
            } else {
                return toolkit_selection;
            }
        },

        generateMapToolkit: function(n) {
            var self = this, i, len;
            var str = '';
            str += '<table><tr>';
            for (i = 0, len = aw.MapUi.CSS_MAP.length; i < len; i++) {
                str += '<td><div class="' + aw.MapUi.CSS_MAP[i] + '"></div></td>';
            }
            str += '</tr></table>';
            n.innerHTML = str;
            var dynamic_objects = self.dynamic_objects;
            var tr = n.getElementsByTagName('tr')[0];
            for (i = 0, len = dynamic_objects.length; i < len; i++) {
                var td = document.createElement('td');
                dynamic_objects[i].init();
                dynamic_objects[i].repaint(true);
                td.appendChild(dynamic_objects[i].node);
                tr.appendChild(td);
            }
            
        },
        
        repaintList: function(sel) {
            var self = this, map_select_node = self.map_select_node, i, len, str = '', maps_names = self.maps_names;
            var nodeValue = (sel !== undefined) ? sel : map_select_node.value;
            str += '<option value="">Select map...</option>';
            for (i = 0, len = maps_names.length; i < len; i++) {
                str += '<option value="' + maps_names[i] + '">' + maps_names[i] + '</option>';
            }
            map_select_node.innerHTML = str;
            map_select_node.value = nodeValue;
        },
        
        generateMapSelector: function(node) {
            node.innerHTML = '<select id="map_selector_box"></select>'
                + '<a class="button" id="map_selector_save" href="javascript:void(0)">Save</a>'
                + '<a class="button" id="map_selector_delete" href="javascript:void(0)">Delete</a>'
                + '<a class="button" id="map_clean" href="javascript:void(0)">Clean</a>'
                + '<a class="button" id="map_simulate" href="javascript:void(0)">Simulate</a>';
        }
    }
    return MapEditorToolkitUi;
})();
