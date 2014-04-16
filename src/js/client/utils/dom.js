"use strict";

self.aw = self.aw || {};

aw.dom = (function() {
    var content;
    return {
        addNode: function(node, body) {
            (body ? document.body : (content || (content = document.getElementById('content')))).appendChild(node);
        },
        
        addClass: function(node, className) {
            if (!this.hasClass(node, className)) {
                node.className += " " + className;
            }
        },

        removeClass: function(node, className) {
            if (this.hasClass(node, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                node.className = node.className.replace(reg, '');
            }
        },

        replaceClass: function(node, oldClass, newClass) {
            this.removeClass(node, oldClass);
            this.addClass(node, newClass);
        },

        hasClass: function(node, className) {
            return node.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        },

        disable: function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
                this.addClass(arguments[i], "disabled");
            }
        },

        enable: function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
                this.removeClass(arguments[i], "disabled");
            }
        },

        isEnabled: function(node) {
            return !this.hasClass(node, "disabled");
        },

        createNode: function(id, method, className) {
            var ret = document.createElement('div');
            id && (ret.id = id);
            method(ret);
            className && (ret.className = className);
            return ret;
        },

        registerClick: function(node, callback) {
            var dom = this;
            node.addEventListener('click', function(e) {
                if (dom.isEnabled(node)) {
                    callback.call(node, e);
                    dom.addClass(node, "down");
                    setTimeout(function() {
                        dom.removeClass(node, "down");
                    }, 100);
                }
                e.preventDefault();
                return false;
            });
        },

        isVisible: function(node) {
            return node.style.display !== "none";
        },

        show: function() {
            var i = 0, display;
            if (typeof(arguments[0]) === 'string') {
                display = arguments[0];
                i = 1;
            } else {
                display = 'block';
            }
            for (var l = arguments.length; i < l; i++) {
                arguments[i].style.display = display;
            }
        },

        hide: function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
                arguments[i].style.display = 'none';
            }
        }
    }
})();
