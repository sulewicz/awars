"use strict";

self.aw = self.aw || {};

aw.CodeEditorUi = (function() {
    var fs = require('fs');

    var POPUP = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
        + '<html xmlns="http://www.w3.org/1999/xhtml" lang="en"> '
        + '<head> '
        + '  <title>Code Editor</title> '
        + '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> '
        + '  <link href="css/main.css" media="screen" rel="stylesheet" type="text/css" />'
        + '  <link href="css/codemirror.css" media="screen" rel="stylesheet" type="text/css" />'
        + '</head> '
        + '<body style="padding: 0; margin: 0; text-align: center;">'
        + '</body>'
        + '</html>';
    
    var SAMPLE_CODE = 'function() {\n'
        + '  if (this.view.front.indexOf(ENEMY_MACHINE) != -1 ||\n'
        + '      this.view.front.indexOf(ENEMY_CONSTRUCTOR) != -1) {\n'
        + '    fire();\n'
        + '    fire();\n'
        + '  } else if (this.view.front[0] !== FLOOR && this.view.front[0] !== JUNK) {\n'
        + '    turn(RIGHT);\n'
        + '  }\n'
        + '  move(FRONT);\n'
        + '}\n';
        
    var CODE_CHANGED_EVENT = "code_changed_event";
    
    var CodeEditorUi = function() {
        var self = this;
        self.ignoreChange = false;
        self.detached = false;
        self.minimized = false;
        self.current_code = 0;
        self.code_names = null;
        self.code_cache = [SAMPLE_CODE, SAMPLE_CODE, SAMPLE_CODE, SAMPLE_CODE];
        self.code_error_cache = [null, null, null, null];
        self.current_error_widget = null;
        self.selection_cache = ['', '', '', ''];
        self.history_cache = [null, null, null, null];
        self.globals = ["test"];
    }
    
    CodeEditorUi.prototype = {
        __name: 'CodeEditorUi',
        constructor: CodeEditorUi,

        init: function() {
            var self = this, dom = aw.dom, utils = aw.utils, children, js = aw.js;

            self.simulator_code_node = dom.createNode('simulator_code_node', self.generateSimulatorCodeEditor, 'box');
            children = self.simulator_code_node.children;
            self.code_header = children[0];
            self.code_editor_node = children[1];
            self.code_footer = children[2];
            
            children = self.code_header.children;
            self.code_detach_btn = children[0];
            self.code_help_btn = children[1];
            self.code_minimize_btn = children[2];
            self.code_header_icon = children[3];
            
            children = self.code_footer.children;
            self.code_resize_node = children[0];
            self.code_select_node = children[1];
            self.code_save_node = children[2];
            self.code_delete_node = children[3];
            
            dom.addNode(self.simulator_code_node);
            self.code_error_node = document.createElement('div');;
            self.code_error_node.className = 'cl_code_error';
            self.code_mirror_editor = CodeMirror(self.code_editor_node, { 
                    value: SAMPLE_CODE, 
                    lineNumbers: true, 
                    autofocus: true,
                    viewportMargin: Infinity,
                    mode: 'javascript'
                });

            fs.readFile('js/client/ui/ecma5.json', 'utf8', function (err, data) {
                var server = new CodeMirror.TernServer({defs: [JSON.parse(data)]});
                self.code_mirror_editor.setOption("extraKeys", {
                  "Ctrl-Space": function(cm) { server.complete(cm); },
                  "Ctrl-I": function(cm) { server.showType(cm); },
                  "Alt-.": function(cm) { server.jumpToDef(cm); },
                  "Alt-,": function(cm) { server.jumpBack(cm); },
                  "Ctrl-Q": function(cm) { server.rename(cm); },
                  "Ctrl-.": function(cm) { server.selectName(cm); }
                })
                self.code_mirror_editor.on("cursorActivity", function(cm) { server.updateArgHints(cm); }); 
            });
            self.code_mirror_scroll = self.code_editor_node.getElementsByClassName("CodeMirror-scroll")[0];
            
            self.code_mirror_editor.on("change", function() {
                if (self.ignoreChange) {
                    self.ignoreChange = false;
                } else {
                    js.emit(self, CODE_CHANGED_EVENT);
                }
            });
            
            self.minimize();
            dom.registerClick(self.code_minimize_btn, function(e) {
                self.minimize();
            });
            
            dom.registerClick(self.code_help_btn, function(e) {
                self.help();
            });
            
            dom.registerClick(self.code_detach_btn, function(e) {
                self.detach();
            });

            self.code_header.addEventListener('mousedown', function(e) {
                function move(e) {
                    var x = (pos[2] + e.pageX - pos[0]), y = (pos[3] + e.pageY - pos[1]);
                    self.simulator_code_node.style.left = x + 'px';
                    self.simulator_code_node.style.top = y + 'px';
                }
                function up(e) {
                    window.removeEventListener('mousemove', move);
                    window.removeEventListener('mouseup', up);
                }
                if (self.minimized) {
                    self.restore();
                } else if (!self.detached) {
                    var pos = [ e.pageX, e.pageY, self.simulator_code_node.offsetLeft, self.simulator_code_node.offsetTop ];
                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                }
            });
            
            self.code_resize_node.addEventListener('mousedown', function(e) {
                function move(e) {
                    var x = (pos[2] + e.pageX - pos[0]), y = (pos[3] + e.pageY - pos[1]);
                    if (x >= 400) {
                        self.code_editor_node.style.width = x + 'px';
                        self.code_mirror_scroll.style.width = x + 'px';
                    }
                    if (y >= 200) {
                        self.code_editor_node.style.height = y + 'px';
                        self.code_mirror_scroll.style.height = y + 'px';
                    }
                }
                function up(e) {
                    window.removeEventListener('mousemove', move);
                    window.removeEventListener('mouseup', up);
                    self.code_mirror_editor.focus();
                }
                var pos = [ e.pageX, e.pageY, self.code_editor_node.clientWidth, self.code_editor_node.clientHeight ];
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
            });
            
            window.onunload = function() {
                if (self.win) {
                    self.win.close();
                }
                if (self.help_win) {
                    self.help_win.close();
                }
            }
        },

        destroy: function() {
            var self = this;
            self.simulator_code_node.innerHTML = "";
            self.simulator_code_node.parentNode.removeChild(self.simulator_code_node);
            self.simulator_code_node = null;
            self.code_header = null;
            self.code_detach_btn = null;
            self.code_help_btn = null;
            self.code_minimize_btn = null;
            self.code_header_icon = null;
            self.code_editor_node = null;
            self.code_footer = null;
            self.code_select_node = null;
            self.code_save_node = null;
            self.code_delete_node = null;
            self.code_resize_node = null;
            self.code_mirror_editor.off("change");
            self.code_mirror_editor = null;
            self.code_error_node = null;
            self.code_mirror_scroll = null;
        },

        generateSimulatorCodeEditor: function(n) {
            // Code editor
            var str = '<div class="simulator_code_header"><a href="javascript:void(0)" class="button simulator_code_detach"></a><a href="javascript:void(0)" class="button simulator_code_help"></a><a href="javascript:void(0)" class="button simulator_code_minimize"></a>Team <span class="simulator_code_header_icon"></span></div>'
                + '<div class="simulator_code"></div>'
                + '<div class="simulator_code_toolkit">'
                + '<span class="simulator_code_resize"></span>'
                + '<select class="simulator_code_selector"></select>'
                + '<a class="button" class="simulator_code_save" href="javascript:void(0)">Save</a>'
                + '<a class="button" class="simulator_code_delete" href="javascript:void(0)">Delete</a>'
                + '</div>';

            n.innerHTML = str;
        },

        repaintCodeList: function(sel) {
            var self = this, node = self.code_select_node, i, len, str = '', code_names = self.code_names;
            var nodeValue = (sel !== undefined) ? sel : node.value;
            str += '<option value="">Select code...</option>';
            for (i = 0, len = code_names.length; i < len; i++) {
                str += '<option value="' + code_names[i] + '">' + code_names[i] + '</option>';
            }
            node.innerHTML = str;
            node.value = nodeValue;
        },
        
        help: function() {
            var self = this, win = aw.utils.helpWin();
            self.help_win = win;
        },

        switchTo: function(i) {
            var self = this;
            if (i !== self.current_code) {                
                self.ignoreChange = true;
                self.code_cache[self.current_code] = self.code_mirror_editor.getValue();
                self.history_cache[self.current_code] = self.code_mirror_editor.doc.getHistory();
                self.selection_cache[self.current_code] = self.code_select_node.value;
                self.current_code = i;
                self.code_mirror_editor.setValue(self.code_cache[self.current_code])
                if (self.history_cache[self.current_code]) {
                    self.code_mirror_editor.doc.setHistory(self.history_cache[self.current_code]);
                }

                self.code_select_node.value = self.selection_cache[self.current_code];
                self.code_header_icon.style.backgroundPosition = (-aw.utils.TILE_SIZE * self.current_code) + "px";
                self.repaintError();
            }
            if (self.minimized) {
                self.restore();
            }
            
            self.code_mirror_editor.focus();
        },
        
        error: function(team_no, error) {
            var self = this, curErr = self.code_error_cache[team_no];
            if ((!curErr && error) || (curErr.msg !== error.msg || curErr.line !== error.line)) {
                self.code_error_cache[team_no] = error;
                self.repaintError();
            }
        },
        
        repaintError: function() {
            var self = this, error = self.code_error_cache[self.current_code];
            if (self.current_error_widget) {
                self.code_error_node.style.display = 'none';
                self.code_mirror_editor.removeLineWidget(self.current_error_widget);
                self.current_error_widget = null;
            }
            if (error) {
                self.code_error_node.innerHTML = error.msg;
                self.current_error_widget = self.code_mirror_editor.addLineWidget((error.line - 1) || 0, self.code_error_node, { above: (error.line === undefined) });
                self.code_error_node.style.display = 'block';
            }
        },
        
        clearErrors: function() {
            var self = this;
            self.code_error_cache = [null, null, null, null];
            self.repaintError();
        },
        
        getCodes: function() {
            var self = this;
            self.code_cache[self.current_code] = self.code_mirror_editor.getValue();
            self.clearErrors();
            return self.code_cache;
        },

        minimize: function() {
            var self = this, dom = aw.dom;
            self.minimized = true;
            dom.addClass(self.simulator_code_node, "minimized");
        },

        restore: function() {
            var self = this, dom = aw.dom;
            self.minimized = false;
            dom.removeClass(self.simulator_code_node, "minimized");
            self.code_mirror_editor.focus();
        },

        detach: function() {
            var self = this, dom = aw.dom, win = window.open('', '', 'width=' + (self.simulator_code_node.clientWidth + 20) + ',height=' + (self.simulator_code_node.clientHeight + 20) + ',toolbar=no,menubar=no,location=no,personalbar=no,scrollbars=no,directories=no,status=no');
            win.document.write(POPUP);
            win.document.close();
            self.simulator_code_node.parentNode.removeChild(self.simulator_code_node);
            win.dom.addNode(self.simulator_code_node);
            dom.addClass(self.simulator_code_node, 'detached');
            win.onunload = function() {
                self.attach();
            }
            
            self.win = win;
            self.detached = true;
            self.code_mirror_editor.focus();
        },

        attach: function() {
            var self = this, dom = aw.dom;
            self.simulator_code_node.parentNode.removeChild(self.simulator_code_node);
            dom.addNode(self.simulator_code_node);
            dom.removeClass(self.simulator_code_node, 'detached');
            self.win.close();
            window.onunload = undefined;
            self.win = null;
            self.detached = false;
            self.code_mirror_editor.focus();
        }
    }
    CodeEditorUi.CODE_CHANGED_EVENT = CODE_CHANGED_EVENT;
    return CodeEditorUi;
})();
