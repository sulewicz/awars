"use strict";

self.aw = self.aw || {};

var fs = require("fs");
var path = require("path");

aw.MapEditor = (function() {
    var SAMPLE_MAP = '0000000001100000000001111111111111111110010000000110000000100101000100001000101001000001011010000010010000010110100000100100000100001000001001011111011011111010010000000110000000100110110111111011011101101101111110110111010000000110000000100101111101101111101001000001000010000010010000010110100000100100000101101000001001010001000010001010010000000110000000100111111111111111111000000000011000000000|Junk,15,0,10;Junk,16,0,10;Junk,17,0,10;Junk,18,0,10;Junk,19,0,10;Junk,19,1,10;Junk,19,2,10;Junk,19,3,10;Junk,19,4,10;Junk,0,0,10;Junk,0,1,10;Junk,0,4,10;Junk,0,3,10;Junk,0,2,10;Junk,1,0,10;Junk,2,0,10;Junk,3,0,10;Junk,4,0,10;Junk,0,15,10;Junk,0,16,10;Junk,0,17,10;Junk,0,18,10;Junk,0,19,10;Junk,1,19,10;Junk,2,19,10;Junk,3,19,10;Junk,4,19,10;Junk,19,19,10;Junk,18,19,10;Junk,17,19,10;Junk,16,19,10;Junk,15,19,10;Junk,19,18,10;Junk,19,17,10;Junk,19,16,10;Junk,19,15,10;Constructor,5,5,0;Constructor,14,5,1;Constructor,14,14,2;Constructor,5,14,3;Junk,9,16,10;Junk,10,16,10;Junk,9,13,10;Junk,10,13,10;Junk,9,6,10;Junk,10,6,10;Junk,9,3,10;Junk,10,3,10;Junk,3,9,10;Junk,3,10,10;Junk,6,9,10;Junk,6,10,10;Junk,13,9,10;Junk,13,10,10;Junk,16,9,10;Junk,16,10,10;Junk,8,11,10;Junk,11,11,10;Junk,8,8,10;Junk,11,8,10';
    var SIMULATE_CLICKED = "simulate_clicked";
    
    var MapEditor = function() {
        var self = this;
        self.map = new aw.Map(20);
        self.map.deserialize(SAMPLE_MAP);
        self.ui_map = new aw.MapUi(self.map);
        self.ui_toolkit = new aw.MapEditorToolkitUi();
        self.file_name = null;
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
            dom.registerClick(ui.load_btn_node, function(e) {
                self.loadMap();
            });
            dom.registerClick(ui.save_btn_node, function(e) {
                self.saveMap(self.file_name);
            });
            dom.registerClick(ui.save_as_btn_node, function(e) {
                self.saveMap(null);
            });
            dom.registerClick(ui.clear_btn_node, function(e) {
                self.clearMap();
            });
            dom.registerClick(ui.simulate_btn_node, function(e) {
                if (self.map.validate()) {
                    js.emit(self, SIMULATE_CLICKED, self.map.copy());
                }
            });

            ui.save_file_node.addEventListener('change', function() {
                self.saveMap(this.value);
            }, true);

            ui.open_file_node.addEventListener('change', function() {
                self.loadMap(this.value);
            }, true);
        },
        
        saveMap: function(filename) {
            var self = this, dom = aw.dom, ui = self.ui_toolkit;
            if (filename) {
                fs.writeFile(filename, self.map.serialize(), function(err) {
                    if (err) {
                      alert('Could not write to file "' + filename + '": ' + err);
                      return;
                    }

                    self.file_name = filename;
                    ui.setFileName(path.basename(filename));
                  });
            } else {
                dom.triggerEvent(self.ui_toolkit.save_file_node, 'click');
            }
        },

        clearMap: function() {
            var self = this, ui = self.ui_toolkit;
            new aw.DialogUi({msg: 'Are you sure you want to clear the map?', cancel: true, ok: function(name) {
                self.map.reset();
                self.ui_map.repaint();
                ui.setFileName(self.file_name = null);
            }}).show();
        },
        
        loadMap: function(filename) {
            var self = this, dom = aw.dom, ui = self.ui_toolkit;
            if (filename) {
                fs.readFile(filename, function(err, data) {
                    if (err) {
                      alert('Could not read file "' + filename + '": ' + err);
                      return;
                    }

                    var mapBkp = self.map.serialize();
                    try {
                        self.map.deserialize(String(data));
                    } catch (e) {
                        debugger;
                        alert('Error while loading map: ' + e);
                        self.map.reset();
                        self.map.deserialize(mapBkp);
                        return;
                    }
                    self.file_name = filename;
                    ui.setFileName(path.basename(filename));
                  });
            } else {
                dom.triggerEvent(self.ui_toolkit.open_file_node, 'click');
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
