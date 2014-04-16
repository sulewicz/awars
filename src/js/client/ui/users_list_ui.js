"use strict";

self.aw = self.aw || {};

aw.UsersListUi = (function() {
    var MAX_SIZE = 128;
    var CHAT_MESSAGE_EVENT = "chat_message_event";
    
    var UsersListUi = function() {
        var self = this;
    }
    
    UsersListUi.prototype = {
        __name: 'UsersListUi',
        constructor: UsersListUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;

            self.node = dom.createNode('users_list', self.generateUi);
            var children = self.node.children;
            self.list_node = children[0];
            self.users_nodes = {};
            
            dom.addNode(self.node);
        },

        destroy: function() {
            var self = this;
            self.node.innerHTML = "";
            self.node.parentNode.removeChild(self.node);
            self.list_node = null;
            self.users_nodes = null;
        },
        
        addUsers: function(users) {
            var self = this;
            for (var id in users) {
                if (users.hasOwnProperty(id)) {
                    self.addUser(users[id]);
                }
            }
        },
        
        addUser: function(user) {
            var self = this, n = document.createElement('span');
            n.innerText = user.nick + ' (' + user.id + ')';
            self.users_nodes[user.id] = n;
            self.list_node.appendChild(n);
        },
        
        deleteUser: function(id) {
            var self = this;
            if (self.users_nodes.hasOwnProperty(id)) {
                var node = self.users_nodes[id];
                node.parentNode.removeChild(node);
                delete self.users_nodes[id];
            }
        },

        generateUi: function(n) {
            var str = '<div class="users"></div>';
            n.innerHTML = str;
        }
    }
    
    UsersListUi.CHAT_MESSAGE_EVENT = CHAT_MESSAGE_EVENT;
    return UsersListUi;
})();
