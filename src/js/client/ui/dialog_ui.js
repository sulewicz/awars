"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.DialogUi = (function() {
    var DialogUi = function(spec) {
        var self = this;
        self.spec = spec;
        
    }
    
    DialogUi.prototype = {
        __name: 'DialogUi',
        constructor: DialogUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js, spec = self.spec || {};

            self.node = dom.createNode(null, self.generateDialog, 'modal_dialog');
            var children = self.node.children;
            self.overlay = children[0];
            self.box = children[1];
            children = self.box.children;
            self.msg = children[0];
            self.input = children[1];
            self.select = children[2]
            children = children[3].children;
            self.ok = children[0];
            self.cancel = children[1];
            
            function ok(e) {
                typeof(self.spec.ok) === 'function' && self.spec.ok(self.spec.input ? self.input.value : self.spec.select ? self.select.value : null);
                self.destroy();
            }
            dom.registerClick(self.ok, ok);
            
            function cancel(e) {
                typeof(self.spec.cancel) === 'function' && self.spec.cancel();
                self.destroy();
            }
            dom.registerClick(self.cancel, cancel);
            
            if (spec) {
                spec.msg  && (self.msg.innerHTML = spec.msg);
                spec.ok || (self.ok.style.display = 'none');
                spec.cancel || (self.cancel.style.display = 'none');
                if (spec.input) {
                    spec.value && (self.input.value = spec.value);
                    spec.select = null;
                    setTimeout(function() {
                        self.input.focus();
                        self.input.select();
                    }, 0);
                    self.input.onkeydown = function (e) {
                        if (e.which === 13) {
                            ok();
                        } else if (e.which === 27) {
                            cancel();
                        }
                    }
                } else {
                    self.input.style.display = 'none'
                }
                if (spec.select) {
                    var str = '';
                    for (var i = 0, len = spec.select.length; i < len; i++) {
                        str += '<option value="' + ((spec.value) ? spec.value[i] : spec.select[i]) + '">' + spec.select[i] + '</option>';
                    }
                    self.select.innerHTML = str;
                    spec.selectVal && (self.select.value = spec.selectVal);
                    setTimeout(function() {
                        self.select.focus();
                        self.select.select();
                    }, 0);
                } else {
                    self.select.style.display = 'none';
                }
                if (!spec.input && !spec.select) {
                    self.input.style.display = 'none';
                }
            }
            
            dom.addNode(self.node, true);
        },

        destroy: function() {
            var self = this;
            self.node.innerHTML = "";
            self.node.parentNode.removeChild(self.node);
            self.node = null;
            self.overlay = null;
            self.box = null;
            self.msg = null;
            self.input = null;
            self.select = null;
            self.ok = null;
            self.cancel = null;
        },
        
        show: function(msg) {
            var self = this;
            if (!self.node) {
                self.init();
            }
            
            self.overlay.style.display = 'block';
        },
        
        hide: function() {
            var self = this;
            if (self.node) {
                window.removeEventListener('resize', self.updateOverlaySize);
                self.destroy();
            }
        },

        generateDialog: function(n) {
            var str = '<div class="overlay"></div><div class="box"><div class="dialog_msg"></div><input type="text" name="input"></input><select></select><div class="dialog_btns"><a class="button" class="dialog_ok" href="javascript:void(0)">Ok</a><a class="button" class="dialog_cancel" href="javascript:void(0)">Cancel</a></div></div>';
            n.innerHTML = str;
        }
    }
    return DialogUi;
})();
