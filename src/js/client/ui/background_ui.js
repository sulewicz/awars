"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.BackgroundUi = (function() {
    var TIMEOUT = 50, CHAR_WIDTH = 8, LINE_HEIGHT = 16, CENTER_WIDTH = 846, CENTER_COL_WIDTH = parseInt(CENTER_WIDTH / CHAR_WIDTH);
    var S = [], SPACES;
    
    for (var i = CENTER_COL_WIDTH; i >= 0; i--) {
        S.push(' ');
    }
    SPACES = S.join('');
    
    var BackgroundUi = function() {
        var self = this;
    }
    
    BackgroundUi.prototype = {
        __name: 'BackgroundUi',
        constructor: BackgroundUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, js = aw.js;

            var bkg = document.getElementById('background');
            var pre = bkg.children[0];
            var bkg_line = document.getElementById('background_line');
            
            var w = (window.innerWidth || document.body.clientWidth);
            var h = (window.innerHeight || document.body.clientHeight) - LINE_HEIGHT;
            
            var text = pre.innerHTML.split('\n');
            var lengths = js.map(text, function(e, i) {
                return e.length;
            });
            
            var currentLine = 0;
            var currentLinePx;
            var currentCol = 0;
            var currentColPx = 0;
            var lineLen = 0;
            var LINES_LEN = lengths.length;
            
            var leftColMargin = 0;
            
            self.handler = function() {
                w = (window.innerWidth || document.body.clientWidth);
                h = (window.innerHeight || document.body.clientHeight) - LINE_HEIGHT;
                currentLine = LINES_LEN;
                leftColMargin = parseInt((w - CENTER_WIDTH) / (2 * CHAR_WIDTH));

                pre.innerHTML = js.map(text, function (e) {
                    if (e.length > leftColMargin) {
                        return e.substr(0, leftColMargin) + SPACES + e.substr(leftColMargin);
                    }
                    return e;
                }).join('\n');
            };
            
            window.addEventListener('resize', self.handler);
            
            self.tick = function() {
                if (currentLine >= LINES_LEN || currentCol >= lineLen) {
                    currentLinePx -= 16;
                    if (currentLine >= LINES_LEN) {
                        currentLinePx = h;
                        currentLine = 0;
                    } else {
                        currentLine++;
                    }
                    lineLen = lengths[currentLine] || 0;
                    currentCol = 0;
                    currentColPx = 0;
                    bkg_line.style.left = '0px';
                    pre.style.marginTop = currentLinePx + 'px';
                } else {
                    currentCol++;
                    if (currentCol === leftColMargin) {
                        currentColPx += CENTER_WIDTH;
                    }
                    currentColPx += CHAR_WIDTH;
                    bkg_line.style.left = currentColPx + 'px';
                }
                self.timer = setTimeout(self.tick, TIMEOUT);
            }
            
            self.handler();
            self.tick();
        },

        destroy: function() {
            var self = this;
            clearTimeout(self.timer);
            window.removeEventListener('resize', self.handler);
            self.timer = null;
            self.handler = null;
            self.tick = null;
        }
    }
    return BackgroundUi;
})();
