"use strict";

var assert = require("assert");

var MockSocket = require('./mocks/mock_socket.js').MockSocket;
var MockUsersDao = require('./mocks/mock_users_dao.js').MockUsersDao;

var AuthHandler = require('../logic/auth_handler.js').AuthHandler;

describe('AuthHandler', function() {
    var dao = new MockUsersDao();
    var auth = new AuthHandler(dao)
    describe('#handle()', function() {
        it('should authenticate user when proper creds are passed', function(done) {
            var socket = new MockSocket();
            auth.onAuth = function() { done(); }
            auth.handle(socket);
            assert.equal(1, auth.count);
            socket.__send({type: 'login', email: 'vlc@aw.pl', pass: 'vlc'});
            assert.equal(0, auth.count);
        })
        it('should disconnect user when improper creds are passed', function(done) {
            var socket = new MockSocket(function(data) {
                assert.equal('error', data.type);
                done();
            });
            
            auth.onAuth = function() {}
            auth.handle(socket);
            assert.equal(1, auth.count);
            socket.__send({type: 'login', email: 'vlc@aw.pl', pass: 'badpass'});
        })
    })
})