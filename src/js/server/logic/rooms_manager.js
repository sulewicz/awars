"use strict";

var Room = require('../model/room.js').Room;

function RoomsManager(broadcaster) {
    var self = this;
    self.rooms = [];
    self.sessions = {};
    self.broadcast = broadcaster;
}

RoomsManager.prototype = {
    constructor: RoomsManager, 
    name: 'RoomsManager',
    
    createRoom: function() {
        var self = this, room_id = self.rooms.length;
        self.rooms[room_id] = new Room();
        return room_id;
    },
    
    deleteRoom: function(room_id) {
        
    },
    
    addSession: function(session, room_id) {
        var self = this, user = session.user;
        if (room_id >= 0 && room_id < self.rooms.length) {
            session.room = self.rooms[room_id];
            self.broadcast({type: 'joined_room', id: user.id, nick: user.nick, room_id: room_id });
            self.sessions[user.email] = session;
            session.send({type: 'join_room', room_id: room_id});
            console.log('User ' + user.nick + ' joined room number ' + room_id + '.');
        } else {
            session.disconnect(); 
        }
    },
    
    removeSession: function(session) {
        var self = this, user = session.user;
        if (session.room && self.rooms.hasOwnProperty(session.room.id)) {
            var room_id = session.room.id;
            self.broadcast({type: 'left_room', id: user.id, room: room_id });
            delete self.sessions[user.email];
            console.log('User ' + user.nick + ' left room with id ' + room_id + '.');
        } else {
            session.disconnect();
        }
    },
    
    chat: function(session, msg) {
        var self = this
        self.broadcast({type: 'chat', id: session.user.id, msg: msg}, session.room.users);
    }
}

exports.RoomsManager = RoomsManager;
