"use strict";

var LobbyManager = require('../logic/lobby_manager.js').LobbyManager;
var RoomsManager = require('../logic/rooms_manager.js').RoomsManager;
var validate = require('../utils/validator.js').validate;

function SessionsHandler() {
    var self = this;
    self.sessions = {};
    
    function broadcaster(obj, users) {
        self.broadcast(obj, users);
    }
    self.lobby = new LobbyManager(broadcaster);
    self.rooms = new RoomsManager(broadcaster);

    self.handleMessage = function(session, data) {
        var handled = false, user = session.user;
        if (data && validate(data)) {
            switch (data.type) {
                case 'chat':
                    if (session.room) {
                        self.rooms.chat(session, data.msg);
                    } else {
                        self.lobby.chat(session, data.msg);
                    }
                    handled = true;
                break;
                case 'join_room':
                    if (!session.room) {
                        var room_id = data.room_id;
                        if (room_id < 0) {
                            room_id = self.rooms.createRoom();
                        }
                        if (room_id >= 0) {
                            self.rooms.addSession(session, room_id);
                            self.lobby.removeSession(session);
                        } else {
                            // TODO: inform about rooms limit hit
                        }
                        handled = true;
                    }
                break;
            }
        }
        if (!handled) {
            session.disconnect();
        }
    };
    
    self.handleClose = function(session) {
        self.removeSession(session);
    };
}

SessionsHandler.prototype = {
    constructor: SessionsHandler, 
    name: 'SessionsHandler',
    
    addSession: function(session) {
        var self = this, sessions = self.sessions, user = session.user, activeSession = self.sessions[session.user.id];
        
        if (activeSession) {
            self.removeSession(activeSession);
            activeSession.onMessage = null;
            activeSession.onClose = null;
            activeSession.disconnect();
            console.log('Replacing client session!');
        }
        sessions[user.id] = session;
        session.onMessage = self.handleMessage;
        session.onClose = self.handleClose;
        console.log('Client ' + user.email + ' connected.');
        self.lobby.addSession(session); // entering the lobby by default
    },
    
    removeSession: function(session) {
        var self = this, user = session.user;
        delete self.sessions[user.id];
        (session.room ? self.rooms : self.lobby).removeSession(session);
        console.log('Client ' + user.email + ' disconnected.');
    },
    
    broadcast: function(obj, users) {
        var self = this, sessions = users || self.sessions, utf = JSON.stringify(obj);
        for (var id in sessions) {
            if (sessions.hasOwnProperty(id)) {
                sessions[id].sendUtf(utf);
            }
        }
    }

}

exports.SessionsHandler = SessionsHandler;
