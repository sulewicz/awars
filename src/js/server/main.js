"use strict";

var server = require('./logic/server.js');
var AuthHandler = require('./logic/auth_handler.js').AuthHandler;
var SessionsHandler = require('./logic/sessions_handler.js').SessionsHandler;

var UserSession = require('./model/user_session.js').UserSession;
var UsersDao = require('./dao/users_dao.js').UsersDao;

process.title = 'awserver';

var sessions_handler = new SessionsHandler();

var auth_handler = new AuthHandler(new UsersDao(), function(socket, user) {
    sessions_handler.addSession(new UserSession(socket, user));
});

exports.main = function() {
    server.start(function(socket) {
        auth_handler.handle(socket);
    });
}
