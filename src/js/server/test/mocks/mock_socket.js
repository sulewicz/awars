"use strict";

var EventEmitter = require('events').EventEmitter;

function MockSocket(onRecv) {
    var self = this;
    self.onRecv = onRecv;
    self.__sendUTF = function(msg) {
        self.emit('message', {type: 'utf8', utf8Data: msg});
    }
    
    self.__send = function(obj) {
        self.__sendUTF(JSON.stringify(obj));
    }
    
    self.sendUTF = function(data) {
        self.onRecv && self.onRecv(JSON.parse(data));
    }
    
    self.close = function() {
        self.emit('close');
    }
}

MockSocket.prototype = new EventEmitter();

exports.MockSocket = MockSocket;