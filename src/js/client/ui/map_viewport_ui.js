"use strict";

self.aw = self.aw || {};

aw.MapViewportUi = (function() {
    var CSS_MAP = ['cl_floor', 'cl_wall'];
    var MapViewportUi = function(map) {
        var self = this;
        self.map = map;
        self.x = 0;
        self.y = 0;
        self.size = 5;
        self.objects_map = {};
    }

    MapViewportUi.prototype = {
        __name: 'MapViewportUi',
        constructor: MapViewportUi,

        init: function() {
            var self = this, m = document.createElement('div'), dom = aw.dom;
            m.id = 'map_viewport';
            m.className = 'box';
            m.innerHTML = this.generateMapView(self.size);
            self.cell_nodes = m.getElementsByTagName('div');

            self.map_viewport_node = m;
            dom.addNode(m);
            self.repaint();
        },

        destroy: function() {
            var self = this;
            self.map_viewport_node.innerHTML = "";
            self.map_viewport_node.parentNode.removeChild(self.map_viewport_node);
            self.cell_nodes = null;
            self.map_viewport_node = null;
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
        
        setViewport: function(x, y) {
            var self = this;
            self.x = x - ~~(self.size / 2);
            self.y = y - ~~(self.size / 2);
            self.repaint();
        },

        repaint: function() {
            var self = this, js = aw.js, i, l, tile, nodes = self.cell_nodes, x, y, objects = self.map.dynamic_objects, mapSize = self.map.size, size = self.size, obj, node, id;
            var objectsCopy = js.clone(self.objects_map);

            for (x = 0; x < size; x++) {
                for (y = 0; y < size; y++) {
                    i = x * size + y;
                    tile = self.map.get(self.x + x, self.y + y);
                    nodes[i].className = (tile != null) ? CSS_MAP[tile] : 'cl_empty';
                }
            }
            for (i = 0, l = objects.length; i < l; i++) {
                obj = objects[i];
                if (obj.x >= self.x && obj.x < self.x + size && obj.y >= self.y && obj.y < self.y + size) {
                    if (self.objects_map[obj.id]) {
                        node = self.objects_map[obj.id];
                        delete objectsCopy[obj.id];
                    } else {
                        node = document.createElement('div');
                        node.innerHTML = obj._ui.node.innerHTML;
                        node.className = obj._ui.node.className;
                        self.map_viewport_node.appendChild(node);
                        self.objects_map[obj.id] = node;
                    }
                    self.adjustNode(node, obj);
                }
            }
            
            for (id in objectsCopy) {
                if (objectsCopy.hasOwnProperty(id)) {
                    objectsCopy[id].parentNode.removeChild(objectsCopy[id]);
                    delete self.objects_map[id];
                }
            }
        },
        
        adjustNode: function(node, obj) {
            var self = this, parent = node.parentNode, xToLeft = aw.utils.xToLeft, yToTop = aw.utils.yToTop;
            node.style.left = xToLeft(node, (obj.x - self.x), -1);
            node.style.top = yToTop(node, (obj.y - self.y), -1);
            if (obj.constructor == aw.Machine) {
                node.style.backgroundPosition = (-aw.utils.TILE_SIZE * obj.team.team_no) + 'px';
                node.style.webkitTransform = 'rotate(' + (obj.dir * 90) + 'deg)';
            }
        }
    }
    return MapViewportUi;
})();
