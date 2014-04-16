"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.MapObjectUi = (function() {
    var TEAM_COLOR = ["#FF0000", "#00FF00", "#9c40b0", "#FFFF00"];
    var MapObjectUi = function(obj) {
        var self = this;
        self.obj = obj;
        obj._ui = self;
    }
    
    MapObjectUi.prototype = {
        __name: 'MapObjectUi',
        constructor: MapObjectUi,
        
        init: function(node) {
            var self = this, dom = aw.dom, utils = aw.utils;
            if (node) {
                self.node = node;
            } else {
                node = document.createElement('div');
                node.innerHTML = self.generateUi();
                dom.addClass(node, 'cl_object');
                dom.addClass(node, 'cl_' + self.obj.__name.toLowerCase());
                self.node = node;
            }
        },
        
        destroy: function() {
            var self = this;
            if (self.node) {
                self.node.innerHTML = "";
                self.node.parentNode.removeChild(self.node);
            }
            delete self.node;
        },

        generateUi: function() {
            var self = this, object = self.obj, str = '';
            if (object.constructor == aw.Constructor) {
                str += '<span></span>';
            }
            return str;
        },
        
        repaint: function(ignorePos) {
            var self = this, dom = aw.dom, object = self.obj, node = self.node, xToLeft = aw.utils.xToLeft, yToTop = aw.utils.yToTop;
            if (!ignorePos) {
                node.style.left = xToLeft(node, self.obj.x);
                node.style.top = yToTop(node, self.obj.y);
            }
            if (object.constructor == aw.Machine) {
                node.style.backgroundPosition = (-aw.utils.TILE_SIZE * object.team.team_no) + 'px';
                node.style.webkitTransform = 'rotate(' + (object.dir * 90) + 'deg)';
            } else if (object.constructor == aw.Constructor) {
                node.children[0].style.backgroundColor = TEAM_COLOR[object.team_no];
            } else if (object.constructor == aw.Junk) {
                node.innerHTML = '<span>' + object.value + '</span>';
            }
        },
        
        copy: function() {
            return new MapObjectUi(this.obj.copy());
        }
    }
    return MapObjectUi;
})();
