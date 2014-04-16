"use strict";

self.aw = self.aw || {};

aw.Animation = (function() {
    var snapshot = function(node, props) {
        var self = this, key, ret = {};
        for (key in props) {
            if (props.hasOwnProperty(key)) {
                ret[key] = node.style[key];
            }
        }
        return ret;
    }
    
    var Animation = function(node, tmpl) {
        var self = this;
        self.node = node;
        self.pipe = (tmpl) ? tmpl : [];
        self.idx = 0;
        self.current = null;
        self.tick = aw.js.bind(self.fire, self);
    }
    
    Animation.prototype = {
        __name: 'Animation',
        constructor: Animation,
        animate: function(spec) {
            var self = this, obj = {
                type: 'animate'
            };
            if (spec.indexOf(' ') == -1) {
                obj.className = spec;
            } else {
                obj.props = {
                    'webkitAnimation': spec
                }
                obj.reset = true;
            }
            self.pipe.push(obj);
            return self;
        },
        
        attr: function(spec, timeout, reset) {
            var self = this, obj = {
                type: 'attr',
                timeout: timeout,
                reset: reset
            };
            if (typeof(spec) == 'string') {
                obj.className = spec;
            } else if (typeof(spec) == 'object') {
                obj.props = spec;
            }
            self.pipe.push(obj);
            return self;
        },
        
        transit: function(spec, transition, reset) {
            var self = this, obj = {
                type: 'transit',
                transition: transition,
                reset: reset
            };
            if (typeof(spec) == 'string') {
                obj.className = spec;
            } else if (typeof(spec) == 'object') {
                obj.props = spec;
                obj.props.webkitTransition = transition;
            }
            self.pipe.push(obj);
            return self;
        },
        
        fire: function(callback) {
            var self = this, dom = aw.dom, current = self.current, pipe = self.pipe, key, i, l, proxyCallback, callbackCount, val;
            if (callback) { 
                self.callback = callback;
            }
            if (current) {
                if (current.destroy) {
                    self.node.innerHTML = "";
                    self.node.parentNode.removeChild(self.node);
                } else {
                    if (current.className) {
                        dom.removeClass(self.node, current.className);
                    } else if (current.snapshot) {
                        for (key in current.snapshot) {
                            if (current.snapshot.hasOwnProperty(key)) {
                                self.node.style[key] = current.snapshot[key];
                            }
                        }
                    }
                }
                
                current = null;
            }
            if (self.idx < pipe.length) {
                current = pipe[self.idx];
                self.idx++;
                if (current.reset && current.props) {
                    current.snapshot = snapshot(current.props);
                }
                switch (current.type) {
                    case 'attr':
                        if (current.className) {
                            dom.addClass(self.node, current.className);
                        } else if (current.props) {
                            for (key in current.props) {
                                if (current.props.hasOwnProperty(key)) {
                                    val = current.props[key];
                                    self.node.style[key] = (typeof(val) === 'number') ? self.args[val] : val;
                                }
                            }
                        }
                        setTimeout(self.tick, current.timeout);
                    break;
                    case 'transit':
                        if (current.className) {
                            dom.addClass(self.node, current.className);
                        } else if (current.props) {
                            for (key in current.props) {
                                if (current.props.hasOwnProperty(key)) {
                                    val = current.props[key];
                                    self.node.style[key] = (typeof(val) === 'number') ? self.args[val] : val;
                                }
                            }
                        }
                        self.node.addEventListener('webkitTransitionEnd', function transitionEnd(e) {
                            e.stopPropagation()
                            self.node.style.webkitTransition = "";
                            self.node.removeEventListener('webkitTransitionEnd', transitionEnd);
                            setTimeout(self.tick, 0);
                        });
                    break;
                    case 'animate':
                        if (current.className) {
                            dom.addClass(self.node, current.className);
                        } else if (current.props) {
                            self.node.style.webkitAnimation = current.props.webkitAnimation;
                        }
                        self.node.addEventListener('webkitAnimationEnd', function animationEnd(e) {
                            e.stopPropagation()
                            self.node.style.webkitAnimation = "";
                            self.node.removeEventListener('webkitAnimationEnd', animationEnd);
                            setTimeout(self.tick, 0);
                        });
                    break;
                }
            } else {
                // resetting
                self.idx = 0;
                current = null;
                self.callback && self.callback();
            }
            self.current = current;
        },
        
        toTemplate: function() {
            var self = this, tmpl = [], pipe = self.pipe, i, l = pipe.length, c, js = aw.js;
            for (i = 0; i < l; i++) {
                c = js.clone(pipe[i]);
                tmpl.push(c);
            }
            return tmpl;
        },
        
        destroy: function() {
            var self = this;
            if (self.pipe.length == 0) {
                self.attr(null, 0);
            }
            self.pipe[self.pipe.length - 1].destroy = true;
            return self;
        },
        
        cancel: function() {
            var self = this;
            self.idx = self.pipe.length;
        }
    }
    
    Animation.fromTemplate = function(tmpl, node, args) {
        var a = new Animation(node, tmpl);
        a.args = args;
        return a;
    }
    
    Animation.fire = function(array, callback, parallel) {
        var i = 0, l = array.length, current, parallel = !!parallel;
        var _fire = function() {
            if (parallel) {
                var callbackCount = 0;
                var proxyCallback = function() {
                    callbackCount++;
                    if (callbackCount == l) {
                        callback && callback();
                    }
                }
                for (i = 0; i < l; i++) {
                    current = array[i];
                    if (current.concat) {
                        Animation.fire(current, proxyCallback, false);
                    } else {
                        current.fire(proxyCallback);
                    }
                }
            } else {
                if (i === l) {
                    callback && callback();
                } else {
                    current = array[i++];
                    if (current.concat) {
                        Animation.fire(current, _fire, true);
                    } else {
                        current.fire(_fire);
                    }
                }
            }
        };
        _fire();
    }
    
    return Animation;
})();
