"use strict";

var MAX_TYPE_NAME_LENGTH = 64;
var MAX_CHAT_MSG_SIZE = 256;
var MIN_PASSWORD_LENGTH = 3;
var MAX_PASSWORD_LENGTH = 64;
var MIN_NICK_LENGTH = 3;
var MAX_NICK_LENGTH = 64;

var EMAIL_REGEXP = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}\b/i;


function validEmail(data) {
    return data && typeof(data) === 'string' && EMAIL_REGEXP.test(data);
}

function validPassword(data) {
    return data && typeof(data) === 'string' && data.length >= MIN_PASSWORD_LENGTH && data.length <= MAX_PASSWORD_LENGTH;
}

function validNick(data) {
    return data && typeof(data) === 'string' && data.length >= MIN_NICK_LENGTH && data.length <= MAX_NICK_LENGTH;
}

function isInt(x) {
    return typeof x === 'number' && x % 1 === 0;
}

var VALIDATORS = {
    chat: function(data) {
        return typeof(data.msg) === 'string' && data.msg.length <= MAX_CHAT_MSG_SIZE
    },
    
    login: function(data) {
        return validEmail(data.email) && validPassword(data.pass);
    },
    
    register: function(data) {
        return validEmail(data.email) && validPassword(data.pass) && validNick(data.nick);
    },
    
    join_room: function(data) {
        return isInt(data.room_id);
    }
}

function validate(data) {
    if (data && data.type && typeof(data.type) === 'string' && data.type.length < MAX_TYPE_NAME_LENGTH && VALIDATORS.hasOwnProperty(data.type)) {
        return VALIDATORS[data.type](data);
    }
    return false;
}

exports.validate = validate;