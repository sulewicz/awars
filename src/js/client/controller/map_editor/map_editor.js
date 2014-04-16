"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.MapEditor = (function() {
    var SAMPLE_MAP = '0000000001100000000001111111111111111110010000000110000000100101000100001000101001000001011010000010010000010110100000100100000100001000001001011111011011111010010000000110000000100110110111111011011101101101111110110111010000000110000000100101111101101111101001000001000010000010010000010110100000100100000101101000001001010001000010001010010000000110000000100111111111111111111000000000011000000000|Junk,15,0,10;Junk,16,0,10;Junk,17,0,10;Junk,18,0,10;Junk,19,0,10;Junk,19,1,10;Junk,19,2,10;Junk,19,3,10;Junk,19,4,10;Junk,0,0,10;Junk,0,1,10;Junk,0,4,10;Junk,0,3,10;Junk,0,2,10;Junk,1,0,10;Junk,2,0,10;Junk,3,0,10;Junk,4,0,10;Junk,0,15,10;Junk,0,16,10;Junk,0,17,10;Junk,0,18,10;Junk,0,19,10;Junk,1,19,10;Junk,2,19,10;Junk,3,19,10;Junk,4,19,10;Junk,19,19,10;Junk,18,19,10;Junk,17,19,10;Junk,16,19,10;Junk,15,19,10;Junk,19,18,10;Junk,19,17,10;Junk,19,16,10;Junk,19,15,10;Constructor,5,5,0;Constructor,14,5,1;Constructor,14,14,2;Constructor,5,14,3;Junk,9,16,10;Junk,10,16,10;Junk,9,13,10;Junk,10,13,10;Junk,9,6,10;Junk,10,6,10;Junk,9,3,10;Junk,10,3,10;Junk,3,9,10;Junk,3,10,10;Junk,6,9,10;Junk,6,10,10;Junk,13,9,10;Junk,13,10,10;Junk,16,9,10;Junk,16,10,10;Junk,8,11,10;Junk,11,11,10;Junk,8,8,10;Junk,11,8,10';
    var SIMULATE_CLICKED = "simulate_clicked";
    
    var MapEditor = function() {
        var self = this;
        self.map = new aw.Map(20);
        self.map.deserialize(SAMPLE_MAP);
        self.ui_map = new aw.MapUi(self.map);
        self.ui_toolkit = new aw.MapEditorToolkitUi();
    }
    
    MapEditor.prototype = {
        __name: 'MapEditor',
        constructor: MapEditor,
        
        setup: function() {
            var self = this;
            self.ui_map.init();
            self.ui_toolkit.init();
            self.init();
        },
        
        destroy: function() {
            var self = this;
            self.ui_map.destroy();
            self.ui_toolkit.destroy();
        },
        
        init: function() {
            var self = this;
            self.registerMapCallbacks();
            self.registerToolkitCallbacks();
            self.registerSelectorCallbacks();
            self.updateMapsList();
            self.ui_map.repaint();
        },
        
        registerMapCallbacks: function() {
            var self = this, js = aw.js, dom = aw.dom, size = self.map.size;
            js.each(self.ui_map.cell_nodes, function(node, i) {
                dom.registerClick(node, function(e) {
                   self.updateCell(~~(i / size), (i % size), self.ui_toolkit.getSelectedObject());
                });
            });
            aw.js.reg(self.ui_map, aw.MapUi.DYNAMIC_OBJECT_EVENT, function(obj) {
                self.deleteObject(obj);
            });
        },

        registerToolkitCallbacks: function() {
            var js = aw.js, dom = aw.dom, self = this;
            js.each(self.ui_toolkit.buttons_nodes, function(node, i) {
                dom.registerClick(node, function(e) {
                   self.ui_toolkit.select(i);
                });
            });
        },
        
        registerSelectorCallbacks: function() {
            var self = this, ui = self.ui_toolkit, dom = aw.dom, js = aw.js;
            ui.map_select_node.addEventListener('change', function(e) {
                self.loadMap();
            });
            dom.registerClick(ui.save_btn_node, function(e) {
                self.saveMap();
            });
            dom.registerClick(ui.delete_btn_node, function(e) {
                self.deleteMap();
            });
            dom.registerClick(ui.clean_btn_node, function(e) {
                self.cleanMap();
            });
            dom.registerClick(ui.simulate_btn_node, function(e) {
                if (self.map.validate()) {
                    js.emit(self, SIMULATE_CLICKED, self.map.copy());
                }
            });
        },
        
        updateMapsList: function() {
            var self = this;
            if (!self.ui_toolkit.maps_names) {
                var mapsString = localStorage.getItem('aw_maps');
                if (mapsString) {
                    self.ui_toolkit.maps_names = mapsString.split('|');
                } else {
                    self.ui_toolkit.maps_names = [];
                } 
            }
            self.ui_toolkit.repaintList();
        },
        
        saveMap: function() {
            var self = this;
            new aw.DialogUi({msg: 'Enter map name:', input: true, value: self.ui_toolkit.map_select_node.value, cancel: true, ok: function(name) {
                if (!name || name.indexOf('|') >= 0) {
                    new aw.DialogUi({msg: 'Invalid name!', ok: true}).show();
                    return;
                }
                function save() {
                    localStorage.setItem('aw_maps', self.ui_toolkit.maps_names.join('|'));
                    localStorage.setItem('aw_map_' + name, self.map.serialize());
                    self.ui_toolkit.repaintList(name);
                    self.ui_map.repaint();
                }
                if (self.ui_toolkit.maps_names.indexOf(name) >= 0) {
                    new aw.DialogUi({msg: 'Are you sure you want to override the code?', cancel: true, ok: function() {
                        save();
                    }}).show();
                } else {
                    self.ui_toolkit.maps_names.push(name);
                    save();
                }
            }}).show();
        },
        
        cleanMap: function() {
            var self = this;
            new aw.DialogUi({msg: 'Are you sure you want to clean the map?', cancel: true, ok: function(name) {
                self.map.reset();
                self.ui_map.repaint();
            }}).show();
        },
        
        loadMap: function() {
            var self = this, name = self.ui_toolkit.map_select_node.value;
            if (name) {
                self.map.deserialize(localStorage.getItem('aw_map_' + name));
                self.ui_map.repaint();
            }
        },
        
        deleteMap: function() {
            var self = this, name = self.ui_toolkit.map_select_node.value, maps_names = self.ui_toolkit.maps_names;
            if (name) {
                new aw.DialogUi({msg: 'Are you sure you want to delete "' + name + '"?', cancel: true, ok: function(name) {
                    maps_names.splice(maps_names.indexOf(name), 1);
                    localStorage.setItem('aw_maps', self.ui_toolkit.maps_names.join('|'));
                    localStorage.removeItem('aw_map_' + name)
                    self.ui_toolkit.repaintList('');
                }}).show();
            }
        },
        
        updateCell: function(x, y, object) {
            var self = this;
            if (object !== null) {
                if (typeof(object) === 'number') {
                    self.map.set(x, y, object);
                    self.ui_map.repaint([x, y]);
                } else {
                    object.x = x;
                    object.y = y;
                    self.map.addObject(object);
                }
            }
        },
        
        deleteObject: function(obj) {
            var self = this;
            self.map.deleteObject(obj);
            self.ui_map.repaint([obj.x, obj.y]);
        }
    }
    
    MapEditor.SIMULATE_CLICKED = SIMULATE_CLICKED;
    return MapEditor;
})();
