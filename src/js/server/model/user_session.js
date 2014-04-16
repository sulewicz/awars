"use strict";

function UserSession(socket, user) {
    var self = this;
    self.user = user;
    self.socket = socket;
    self.room = null;
    
    self.onMessage = null;
    self.onClose = null;
    
    socket.on('message', function(message) {
        try {
            if (message.type == 'utf8') {
                self.onMessage && self.onMessage(self, JSON.parse(message.utf8Data));
            } else {
                socket.close();
            }
        } catch (e) {
            console.log(e);
            socket.close();
        }
    });
    
    socket.on('close', function() {
       self.onClose && self.onClose(self); 
    });
}

UserSession.prototype = {
    constructor: UserSession, 
    name: 'UserSession',
    disconnect: function() {
        var self = this;
        self.socket.close();
    },
    
    send: function(data) {
        var self = this;
        self.socket.sendUTF(JSON.stringify(data));
    },
    
    sendUtf: function(utf) {
        var self = this;
        self.socket.sendUTF(utf);
    }
}

exports.UserSession = UserSession;

