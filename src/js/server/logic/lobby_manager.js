"use strict";

function LobbyManager(broadcaster) {
    var self = this;
    self.sessions = {};
    self.broadcast = broadcaster;
}

LobbyManager.prototype = {
    constructor: LobbyManager, 
    name: 'LobbyManager',
    
    addSession: function(session) {
        var self = this, sessions = self.sessions, user = session.user;
        var nicks = [], ids = [];
        
        self.broadcastLobby({type: 'joined_lobby', id: user.id, nick: user.nick});
        sessions[user.id] = session;
        console.log('User ' + user.nick + ' joined the lobby.');
        
        for (var id in sessions) {
            if (sessions.hasOwnProperty(id)) {
                var u = sessions[id].user
                nicks.push(u.nick);
                ids.push(u.id);
            }
        }
        session.send({type: 'join_lobby', nicks: nicks, ids: ids});
    },
    
    removeSession: function(session) {
        var self = this, user = session.user;
        self.broadcastLobby({type: 'left_lobby', id: user.id});
        delete self.sessions[user.id];
        console.log('User ' + user.nick + ' left the lobby.');
    },
    
    chat: function(session, msg) {
        var self = this;
        self.broadcastLobby({type: 'chat', id: session.user.id, msg: msg});
    },
    
    broadcastLobby: function(msg) {
        var self = this, sessions = self.sessions;
        self.broadcast(msg, sessions);
    }
}

exports.LobbyManager = LobbyManager;
