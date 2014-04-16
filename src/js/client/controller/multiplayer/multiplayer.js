"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.Multiplayer = (function() {
    var LOGIN_SCREEN = 0, LOBBY_SCREEN = 1, GAME_SCREEN = 2;
    
    var MESSAGE_HANDLERS = {
        error: function(msg) {
            var self = this;
            if (self.state == LOGIN_SCREEN) {
                self.ui_auth.showError(msg.desc);
            }
        },
        
        chat: function(msg) {
            var self = this;
            if (self.state == LOBBY_SCREEN) {
                self.ui_chat.showMessage('<' + self.users[msg.id].nick + '> ' + msg.msg);
            }
        },
        
        join_room: function(msg) {
            var self = this;
            console.log('Joining room ' + msg.room_id);
            self.setState(GAME_SCREEN);
        },
        
        joined_room: function(msg) {
            var self = this;
            if (self.state == LOBBY_SCREEN) {
                self.ui_chat.showMessage(msg.nick + ' has joined room number ' + msg.room_id + '.' , 'system');
            }
        },
        
        left_room: function(msg) {
            
        },
        
        join_lobby: function(msg) {
            var self = this;
            
            if (self.state == LOGIN_SCREEN) {
                self.setState(LOBBY_SCREEN);
            }
            
            if (self.state == LOBBY_SCREEN) {
                var ids = msg.ids, nicks = msg.nicks;
                for (var i = 0, l = ids.length; i < l; i++) {
                    var id = ids[i], nick = nicks[i];
                    self.users[id] = { id: id, nick: nick };
                }
                self.ui_users_list.addUsers(self.users);
            }
        },
        
        joined_lobby: function(msg) {
            var self = this;
            
            if (self.state == LOBBY_SCREEN) {
                var user = { id: msg.id, nick: msg.nick };
                self.users[user.id] = user;
                self.ui_chat.showMessage(msg.nick + ' has joined the lobby.' , 'system');
                self.ui_users_list.addUser(user);
            }
        },
        
        left_lobby: function(msg) {
            var self = this;
            if (self.state == LOBBY_SCREEN) {
                var id = msg.id, nick = self.users[id].nick;
                delete self.users[id];
                self.ui_chat.showMessage(nick + ' has left the lobby.' , 'system');
                self.ui_users_list.deleteUser(id);
            }
        }
    }
    
    var Multiplayer = function(map) {
        var self = this, js = aw.js;
        self.state = -1;
        self.users = {};
        self.ui_auth = new aw.AuthUi();
        self.ui_chat = new aw.ChatUi();
        self.ui_users_list = new aw.UsersListUi();
        self.ui_rooms_list = new aw.RoomsListUi();
        self.connector = new aw.Connector();
        js.reg(self.connector, aw.Connector.MESSAGE_EVENT, js.bind(self.onMessage, self));
    }
    

    Multiplayer.prototype = {
        __name: 'Multiplayer',
        constructor: Multiplayer,
        setup: function() {
            var self = this;
            
            self.init();
        },

        destroy: function() {
            var self = this;
            self.setState(-1);
        },

        init: function() {
            var self = this;
            
            self.setState(LOGIN_SCREEN);
        },
        
        setState: function(new_state) {
            var self = this, dom = aw.dom, js = aw.js;
            if (self.state != new_state) {
                switch (self.state) {
                    case LOGIN_SCREEN:
                        js.unregAll(self.ui_auth, aw.AuthUi.REGISTER_EVENT);
                        js.unregAll(self.ui_auth, aw.AuthUi.LOGIN_EVENT);
                        self.ui_auth.destroy();
                    break;
                    case LOBBY_SCREEN:
                        js.unregAll(self.ui_chat, aw.ChatUi.CHAT_MESSAGE_EVENT);
                        js.unregAll(self.ui_rooms_list, aw.RoomsListUi.CREATE_ROOM_EVENT);
                        self.ui_chat.destroy();
                        self.ui_users_list.destroy();
                        self.ui_rooms_list.destroy();
                    break;
                    case GAME_SCREEN:
                    break;
                }
                self.state = new_state;
                switch (self.state) {
                    case LOGIN_SCREEN:
                        self.ui_auth.init();
                        js.reg(self.ui_auth, aw.AuthUi.REGISTER_EVENT, js.bind(self.register, self));
                        js.reg(self.ui_auth, aw.AuthUi.LOGIN_EVENT, js.bind(self.login, self));
                    break;
                    case LOBBY_SCREEN:
                        self.ui_chat.init();
                        js.reg(self.ui_chat, aw.ChatUi.CHAT_MESSAGE_EVENT, js.bind(self.chat, self));
                        js.reg(self.ui_rooms_list, aw.RoomsListUi.CREATE_ROOM_EVENT, js.bind(self.createRoom, self));
                        self.ui_users_list.init();
                        self.ui_rooms_list.init();
                    break;
                    case GAME_SCREEN:
                    break;
                }
            }
        },
        
        onMessage: function(msg) {
            var self = this;
            
            if (msg && MESSAGE_HANDLERS.hasOwnProperty(msg.type)) {
                MESSAGE_HANDLERS[msg.type].call(self, msg);
            }
        },
        
        register: function(email, nick, pass) {
            var self = this, connector = self.connector;
            connector.connect(function() {
                connector.register(email, nick, pass);
            });
        },
        
        login: function(email, pass) {
            var self = this, connector = self.connector;
            connector.connect(function() {
                connector.login(email, pass);
            }, function() {
                self.setState(LOGIN_SCREEN);
            });
        },
        
        chat: function(msg) {
            var self = this, connector = self.connector;
            connector.chat(msg);
        },
        
        createRoom: function() {
            var self = this, connector = self.connector;
            connector.joinRoom();
        }
    }
    return Multiplayer;
})();