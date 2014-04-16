"use strict";

function Room(id) {
    var self = this;
    self.id = id;
    self.users = {};
    self.players = {};
}

Room.prototype = {
    constructor: Room, 
    name: 'Room'
}


exports.Room = Room;
