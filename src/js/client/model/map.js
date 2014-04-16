"use strict";
var _self = (typeof(global) !== 'undefined' ? global : self);
_self.aw = _self.aw || {};

aw.Map = (function() {
    var MAP_MUTATED_EVENT = 'mapMutated';
    
    var FLOOR = 0, WALL = 1, CONSTRUCTOR = 2, ENEMY_CONSTRUCTOR = 3, MACHINE = 4, ENEMY_MACHINE = 5, JUNK = 6;
    var DYNAMIC_OBJECTS_SPEC = {
        'Constructor': ['x', 'y', 'team_no'],
        'Junk': ['x', 'y', 'value']
    };
    
    var Map = function(size) {
        var self = this;
        
        self.size = size;
        self.max_teams = 0;
        self.reset();
    };
    
    var isValidTileType = function(type) {
        return typeof(type) === 'number' && type >= FLOOR && type <= WALL;
    };
    
    Map.prototype = {
        __name: 'Map',
        constructor: Map,
        reset: function() {
            var self = this, mapTiles = [], i, size = self.size;
            for (i = size * size - 1; i >= 0; --i) {
                mapTiles[i] = FLOOR;
            }
            self.content = mapTiles;
            var objs = self.dynamic_objects;
            if (objs) {
                for (i = objs.length - 1; i >= 0; --i) {
                    self.deleteObject(objs[0]);
                }
            }
            this.dynamic_objects = [];
        },
        
        serialize: function() {
            var self = this, i, len, objects = self.dynamic_objects, serializedObjects = [];
            self.validate();
            for (i = 0, len = objects.length; i < len; i++) {
                var j, l2, object = objects[i], name = object.__name, serializedObject = [name], props = DYNAMIC_OBJECTS_SPEC[name];
                for (j = 0, l2 = props.length; j < l2; j++) {
                    serializedObject.push(object[props[j]]);
                }
                serializedObjects.push(serializedObject.join(','));
            }
            return self.content.join('') + '|' + serializedObjects.join(';');
        },
        
        deserialize: function(raw) {
            this.reset();
            var self = this, data = raw.split('|'), mapTilesSerialized = data[0], dynamicObjectsSerialized = data[1];
            var mapTiles = [], size = this.size;
            for (var i = size * size - 1; i >=0; --i) {
                mapTiles[i] = 0 | mapTilesSerialized[i];
            }
            self.dynamic_objects = [];
            var dynamicObjectsArr = dynamicObjectsSerialized.split(';');
            for (var i = 0, l = dynamicObjectsArr.length; i < l; i++) {
                var dynamicObjectsStr = dynamicObjectsArr[i].split(','), props = DYNAMIC_OBJECTS_SPEC[dynamicObjectsStr[0]];
                if (props) {
                    var object = new aw[dynamicObjectsStr[0]];
                    for (var j = 0, l2 = props.length; j < l2; j++) {
                        object[props[j]] = 0 | dynamicObjectsStr[j + 1];
                    }
                    self.addObject(object);
                }
            }
            self.content = mapTiles;
            self.validate();
        },
        
        set: function(x, y, type) {
            if (!isValidTileType(type)) {
                throw "Invalid tile type given: " + type;
            }
            var i = x * this.size + y;
            this.content[i] = type;
        },
        
        get: function(x, y) {
            var self = this, i = x * self.size + y;
            return (x >= 0 && x < self.size && y >= 0 && y < self.size) ? self.content[i] : null;
        },
        
        getViewport: function(machine, coors) {
            var self = this, i, len, ret = [], x, y, object, team_no = machine.team.team_no;
            for (i = 0, len = coors.length; i < len; i += 2) {
                x = coors[i], y = coors[i + 1];
                object = self.getObject(x, y);
                if (object == null) {
                    ret.push(self.get(x, y));
                } else {
                    ret.push(self.objectToConst(object, team_no));
                }
            }
            return ret;
        },
        
        objectToConst: function(object, team_no) {
            if (object.constructor == aw.Constructor) {
                return (object.team_no == team_no) ? CONSTRUCTOR : ENEMY_CONSTRUCTOR;
            } else if (object.constructor == aw.Machine) {
                return (object.team.team_no == team_no) ? MACHINE : ENEMY_MACHINE;
            } else if (object.constructor == aw.Junk) {
                return JUNK;
            }
        },
        
        addObject: function(obj) {
            var self = this;
            if (!self.canAddObject(obj.x, obj.y)) {
                throw "Cannot add object to " + obj.x + "x" + obj.y;
            }
            self.dynamic_objects.push(obj);
            aw.js.emit(self, MAP_MUTATED_EVENT, 'added', obj);
        },
        
        deleteObject: function(obj) {
            var self = this, dynamic_objects = self.dynamic_objects;
            dynamic_objects.splice(dynamic_objects.indexOf(obj), 1);
            aw.js.emit(self, MAP_MUTATED_EVENT, 'deleted', obj);
        },
        
        getObject: function(x, y) {
            var self = this, objs = self.dynamic_objects, i, len, object;
            if (x >= 0 && x < self.size && y >= 0 && y < self.size) {
                for (i = 0, len = objs.length; i < len; i++) {
                    object = objs[i]
                    if (object.x === x && object.y === y) {
                        return object;
                    }
                }
            }
            return null;
        },
        
        getConstructors: function(id) {
            var self = this, dynamic_objects = self.dynamic_objects, i, len, ret = [];
            for (i = 0, len = dynamic_objects.length; i < len; i++) {
                if (dynamic_objects[i].constructor == aw.Constructor && dynamic_objects[i].team_no == id) {
                    ret.push(dynamic_objects[i]);
                }
            }
            return ret;
        },
        
        canAddObject: function(x, y) {
            var self = this;
            return self.isEmptyTile(x, y) && !self.getObject(x, y);
        },
        
        isEmptyTile: function(x, y) {
            var self = this, i = x * self.size + y;
            return x >= 0 && x < self.size && y >= 0 && y < self.size && self.content[i] === FLOOR;
        },
        
        validate: function() {
            var self = this, objs = self.dynamic_objects, object, i, j, len, len2, constructorsMap = [[], [], [], []], constructors;
            for (i = 0, len = objs.length; i < len; i++) {
                object = objs[i];
                if (self.get(object.x, object.y) !== FLOOR) {
                    throw "Object placed on wrong tile!";
                }
                if (object.constructor == aw.Constructor) {
                    if (object.team_no < 0 || object.team_no > 3) {
                        throw "Invalid Constructor object";
                    }
                    constructorsMap[object.team_no].push(object);
                } else if (object.constructor == aw.Junk) {
                    if (!isFinite(object.value) || object.value < 0) {
                        throw "Invalid Junk value";
                    }
                } else {
                    throw "Unsupported object placed on map";
                }
            }
            
            for (i = 0; i < constructorsMap.length; i++) {
                if (constructorsMap[i].length == 0) {
                    constructorsMap.splice(i, 1);
                    i--;
                }
            }
            for (i = 0, len = constructorsMap.length; i < len; i++) {
                constructors = constructorsMap[i];
                if (constructors[0].team_no !== i) {
                    for (j = 0, len2 = constructors.length; j < len2; j++) {
                        constructors[j].team_no = i;
                    }
                }
            }
            
            self.max_teams = constructorsMap.length;
            if (self.max_teams < 2 || self.max_teams > 4) {
                throw "Invalid number of teams";
            }
            return true;
        },
        
        copy: function() {
            var self = this, map = new Map(self.size);
            map.deserialize(self.serialize());
            return map;
        },
        
        snapshot: function() {
            var self = this;
            self.map_snapshot = self.serialize();
        },
        
        restoreSnapshot: function() {
            var self = this;
            if (self.map_snapshot) {
                self.deserialize(self.map_snapshot);
            }
        }
    }
    
    Map.MAP_MUTATED_EVENT = MAP_MUTATED_EVENT;
    
    Map.FLOOR = FLOOR;
    Map.WALL = WALL;
    Map.CONSTRUCTOR = CONSTRUCTOR;
    Map.ENEMY_CONSTRUCTOR = ENEMY_CONSTRUCTOR;
    Map.MACHINE = MACHINE;
    Map.ENEMY_MACHINE = ENEMY_MACHINE;
    Map.JUNK = JUNK;
    return Map;
})();

