"use strict";

self.aw = self.aw || {};

aw.AnimationsFactory = (function() {
    var xToLeft, yToTop;
    var AnimationsFactory = function(node, tmpl) {
        xToLeft = aw.utils.xToLeft;
        yToTop = aw.utils.yToTop;
        var self = this;
        
        // Creating templates
        self.move_tmpl = new aw.Animation().attr({ left: 0, top: 1 }, 0)
            .transit({ left: 2, top: 3 }, 'all 0.05s ease-in').toTemplate();
        self.turn_tmpl = new aw.Animation().attr({ webkitTransform: 0 }, 0)
            .transit({ webkitTransform: 1 }, 'all 0.05s ease-in').toTemplate();
        self.shot_tmpl = new aw.Animation().attr({ display: 'block', left: 0, top: 1 }, 0)
            .transit({ left: 2, top: 3 }, 'all 0.05s ease-out')
            .transit({ left: 4, top: 5, width: '12px', height: '12px', webkitBorderRadius: '12px', backgroundColor: '#FFFF00' }, 'all 0.1s ease-in')
            .transit({ left: 2, top: 3, width: '4px', height: '4px', webkitBorderRadius: '4px', backgroundColor: '#FF0000' }, 'all 0.1s ease-out')
            .destroy().toTemplate();
        self.destruction_tmpl = new aw.Animation().attr({ display: 'block', opacity: '1.0' }, 0)
            .transit({ opacity: '0.0' }, 'opacity 0.25s ease-in')
            .destroy().toTemplate();
        self.spawn_tmpl = new aw.Animation().attr({ display: 'block', opacity: '0.0' }, 0)
            .transit({ opacity: '1.0' }, 'opacity 0.25s ease-in').toTemplate();
        self.remove_tmpl = new aw.Animation().destroy().toTemplate();
        self.melt_tmpl = new aw.Animation().attr({ opacity: '1.0' }, 0).transit({ opacity: '0.0' }, 'opacity 0.25s ease-in')
            .destroy().toTemplate();
        self.build_tmpl = new aw.Animation().attr({ opacity: '1.0' }, 0).transit({ opacity: '0.0' }, 'opacity 0.25s ease-in')
            .destroy().toTemplate();
        self.hit_tmpl = new aw.Animation().attr({ left: 0, top: 1 }, 0)
            .transit({ left: 2, top: 3 }, 'all 0.05s ease-in')
            .transit({ left: 0, top: 1 }, 'all 0.05s ease-in').toTemplate();
        self.repair_tmpl = new aw.Animation().attr({ display: 'block', left: 0, top: 1, opacity: '1.0' }, 0)
            .transit({ left: 2, top: 3, opacity: '0.0' }, 'all 0.5s ease-out')
            .destroy().toTemplate();
        self.scan_tmpl = new aw.Animation().attr({ display: 'block', left: 0, top: 1 }, 0)
            .transit({ webkitTransform: 'rotate(359deg)'}, 'all 0.7s linear')
            .attr({ webkitTransform: 'rotate(0deg)'}, 0)
            .transit({ webkitTransform: 'rotate(359deg)'}, 'all 0.7s linear')
            .destroy().toTemplate();
        self.convert1_tmpl = new aw.Animation().attr({ left: 0, top: 1 }, 0)
            .transit({ left: 2, top: 3 }, 'all 0.05s ease-in').toTemplate();
        self.convert2_tmpl = new aw.Animation().attr({ opacity: '1.0' }, 0)
            .transit({ opacity: '0.0' }, 'opacity 1.0s ease-in')
            .destroy().toTemplate();
        self.error_tmpl = new aw.Animation().attr({display: 'block', left: 0, top: 1 }, 0)
            .transit({ top: 2 }, 'all 0.25s ease-in')
            .destroy().toTemplate();
    }
    
    AnimationsFactory.prototype = {
        __name: 'AnimationsFactory',
        constructor: AnimationsFactory,
        
        move: function(m, x1, y1, x2, y2) {
            var self = this, node = m._ui.node, args = [xToLeft(node, x1), yToTop(node, y1), xToLeft(node, x2), yToTop(node, y2)];
            return aw.Animation.fromTemplate(self.move_tmpl, node, args);
        },
        
        turn: function(m, dir1, dir2) {
            var self = this, args = ['rotate(' + (dir1 * 90) + 'deg)', 'rotate(' + (dir2 * 90) + 'deg)'];
            return aw.Animation.fromTemplate(self.turn_tmpl, m._ui.node, args);
        },
        
        shot: function(parent, x1, y1, x2, y2) {
            var self = this, node = document.createElement('div'), args, SHOT_OFFSET = aw.utils.TILE_SIZE / 2 - 2, SHOT_BLAST_OFFSET = aw.utils.TILE_SIZE / 2 - 6;
            node.className = "cl_shot";
            parent.appendChild(node);
            args = [xToLeft(node, x1, SHOT_OFFSET), yToTop(node, y1, SHOT_OFFSET), xToLeft(node, x2, SHOT_OFFSET), yToTop(node, y2, SHOT_OFFSET), // flying
                xToLeft(node, x2, SHOT_BLAST_OFFSET), yToTop(node, y2, SHOT_BLAST_OFFSET)// blast-in
                ];
            return aw.Animation.fromTemplate(self.shot_tmpl, node, args);
        },
        
        destroy: function(node) {
            var self = this;
            return aw.Animation.fromTemplate(self.destruction_tmpl, node);
        },
        
        spawn: function(node) {
            var self = this;
            return aw.Animation.fromTemplate(self.spawn_tmpl, node);
        },
        
        remove: function(node) {
            var self = this;
            return aw.Animation.fromTemplate(self.remove_tmpl, node);
        },
        
        melt: function(parent, x, y) {
            var self = this, node = document.createElement('div');
            parent.appendChild(node);
            node.className = "cl_object cl_wall";
            node.style.left = xToLeft(node, x);
            node.style.top = yToTop(node, y);
            return aw.Animation.fromTemplate(self.melt_tmpl, node);
        },
        
        build: function(parent, x, y) {
            var self = this, node = document.createElement('div');
            parent.appendChild(node);
            node.className = "cl_object cl_floor";
            node.style.left = xToLeft(node, x);
            node.style.top = yToTop(node, y);
            return aw.Animation.fromTemplate(self.build_tmpl, node);
        },
        
        hit: function(m) {
            var self = this, dirV = aw.utils.getDirVector(m.dir), node = m._ui.node, offset = aw.utils.TILE_SIZE / 3, args = [xToLeft(node, m.x), yToTop(node, m.y), xToLeft(node, m.x, dirV[0] * offset), yToTop(node, m.y, dirV[1] * offset)];
            return aw.Animation.fromTemplate(self.hit_tmpl, node, args);
        },
        
        repair: function(parent, x, y) {
            var self = this, node = document.createElement('span'), args, SIZE = aw.utils.TILE_SIZE;
            node.innerHTML = "+";
            node.className = "cl_repair";
            var w = 10, h = 15;
            parent.appendChild(node);
            args = [xToLeft(node, x, SIZE - w), yToTop(node, y, SIZE - h), xToLeft(node, x, SIZE - w), yToTop(node, y)];
            return aw.Animation.fromTemplate(self.repair_tmpl, node, args);
        },
        
        scan: function(parent, x, y) {
            var self = this, node = document.createElement('div'), args, SIZE_2 = aw.utils.TILE_SIZE / 2;
            node.className = "cl_scan";
            parent.appendChild(node);
            args = [xToLeft(node, x, SIZE_2 - 4), yToTop(node, y, SIZE_2 - 33)];
            return aw.Animation.fromTemplate(self.scan_tmpl, node, args);
        },
        
        convert: function(parent, m, converted, oldTeamNo) {
            var self = this, dirV = aw.utils.getDirVector(m.dir), node = m._ui.node, offset = aw.utils.TILE_SIZE / 3; 
            var args1 = [xToLeft(node, m.x), yToTop(node, m.y), xToLeft(node, m.x, dirV[0] * offset), yToTop(node, m.y, dirV[1] * offset)];
            var args2 = [args1[2], args1[3], args1[0], args1[1]];
            var node = document.createElement('div');
            node.className = "cl_object cl_machine";
            node.style.backgroundPosition = (-aw.utils.TILE_SIZE * oldTeamNo) + 'px';
            node.style.webkitTransform = 'rotate(' + (converted.dir * 90) + 'deg)';
            node.style.zIndex = "999";
            parent.appendChild(node);
            node.style.left = xToLeft(node, converted.x);
            node.style.top = yToTop(node, converted.y);
            converted._ui.repaint();
            return [[aw.Animation.fromTemplate(self.convert1_tmpl, m._ui.node, args1), aw.Animation.fromTemplate(self.convert2_tmpl, node), aw.Animation.fromTemplate(self.convert1_tmpl, m._ui.node, args2)]];
        },
        
        error: function(parent, x, y) {
            var self = this, node = document.createElement('div'), args, SIZE = aw.utils.TILE_SIZE, SIZE_2 = SIZE / 2;
            node.className = "cl_error";
            node.innerHTML = "<span>error!</span>";
            parent.appendChild(node);
            args = [xToLeft(node, x, SIZE_2 - 25), yToTop(node, y), yToTop(node, y, -SIZE_2)];
            return aw.Animation.fromTemplate(self.error_tmpl, node, args);
        }
    }
    return AnimationsFactory;
})();
