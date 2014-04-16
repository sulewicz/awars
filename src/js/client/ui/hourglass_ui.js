"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.HourglassUi = (function() {
    var HourglassUi = function() {
        var self = this;
        self.shown = false;
    }
    
    HourglassUi.prototype = {
        __name: 'HourglassUi',
        constructor: HourglassUi,
        
        init: function() {
            var self = this, dom = aw.dom;
            self.node = document.createElement('div');
            self.node.className = 'cl_hourglass';
            self.node.innerHTML = '<div class="spinner"><div class="mask"><div class="maskedCircle"></div></div></div>';
            dom.addNode(self.node);
        },
        
        destroy: function() {
            var self = this;
            self.node.parentNode.removeChild(self.node);
            self.node = null;
        },
        
        show: function() {
            var self = this;
            self.node.style.display = 'block';
        },
        
        hide: function() {
            var self = this;
            self.node.style.display = 'none';
        }
    }
    
    return HourglassUi;
})();

