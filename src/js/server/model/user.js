"use strict";

function User(id, email, nick) {
    var self = this;
    self.id = id;
    self.email = email;
    self.nick = nick;
}

User.prototype = {
    constructor: User, 
    name: 'User'
}

exports.User = User;
