"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.Connector = (function() {
    var MESSAGE_EVENT = "message_event";
    var Connector = function() {
        var self = this;
        self.connected = false;
        self.auth = false;
        self.room = null;
    }

    Connector.prototype = {
        __name: 'Connector',
        constructor: Connector,
        
        connect: function(open, close, error) {
            var self = this, socket = new WebSocket('ws://antzwarz.org:31337/');
            socket.onopen = function (e) {
                self.connected = true;
                open && open(e);
            }
            socket.onerror = function (e) {
                self.connected = false;
                error && error(e);
            }
            socket.onclose = function (e) {
                self.connected = false;
                close && close(e);
            }
            socket.onmessage = function (e) {
                self.onMessage(e.data);
            }
            self.socket = socket;
        },
        
        disconnect: function() {
            self.socket.close();
            self.scoket = null;
        },
        
        register: function(email, nick, pass) {
            var self = this;
            if (self.connected) {
                self.socket.send(JSON.stringify({
                    type: 'register',
                    email: email,
                    nick: nick,
                    pass: pass
                }));
            }
        },
        
        login: function(email, pass) {
            var self = this;
            if (self.connected) {
                self.socket.send(JSON.stringify({
                    type: 'login',
                    email: email,
                    pass: pass
                }));
            }
        },
        
        joinRoom: function(room_id) {
            var self = this;
            self.socket.send(JSON.stringify({
                type: 'join_room',
                room_id: (typeof room_id !== 'number') ? -1 : room_id
            }));
        },
        
        leaveRoom: function() {
            
        },
        
        joinGame: function(team_id) {
            
        },
        
        chat: function(msg) {
            var self = this;
            if (self.connected) {
                self.socket.send(JSON.stringify({
                    type: 'chat',
                    msg: msg
                }));
            }
        },
        
        onMessage: function(msg) {
            var self = this, js = aw.js;
            console.log("Received: ");
            js.emit(self, MESSAGE_EVENT, JSON.parse(msg));
            console.log(JSON.parse(msg));
        },
        
        logout: function() {
            
        }
        
    }
    
    Connector.MESSAGE_EVENT = MESSAGE_EVENT;
    return Connector;
})();
