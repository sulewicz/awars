"use strict";

var User = require('../../model/user.js').User;

var lastId = 0;
var DATA = {
    'vlc@aw.pl': {
        id: '' + (lastId++),
        password: 'vlc',
        nick: 'vlc'
    },
    'isia@aw.pl': {
        id: '' + (lastId++),
        password: 'isia',
        nick: 'isia'
    }
}

function MockUsersDao() {
    var self = this;
}

MockUsersDao.prototype = {
    constructor: MockUsersDao,
    name: 'MockUsersDao',

    get: function(email, password) {
        if (DATA.hasOwnProperty(email) && DATA[email].password === password) {
            var userData = DATA[email];
            return new User(userData.id, email, userData.nick);
        }
        return null;
    },

    register: function(email, password, nick) {
        if (!DATA.hasOwnProperty(email)) {
            DATA[email] = {
                id: '' + (lastId++),
                password: password,
                nick: nick
            };
            console.log('User ' + email + ' registered.');
            return true;
        }
        return false;
    }
}

exports.MockUsersDao = MockUsersDao;
