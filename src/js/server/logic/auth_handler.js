"use strict";

var validate = require('../utils/validator.js').validate;
var MAX_PACKET_SIZE = 256;

function AuthHandler(dao, onAuth) {
    var self = this;
    self.onAuth = onAuth;
    self.count = 0;
    self.dao = dao;
}

AuthHandler.prototype = {
    constructor: AuthHandler, 
    name: 'AuthHandler',
    handle: function(socket) {
        var self = this;
        self.count++;
        
        var timeoutId = setTimeout(function() {
            timeoutId = null;
            socket.close();
        }, 20000);
        socket.on('message', function(message) {
            var disconnect = true;
            if (message.type == 'utf8' && message.utf8Data.length <= MAX_PACKET_SIZE) {
                var msgObj = null;
                try {
                    msgObj = JSON.parse(message.utf8Data);
                } catch (e) {
                }
                if (msgObj && msgObj.type === 'login') {
                    var user;
                    if (validate(msgObj) && (user = self.dao.get(msgObj.email, msgObj.pass))) {
                        socket.removeAllListeners('message');
                        socket.removeAllListeners('close');
                        self.onAuth(socket, user);
                        disconnect = false;
                    } else {
                        socket.sendUTF(JSON.stringify({ type: 'error', desc: 'Invalid credentials!' }));
                    }

                } else if (msgObj && msgObj.type === 'register') {
                    if (validate(msgObj) && self.dao.register(msgObj.email, msgObj.pass, msgObj.nick)) {
                        socket.sendUTF(JSON.stringify(msgObj));
                    } else {
                        socket.sendUTF(JSON.stringify({
                            type : 'error',
                            desc : 'Account already exists for e-mail: ' + msgObj.email
                        }));
                    }
                }
            }
            clearTimeout(timeoutId);
            if (disconnect) {
                socket.close();
            } else {
                self.count--;
            }
        });
        socket.on('close', function(code, description) {
            self.count--;
            if (timeoutId != null) {
                clearTimeout(timeoutId);
            }
        });
    }
}

exports.AuthHandler = AuthHandler;
