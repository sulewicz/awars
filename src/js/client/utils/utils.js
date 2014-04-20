"use strict";

self.aw = self.aw || {};

aw.utils = (function() {
    var id_map = {};
    var _id = function(o) {
        var n = o.__name;
        if (!id_map[n]) {
            id_map[n] = 1;
        }
        var ret = n + id_map[n];
        id_map[n] = id_map[n] + 1;
        return ret;
    }
    
    var TILE_OFFSET = 3;
    var TILE_SIZE = 24;
    var xToLeft = function(node, x, offset) {
        return TILE_OFFSET + (~~x) * (TILE_SIZE + 1) + (offset ? offset : 0) + 'px';
    }
    
    var yToTop = function(node, y, offset) {
        return TILE_OFFSET + (~~y) * (TILE_SIZE + 1) + (offset ? offset : 0) + 'px';
    }
    
    var vectors = [0, 1, 0, -1];
    function getDirVector(dir) {
        return [vectors[dir], vectors[(dir + 3) % 4]];
    }
    
    function helpWin() {
        return window.open('./help.html', '', 'width=450,height=400,toolbar=no,menubar=no,location=no,personalbar=no,scrollbars=no,directories=no,status=no');
    }
    
    return {
        helpWin: helpWin,
        id: _id,
        getDirVector: getDirVector,
        xToLeft: xToLeft,
        yToTop: yToTop,
        TILE_SIZE: TILE_SIZE
    }
})();
