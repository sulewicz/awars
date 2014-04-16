(function() {
    var scripts = [
        'common/utils/constants.js',
        'common/utils/js.js',
        'client/controller/map_editor/map_editor.js',
        'client/controller/multiplayer/connector.js',
        'client/controller/multiplayer/multiplayer.js',
        'client/controller/simulator/context_factory.js',
        'client/controller/simulator/game.js',
        'client/controller/simulator/simulator.js',
        'client/controller/simulator/vm.js',
        'client/model/constructor.js',
        'client/model/junk.js',
        'client/model/machine.js',
        'client/model/map.js',
        'client/model/team.js',
        'client/model/world.js',
        'client/ui/animation.js',
        'client/ui/animations_factory.js',
        'client/ui/auth_ui.js',
        'client/ui/background_ui.js',
        'client/ui/chat_ui.js',
        'client/ui/code_editor_ui.js',
        'client/ui/console_ui.js',
        'client/ui/dialog_ui.js',
        'client/ui/hourglass_ui.js',
        'client/ui/map_editor_toolkit_ui.js',
        'client/ui/map_object_ui.js',
        'client/ui/map_ui.js',
        'client/ui/map_viewport_ui.js',
        'client/ui/object_details_ui.js',
        'client/ui/rooms_list_ui.js',
        'client/ui/simulator_control_ui.js',
        'client/ui/teams_tab_ui.js',
        'client/ui/users_list_ui.js',
        'client/utils/codemirror.js',
        'client/utils/dom.js',
        'client/utils/utils.js',
        'client/main.js',
        'sandbox.js'
        ];
    var i, l, s, x;
    for (i = 0, l = scripts.length; i < l; i++) {
        s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'js/' + scripts[i];
        x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    }
})();