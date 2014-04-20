"use strict";

self.aw = self.aw || {};

aw.MapUi = (function() {
    var CSS_MAP = ['cl_floor', 'cl_wall'];
    
    var DYNAMIC_OBJECT_EVENT = "dynamicObjectEvent";

    var MapUi = function(map) {
        var self = this, js = aw.js;
        self.map = map;
        self.map._ui = self;
        self.map_mutated_callback = js.bind(self.mapMutated, self);
        aw.js.reg(self.map, aw.Map.MAP_MUTATED_EVENT, self.map_mutated_callback);
    }

    MapUi.prototype = {
        __name: 'MapUi',
        constructor: MapUi,

        init: function() {
            var self = this, m = document.createElement('div'), dom = aw.dom;
            m.id = 'map';
            m.className = "box";
            self.size = self.map.size;
            m.innerHTML = this.generateMapView(self.size);
            self.cell_nodes = m.getElementsByTagName('div');

            self.map_node = m;
            dom.addNode(m);
            
            var objs = self.map.dynamic_objects, len = objs.length, i;
            if (len > 0) {
                for (i = 0; i < len; i++) {
                    self.mapMutated('added', objs[i]);
                }
            }
        },

        destroy: function() {
            var self = this;
            var objs = self.map.dynamic_objects, len = objs.length, i;
            if (len > 0) {
                for (i = 0; i < len; i++) {
                    if (objs[i]._ui) {
                        objs[i]._ui.destroy();
                        delete objs[i]._ui;
                    }
                }
            }
            self.map_node.innerHTML = "";
            self.map_node.parentNode.removeChild(self.map_node);
            self.cell_nodes = null;
            self.map_node = null;
            self.size = null;
        },

        generateMapView: function(size) {
            var x, y;
            var str = '';
            str += '<table><tr>';
            for ( y = 0; y < size; y++) {
                str += '<td>';
                for ( x = 0; x < size; x++) {
                    str += '<div class="' + CSS_MAP[0] + '"></div>';
                }
                str += '</td>';
            }
            str += '</tr></table>';
            return str;
        },

        repaintObject: function(o) {
            var self = this;
            o._ui.repaint();
        },

        repaint: function() {
            var i, l;
            var self = this, nodes = self.cell_nodes, mapTiles = self.map.content, objects = self.map.dynamic_objects;
            if (arguments.length == 1) {// repaint selected
                var a = arguments[0], xy, s = self.map.size;
                for ( i = 0, l = a.length; i < l; i += 2) {
                    xy = a[i] * s + a[i + 1];
                    nodes[xy].className = CSS_MAP[mapTiles[xy]];
                }
            } else {// repaint all
                for ( i = 0, l = mapTiles.length; i < l; i++) {
                    nodes[i].className = CSS_MAP[mapTiles[i]];
                }
            }

            for ( i = 0, l = objects.length; i < l; i++) {
                self.repaintObject(objects[i]);
            }
        },

        mapMutated: function(type, o) {
            var self = this, o_ui;
            if (type === 'added') {
                // create a node for given object
                if (!o._ui) {
                    o_ui = new aw.MapObjectUi(o);
                    o_ui.init();
                    self.map_node.appendChild(o_ui.node);
                    o_ui.repaint();
                } else {
                    o_ui = o._ui;
                }
                o_ui.node.addEventListener('click', function() {
                    aw.js.emit(self, DYNAMIC_OBJECT_EVENT, o);
                });
            } else if (type === 'deleted') {
                o._ui.destroy();
            }
        }
    }

    MapUi.CSS_MAP = CSS_MAP;
    MapUi.DYNAMIC_OBJECT_EVENT = DYNAMIC_OBJECT_EVENT;
    return MapUi;
})();
