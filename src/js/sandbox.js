"use strict";

self.aw = self.aw || {};

aw.Sandbox = (function() {
    var ERROR_OFFSET = 22;
    var TIMEOUT = 2000;

    function clearObject(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        }
    }

    function mixin(dst) {
        if (arguments.length === 1) {
            return dst;
        }
        var obj = dst;
        for (var i = arguments.length - 1; i >= 1; --i) {
            for (var o in arguments[i]) {
                if (arguments[i].hasOwnProperty(o)) {
                    obj[o] = arguments[i][o];
                }
            }
        }
        return obj;
    }

    var Sandbox = function(sandbox) {
        var self = this;

        function init(code) {
            self.code = code;
        }
        self.init = init;

        function compile(code) {
            return (function(code) {
                try {
                    return eval(code);
                } catch (e) {
                    return (function() { var global = {}; return { main: function() { global.__ops.push('error', { msg: e.message }); }, global: global}; })()
                }
            })(code);
        }

        function recv(e) {
            if (self.timer) {
                clearTimeout(self.timer);
                self.timer = null;
            }
            if (self.callback) {
                self.callback(JSON.parse(e.data));
                self.callback = null;
            }
        }

        function recvSandbox(e) {
            var msg = JSON.parse(e.data);
            if (msg.code) {
                self.logic = compile(msg.code);
            }
            if (msg.invoke) {
                postMessage(JSON.stringify(invokeSandbox(msg.invoke)));
            }
        }

        function send(msg) {
            self.worker.postMessage(msg);
        }

        function invoke(ctx, callback) {
            self.callback = callback;
            var msg = { invoke: ctx };
            if (self.code) {
                msg.code = self.code;
                self.code = null;
            }
            self.timer = setTimeout(function() {
                self.worker.terminate();
                self.timer = null;
                if (self.callback) {
                    self.callback(null);
                    self.callback = null;
                }
            }, TIMEOUT);
            send(JSON.stringify(msg));
        }
        self.invoke = invoke;

        function invokeSandbox(ctx) {
            self.logic.global.__ops = [];
            clearObject(self.logic.robot);
            mixin(self.logic.robot, ctx);
            try {
                self.logic.main.call(self.logic.global, ctx);
            } catch (e) {
                self.logic.global.__ops = ['error', { msg: e.message, line: (0 | e.stack.match(/<anonymous>:([0-9]+):[0-9]+/)[1]) - ERROR_OFFSET }];
            }
            return self.logic.global.__ops;
        }

        self.sandbox = !!sandbox;
        self.recv = self.sandbox ? recvSandbox : recv;

        if (self.sandbox) {
        } else {
            self.worker = new Worker('./js/sandbox.js');
            self.worker.onmessage = self.recv;
        }
    }

    Sandbox.prototype = {
        __name: 'Sandbox',
        constructor: Sandbox,

        destroy: function() {
            var self = this;
            if (self.worker) {
                self.worker.terminate();
                self.worker = null;
            }
        }
    }

    Sandbox.winCache = [];
    Sandbox.cache = [];
    return Sandbox;
})();

(function() {
    var inSandbox = !self.window, Sandbox = aw.Sandbox;
    if (inSandbox) {
        var sandbox = new Sandbox(true);
        onmessage = function(e) {
            sandbox.recv(e);
        };
    }

})();
