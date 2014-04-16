"use strict";

self.aw = self.aw || {};

aw.ChatUi = (function() {
    var MAX_SIZE = 128;
    var CHAT_MESSAGE_EVENT = "chat_message_event";
    
    var ChatUi = function() {
        var self = this;
        self.count = 0;
    }
    
    ChatUi.prototype = {
        __name: 'ChatUi',
        constructor: ChatUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;

            self.node = dom.createNode('chat', self.generateUi);
            var children = self.node.children;
            self.messages = children[0];
            self.input = children[1].children[0];
            self.send = children[1].children[1];
            function onSend() {
                if (self.input.value) {
                    js.emit(self, CHAT_MESSAGE_EVENT, self.input.value);
                    self.input.value = '';
                }
            }
            dom.registerClick(self.send, onSend);
            self.input.addEventListener('keyup', function (e) {
                if (e.keyCode == 13) {
                    onSend();
                }
            })
            dom.addNode(self.node);
        },

        destroy: function() {
            var self = this;
            self.node.innerHTML = "";
            self.node.parentNode.removeChild(self.node);
            self.messages = null;
            self.input = null;
            self.send = null;
        },
        
        showMessage: function(msg, type) {
            var self = this, n = document.createElement('span');
            if (type) {
                n.className = type;
            }
            n.innerText = msg;
            if (self.count >= MAX_SIZE) {
                self.messages.removeChild(self.messages.children[0]);
            } else {
                self.count++;
            }
            self.messages.appendChild(n);
            self.messages.scrollTop = self.messages.scrollHeight;
        },

        generateUi: function(n) {
            var str = '<div class="messages"></div>'
                + '<div class="row" id="chat_row"><input type="text" name="input" id="chat_input"></input><a class="button" id="chat_send" href="javascript:void(0)">Send</a></div>';
            n.innerHTML = str;
        }
    }
    
    ChatUi.CHAT_MESSAGE_EVENT = CHAT_MESSAGE_EVENT;
    return ChatUi;
})();
