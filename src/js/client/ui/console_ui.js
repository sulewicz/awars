"use strict";

self.aw = self.aw || {};

aw.ConsoleUi = (function() {
    var MAX_SIZE = 64;
    
    var ConsoleUi = function() {
        var self = this;
        self.count = 0;
    }
    
    ConsoleUi.prototype = {
        __name: 'ConsoleUi',
        constructor: ConsoleUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;

            self.node = dom.createNode('console_node', self.generateConsole, 'box');
            dom.addNode(self.node);
            self.log_node = self.node.children[0];
            self.log('system', 'Here you will see any errors or messages.');
        },

        destroy: function() {
            var self = this;
            self.node.innerHTML = "";
            self.node.parentNode.removeChild(self.node);
            self.node = null;
        },
        
        log: function(type, msg) {
            var self = this, n = document.createElement('span');
            n.className = type;
            n.innerText = msg;
            if (self.count >= MAX_SIZE) {
                self.log_node.removeChild(self.log_node.children[0]);
            } else {
                self.count++;
            }
            self.log_node.appendChild(n);
            self.log_node.scrollTop = self.log_node.scrollHeight;
        },

        generateConsole: function(n) {
            var str = '<div></div>';
            n.innerHTML = str;
        }
    }
    return ConsoleUi;
})();
