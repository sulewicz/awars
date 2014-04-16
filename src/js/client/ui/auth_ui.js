"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.AuthUi = (function() {
    var REGISTER_EVENT = "register_event";
    var LOGIN_EVENT = "login_event";
    
    var AuthUi = function() {
        var self = this;
        self.register_mode = false;
    }
    
    AuthUi.prototype = {
        __name: 'AuthUi',
        constructor: AuthUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;

            self.node = dom.createNode('auth', self.generateUi, 'box');
            var children = self.node.children;
            self.login = children[4].children[0];
            self.register = children[4].children[1];
            self.show_register = children[5].children[0];
            self.show_login = children[6].children[0];
            
            self.email = children[0].children[1];
            self.nick = children[1].children[1];
            self.pass = children[2].children[1];
            self.error = children[3];
            
            function onRegister() {
                js.emit(self, REGISTER_EVENT, self.email.value, self.nick.value, self.pass.value);
            }
            
            function onLogin() {
                js.emit(self, LOGIN_EVENT, self.email.value, self.pass.value);
            }
            
            dom.registerClick(self.register, onRegister);
            dom.registerClick(self.show_register, function() {
                dom.addClass(self.node, "register");
                self.register_mode = true;
            });
            dom.registerClick(self.login, onLogin);
            dom.registerClick(self.show_login, function() {
                dom.removeClass(self.node, "register");
                self.register_mode = false;
            });
            
            self.email.addEventListener('keyup', function (e) {
                if (e.keyCode == 13) {
                    if (self.register_mode) {
                        self.nick.focus();
                    } else {
                        self.pass.focus();
                    }
                }
            });
            
            self.nick.addEventListener('keyup', function (e) {
                if (e.keyCode == 13) {
                    self.pass.focus();
                }
            });
            
            self.pass.addEventListener('keyup', function (e) {
                if (e.keyCode == 13) {
                    if (self.register_mode) {
                        onRegister();
                    } else {
                        onLogin();
                    }
                }
            })
            
            dom.addNode(self.node);
        },

        destroy: function() {
            var self = this;
            self.node.innerHTML = "";
            self.node.parentNode.removeChild(self.node);
            self.login = null;
            self.register = null;
            self.show_register = null;
            self.show_login = null;
            
            self.email = null;
            self.nick = null;
            self.pass = null;
            self.error = null;
        },
        
        showError: function(desc) {
            var self = this;
            self.error.innerText = desc;
            self.error.style.display = 'block';
        },

        generateUi: function(n) {
            var str = '<div class="row"><span>E-mail:</span><input type="text" name="input" id="auth_email"></input></div>'
                + '<div class="row" id="auth_nickname_row"><span>Nickname:</span><input type="text" name="input" id="auth_nick"></input></div>'
                + '<div class="row"><span>Password:</span><input type="password" name="input" id="auth_password"></input></div>'
                + '<div class="row" id="auth_error_row"></div>'
                + '<div class="row"><a class="button" id="auth_login" href="javascript:void(0)">Login</a><a class="button" id="auth_register" href="javascript:void(0)">Register</a></div>'
                + '<div class="row" id="auth_show_register_row"><a class="auth_subscript" id="auth_register" href="javascript:void(0)">You don\'t have an account? Click here to register!</a></div>'
                + '<div class="row" id="auth_show_login_row"><a class="auth_subscript" id="auth_back" href="javascript:void(0)">Return to login screen.</a></div>';
            n.innerHTML = str;
        }
    }
    AuthUi.REGISTER_EVENT = REGISTER_EVENT;
    AuthUi.LOGIN_EVENT = LOGIN_EVENT;
    return AuthUi;
})();
