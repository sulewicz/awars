"use strict";

window.aw = window.aw || {};

aw.js = aw.js || (function() {
    function toArray(a) {
        return Array.prototype.slice.call(a);
    }
    
    function each(list, func) {
        var i, len = list.length;
        for (i = 0; i < len; i++) {
            func(list[i], i);
        }
    }
    
    function map(list, func) {
         var i, len = list.length, ret = [];
        for (i = 0; i < len; i++) {
            ret.push(func(list[i], i));
        }
        return ret;
    }
    
    function filter(list, func) {
         var i, len = list.length, ret = [];
        for (i = 0; i < len; i++) {
            if (func(list[i], i)) {
                ret.push(list[i]);
            }
        }
        return ret;
    }
     
    function curry(func) {
        if (arguments.length < 2) {
            return func;
        }
        var args = toArray(arguments);
        return function () {
            return func.apply(this, args.concat(toArray(arguments)));
        };
    }
    
    function bind(func, ctx) {
        return function() {
            return func.apply(ctx, arguments);
        }
    }

     function mixin(dst) {
        if (arguments.length === 1) {
            return dst;
        }
        var obj = dst;
        for (var i = arguments.length - 1; i >= 1; --i) {
            for (var o in arguments[i]) {
                if (arguments[i].hasOwnProperty(o)) {
                    obj[o] = arguments[i][o];
                }
            }
        }
        return obj;
    }
    
    function clone(obj) {
        return mixin({}, obj);
    }
    
    /* Event handling */
    
    function emit(obj, e) {
        var self = obj, args = Array.prototype.splice.call(arguments, 2), evMap, callbacks, i, len;
        if ((evMap = self.__evMap)) {
            if ((callbacks = evMap[e])) {
                for (i = 0, len = callbacks.length; i < len; i++) {
                    callbacks[i].apply(self, args);
                }
            }
        }
    }
    
   function reg(obj, e, c) {
        var self = obj, evMap, callbacks;
        if (!(evMap = self.__evMap)) {
            self.__evMap = evMap = {};
        }
        if (!(callbacks = evMap[e])) {
            evMap[e] = callbacks = [];
        }
        callbacks.push(c);
    }
    
    function unreg(obj, e, c) {
        var self = obj, evMap, callbacks;
        if ((evMap = self.__evMap)) {
            if ((callbacks = evMap[e])) {
                callbacks.splice(callbacks.indexOf(c), 1);
            }
        }
    }
    
    function unregAll(obj, e) {
        var self = obj, evMap;
        if ((evMap = self.__evMap)) {
            delete evMap[e];
        }
    }
    
    function extract(obj, prop) {
        var self = obj, elems = prop.split('.'), i, l = elems.length;
        for (i = 0; i < l && self !== undefined; i++) {
            self = self[elems[i]];
        }
        return self;
    }
    
    return {
        to_array: toArray,
        each: each,
        map: map,
        filter: filter,
        curry: curry,
        bind: bind,
        mixin: mixin,
        clone: clone,
        emit: emit,
        reg: reg,
        unreg: unreg,
        unregAll: unregAll,
        extract: extract
    }
})();

if (typeof(module) !== 'undefined' && module.exports) {
    module.exports = aw.js;
}
