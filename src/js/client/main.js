"use strict";

window.onload = function() {
    function editor() {
        var editor = new aw.MapEditor();
        var simulator = null;
        aw.js.reg(editor, aw.MapEditor.SIMULATE_CLICKED, function(map) {
            editor.destroy();
            simulator = new aw.Simulator(map);
            simulator.setup();
                aw.js.reg(simulator, aw.Simulator.EDIT_MAP_CLICKED, function(map) {
                simulator.destroy();
                simulator = null;
                editor.setup();
            });
        });
        
        editor.setup();
        
        if (!localStorage.getItem('aw_was_started')) {
            new aw.DialogUi({msg: 'It seems that you have started the game for the first time. Do you want to read help? You can always find the help button in the code editor.', cancel: true, ok: function() {
                aw.utils.helpWin();
            }}).show();
            localStorage.setItem('aw_was_started', true)
        }
    }
    
    var background = new aw.BackgroundUi();
    background.init();
    
    editor();
}


