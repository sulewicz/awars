"use strict";

self.aw = self.aw || {};

aw.RoomsListUi = (function() {
    var CREATE_ROOM_EVENT = "create_room_event";
    var RoomsListUi = function() {
        var self = this;
    }
    
    RoomsListUi.prototype = {
        __name: 'RoomsListUi',
        constructor: RoomsListUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;

            self.node = dom.createNode('rooms_list', self.generateUi);
            var children = self.node.children;
            self.panel_node = children[0];
            self.create_room_btn = self.panel_node.children[0];
            self.list_node = children[1];
            self.rooms_nodes = {};
            
            function onCreateRoom() {
                js.emit(self, CREATE_ROOM_EVENT);
            }
            dom.registerClick(self.create_room_btn, onCreateRoom);
            
            dom.addNode(self.node);
        },

        destroy: function() {
            var self = this;
            self.node.innerHTML = "";
            self.node.parentNode.removeChild(self.node);
            self.panel_node = null;
            self.list_node = null;
            self.create_room_btn = null;
        },
        
        addRooms: function(rooms) {
            var self = this;
            for (var id in rooms) {
                if (rooms.hasOwnProperty(id)) {
                    self.addRoom(rooms[id]);
                }
            }
        },
        
        addRoom: function(room) {
            var self = this;
        },
        
        deleteRoom: function(id) {
            var self = this;
        },

        generateUi: function(n) {
            var str = '<div class="panel"><a class="button" id="rooms_create" href="javascript:void(0)">Create room</a></div><div class="rooms"></div>';
            n.innerHTML = str;
        }
    }
    
    RoomsListUi.CREATE_ROOM_EVENT = CREATE_ROOM_EVENT;
    return RoomsListUi;
})();
