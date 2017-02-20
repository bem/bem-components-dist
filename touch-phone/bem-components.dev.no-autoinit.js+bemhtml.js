/**
 * Modules
 *
 * Copyright (c) 2013 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.1.2
 */

(function(global) {

var undef,

    DECL_STATES = {
        NOT_RESOLVED : 'NOT_RESOLVED',
        IN_RESOLVING : 'IN_RESOLVING',
        RESOLVED     : 'RESOLVED'
    },

    /**
     * Creates a new instance of modular system
     * @returns {Object}
     */
    create = function() {
        var curOptions = {
                trackCircularDependencies : true,
                allowMultipleDeclarations : true
            },

            modulesStorage = {},
            waitForNextTick = false,
            pendingRequires = [],

            /**
             * Defines module
             * @param {String} name
             * @param {String[]} [deps]
             * @param {Function} declFn
             */
            define = function(name, deps, declFn) {
                if(!declFn) {
                    declFn = deps;
                    deps = [];
                }

                var module = modulesStorage[name];
                if(!module) {
                    module = modulesStorage[name] = {
                        name : name,
                        decl : undef
                    };
                }

                module.decl = {
                    name       : name,
                    prev       : module.decl,
                    fn         : declFn,
                    state      : DECL_STATES.NOT_RESOLVED,
                    deps       : deps,
                    dependents : [],
                    exports    : undef
                };
            },

            /**
             * Requires modules
             * @param {String|String[]} modules
             * @param {Function} cb
             * @param {Function} [errorCb]
             */
            require = function(modules, cb, errorCb) {
                if(typeof modules === 'string') {
                    modules = [modules];
                }

                if(!waitForNextTick) {
                    waitForNextTick = true;
                    nextTick(onNextTick);
                }

                pendingRequires.push({
                    deps : modules,
                    cb   : function(exports, error) {
                        error?
                            (errorCb || onError)(error) :
                            cb.apply(global, exports);
                    }
                });
            },

            /**
             * Returns state of module
             * @param {String} name
             * @returns {String} state, possible values are NOT_DEFINED, NOT_RESOLVED, IN_RESOLVING, RESOLVED
             */
            getState = function(name) {
                var module = modulesStorage[name];
                return module?
                    DECL_STATES[module.decl.state] :
                    'NOT_DEFINED';
            },

            /**
             * Returns whether the module is defined
             * @param {String} name
             * @returns {Boolean}
             */
            isDefined = function(name) {
                return !!modulesStorage[name];
            },

            /**
             * Sets options
             * @param {Object} options
             */
            setOptions = function(options) {
                for(var name in options) {
                    if(options.hasOwnProperty(name)) {
                        curOptions[name] = options[name];
                    }
                }
            },

            getStat = function() {
                var res = {},
                    module;

                for(var name in modulesStorage) {
                    if(modulesStorage.hasOwnProperty(name)) {
                        module = modulesStorage[name];
                        (res[module.decl.state] || (res[module.decl.state] = [])).push(name);
                    }
                }

                return res;
            },

            onNextTick = function() {
                waitForNextTick = false;
                applyRequires();
            },

            applyRequires = function() {
                var requiresToProcess = pendingRequires,
                    i = 0, require;

                pendingRequires = [];

                while(require = requiresToProcess[i++]) {
                    requireDeps(null, require.deps, [], require.cb);
                }
            },

            requireDeps = function(fromDecl, deps, path, cb) {
                var unresolvedDepsCnt = deps.length;
                if(!unresolvedDepsCnt) {
                    cb([]);
                }

                var decls = [],
                    onDeclResolved = function(_, error) {
                        if(error) {
                            cb(null, error);
                            return;
                        }

                        if(!--unresolvedDepsCnt) {
                            var exports = [],
                                i = 0, decl;
                            while(decl = decls[i++]) {
                                exports.push(decl.exports);
                            }
                            cb(exports);
                        }
                    },
                    i = 0, len = unresolvedDepsCnt,
                    dep, decl;

                while(i < len) {
                    dep = deps[i++];
                    if(typeof dep === 'string') {
                        if(!modulesStorage[dep]) {
                            cb(null, buildModuleNotFoundError(dep, fromDecl));
                            return;
                        }

                        decl = modulesStorage[dep].decl;
                    }
                    else {
                        decl = dep;
                    }

                    decls.push(decl);

                    startDeclResolving(decl, path, onDeclResolved);
                }
            },

            startDeclResolving = function(decl, path, cb) {
                if(decl.state === DECL_STATES.RESOLVED) {
                    cb(decl.exports);
                    return;
                }
                else if(decl.state === DECL_STATES.IN_RESOLVING) {
                    curOptions.trackCircularDependencies && isDependenceCircular(decl, path)?
                        cb(null, buildCircularDependenceError(decl, path)) :
                        decl.dependents.push(cb);
                    return;
                }

                decl.dependents.push(cb);

                if(decl.prev && !curOptions.allowMultipleDeclarations) {
                    provideError(decl, buildMultipleDeclarationError(decl));
                    return;
                }

                curOptions.trackCircularDependencies && (path = path.slice()).push(decl);

                var isProvided = false,
                    deps = decl.prev? decl.deps.concat([decl.prev]) : decl.deps;

                decl.state = DECL_STATES.IN_RESOLVING;
                requireDeps(
                    decl,
                    deps,
                    path,
                    function(depDeclsExports, error) {
                        if(error) {
                            provideError(decl, error);
                            return;
                        }

                        depDeclsExports.unshift(function(exports, error) {
                            if(isProvided) {
                                cb(null, buildDeclAreadyProvidedError(decl));
                                return;
                            }

                            isProvided = true;
                            error?
                                provideError(decl, error) :
                                provideDecl(decl, exports);
                        });

                        decl.fn.apply(
                            {
                                name   : decl.name,
                                deps   : decl.deps,
                                global : global
                            },
                            depDeclsExports);
                    });
            },

            provideDecl = function(decl, exports) {
                decl.exports = exports;
                decl.state = DECL_STATES.RESOLVED;

                var i = 0, dependent;
                while(dependent = decl.dependents[i++]) {
                    dependent(exports);
                }

                decl.dependents = undef;
            },

            provideError = function(decl, error) {
                decl.state = DECL_STATES.NOT_RESOLVED;

                var i = 0, dependent;
                while(dependent = decl.dependents[i++]) {
                    dependent(null, error);
                }

                decl.dependents = [];
            };

        return {
            create     : create,
            define     : define,
            require    : require,
            getState   : getState,
            isDefined  : isDefined,
            setOptions : setOptions,
            getStat    : getStat
        };
    },

    onError = function(e) {
        nextTick(function() {
            throw e;
        });
    },

    buildModuleNotFoundError = function(name, decl) {
        return Error(decl?
            'Module "' + decl.name + '": can\'t resolve dependence "' + name + '"' :
            'Required module "' + name + '" can\'t be resolved');
    },

    buildCircularDependenceError = function(decl, path) {
        var strPath = [],
            i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            strPath.push(pathDecl.name);
        }
        strPath.push(decl.name);

        return Error('Circular dependence has been detected: "' + strPath.join(' -> ') + '"');
    },

    buildDeclAreadyProvidedError = function(decl) {
        return Error('Declaration of module "' + decl.name + '" has already been provided');
    },

    buildMultipleDeclarationError = function(decl) {
        return Error('Multiple declarations of module "' + decl.name + '" have been detected');
    },

    isDependenceCircular = function(decl, path) {
        var i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            if(decl === pathDecl) {
                return true;
            }
        }
        return false;
    },

    nextTick = (function() {
        var fns = [],
            enqueueFn = function(fn) {
                return fns.push(fn) === 1;
            },
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(typeof process === 'object' && process.nextTick) { // nodejs
            return function(fn) {
                enqueueFn(fn) && process.nextTick(callFns);
            };
        }

        if(global.setImmediate) { // ie10
            return function(fn) {
                enqueueFn(fn) && global.setImmediate(callFns);
            };
        }

        if(global.postMessage && !global.opera) { // modern browsers
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__modules' + (+new Date()),
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    enqueueFn(fn) && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var head = doc.getElementsByTagName('head')[0],
                createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                    };
                    head.appendChild(script);
                };

            return function(fn) {
                enqueueFn(fn) && createScript();
            };
        }

        return function(fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })();

if(typeof exports === 'object') {
    module.exports = create();
}
else {
    global.modules = create();
}

})(typeof window !== 'undefined' ? window : global);
if(/* hack electron env */ typeof window === 'undefined' && /* commonJs */ typeof module !== 'undefined') {modules = module.exports;}
/* ../../libs/bem-core/common.blocks/cookie/cookie.js begin */
/**
 * @module cookie
 * @description Inspired from $.cookie plugin by Klaus Hartl (stilbuero.de)
 */

modules.define('cookie', function(provide) {

provide(/** @exports */{
    /**
     * Returns cookie by given name
     * @param {String} name
     * @returns {String|null}
     */
    get : function(name) {
        var res = null;
        if(document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for(var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if(cookie.substring(0, name.length + 1) === (name + '=')) {
                    res = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return res;
    },

    /**
     * Sets cookie by given name
     * @param {String} name
     * @param {String} val
     * @param {Object} options
     * @returns {cookie} this
     */
    set : function(name, val, options) {
        options = options || {};
        if(val === null) {
            val = '';
            options.expires = -1;
        }
        var expires = '';
        if(options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
            var date;
            if(typeof options.expires === 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path? '; path=' + (options.path) : '',
            domain = options.domain? '; domain=' + (options.domain) : '',
            secure = options.secure? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(val), expires, path, domain, secure].join('');

        return this;
    }
});

});

/* ../../libs/bem-core/common.blocks/cookie/cookie.js end */

/* ../../libs/bem-core/common.blocks/dom/dom.js begin */
/**
 * @module dom
 * @description some DOM utils
 */

modules.define('dom', ['jquery'], function(provide, $) {

provide(/** @exports */{
    /**
     * Checks whether a DOM elem is in a context
     * @param {jQuery} ctx DOM elem where check is being performed
     * @param {jQuery} domElem DOM elem to check
     * @returns {Boolean}
     */
    contains : function(ctx, domElem) {
        var res = false;

        domElem.each(function() {
            var domNode = this;
            do {
                if(~ctx.index(domNode)) return !(res = true);
            } while(domNode = domNode.parentNode);

            return res;
        });

        return res;
    },

    /**
     * Returns current focused DOM elem in document
     * @returns {jQuery}
     */
    getFocused : function() {
        // "Error: Unspecified error." in iframe in IE9
        try { return $(document.activeElement); } catch(e) {}
    },

    /**
     * Checks whether a DOM element contains focus
     * @param {jQuery} domElem
     * @returns {Boolean}
     */
    containsFocus : function(domElem) {
        return this.contains(domElem, this.getFocused());
    },

    /**
    * Checks whether a browser currently can set focus on DOM elem
    * @param {jQuery} domElem
    * @returns {Boolean}
    */
    isFocusable : function(domElem) {
        var domNode = domElem[0];

        if(!domNode) return false;
        if(domNode.hasAttribute('tabindex')) return true;

        switch(domNode.tagName.toLowerCase()) {
            case 'iframe':
                return true;

            case 'input':
            case 'button':
            case 'textarea':
            case 'select':
                return !domNode.disabled;

            case 'a':
                return !!domNode.href;
        }

        return false;
    },

    /**
    * Checks whether a domElem is intended to edit text
    * @param {jQuery} domElem
    * @returns {Boolean}
    */
    isEditable : function(domElem) {
        var domNode = domElem[0];

        if(!domNode) return false;

        switch(domNode.tagName.toLowerCase()) {
            case 'input':
                var type = domNode.type;
                return (type === 'text' || type === 'password') && !domNode.disabled && !domNode.readOnly;

            case 'textarea':
                return !domNode.disabled && !domNode.readOnly;

            default:
                return domNode.contentEditable === 'true';
        }
    }
});

});

/* ../../libs/bem-core/common.blocks/dom/dom.js end */

/* ../../libs/bem-core/common.blocks/jquery/jquery.js begin */
/**
 * @module jquery
 * @description Provide jQuery (load if it does not exist).
 */

modules.define(
    'jquery',
    ['loader_type_js', 'jquery__config'],
    function(provide, loader, cfg) {

/* global jQuery */

function doProvide(preserveGlobal) {
    /**
     * @exports
     * @type Function
     */
    provide(preserveGlobal? jQuery : jQuery.noConflict(true));
}

typeof jQuery !== 'undefined'?
    doProvide(true) :
    loader(cfg.url, doProvide);
});

/* ../../libs/bem-core/common.blocks/jquery/jquery.js end */

/* ../../libs/bem-core/common.blocks/loader/_type/loader_type_js.js begin */
/**
 * @module loader_type_js
 * @description Load JS from external URL.
 */

modules.define('loader_type_js', function(provide) {

var loading = {},
    loaded = {},
    head = document.getElementsByTagName('head')[0],
    runCallbacks = function(path, type) {
        var cbs = loading[path], cb, i = 0;
        delete loading[path];
        while(cb = cbs[i++]) {
            cb[type] && cb[type]();
        }
    },
    onSuccess = function(path) {
        loaded[path] = true;
        runCallbacks(path, 'success');
    },
    onError = function(path) {
        runCallbacks(path, 'error');
    };

provide(
    /**
     * @exports
     * @param {String} path resource link
     * @param {Function} [success] to be called if the script succeeds
     * @param {Function} [error] to be called if the script fails
     */
    function(path, success, error) {
        if(loaded[path]) {
            success && success();
            return;
        }

        if(loading[path]) {
            loading[path].push({ success : success, error : error });
            return;
        }

        loading[path] = [{ success : success, error : error }];

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = (location.protocol === 'file:' && !path.indexOf('//')? 'http:' : '') + path;

        if('onload' in script) {
            script.onload = function() {
                script.onload = script.onerror = null;
                onSuccess(path);
            };

            script.onerror = function() {
                script.onload = script.onerror = null;
                onError(path);
            };
        } else {
            script.onreadystatechange = function() {
                var readyState = this.readyState;
                if(readyState === 'loaded' || readyState === 'complete') {
                    script.onreadystatechange = null;
                    onSuccess(path);
                }
            };
        }

        head.insertBefore(script, head.lastChild);
    }
);

});

/* ../../libs/bem-core/common.blocks/loader/_type/loader_type_js.js end */

/* ../../libs/bem-core/common.blocks/jquery/__config/jquery__config.js begin */
/**
 * @module jquery__config
 * @description Configuration for jQuery
 */

modules.define('jquery__config', function(provide) {

provide(/** @exports */{
    /**
     * URL for loading jQuery if it does not exist
     * @type {String}
     */
    url : 'https://yastatic.net/jquery/3.1.0/jquery.min.js'
});

});

/* ../../libs/bem-core/common.blocks/jquery/__config/jquery__config.js end */

/* ../../libs/bem-core/common.blocks/events/events.vanilla.js begin */
/**
 * @module events
 */

modules.define(
    'events',
    ['identify', 'inherit', 'functions'],
    function(provide, identify, inherit, functions) {

var undef,
    storageExpando = '__' + (+new Date) + 'storage',

    /**
     * @class Event
     * @exports events:Event
     */
    Event = inherit(/** @lends Event.prototype */{
        /**
         * @constructor
         * @param {String} type
         * @param {Object} target
         */
        __constructor : function(type, target) {
            /**
             * Type
             * @member {String}
             */
            this.type = type;

            /**
             * Target
             * @member {Object}
             */
            this.target = target;

            /**
             * Data
             * @member {*}
             */
            this.data = undef;

            this._isDefaultPrevented = false;
            this._isPropagationStopped = false;
        },

        /**
         * Prevents default action
         */
        preventDefault : function() {
            this._isDefaultPrevented = true;
        },

        /**
         * Returns whether is default action prevented
         * @returns {Boolean}
         */
        isDefaultPrevented : function() {
            return this._isDefaultPrevented;
        },

        /**
         * Stops propagation
         */
        stopPropagation : function() {
            this._isPropagationStopped = true;
        },

        /**
         * Returns whether is propagation stopped
         * @returns {Boolean}
         */
        isPropagationStopped : function() {
            return this._isPropagationStopped;
        }
    }),

    /**
     * @class Emitter
     * @exports events:Emitter
     */
    Emitter = inherit(/** @lends Emitter.prototype */{
        /**
         * Adds an event handler
         * @param {String} e Event type
         * @param {Object} [data] Additional data that the handler gets as e.data
         * @param {Function} fn Handler
         * @param {Object} [ctx] Handler context
         * @returns {Emitter} this
         */
        on : function(e, data, fn, ctx, _special) {
            if(typeof e === 'string') {
                if(functions.isFunction(data)) {
                    ctx = fn;
                    fn = data;
                    data = undef;
                }

                var id = identify(fn, ctx),
                    storage = this[storageExpando] || (this[storageExpando] = {}),
                    eventTypes = e.split(' '), eventType,
                    i = 0, list, item,
                    eventStorage;

                while(eventType = eventTypes[i++]) {
                    eventStorage = storage[eventType] || (storage[eventType] = { ids : {}, list : {} });
                    if(!(id in eventStorage.ids)) {
                        list = eventStorage.list;
                        item = { fn : fn, data : data, ctx : ctx, special : _special };
                        if(list.last) {
                            list.last.next = item;
                            item.prev = list.last;
                        } else {
                            list.first = item;
                        }
                        eventStorage.ids[id] = list.last = item;
                    }
                }
            } else {
                for(var key in e) {
                    e.hasOwnProperty(key) && this.on(key, e[key], data, _special);
                }
            }

            return this;
        },

        /**
         * Adds a one time handler for the event.
         * Handler is executed only the next time the event is fired, after which it is removed.
         * @param {String} e Event type
         * @param {Object} [data] Additional data that the handler gets as e.data
         * @param {Function} fn Handler
         * @param {Object} [ctx] Handler context
         * @returns {Emitter} this
         */
        once : function(e, data, fn, ctx) {
            return this.on(e, data, fn, ctx, { once : true });
        },

        /**
         * Removes event handler or handlers
         * @param {String} [e] Event type
         * @param {Function} [fn] Handler
         * @param {Object} [ctx] Handler context
         * @returns {Emitter} this
         */
        un : function(e, fn, ctx) {
            if(typeof e === 'string' || typeof e === 'undefined') {
                var storage = this[storageExpando];
                if(storage) {
                    if(e) { // if event type was passed
                        var eventTypes = e.split(' '),
                            i = 0, eventStorage;
                        while(e = eventTypes[i++]) {
                            if(eventStorage = storage[e]) {
                                if(fn) {  // if specific handler was passed
                                    var id = identify(fn, ctx),
                                        ids = eventStorage.ids;
                                    if(id in ids) {
                                        var list = eventStorage.list,
                                            item = ids[id],
                                            prev = item.prev,
                                            next = item.next;

                                        if(prev) {
                                            prev.next = next;
                                        } else if(item === list.first) {
                                            list.first = next;
                                        }

                                        if(next) {
                                            next.prev = prev;
                                        } else if(item === list.last) {
                                            list.last = prev;
                                        }

                                        delete ids[id];
                                    }
                                } else {
                                    delete this[storageExpando][e];
                                }
                            }
                        }
                    } else {
                        delete this[storageExpando];
                    }
                }
            } else {
                for(var key in e) {
                    e.hasOwnProperty(key) && this.un(key, e[key], fn);
                }
            }

            return this;
        },

        /**
         * Fires event handlers
         * @param {String|events:Event} e Event
         * @param {Object} [data] Additional data
         * @returns {Emitter} this
         */
        emit : function(e, data) {
            var storage = this[storageExpando],
                eventInstantiated = false;

            if(storage) {
                var eventTypes = [typeof e === 'string'? e : e.type, '*'],
                    i = 0, eventType, eventStorage;
                while(eventType = eventTypes[i++]) {
                    if(eventStorage = storage[eventType]) {
                        var item = eventStorage.list.first,
                            lastItem = eventStorage.list.last,
                            res;
                        while(item) {
                            if(!eventInstantiated) { // instantiate Event only on demand
                                eventInstantiated = true;
                                typeof e === 'string' && (e = new Event(e));
                                e.target || (e.target = this);
                            }

                            e.data = item.data;
                            res = item.fn.apply(item.ctx || this, arguments);
                            if(res === false) {
                                e.preventDefault();
                                e.stopPropagation();
                            }

                            item.special && item.special.once &&
                                this.un(e.type, item.fn, item.ctx);

                            if(item === lastItem) {
                                break;
                            }

                            item = item.next;
                        }
                    }
                }
            }

            return this;
        }
    });

provide({
    Emitter : Emitter,
    Event : Event
});

});

/* ../../libs/bem-core/common.blocks/events/events.vanilla.js end */

/* ../../libs/bem-core/common.blocks/inherit/inherit.vanilla.js begin */
/**
 * @module inherit
 * @version 2.2.1
 * @author Filatov Dmitry <dfilatov@yandex-team.ru>
 * @description This module provides some syntax sugar for "class" declarations, constructors, mixins, "super" calls and static members.
 */

(function(global) {

var hasIntrospection = (function(){'_';}).toString().indexOf('_') > -1,
    emptyBase = function() {},
    hasOwnProperty = Object.prototype.hasOwnProperty,
    objCreate = Object.create || function(ptp) {
        var inheritance = function() {};
        inheritance.prototype = ptp;
        return new inheritance();
    },
    objKeys = Object.keys || function(obj) {
        var res = [];
        for(var i in obj) {
            hasOwnProperty.call(obj, i) && res.push(i);
        }
        return res;
    },
    extend = function(o1, o2) {
        for(var i in o2) {
            hasOwnProperty.call(o2, i) && (o1[i] = o2[i]);
        }

        return o1;
    },
    toStr = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
    },
    isFunction = function(obj) {
        return toStr.call(obj) === '[object Function]';
    },
    noOp = function() {},
    needCheckProps = true,
    testPropObj = { toString : '' };

for(var i in testPropObj) { // fucking ie hasn't toString, valueOf in for
    testPropObj.hasOwnProperty(i) && (needCheckProps = false);
}

var specProps = needCheckProps? ['toString', 'valueOf'] : null;

function getPropList(obj) {
    var res = objKeys(obj);
    if(needCheckProps) {
        var specProp, i = 0;
        while(specProp = specProps[i++]) {
            obj.hasOwnProperty(specProp) && res.push(specProp);
        }
    }

    return res;
}

function override(base, res, add) {
    var addList = getPropList(add),
        j = 0, len = addList.length,
        name, prop;
    while(j < len) {
        if((name = addList[j++]) === '__self') {
            continue;
        }
        prop = add[name];
        if(isFunction(prop) &&
                (!hasIntrospection || prop.toString().indexOf('.__base') > -1)) {
            res[name] = (function(name, prop) {
                var baseMethod = base[name]?
                        base[name] :
                        name === '__constructor'? // case of inheritance from plane function
                            res.__self.__parent :
                            noOp;
                return function() {
                    var baseSaved = this.__base;
                    this.__base = baseMethod;
                    var res = prop.apply(this, arguments);
                    this.__base = baseSaved;
                    return res;
                };
            })(name, prop);
        } else {
            res[name] = prop;
        }
    }
}

function applyMixins(mixins, res) {
    var i = 1, mixin;
    while(mixin = mixins[i++]) {
        res?
            isFunction(mixin)?
                inherit.self(res, mixin.prototype, mixin) :
                inherit.self(res, mixin) :
            res = isFunction(mixin)?
                inherit(mixins[0], mixin.prototype, mixin) :
                inherit(mixins[0], mixin);
    }
    return res || mixins[0];
}

/**
* Creates class
* @exports
* @param {Function|Array} [baseClass|baseClassAndMixins] class (or class and mixins) to inherit from
* @param {Object} prototypeFields
* @param {Object} [staticFields]
* @returns {Function} class
*/
function inherit() {
    var args = arguments,
        withMixins = isArray(args[0]),
        hasBase = withMixins || isFunction(args[0]),
        base = hasBase? withMixins? applyMixins(args[0]) : args[0] : emptyBase,
        props = args[hasBase? 1 : 0] || {},
        staticProps = args[hasBase? 2 : 1],
        res = props.__constructor || (hasBase && base.prototype.__constructor)?
            function() {
                return this.__constructor.apply(this, arguments);
            } :
            hasBase?
                function() {
                    return base.apply(this, arguments);
                } :
                function() {};

    if(!hasBase) {
        res.prototype = props;
        res.prototype.__self = res.prototype.constructor = res;
        return extend(res, staticProps);
    }

    extend(res, base);

    res.__parent = base;

    var basePtp = base.prototype,
        resPtp = res.prototype = objCreate(basePtp);

    resPtp.__self = resPtp.constructor = res;

    props && override(basePtp, resPtp, props);
    staticProps && override(base, res, staticProps);

    return res;
}

inherit.self = function() {
    var args = arguments,
        withMixins = isArray(args[0]),
        base = withMixins? applyMixins(args[0], args[0][0]) : args[0],
        props = args[1],
        staticProps = args[2],
        basePtp = base.prototype;

    props && override(basePtp, basePtp, props);
    staticProps && override(base, base, staticProps);

    return base;
};

var defineAsGlobal = true;
if(typeof exports === 'object') {
    module.exports = inherit;
    defineAsGlobal = false;
}

if(typeof modules === 'object') {
    modules.define('inherit', function(provide) {
        provide(inherit);
    });
    defineAsGlobal = false;
}

if(typeof define === 'function') {
    define(function(require, exports, module) {
        module.exports = inherit;
    });
    defineAsGlobal = false;
}

defineAsGlobal && (global.inherit = inherit);

})(this);

/* ../../libs/bem-core/common.blocks/inherit/inherit.vanilla.js end */

/* ../../libs/bem-core/common.blocks/identify/identify.vanilla.js begin */
/**
 * @module identify
 */

modules.define('identify', function(provide) {

var counter = 0,
    expando = '__' + (+new Date),
    global = this.global,
    get = function() {
        return 'uniq' + (++counter);
    },
    identify = function(obj) {
        if((typeof obj === 'object' && obj !== null) || typeof obj === 'function') {
            var key;
            if('uniqueID' in obj) {
                obj === global.document && (obj = obj.documentElement);
                key = 'uniqueID';
            } else {
                key = expando;
            }
            return key in obj?
                obj[key] :
                obj[key] = get();
        }

        return '';
    };

provide(
    /**
     * Makes unique ID
     * @exports
     * @param {?...Object} obj Object that needs to be identified
     * @returns {String} ID
     */
    function(obj) {
        if(arguments.length) {
            if(arguments.length === 1) {
                return identify(obj);
            }

            var res = [];
            for(var i = 0, len = arguments.length; i < len; i++) {
                res.push(identify(arguments[i]));
            }
            return res.sort().join('');
        }

        return get();
    }
);

});

/* ../../libs/bem-core/common.blocks/identify/identify.vanilla.js end */

/* ../../libs/bem-core/common.blocks/functions/functions.vanilla.js begin */
/**
 * @module functions
 * @description A set of helpers to work with JavaScript functions
 */

modules.define('functions', function(provide) {

var toStr = Object.prototype.toString;

provide(/** @exports */{
    /**
     * Checks whether a given object is function
     * @param {*} obj
     * @returns {Boolean}
     */
    isFunction : function(obj) {
        return toStr.call(obj) === '[object Function]';
    },

    /**
     * Empty function
     */
    noop : function() {}
});

});

/* ../../libs/bem-core/common.blocks/functions/functions.vanilla.js end */

/* ../../libs/bem-core/common.blocks/events/__channels/events__channels.vanilla.js begin */
/**
 * @module events__channels
 */

modules.define('events__channels', ['events'], function(provide, events) {

var undef,
    channels = {};

provide(
    /**
     * Returns/destroys a named communication channel
     * @exports
     * @param {String} [id='default'] Channel ID
     * @param {Boolean} [drop=false] Destroy the channel
     * @returns {events:Emitter|undefined} Communication channel
     */
    function(id, drop) {
        if(typeof id === 'boolean') {
            drop = id;
            id = undef;
        }

        id || (id = 'default');

        if(drop) {
            if(channels[id]) {
                channels[id].un();
                delete channels[id];
            }
            return;
        }

        return channels[id] || (channels[id] = new events.Emitter());
    });
});

/* ../../libs/bem-core/common.blocks/events/__channels/events__channels.vanilla.js end */

/* ../../libs/bem-core/common.blocks/events/__observable/events__observable.js begin */
/**
 * @module events__observable
 */

modules.define(
    'events__observable',
    ['inherit'],
    function(provide, inherit) {

/**
 * @class Observable
 */
var Observable = inherit(/** @lends Observable.prototype */{
    /**
     * @constructor
     * @param {Object} emitter
     */
    __constructor : function(emitter) {
        this._emitter = emitter;
    },

    /**
     * Adds an event handler
     * @param {String} e Event type
     * @param {Object} [data] Additional data that the handler gets as e.data
     * @param {Function} fn Handler
     * @param {Object} [fnCtx] Context
     * @returns {Observable} this
     */
    on : function(e, data, fn, fnCtx) {
        this._emitter.on.apply(this._emitter, arguments);
        return this;
    },

    /**
     * Adds an event handler
     * @param {String} e Event type
     * @param {Object} [data] Additional data that the handler gets as e.data
     * @param {Function} fn Handler
     * @param {Object} [fnCtx] Context
     * @returns {Observable} this
     */
    once : function(e, data, fn, fnCtx) {
        this._emitter.once.apply(this._emitter, arguments);
        return this;
    },

    /**
     * Removes event handler
     * @param {String} [e] Event type
     * @param {Function} [fn] Handler
     * @param {Object} [fnCtx] Context
     * @returns {Observable} this
     */
    un : function(e, fn, fnCtx) {
        this._emitter.un.apply(this._emitter, arguments);
        return this;
    }
});

provide(
    /**
     * Creates new observable
     * @exports
     * @param {events:Emitter} emitter
     * @returns {Observable}
     */
    function(emitter) {
        return new Observable(emitter);
    }
);

});

/* ../../libs/bem-core/common.blocks/events/__observable/events__observable.js end */

/* ../../libs/bem-core/common.blocks/events/__observable/_type/events__observable_type_bem-dom.js begin */
/**
 * @module events__observable
 */

modules.define(
    'events__observable',
    ['i-bem-dom'],
    function(provide, bemDom, observable) {

provide(
    /**
     * Creates new observable
     * @exports
     * @param {i-bem-dom:Block|i-bem-dom:Elem|events:Emitter} bemEntity
     * @returns {Observable}
     */
    function(bemEntity) {
        return observable(bemDom.isEntity(bemEntity)?
            bemEntity._events() :
            bemEntity);
    }
);

});

/* ../../libs/bem-core/common.blocks/events/__observable/_type/events__observable_type_bem-dom.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/i-bem-dom.js begin */
/**
 * @module i-bem-dom
 */

modules.define(
    'i-bem-dom',
    [
        'i-bem',
        'i-bem__internal',
        'i-bem-dom__collection',
        'i-bem-dom__events_type_dom',
        'i-bem-dom__events_type_bem',
        'inherit',
        'identify',
        'objects',
        'functions',
        'jquery',
        'dom'
    ],
    function(
        provide,
        bem,
        bemInternal,
        BemDomCollection,
        domEvents,
        bemEvents,
        inherit,
        identify,
        objects,
        functions,
        $,
        dom) {

var undef,
    /**
     * Storage for DOM elements by unique key
     * @type Object
     */
    uniqIdToDomElems = {},

    /**
     * Storage for blocks by unique key
     * @type Object
     */
    uniqIdToEntity = {},

    /**
    * Storage for DOM element's parent nodes
    * @type Object
    */
    domNodesToParents = {},

    /**
     * Storage for block parameters
     * @type Object
     */
    domElemToParams = {},

    /**
     * Storage for DOM nodes that are being destructed
     * @type Object
     */
    destructingDomNodes = {},

    entities = bem.entities,

    BEM_CLASS_NAME = 'i-bem',
    BEM_SELECTOR = '.' + BEM_CLASS_NAME,
    BEM_PARAMS_ATTR = 'data-bem',

    NAME_PATTERN = bemInternal.NAME_PATTERN,

    MOD_DELIM = bemInternal.MOD_DELIM,
    ELEM_DELIM = bemInternal.ELEM_DELIM,

    buildModPostfix = bemInternal.buildModPostfix,
    buildClassName = bemInternal.buildClassName,

    reverse = Array.prototype.reverse,
    slice = Array.prototype.slice,

    domEventManagerFactory = new domEvents.EventManagerFactory(getEntityCls),
    bemEventManagerFactory = new bemEvents.EventManagerFactory(getEntityCls),

    bemDom;

/**
 * Initializes entities on a DOM element
 * @param {jQuery} domElem DOM element
 * @param {String} uniqInitId ID of the "initialization wave"
 * @param {Object} [dropElemCacheQueue] queue of elems to be droped from cache
 */
function initEntities(domElem, uniqInitId, dropElemCacheQueue) {
    var domNode = domElem[0],
        params = getParams(domNode),
        entityName,
        splitted,
        blockName,
        elemName;

    for(entityName in params) {
        if(dropElemCacheQueue) {
            splitted = entityName.split(ELEM_DELIM);
            blockName = splitted[0];
            elemName = splitted[1];
            elemName &&
                ((dropElemCacheQueue[blockName] ||
                    (dropElemCacheQueue[blockName] = {}))[elemName] = true);
        }

        initEntity(
            entityName,
            domElem,
            processParams(params[entityName], entityName, uniqInitId));
    }
}

/**
 * Initializes a specific entity on a DOM element, or returns the existing entity if it was already created
 * @param {String} entityName Entity name
 * @param {jQuery} domElem DOM element
 * @param {Object} [params] Initialization parameters
 * @param {Boolean} [ignoreLazyInit=false] Ignore lazy initialization
 * @param {Function} [callback] Handler to call after complete initialization
 */
function initEntity(entityName, domElem, params, ignoreLazyInit, callback) {
    var domNode = domElem[0];

    if(destructingDomNodes[identify(domNode)]) return;

    params || (params = processParams(getEntityParams(domNode, entityName), entityName));

    var uniqId = params.uniqId,
        entity = uniqIdToEntity[uniqId];

    if(entity) {
        if(entity.domElem.index(domNode) < 0) {
            entity.domElem = entity.domElem.add(domElem);
            objects.extend(entity.params, params);
        }

        return entity;
    }

    uniqIdToDomElems[uniqId] = uniqIdToDomElems[uniqId]?
        uniqIdToDomElems[uniqId].add(domElem) :
        domElem;

    var parentDomNode = domNode.parentNode;
    if(!parentDomNode || parentDomNode.nodeType === 11) { // jquery doesn't unique disconnected node
        $.unique(uniqIdToDomElems[uniqId]);
    }

    var entityCls = getEntityCls(entityName);

    entityCls._processInit();

    if(!entityCls.lazyInit || ignoreLazyInit || params.lazyInit === false) {
        ignoreLazyInit && domElem.addClass(BEM_CLASS_NAME); // add css class for preventing memory leaks in further destructing

        entity = new entityCls(uniqIdToDomElems[uniqId], params, !!ignoreLazyInit);
        delete uniqIdToDomElems[uniqId];
        callback && callback.apply(entity, slice.call(arguments, 4));
        return entity;
    }
}

function getEntityCls(entityName) {
    if(entities[entityName]) return entities[entityName];

    var splitted = entityName.split(ELEM_DELIM);
    return splitted[1]?
        bemDom.declElem(splitted[0], splitted[1], {}, { lazyInit : true }, true) :
        bemDom.declBlock(entityName, {}, { lazyInit : true }, true);
}

/**
 * Processes and adds necessary entity parameters
 * @param {Object} params Initialization parameters
 * @param {String} entityName Entity name
 * @param {String} [uniqInitId] ID of the "initialization wave"
 */
function processParams(params, entityName, uniqInitId) {
    params.uniqId ||
        (params.uniqId = (params.id?
            entityName + '-id-' + params.id :
            identify()) + (uniqInitId || identify()));

    return params;
}

/**
 * Helper for searching for a DOM element using a selector inside the context, including the context itself
 * @param {jQuery} ctx Context
 * @param {String} selector CSS selector
 * @param {Boolean} [excludeSelf=false] Exclude context from search
 * @returns {jQuery}
 */
function findDomElem(ctx, selector, excludeSelf) {
    var res = ctx.find(selector);
    return excludeSelf?
       res :
       res.add(ctx.filter(selector));
}

/**
 * Returns parameters of an entity's DOM element
 * @param {HTMLElement} domNode DOM node
 * @returns {Object}
 */
function getParams(domNode) {
    var uniqId = identify(domNode);
    return domElemToParams[uniqId] ||
        (domElemToParams[uniqId] = extractParams(domNode));
}

/**
 * Returns parameters of an entity extracted from DOM node
 * @param {HTMLElement} domNode DOM node
 * @param {String} blockName
 * @returns {Object}
 */

function getEntityParams(domNode, blockName) {
    var params = getParams(domNode);
    return params[blockName] || (params[blockName] = {});
}

/**
 * Retrieves entity parameters from a DOM element
 * @param {HTMLElement} domNode DOM node
 * @returns {Object}
 */
function extractParams(domNode) {
    var attrVal = domNode.getAttribute(BEM_PARAMS_ATTR);
    return attrVal? JSON.parse(attrVal) : {};
}

/**
 * Uncouple DOM node from the entity. If this is the last node, then destroys the entity.
 * @param {BemDomEntity} entity entity
 * @param {HTMLElement} domNode DOM node
 */
function removeDomNodeFromEntity(entity, domNode) {
    if(entity.domElem.length === 1) {
        entity._delInitedMod();
        delete uniqIdToEntity[entity._uniqId];
    } else {
        entity.domElem = entity.domElem.not(domNode);
    }
}

/**
 * Stores DOM node's parent nodes to the storage
 * @param {jQuery} domElem
 */
function storeDomNodeParents(domElem) {
    domElem.each(function() {
        domNodesToParents[identify(this)] = this.parentNode;
    });
}

/**
 * Clears the cache for elements in context
 * @param {jQuery} ctx
 */
function dropElemCacheForCtx(ctx, dropElemCacheQueue) {
    ctx.add(ctx.parents()).each(function(_, domNode) {
        var params = domElemToParams[identify(domNode)];

        params && objects.each(params, function(entityParams) {
            var entity = uniqIdToEntity[entityParams.uniqId];
            if(entity) {
                var elemNames = dropElemCacheQueue[entity.__self._blockName];
                elemNames && entity._dropElemCache(Object.keys(elemNames));
            }
        });
    });

    dropElemCacheQueue = {};
}

/**
 * Build key for elem
 * @param {Function|String|Object} elem Element class or name or description elem, modName, modVal
 * @returns {Object}
 */
function buildElemKey(elem) {
    if(typeof elem === 'string') {
        elem = { elem : elem };
    } else if(functions.isFunction(elem)) {
        elem = { elem : elem.getName() };
    } else if(functions.isFunction(elem.elem)) {
        elem.elem = elem.elem.getName();
    }

    return {
        elem : elem.elem,
        mod : buildModPostfix(elem.modName, elem.modVal)
    };
}

// jscs:disable requireMultipleVarDecl

/**
 * Returns jQuery collection for provided HTML
 * @param {jQuery|String} html
 * @returns {jQuery}
 */
function getJqueryCollection(html) {
    return $(typeof html === 'string'? $.parseHTML(html, null, true) : html);
}

/**
 * @class BemDomEntity
 * @description Base mix for BEM entities that have DOM representation
 */
var BemDomEntity = inherit(/** @lends BemDomEntity.prototype */{
    /**
     * @constructor
     * @private
     * @param {jQuery} domElem DOM element that the entity is created on
     * @param {Object} params parameters
     * @param {Boolean} [initImmediately=true]
     */
    __constructor : function(domElem, params, initImmediately) {
        /**
         * DOM elements of entity
         * @member {jQuery}
         * @readonly
         */
        this.domElem = domElem;

        /**
         * Cache for elements collections
         * @member {Object}
         * @private
         */
        this._elemsCache = {};

        /**
         * Cache for elements
         * @member {Object}
         * @private
         */
        this._elemCache = {};

        /**
         * References to parent entities which found current entity ever
         * @type {Array}
         * @private
         */
        this._findBackRefs = [];

        uniqIdToEntity[params.uniqId || identify(this)] = this;

        this.__base(null, params, initImmediately);
    },

    /**
     * @abstract
     * @protected
     * @returns {Block}
     */
    _block : function() {},

    /**
     * Lazy search for elements nested in a block (caches results)
     * @protected
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @returns {BemDomCollection}
     */
    _elems : function(Elem) {
        var key = buildElemKey(Elem),
            elemsCache = this._elemsCache[key.elem];

        if(elemsCache && key.mod in elemsCache)
            return elemsCache[key.mod];

        var res = (elemsCache || (this._elemsCache[key.elem] = {}))[key.mod] =
            this.findMixedElems(Elem).concat(this.findChildElems(Elem));

        res.forEach(function(entity) {
            entity._findBackRefs.push(this);
        }, this);

        return res;
    },

    /**
     * Lazy search for the first element nested in a block (caches results)
     * @protected
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @returns {Elem}
     */
    _elem : function(Elem) {
        var key = buildElemKey(Elem),
            elemCache = this._elemCache[key.elem];

        // NOTE: can use this._elemsCache but it's too rare case
        if(elemCache && key.mod in elemCache)
            return elemCache[key.mod];

        var res = (elemCache || (this._elemCache[key.elem] = {}))[key.mod] =
            this.findMixedElem(Elem) || this.findChildElem(Elem);

        res && res._findBackRefs.push(this);

        return res;
    },

    /**
     * Clears the cache for elements
     * @private
     * @param {?...(Function|String|Object)} elems Nested elements names or description elem, modName, modVal
     * @returns {BemDomEntity} this
     */
    _dropElemCache : function(elems) {
        if(!arguments.length) {
            this._elemsCache = {};
            this._elemCache = {};
            return this;
        }

        (Array.isArray(elems)? elems : slice.call(arguments)).forEach(function(elem) {
            var key = buildElemKey(elem);
            if(key.mod) {
                this._elemsCache[key.elem] && delete this._elemsCache[key.elem][key.mod];
                this._elemCache[key.elem] && delete this._elemCache[key.elem][key.mod];
            } else {
                delete this._elemsCache[key.elem];
                delete this._elemCache[key.elem];
            }
        }, this);

        return this;
    },

    /**
     * Finds the first child block
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {Block}
     */
    findChildBlock : function(Block) {
        // TODO: throw if Block passed as a string
        return this._findEntities('find', Block, true);
    },

    /**
     * Finds child blocks
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findChildBlocks : function(Block) {
        return this._findEntities('find', Block);
    },

    /**
     * Finds the first parent block
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {Block}
     */
    findParentBlock : function(Block) {
        return this._findEntities('parents', Block, true);
    },

    /**
     * Finds parent blocks
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findParentBlocks : function(Block) {
        return this._findEntities('parents', Block);
    },

    /**
     * Finds first mixed block
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {Block}
     */
    findMixedBlock : function(Block) {
        return this._findEntities('filter', Block, true);
    },

    /**
     * Finds mixed blocks
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findMixedBlocks : function(Block) {
        return this._findEntities('filter', Block);
    },

    /**
     * Finds the first child element
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {Elem}
     */
    findChildElem : function(Elem, strictMode) {
        return strictMode?
            this._filterFindElemResults(this._findEntities('find', Elem)).get(0) :
            this._findEntities('find', Elem, true);
    },

    /**
     * Finds child elements
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {BemDomCollection}
     */
    findChildElems : function(Elem, strictMode) {
        var res = this._findEntities('find', Elem);

        return strictMode?
            this._filterFindElemResults(res) :
            res;
    },

    /**
     * Finds the first parent element
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {Elem}
     */
    findParentElem : function(Elem, strictMode) {
        return strictMode?
            this._filterFindElemResults(this._findEntities('parents', Elem))[0] :
            this._findEntities('parents', Elem, true);
    },

    /**
     * Finds parent elements
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {BemDomCollection}
     */
    findParentElems : function(Elem, strictMode) {
        var res = this._findEntities('parents', Elem);
        return strictMode? this._filterFindElemResults(res) : res;
    },

    /**
     * Finds the first mixed element
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @returns {Elem}
     */
    findMixedElem : function(Elem) {
        return this._findEntities('filter', Elem, true);
    },

    /**
     * Finds mixed elements.
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @returns {BemDomCollection}
     */
    findMixedElems : function(Elem) {
        return this._findEntities('filter', Elem);
    },

    /**
     * Filters results of findElem helper execution in strict mode
     * @private
     * @param {BemDomCollection} res Elements
     * @returns {BemDomCollection}
     */
    _filterFindElemResults : function(res) {
        var block = this._block();
        return res.filter(function(elem) {
            return elem._block() === block;
        });
    },

    /**
     * Finds entities
     * @private
     * @param {String} select
     * @param {Function|String|Object} entity
     * @param {Boolean} [onlyFirst=false]
     * @returns {*}
     */
    _findEntities : function(select, entity, onlyFirst) {
        var entityName = functions.isFunction(entity)?
                entity.getEntityName() :
                typeof entity === 'object'?
                    entity.block?
                        entity.block.getEntityName() :
                        typeof entity.elem === 'string'?
                            this.__self._blockName + ELEM_DELIM + entity.elem :
                            entity.elem.getEntityName() :
                    this.__self._blockName + ELEM_DELIM + entity,
            selector = '.' +
                (typeof entity === 'object'?
                    buildClassName(
                        entityName,
                        entity.modName,
                        typeof entity.modVal === 'undefined'?
                            true :
                            entity.modVal) :
                    buildClassName(entityName)) +
                (onlyFirst? ':first' : ''),
            domElems = this.domElem[select](selector);

        if(onlyFirst) return domElems[0]?
            initEntity(entityName, domElems.eq(0), undef, true)._setInitedMod() :
            null;

        var res = [],
            uniqIds = {};

        domElems.each(function(i, domElem) {
            var block = initEntity(entityName, $(domElem), undef, true)._setInitedMod();
            if(!uniqIds[block._uniqId]) {
                uniqIds[block._uniqId] = true;
                res.push(block);
            }
        });

        return new BemDomCollection(res);
    },

    /**
     * Returns an manager to bind and unbind DOM events for particular context
     * @protected
     * @param {Function|String|Object|Elem|BemDomCollection|document|window} [ctx=this.domElem] context to bind,
     *     can be BEM-entity class, instance, collection of BEM-entities,
     *     element name or description (elem, modName, modVal), document or window
     * @returns {EventManager}
     */
    _domEvents : function(ctx) {
        return domEventManagerFactory.getEventManager(this, ctx, this.domElem);
    },

    /**
     * Returns an manager to bind and unbind BEM events for particular context
     * @protected
     * @param {Function|String|BemDomEntity|BemDomCollection|Object} [ctx=this.domElem] context to bind,
     *     can be BEM-entity class, instance, collection of BEM-entities,
     *     element name or description (elem, modName, modVal)
     * @returns {EventManager}
     */
    _events : function(ctx) {
        return bemEventManagerFactory.getEventManager(this, ctx, this.domElem);
    },

    /**
     * Executes the BEM entity's event handlers and delegated handlers
     * @protected
     * @param {String|Object|events:Event} e Event name
     * @param {Object} [data] Additional information
     * @returns {BemEntity} this
     */
    _emit : function(e, data) {
        if((typeof e === 'object' && e.modName === 'js') || this.hasMod('js', 'inited')) {
            bemEvents.emit(this, e, data);
        }

        return this;
    },

    /** @override */
    _extractModVal : function(modName) {
        var domNode = this.domElem[0],
            matches;

        domNode &&
            (matches = domNode.className
                .match(this.__self._buildModValRE(modName)));

        return matches? matches[2] || true : '';
    },

    /** @override */
    _onSetMod : function(modName, modVal, oldModVal) {
        var _self = this.__self,
            name = _self.getName();

        this._findBackRefs.forEach(function(ref) {
            oldModVal === '' || ref._dropElemCache({ elem : name, modName : modName, modVal : oldModVal });
            ref._dropElemCache(modVal === ''? name : { elem : name, modName : modName, modVal : modVal });
        });

        this.__base.apply(this, arguments);

        if(modName !== 'js' || modVal !== '') {
            var classNamePrefix = _self._buildModClassNamePrefix(modName),
                classNameRE = _self._buildModValRE(modName),
                needDel = modVal === '';

            this.domElem.each(function() {
                var className = this.className,
                    modClassName = classNamePrefix;

                modVal !== true && (modClassName += MOD_DELIM + modVal);

                (oldModVal === true?
                    classNameRE.test(className) :
                    (' ' + className).indexOf(' ' + classNamePrefix + MOD_DELIM) > -1)?
                        this.className = className.replace(
                            classNameRE,
                            (needDel? '' : '$1' + modClassName)) :
                        needDel || $(this).addClass(modClassName);
            });
        }
    },

    /** @override */
    _afterSetMod : function(modName, modVal, oldModVal) {
        var eventData = { modName : modName, modVal : modVal, oldModVal : oldModVal };
        this
            ._emit({ modName : modName, modVal : '*' }, eventData)
            ._emit({ modName : modName, modVal : modVal }, eventData);
    },

    /**
     * Checks whether an entity is in the entity
     * @param {BemDomEntity} entity entity
     * @returns {Boolean}
     */
    containsEntity : function(entity) {
        return dom.contains(this.domElem, entity.domElem);
    }

}, /** @lends BemDomEntity */{
    /** @override */
    create : function() {
        throw Error('bemDom entities can not be created otherwise than from DOM');
    },

    /** @override */
    _processInit : function(heedInit) {
        /* jshint eqeqeq: false */
        if(this.onInit && this._inited == heedInit) {
            this.__base(heedInit);

            this.onInit();

            var name = this.getName(),
                origOnInit = this.onInit;

            // allow future calls of init only in case of inheritance in other block
            this.init = function() {
                this.getName() === name && origOnInit.apply(this, arguments);
            };
        }
    },

    /**
     * Returns an manager to bind and unbind events for particular context
     * @protected
     * @param {Function|String|Object} [ctx] context to bind,
     *     can be BEM-entity class, instance, element name or description (elem, modName, modVal)
     * @returns {EventManager}
     */
    _domEvents : function(ctx) {
        return domEventManagerFactory.getEventManager(this, ctx, bemDom.scope);
    },

    /**
     * Returns an manager to bind and unbind BEM events for particular context
     * @protected
     * @param {Function|String|Object} [ctx] context to bind,
     *     can be BEM-entity class, instance, element name or description (block or elem, modName, modVal)
     * @returns {EventManager}
     */
    _events : function(ctx) {
        return bemEventManagerFactory.getEventManager(this, ctx, bemDom.scope);
    },

    /**
     * Builds a prefix for the CSS class of a DOM element of the entity, based on modifier name
     * @private
     * @param {String} modName Modifier name
     * @returns {String}
     */
    _buildModClassNamePrefix : function(modName) {
        return this.getEntityName() + MOD_DELIM + modName;
    },

    /**
     * Builds a regular expression for extracting modifier values from a DOM element of an entity
     * @private
     * @param {String} modName Modifier name
     * @returns {RegExp}
     */
    _buildModValRE : function(modName) {
        return new RegExp(
            '(\\s|^)' +
            this._buildModClassNamePrefix(modName) +
            '(?:' + MOD_DELIM + '(' + NAME_PATTERN + '))?(?=\\s|$)');
    },

    /**
     * Builds a CSS class name corresponding to the entity and modifier
     * @protected
     * @param {String} [modName] Modifier name
     * @param {String} [modVal] Modifier value
     * @returns {String}
     */
    _buildClassName : function(modName, modVal) {
        return buildClassName(this.getEntityName(), modName, modVal);
    },

    /**
     * Builds a CSS selector corresponding to an entity and modifier
     * @protected
     * @param {String} [modName] Modifier name
     * @param {String} [modVal] Modifier value
     * @returns {String}
     */
    _buildSelector : function(modName, modVal) {
        return '.' + this._buildClassName(modName, modVal);
    }
});

/**
 * @class Block
 * @description Base class for creating BEM blocks that have DOM representation
 * @augments i-bem:Block
 * @exports
 */
var Block = inherit([bem.Block, BemDomEntity], /** @lends Block.prototype */{
    /** @override */
    _block : function() {
        return this;
    }
});

/**
 * @class Elem
 * @description Base class for creating BEM elements that have DOM representation
 * @augments i-bem:Elem
 * @exports
 */
var Elem = inherit([bem.Elem, BemDomEntity], /** @lends Elem.prototype */{
    /** @override */
    _block : function() {
        return this._blockInstance || (this._blockInstance = this.findParentBlock(getEntityCls(this.__self._blockName)));
    }
});

/**
 * Returns a block on a DOM element and initializes it if necessary
 * @param {Function} BemDomEntity entity
 * @param {Object} [params] entity parameters
 * @returns {BemDomEntity|null}
 */
$.fn.bem = function(BemDomEntity, params) {
    var entity = initEntity(BemDomEntity.getEntityName(), this, params, true);
    return entity? entity._setInitedMod() : null;
};

$(function() {

bemDom = /** @exports */{
    /**
     * Scope
     * @type jQuery
     */
    scope : $('body'),

    /**
     * Document shortcut
     * @type jQuery
     */
    doc : $(document),

    /**
     * Window shortcut
     * @type jQuery
     */
    win : $(window),

    /**
     * Base bemDom block
     * @type Function
     */
    Block : Block,

    /**
     * Base bemDom element
     * @type Function
     */
    Elem : Elem,

    /**
     * @param {*} entity
     * @return {Boolean}
     */
    isEntity : function(entity) {
        return entity instanceof Block || entity instanceof Elem;
    },

    /**
     * Declares DOM-based block and creates block class
     * @param {String|Function} blockName Block name or block class
     * @param {Function|Array[Function]} [base] base block + mixes
     * @param {Object} [props] Methods
     * @param {Object} [staticProps] Static methods
     * @returns {Function} Block class
     */
    declBlock : function(blockName, base, props, staticProps) {
        if(!base || (typeof base === 'object' && !Array.isArray(base))) {
            staticProps = props;
            props = base;
            base = typeof blockName === 'string'?
                entities[blockName] || Block :
                blockName;
        }

        return bem.declBlock(blockName, base, props, staticProps);
    },

    /**
     * Declares elem and creates elem class
     * @param {String} blockName Block name
     * @param {String} elemName Elem name
     * @param {Function|Array[Function]} [base] base elem + mixes
     * @param {Object} [props] Methods
     * @param {Object} [staticProps] Static methods
     * @returns {Function} Elem class
     */
    declElem : function(blockName, elemName, base, props, staticProps) {
        if(!base || (typeof base === 'object' && !Array.isArray(base))) {
            staticProps = props;
            props = base;
            base = entities[blockName + ELEM_DELIM + elemName] || Elem;
        }

        return bem.declElem(blockName, elemName, base, props, staticProps);
    },

    declMixin : bem.declMixin,

    /**
     * Initializes blocks on a fragment of the DOM tree
     * @param {jQuery|String} [ctx=scope] Root DOM node
     * @returns {jQuery} ctx Initialization context
     */
    init : function(ctx) {
        ctx = typeof ctx === 'string'?
            $(ctx) :
            ctx || bemDom.scope;

        var dropElemCacheQueue = ctx === bemDom.scope? {} : undef,
            uniqInitId = identify();

        findDomElem(ctx, BEM_SELECTOR).each(function() {
            initEntities($(this), uniqInitId, dropElemCacheQueue);
        });

        bem._runInitFns();

        dropElemCacheQueue && dropElemCacheForCtx(ctx, dropElemCacheQueue);

        return ctx;
    },

    /**
     * @param {jQuery} ctx Root DOM node
     * @param {Boolean} [excludeSelf=false] Exclude the main domElem
     * @param {Boolean} [destructDom=false] Remove DOM node during destruction
     * @private
     */
    _destruct : function(ctx, excludeSelf, destructDom) {
        var _ctx,
            currentDestructingDomNodes = [];

        storeDomNodeParents(_ctx = excludeSelf? ctx.children() : ctx);

        reverse.call(findDomElem(_ctx, BEM_SELECTOR)).each(function(_, domNode) {
            var params = getParams(domNode),
                domNodeId = identify(domNode);

            destructingDomNodes[domNodeId] = true;
            currentDestructingDomNodes.push(domNodeId);

            objects.each(params, function(entityParams) {
                if(entityParams.uniqId) {
                    var entity = uniqIdToEntity[entityParams.uniqId];
                    entity?
                        removeDomNodeFromEntity(entity, domNode) :
                        delete uniqIdToDomElems[entityParams.uniqId];
                }
            });
            delete domElemToParams[identify(domNode)];
        });

        // NOTE: it was moved here as jquery events aren't triggered on detached DOM elements
        destructDom &&
            (excludeSelf? ctx.empty() : ctx.remove());

        // flush parent nodes storage that has been filled above
        domNodesToParents = {};

        currentDestructingDomNodes.forEach(function(domNodeId) {
            delete destructingDomNodes[domNodeId];
        });
    },

    /**
     * Destroys blocks on a fragment of the DOM tree
     * @param {jQuery} ctx Root DOM node
     * @param {Boolean} [excludeSelf=false] Exclude the main domElem
     */
    destruct : function(ctx, excludeSelf) {
        this._destruct(ctx, excludeSelf, true);
    },

    /**
     * Detaches blocks on a fragment of the DOM tree without DOM tree destruction
     * @param {jQuery} ctx Root DOM node
     * @param {Boolean} [excludeSelf=false] Exclude the main domElem
     */
    detach : function(ctx, excludeSelf) {
        this._destruct(ctx, excludeSelf);
    },

    /**
     * Replaces a fragment of the DOM tree inside the context, destroying old blocks and intializing new ones
     * @param {jQuery} ctx Root DOM node
     * @param {jQuery|String} content New content
     * @returns {jQuery} Updated root DOM node
     */
    update : function(ctx, content) {
        this.destruct(ctx, true);
        return this.init(ctx.html(content));
    },

    /**
     * Changes a fragment of the DOM tree including the context and initializes blocks.
     * @param {jQuery} ctx Root DOM node
     * @param {jQuery|String} content Content to be added
     * @returns {jQuery} New content
     */
    replace : function(ctx, content) {
        var prev = ctx.prev(),
            parent = ctx.parent();

        content = getJqueryCollection(content);

        this.destruct(ctx);

        return this.init(prev.length?
            content.insertAfter(prev) :
            content.prependTo(parent));
    },

    /**
     * Adds a fragment of the DOM tree at the end of the context and initializes blocks
     * @param {jQuery} ctx Root DOM node
     * @param {jQuery|String} content Content to be added
     * @returns {jQuery} New content
     */
    append : function(ctx, content) {
        return this.init(getJqueryCollection(content).appendTo(ctx));
    },

    /**
     * Adds a fragment of the DOM tree at the beginning of the context and initializes blocks
     * @param {jQuery} ctx Root DOM node
     * @param {jQuery|String} content Content to be added
     * @returns {jQuery} New content
     */
    prepend : function(ctx, content) {
        return this.init(getJqueryCollection(content).prependTo(ctx));
    },

    /**
     * Adds a fragment of the DOM tree before the context and initializes blocks
     * @param {jQuery} ctx Contextual DOM node
     * @param {jQuery|String} content Content to be added
     * @returns {jQuery} New content
     */
    before : function(ctx, content) {
        return this.init(getJqueryCollection(content).insertBefore(ctx));
    },

    /**
     * Adds a fragment of the DOM tree after the context and initializes blocks
     * @param {jQuery} ctx Contextual DOM node
     * @param {jQuery|String} content Content to be added
     * @returns {jQuery} New content
     */
    after : function(ctx, content) {
        return this.init(getJqueryCollection(content).insertAfter(ctx));
    }
};

provide(bemDom);

});

});

(function() {

var origDefine = modules.define,
    storedDeps = []; // NOTE: see https://github.com/bem/bem-core/issues/1446

modules.define = function(name, deps, decl) {
    origDefine.apply(modules, arguments);

    if(name !== 'i-bem-dom__init' && arguments.length > 2 && ~deps.indexOf('i-bem-dom')) {
        storedDeps.push(name);
        storedDeps.length === 1 && modules.define('i-bem-dom__init', storedDeps, function(provide) {
            provide(arguments[arguments.length - 1]);
            storedDeps = [];
        });
    }
};

})();

/* ../../libs/bem-core/common.blocks/i-bem-dom/i-bem-dom.js end */

/* ../../libs/bem-core/common.blocks/objects/objects.vanilla.js begin */
/**
 * @module objects
 * @description A set of helpers to work with JavaScript objects
 */

modules.define('objects', function(provide) {

var hasOwnProp = Object.prototype.hasOwnProperty;

provide(/** @exports */{
    /**
     * Extends a given target by
     * @param {Object} target object to extend
     * @param {Object} source
     * @returns {Object}
     */
    extend : function(target, source) {
        (typeof target !== 'object' || target === null) && (target = {});

        for(var i = 1, len = arguments.length; i < len; i++) {
            var obj = arguments[i];
            if(obj) {
                for(var key in obj) {
                    hasOwnProp.call(obj, key) && (target[key] = obj[key]);
                }
            }
        }

        return target;
    },

    /**
     * Check whether a given object is empty (contains no enumerable properties)
     * @param {Object} obj
     * @returns {Boolean}
     */
    isEmpty : function(obj) {
        for(var key in obj) {
            if(hasOwnProp.call(obj, key)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Generic iterator function over object
     * @param {Object} obj object to iterate
     * @param {Function} fn callback
     * @param {Object} [ctx] callbacks's context
     */
    each : function(obj, fn, ctx) {
        for(var key in obj) {
            if(hasOwnProp.call(obj, key)) {
                ctx? fn.call(ctx, obj[key], key) : fn(obj[key], key);
            }
        }
    }
});

});

/* ../../libs/bem-core/common.blocks/objects/objects.vanilla.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/__init/i-bem-dom__init.js begin */
/**
 * @module i-bem-dom__init
 */

modules.define('i-bem-dom__init', ['i-bem-dom'], function(provide, bemDom) {

provide(
    /**
     * Initializes blocks on a fragment of the DOM tree
     * @exports
     * @param {jQuery} [ctx=scope] Root DOM node
     * @returns {jQuery} ctx Initialization context
     */
    function(ctx) {
        return bemDom.init(ctx);
    });
});

/* ../../libs/bem-core/common.blocks/i-bem-dom/__init/i-bem-dom__init.js end */

/* ../../libs/bem-core/common.blocks/i-bem/i-bem.vanilla.js begin */
/**
 * @module i-bem
 */

modules.define(
    'i-bem',
    [
        'i-bem__internal',
        'inherit',
        'identify',
        'next-tick',
        'objects',
        'functions'
    ],
    function(
        provide,
        bemInternal,
        inherit,
        identify,
        nextTick,
        objects,
        functions) {

var undef,

    ELEM_DELIM = bemInternal.ELEM_DELIM,

    /**
     * Storage for block init functions
     * @private
     * @type Array
     */
    initFns = [],

    /**
     * Storage for block declarations (hash by block name)
     * @private
     * @type Object
     */
    entities = {};

/**
 * Builds the name of the handler method for setting a modifier
 * @param {String} prefix
 * @param {String} modName Modifier name
 * @param {String} modVal Modifier value
 * @returns {String}
 */
function buildModFnName(prefix, modName, modVal) {
    return '__' + prefix +
       '__mod' +
       (modName? '_' + modName : '') +
       (modVal? '_' + modVal : '');
}

/**
 * Builds the function for the handler method for setting a modifier
 * for special syntax
 * @param {String} modVal Declared modifier value
 * @param {Function} curModFn Declared modifier handler
 * @param {Function} [prevModFn] Previous handler
 * @param {Function} [condition] Condition function
 * (called with declared, set and previous modifier values)
 * @returns {Function}
 */
function buildSpecialModFn(modVal, curModFn, prevModFn, condition) {
    return prevModFn || condition?
        function(_modName, _modVal, _prevModVal) {
            var res1, res2;
            prevModFn &&
                (res1 = prevModFn.apply(this, arguments) === false);
            (condition? condition(modVal, _modVal, _prevModVal) : true) &&
                (res2 = curModFn.apply(this, arguments) === false);
            if(res1 || res2) return false;
        } :
        curModFn;
}

var specialModConditions = {
    '!' : function(modVal, _modVal, _prevModVal) {
        return _modVal !== modVal;
    },
    '~' : function(modVal, _modVal, _prevModVal) {
        return _prevModVal === modVal;
    }
};

/**
 * Transforms a hash of modifier handlers to methods
 * @param {String} prefix
 * @param {Object} modFns
 * @param {Object} props
 */
function modFnsToProps(prefix, modFns, props) {
    if(functions.isFunction(modFns)) {
        props[buildModFnName(prefix, '*', '*')] = modFns;
    } else {
        var modName, modVal, modFn;
        for(modName in modFns) {
            modFn = modFns[modName];
            if(functions.isFunction(modFn)) {
                props[buildModFnName(prefix, modName, '*')] = modFn;
            } else {
                var starModFnName = buildModFnName(prefix, modName, '*');
                for(modVal in modFn) {
                    var curModFn = modFn[modVal],
                        modValPrefix = modVal[0];

                    if(modValPrefix === '!' || modValPrefix === '~' || modVal === '*') {
                        modVal === '*' || (modVal = modVal.substr(1));
                        props[starModFnName] = buildSpecialModFn(
                            modVal,
                            curModFn,
                            props[starModFnName],
                            specialModConditions[modValPrefix]);
                    } else {
                        props[buildModFnName(prefix, modName, modVal)] = curModFn;
                    }
                }
            }
        }
    }
}

function buildCheckMod(modName, modVal) {
    return modVal?
        Array.isArray(modVal)?
            function(block) {
                var i = 0, len = modVal.length;
                while(i < len)
                    if(checkMod(block, modName, modVal[i++]))
                        return true;
                return false;
            } :
            function(block) {
                return checkMod(block, modName, modVal);
            } :
        function(block) {
            return checkMod(block, modName, true);
        };
}

function checkMod(block, modName, modVal) {
    var prevModVal = block._processingMods[modName];

    // check if a block has either current or previous modifier value equal to passed modVal
    return modVal === '*'?
        /* jshint eqnull: true */
        block.hasMod(modName) || prevModVal != null :
        block.hasMod(modName, modVal) || prevModVal === modVal;
}

function convertModHandlersToMethods(props) {
    if(props.beforeSetMod) {
        modFnsToProps('before', props.beforeSetMod, props);
        delete props.beforeSetMod;
    }

    if(props.onSetMod) {
        modFnsToProps('after', props.onSetMod, props);
        delete props.onSetMod;
    }
}

function declEntity(baseCls, entityName, base, props, staticProps) {
    base || (base = entities[entityName] || baseCls);

    Array.isArray(base) || (base = [base]);

    if(!base[0].__bemEntity) {
        base = base.slice();
        base.unshift(entities[entityName] || baseCls);
    }

    props && convertModHandlersToMethods(props);

    var entityCls;

    entityName === base[0].getEntityName()?
        // makes a new "init" if the old one was already executed
        (entityCls = inherit.self(base, props, staticProps))._processInit(true) :
        (entityCls = entities[entityName] = inherit(base, props, staticProps));

    return entityCls;
}

// jscs:disable requireMultipleVarDecl

/**
 * @class BemEntity
 * @description Base block for creating BEM blocks
 */
var BemEntity = inherit(/** @lends BemEntity.prototype */ {
    /**
     * @constructor
     * @private
     * @param {Object} mods BemEntity modifiers
     * @param {Object} params BemEntity parameters
     * @param {Boolean} [initImmediately=true]
     */
    __constructor : function(mods, params, initImmediately) {
        /**
         * Cache of modifiers
         * @member {Object}
         * @private
         */
        this._modCache = mods || {};

        /**
         * Current modifiers in the stack
         * @member {Object}
         * @private
         */
        this._processingMods = {};

        /**
         * BemEntity parameters, taking into account the defaults
         * @member {Object}
         * @readonly
         */
        this.params = objects.extend(this._getDefaultParams(), params);

        /**
         * @member {String} Unique entity ID
         * @private
         */
        this._uniqId = this.params.uniqId || identify(this);

        initImmediately !== false?
            this._setInitedMod() :
            initFns.push(this._setInitedMod, this);
    },

    /**
     * Initializes a BEM entity
     * @private
     */
    _setInitedMod : function() {
        return this.setMod('js', 'inited');
    },

    /**
     * Deletes a BEM entity
     * @private
     */
    _delInitedMod : function() {
        this.delMod('js');
    },

    /**
     * Checks whether a BEM entity has a modifier
     * @param {String} modName Modifier name
     * @param {String|Boolean} [modVal] Modifier value. If not of type String or Boolean, it is casted to String
     * @returns {Boolean}
     */
    hasMod : function(modName, modVal) {
        var typeModVal = typeof modVal;
        typeModVal === 'undefined' || typeModVal === 'boolean' || (modVal = modVal.toString());

        var res = this.getMod(modName) === (modVal || '');
        return arguments.length === 1? !res : res;
    },

    /**
     * Returns the value of the modifier of the BEM entity
     * @param {String} modName Modifier name
     * @returns {String} Modifier value
     */
    getMod : function(modName) {
        var modCache = this._modCache;
        return modName in modCache?
            modCache[modName] || '' :
            modCache[modName] = this._extractModVal(modName);
    },

    /**
     * Sets the modifier for a BEM entity
     * @param {String} modName Modifier name
     * @param {String|Boolean} [modVal=true] Modifier value. If not of type String or Boolean, it is casted to String
     * @returns {BemEntity} this
     */
    setMod : function(modName, modVal) {
        var typeModVal = typeof modVal;
        if(typeModVal === 'undefined') {
            modVal = true;
        } else if(typeModVal === 'boolean') {
            modVal === false && (modVal = '');
        } else {
            modVal = modVal.toString();
        }

        /* jshint eqnull: true */
        if(this._processingMods[modName] != null) return this;

        var curModVal = this.getMod(modName);
        if(curModVal === modVal) return this;

        this._processingMods[modName] = curModVal;

        var needSetMod = true,
            modFnParams = [modName, modVal, curModVal],
            modVars = [['*', '*'], [modName, '*'], [modName, modVal]],
            prefixes = ['before', 'after'],
            i = 0, prefix, j, modVar;

        while(prefix = prefixes[i++]) {
            j = 0;
            while(modVar = modVars[j++]) {
                if(this._callModFn(prefix, modVar[0], modVar[1], modFnParams) === false) {
                    needSetMod = false;
                    break;
                }
            }

            if(!needSetMod) break;

            if(prefix === 'before') {
                this._modCache[modName] = modVal;
                this._onSetMod(modName, modVal, curModVal);
            }
        }

        this._processingMods[modName] = null;
        needSetMod && this._afterSetMod(modName, modVal, curModVal);

        return this;
    },

    /**
     * @protected
     * @param {String} modName Modifier name
     * @param {String} modVal Modifier value
     * @param {String} oldModVal Old modifier value
     */
    _onSetMod : function(modName, modVal, oldModVal) {},

    /**
     * @protected
     * @param {String} modName Modifier name
     * @param {String} modVal Modifier value
     * @param {String} oldModVal Old modifier value
     */
    _afterSetMod : function(modName, modVal, oldModVal) {},

    /**
     * Sets a modifier for a BEM entity, depending on conditions.
     * If the condition parameter is passed: when true, modVal1 is set; when false, modVal2 is set.
     * If the condition parameter is not passed: modVal1 is set if modVal2 was set, or vice versa.
     * @param {String} modName Modifier name
     * @param {String} [modVal1=true] First modifier value, optional for boolean modifiers
     * @param {String} [modVal2] Second modifier value
     * @param {Boolean} [condition] Condition
     * @returns {BemEntity} this
     */
    toggleMod : function(modName, modVal1, modVal2, condition) {
        typeof modVal1 === 'undefined' && (modVal1 = true); // boolean mod

        if(typeof modVal2 === 'undefined') {
            modVal2 = '';
        } else if(typeof modVal2 === 'boolean') {
            condition = modVal2;
            modVal2 = '';
        }

        var modVal = this.getMod(modName);
        (modVal === modVal1 || modVal === modVal2) &&
            this.setMod(
                modName,
                typeof condition === 'boolean'?
                    (condition? modVal1 : modVal2) :
                    this.hasMod(modName, modVal1)? modVal2 : modVal1);

        return this;
    },

    /**
     * Removes a modifier from a BEM entity
     * @param {String} modName Modifier name
     * @returns {BemEntity} this
     */
    delMod : function(modName) {
        return this.setMod(modName, '');
    },

    /**
     * Executes handlers for setting modifiers
     * @private
     * @param {String} prefix
     * @param {String} modName Modifier name
     * @param {String} modVal Modifier value
     * @param {Array} modFnParams Handler parameters
     */
    _callModFn : function(prefix, modName, modVal, modFnParams) {
        var modFnName = buildModFnName(prefix, modName, modVal);
        return this[modFnName]?
           this[modFnName].apply(this, modFnParams) :
           undef;
    },

    _extractModVal : function(modName) {
        return '';
    },

    /**
     * Returns a BEM entity's default parameters
     * @protected
     * @returns {Object}
     */
    _getDefaultParams : function() {
        return {};
    },

    /**
     * Executes given callback on next turn eventloop in BEM entity's context
     * @protected
     * @param {Function} fn callback
     * @returns {BemEntity} this
     */
    _nextTick : function(fn) {
        var _this = this;
        nextTick(function() {
            _this.hasMod('js', 'inited') && fn.call(_this);
        });
        return this;
    }
}, /** @lends BemEntity */{
    /**
     * Factory method for creating an instance
     * @param {Object} mods modifiers
     * @param {Object} params params
     * @returns {BemEntity}
     */
    create : function(mods, params) {
        return new this(mods, params);
    },

    /**
     * Declares modifier
     * @param {Object} mod
     * @param {String} mod.modName
     * @param {String|Boolean|Array} [mod.modVal]
     * @param {Object} props
     * @param {Object} [staticProps]
     * @returns {Function}
     */
    declMod : function(mod, props, staticProps) {
        props && convertModHandlersToMethods(props);

        var checkMod = buildCheckMod(mod.modName, mod.modVal),
            basePtp = this.prototype;

        objects.each(props, function(prop, name) {
            functions.isFunction(prop) &&
                (props[name] = function() {
                    var method;
                    if(checkMod(this)) {
                        method = prop;
                    } else {
                        var baseMethod = basePtp[name];
                        baseMethod && baseMethod !== prop &&
                            (method = this.__base);
                    }
                    return method?
                        method.apply(this, arguments) :
                        undef;
                });
        });

        return inherit.self(this, props, staticProps);
    },

    __bemEntity : true,

    _name : null,

    /**
     * Processes a BEM entity's init
     * @private
     * @param {Boolean} [heedInit=false] Whether to take into account that the BEM entity already processed its init property
     */
    _processInit : function(heedInit) {
        this._inited = true;
    },

    /**
     * Returns the name of the current BEM entity
     * @returns {String}
     */
    getName : function() {
        return this._name;
    },

    /**
     * Returns the name of the current BEM entity
     * @returns {String}
     */
    getEntityName : function() {
        return this._name;
    }
});

/**
 * @class Block
 * @description Class for creating BEM blocks
 * @augments BemEntity
 */
var Block = BemEntity;

/**
 * @class Elem
 * @description Class for creating BEM elems
 * @augments BemEntity
 */
var Elem = inherit(BemEntity, /** @lends Elem.prototype */ {
    /**
     * Returns the own block of current element
     * @protected
     * @returns {Block}
     */
    _block : function() {
        return this._blockInstance;
    }
}, /** @lends Elem */{
    /**
     * Factory method for creating an instance
     * @param {Object} block block instance
     * @param {Object} mods modifiers
     * @param {Object} params params
     * @returns {BemEntity}
     */
    create : function(block, mods, params) {
        var res = new this(mods, params);
        res._blockInstance = block;
        return res;
    },

    /**
     * Returns the name of the current BEM entity
     * @returns {String}
     */
    getEntityName : function() {
        return this._blockName + ELEM_DELIM + this._name;
    }
});

provide(/** @exports */{
    /**
     * Block class
     * @type Function
     */
    Block : Block,

    /**
     * Elem class
     * @type Function
     */
    Elem : Elem,

    /**
     * Storage for block declarations (hash by block name)
     * @type Object
     */
    entities : entities,

    /**
     * Declares block and creates a block class
     * @param {String|Function} blockName Block name or block class
     * @param {Function|Array[Function]} [base] base block + mixes
     * @param {Object} [props] Methods
     * @param {Object} [staticProps] Static methods
     * @returns {Function} Block class
     */
    declBlock : function(blockName, base, props, staticProps) {
        if(typeof base === 'object' && !Array.isArray(base)) {
            staticProps = props;
            props = base;
            base = undef;
        }

        var baseCls = Block;
        if(typeof blockName !== 'string') {
            baseCls = blockName;
            blockName = blockName.getEntityName();
        }

        var res = declEntity(baseCls, blockName, base, props, staticProps);
        res._name = res._blockName = blockName;
        return res;
    },

    /**
     * Declares elem and creates an elem class
     * @param {String} [blockName] Block name
     * @param {String|Function} elemName Elem name or elem class
     * @param {Function|Function[]} [base] base elem + mixes
     * @param {Object} [props] Methods
     * @param {Object} [staticProps] Static methods
     * @returns {Function} Elem class
     */
    declElem : function(blockName, elemName, base, props, staticProps) {
        var baseCls = Elem,
            entityName;

        if(typeof blockName !== 'string') {
            staticProps = props;
            props = base;
            base = elemName;
            elemName = blockName._name;
            baseCls = blockName;
            blockName = baseCls._blockName;
            entityName = baseCls.getEntityName();
        } else {
            entityName = blockName + ELEM_DELIM + elemName;
        }

        if(typeof base === 'object' && !Array.isArray(base)) {
            staticProps = props;
            props = base;
            base = undef;
        }

        var res = declEntity(baseCls, entityName, base, props, staticProps);
        res._blockName = blockName;
        res._name = elemName;
        return res;
    },

    /**
     * Declares mixin
     * @param {Object} [props] Methods
     * @param {Object} [staticProps] Static methods
     * @returns {Function} mix
     */
    declMixin : function(props, staticProps) {
        convertModHandlersToMethods(props || (props = {}));
        return inherit(props, staticProps);
    },

    /**
     * Executes the block init functions
     * @private
     */
    _runInitFns : function() {
        if(initFns.length) {
            var fns = initFns,
                fn, i = 0;

            initFns = [];
            while(fn = fns[i]) {
                fn.call(fns[i + 1]);
                i += 2;
            }
        }
    }
});

});

/* ../../libs/bem-core/common.blocks/i-bem/i-bem.vanilla.js end */

/* ../../libs/bem-core/common.blocks/i-bem/__internal/i-bem__internal.vanilla.js begin */
/**
 * @module i-bem__internal
 */

modules.define('i-bem__internal', function(provide) {

var undef,
    /**
     * Separator for modifiers and their values
     * @const
     * @type String
     */
    MOD_DELIM = '_',

    /**
     * Separator between names of a block and a nested element
     * @const
     * @type String
     */
    ELEM_DELIM = '__',

    /**
     * Pattern for acceptable element and modifier names
     * @const
     * @type String
     */
    NAME_PATTERN = '[a-zA-Z0-9-]+';

function isSimple(obj) {
    var typeOf = typeof obj;
    return typeOf === 'string' || typeOf === 'number' || typeOf === 'boolean';
}

function buildModPostfix(modName, modVal) {
    var res = '';
    /* jshint eqnull: true */
    if(modVal != null && modVal !== false) {
        res += MOD_DELIM + modName;
        modVal !== true && (res += MOD_DELIM + modVal);
    }
    return res;
}

function buildBlockClassName(name, modName, modVal) {
    return name + buildModPostfix(modName, modVal);
}

function buildElemClassName(block, name, modName, modVal) {
    return buildBlockClassName(block, undef, undef) +
        ELEM_DELIM + name +
        buildModPostfix(modName, modVal);
}

provide(/** @exports */{
    NAME_PATTERN : NAME_PATTERN,

    MOD_DELIM : MOD_DELIM,
    ELEM_DELIM : ELEM_DELIM,

    buildModPostfix : buildModPostfix,

    /**
     * Builds the class name of a block or element with a modifier
     * @param {String} block Block name
     * @param {String} [elem] Element name
     * @param {String} [modName] Modifier name
     * @param {String|Number} [modVal] Modifier value
     * @returns {String} Class name
     */
    buildClassName : function(block, elem, modName, modVal) {
        if(isSimple(modName)) {
            if(!isSimple(modVal)) {
                modVal = modName;
                modName = elem;
                elem = undef;
            }
        } else if(typeof modName !== 'undefined') {
            modName = undef;
        } else if(elem && typeof elem !== 'string') {
            elem = undef;
        }

        if(!(elem || modName)) { // optimization for simple case
            return block;
        }

        return elem?
            buildElemClassName(block, elem, modName, modVal) :
            buildBlockClassName(block, modName, modVal);
    },

    /**
     * Builds full class names for a buffer or element with modifiers
     * @param {String} block Block name
     * @param {String} [elem] Element name
     * @param {Object} [mods] Modifiers
     * @returns {String} Class
     */
    buildClassNames : function(block, elem, mods) {
        if(elem && typeof elem !== 'string') {
            mods = elem;
            elem = undef;
        }

        var res = elem?
            buildElemClassName(block, elem, undef, undef) :
            buildBlockClassName(block, undef, undef);

        if(mods) {
            for(var modName in mods) {
                if(mods.hasOwnProperty(modName) && mods[modName]) {
                    res += ' ' + (elem?
                        buildElemClassName(block, elem, modName, mods[modName]) :
                        buildBlockClassName(block, modName, mods[modName]));
                }
            }
        }

        return res;
    }
});

});

/* ../../libs/bem-core/common.blocks/i-bem/__internal/i-bem__internal.vanilla.js end */

/* ../../libs/bem-core/common.blocks/next-tick/next-tick.vanilla.js begin */
/**
 * @module next-tick
 */

modules.define('next-tick', function(provide) {

/**
 * Executes given function on next tick.
 * @exports
 * @type Function
 * @param {Function} fn
 */

var global = this.global,
    fns = [],
    enqueueFn = function(fn) {
        fns.push(fn);
        return fns.length === 1;
    },
    callFns = function() {
        var fnsToCall = fns, i = 0, len = fns.length;
        fns = [];
        while(i < len) {
            fnsToCall[i++]();
        }
    };

    /* global process */
    if(typeof process === 'object' && process.nextTick) { // nodejs
        return provide(function(fn) {
            enqueueFn(fn) && process.nextTick(callFns);
        });
    }

    if(global.setImmediate) { // ie10
        return provide(function(fn) {
            enqueueFn(fn) && global.setImmediate(callFns);
        });
    }

    if(global.postMessage) { // modern browsers
        var isPostMessageAsync = true;
        if(global.attachEvent) {
            var checkAsync = function() {
                    isPostMessageAsync = false;
                };
            global.attachEvent('onmessage', checkAsync);
            global.postMessage('__checkAsync', '*');
            global.detachEvent('onmessage', checkAsync);
        }

        if(isPostMessageAsync) {
            var msg = '__nextTick' + (+new Date),
                onMessage = function(e) {
                    if(e.data === msg) {
                        e.stopPropagation && e.stopPropagation();
                        callFns();
                    }
                };

            global.addEventListener?
                global.addEventListener('message', onMessage, true) :
                global.attachEvent('onmessage', onMessage);

            return provide(function(fn) {
                enqueueFn(fn) && global.postMessage(msg, '*');
            });
        }
    }

    var doc = global.document;
    if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
        var head = doc.getElementsByTagName('head')[0],
            createScript = function() {
                var script = doc.createElement('script');
                script.onreadystatechange = function() {
                    script.parentNode.removeChild(script);
                    script = script.onreadystatechange = null;
                    callFns();
                };
                head.appendChild(script);
            };

        return provide(function(fn) {
            enqueueFn(fn) && createScript();
        });
    }

    provide(function(fn) { // old browsers
        enqueueFn(fn) && global.setTimeout(callFns, 0);
    });
});

/* ../../libs/bem-core/common.blocks/next-tick/next-tick.vanilla.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/__events/i-bem-dom__events.js begin */
/**
 * @module i-bem-dom__events
 */
modules.define(
    'i-bem-dom__events',
    [
        'i-bem__internal',
        'i-bem-dom__collection',
        'inherit',
        'identify',
        'objects',
        'jquery',
        'functions'
    ],
    function(
        provide,
        bemInternal,
        BemDomCollection,
        inherit,
        identify,
        objects,
        $,
        functions) {

var undef,
    winNode = window,
    docNode = document,
    winId = identify(winNode),
    docId = identify(docNode),
    eventStorage = {},

    /**
     * @class EventManager
     */
    EventManager = inherit(/** @lends EventManager.prototype */{
        /**
         * @constructor
         * @param {Object} params EventManager parameters
         * @param {Function} fnWrapper Wrapper function to build event handler
         * @param {Function} eventBuilder Function to build event
         */
        __constructor : function(params, fnWrapper, eventBuilder) {
            this._params = params;
            this._fnWrapper = fnWrapper;
            this._eventBuilder = eventBuilder;
            this._storage = {};
        },

        /**
         * Adds an event handler
         * @param {String|Object|events:Event} e Event type
         * @param {*} [data] Additional data that the handler gets as e.data
         * @param {Function} fn Handler
         * @returns {EventManager} this
         */
        on : function(e, data, fn, _fnCtx, _isOnce) {
            var params = this._params,
                event = this._eventBuilder(e, params);

            if(functions.isFunction(data)) {
                _isOnce = _fnCtx;
                _fnCtx = fn;
                fn = data;
                data = undef;
            }

            var fnStorage = this._storage[event] || (this._storage[event] = {}),
                fnId = identify(fn, _fnCtx);

            if(!fnStorage[fnId]) {
                var bindDomElem = params.bindDomElem,
                    bindSelector = params.bindSelector,
                    _this = this,
                    handler = fnStorage[fnId] = this._fnWrapper(
                        _isOnce?
                            function() {
                                _this.un(e, fn, _fnCtx);
                                fn.apply(this, arguments);
                            } :
                            fn,
                        _fnCtx,
                        fnId);

                bindDomElem.on(event, bindSelector, data, handler);
                bindSelector && bindDomElem.is(bindSelector) && bindDomElem.on(event, data, handler);
                // FIXME: "once" won't properly work in case of nested and mixed elem with the same name
            }

            return this;
        },

        /**
         * Adds an event handler
         * @param {String} e Event type
         * @param {*} [data] Additional data that the handler gets as e.data
         * @param {Function} fn Handler
         * @returns {EventManager} this
         */
        once : function(e, data, fn, _fnCtx) {
            if(functions.isFunction(data)) {
                _fnCtx = fn;
                fn = data;
                data = undef;
            }

            return this.on(e, data, fn, _fnCtx, true);
        },

        /**
         * Removes event handler or handlers
         * @param {String|Object|events:Event} [e] Event type
         * @param {Function} [fn] Handler
         * @returns {EventManager} this
         */
        un : function(e, fn, _fnCtx) {
            var argsLen = arguments.length;
            if(argsLen) {
                var params = this._params,
                    event = this._eventBuilder(e, params);

                if(argsLen === 1) {
                    this._unbindByEvent(this._storage[event], event);
                } else {
                    var wrappedFn,
                        fnId = identify(fn, _fnCtx),
                        fnStorage = this._storage[event],
                        bindDomElem = params.bindDomElem,
                        bindSelector = params.bindSelector;

                    if(wrappedFn = fnStorage && fnStorage[fnId])
                        delete fnStorage[fnId];

                    var handler = wrappedFn || fn;

                    bindDomElem.off(event, params.bindSelector, handler);
                    bindSelector && bindDomElem.is(bindSelector) && bindDomElem.off(event, handler);
                }
            } else {
                objects.each(this._storage, this._unbindByEvent, this);
            }

            return this;
        },

        _unbindByEvent : function(fnStorage, e) {
            var params = this._params,
                bindDomElem = params.bindDomElem,
                bindSelector = params.bindSelector,
                unbindWithoutSelector = bindSelector && bindDomElem.is(bindSelector);

            fnStorage && objects.each(fnStorage, function(fn) {
                bindDomElem.off(e, bindSelector, fn);
                unbindWithoutSelector && bindDomElem.off(e, fn);
            });
            this._storage[e] = null;
        }
    }),
    buildForEachEventManagerProxyFn = function(methodName) {
        return function() {
            var args = arguments;

            this._eventManagers.forEach(function(eventManager) {
                eventManager[methodName].apply(eventManager, args);
            });

            return this;
        };
    },
    /**
     * @class CollectionEventManager
     */
    CollectionEventManager = inherit(/** @lends CollectionEventManager.prototype */{
        /**
         * @constructor
         * @param {Array} eventManagers Array of event managers
         */
        __constructor : function(eventManagers) {
            this._eventManagers = eventManagers;
        },

        /**
         * Adds an event handler
         * @param {String|Object|events:Event} e Event type
         * @param {Object} [data] Additional data that the handler gets as e.data
         * @param {Function} fn Handler
         * @returns {CollectionEventManager} this
         */
        on : buildForEachEventManagerProxyFn('on'),

        /**
         * Adds an event handler
         * @param {String} e Event type
         * @param {Object} [data] Additional data that the handler gets as e.data
         * @param {Function} fn Handler
         * @returns {CollectionEventManager} this
         */
        once : buildForEachEventManagerProxyFn('once'),

        /**
         * Removes event handler or handlers
         * @param {String|Object|events:Event} [e] Event type
         * @param {Function} [fn] Handler
         * @returns {CollectionEventManager} this
         */
        un : buildForEachEventManagerProxyFn('un')
    }),
    /**
     * @class EventManagerFactory
     * @exports i-bem-dom__events:EventManagerFactory
     */
    EventManagerFactory = inherit(/** @lends EventManagerFactory.prototype */{
        __constructor : function(getEntityCls) {
            this._storageSuffix = identify();
            this._getEntityCls = getEntityCls;
            this._eventManagerCls = EventManager;
        },

        /**
         * Instantiates event manager
         * @param {Function|i-bem-dom:BemDomEntity} ctx BemDomEntity class or instance
         * @param {*} bindCtx context to bind
         * @param {jQuery} bindScope bind scope
         * @returns {EventManager}
         */
        getEventManager : function(ctx, bindCtx, bindScope) {
            if(bindCtx instanceof BemDomCollection) {
                return new CollectionEventManager(bindCtx.map(function(entity) {
                    return this.getEventManager(ctx, entity, bindScope);
                }, this));
            }

            var ctxId = identify(ctx),
                ctxStorage = eventStorage[ctxId],
                storageSuffix = this._storageSuffix,
                isBindToInstance = typeof ctx !== 'function',
                ctxCls,
                selector = '';

            if(isBindToInstance) {
                ctxCls = ctx.__self;
            } else {
                ctxCls = ctx;
                selector = ctx._buildSelector();
            }

            var params = this._buildEventManagerParams(bindCtx, bindScope, selector, ctxCls),
                storageKey = params.key + storageSuffix;

            if(!ctxStorage) {
                ctxStorage = eventStorage[ctxId] = {};
                if(isBindToInstance) {
                    ctx._events().on({ modName : 'js', modVal : '' }, function() {
                        params.bindToArbitraryDomElem && ctxStorage[storageKey] &&
                            ctxStorage[storageKey].un();
                        delete ctxStorage[ctxId];
                    });
                }
            }

            return ctxStorage[storageKey] ||
                (ctxStorage[storageKey] = this._createEventManager(ctx, params, isBindToInstance));
        },

        _buildEventManagerParams : function(bindCtx, bindScope, ctxSelector, ctxCls) {
            var res = {
                bindEntityCls : null,
                bindDomElem : bindScope,
                bindToArbitraryDomElem : false,
                bindSelector : ctxSelector,
                ctxSelector : ctxSelector,
                key : ''
            };

            if(bindCtx) {
                var typeOfCtx = typeof bindCtx;

                if(bindCtx.jquery) {
                    res.bindDomElem = bindCtx;
                    res.key = identify.apply(null, bindCtx.get());
                    res.bindToArbitraryDomElem = true;
                } else if(bindCtx === winNode || bindCtx === docNode || (typeOfCtx === 'object' && bindCtx.nodeType === 1)) { // NOTE: duck-typing check for "is-DOM-element"
                    res.bindDomElem = $(bindCtx);
                    res.key = identify(bindCtx);
                    res.bindToArbitraryDomElem = true;
                } else if(typeOfCtx === 'object' && bindCtx.__self) { // bem entity instance
                    res.bindDomElem = bindCtx.domElem;
                    res.key = bindCtx._uniqId;
                    res.bindEntityCls = bindCtx.__self;
                } else if(typeOfCtx === 'string' || typeOfCtx === 'object' || typeOfCtx === 'function') {
                    var blockName, elemName, modName, modVal;
                    if(typeOfCtx === 'string') { // elem name
                        blockName = ctxCls._blockName;
                        elemName = bindCtx;
                    } else if(typeOfCtx === 'object') { // bem entity with optional mod val
                        blockName = bindCtx.block?
                            bindCtx.block.getName() :
                            ctxCls._blockName;
                        elemName = typeof bindCtx.elem === 'function'?
                            bindCtx.elem.getName() :
                            bindCtx.elem;
                        modName = bindCtx.modName;
                        modVal = bindCtx.modVal;
                    } else if(bindCtx.getName() === bindCtx.getEntityName()) { // block class
                        blockName = bindCtx.getName();
                    } else { // elem class
                        blockName = ctxCls._blockName;
                        elemName = bindCtx.getName();
                    }

                    var entityName = bemInternal.buildClassName(blockName, elemName);
                    res.bindEntityCls = this._getEntityCls(entityName);
                    res.bindSelector = '.' + (res.key = entityName + bemInternal.buildModPostfix(modName, modVal));
                }
            } else {
                res.bindEntityCls = ctxCls;
            }

            return res;
        },

        _createEventManager : function(ctx, params, isInstance) {
            throw new Error('not implemented');
        }
    });

provide({
    EventManagerFactory : EventManagerFactory
});

});

/* ../../libs/bem-core/common.blocks/i-bem-dom/__events/i-bem-dom__events.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/__collection/i-bem-dom__collection.js begin */
/**
 * @module i-bem-dom__collection
 */
modules.define('i-bem-dom__collection', ['inherit', 'i-bem__collection'], function(provide, inherit, BemCollection) {

/**
 * @class BemDomCollection
 */
var BemDomCollection = inherit(BemCollection, /** @lends BemDomCollection.prototype */{
    /**
     * Finds the first child block for every entities in collection
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findChildBlock : buildProxyMethodForOne('findChildBlock'),

    /**
     * Finds child block for every entities in collections
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findChildBlocks : buildProxyMethodForMany('findChildBlocks'),

    /**
     * Finds the first parent block for every entities in collection
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findParentBlock : buildProxyMethodForOne('findParentBlock'),

    /**
     * Finds parent block for every entities in collections
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findParentBlocks : buildProxyMethodForMany('findParentBlocks'),

    /**
     * Finds first mixed bloc for every entities in collectionk
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findMixedBlock : buildProxyMethodForOne('findMixedBlock'),

    /**
     * Finds mixed block for every entities in collections
     * @param {Function|Object} Block Block class or description (block, modName, modVal) of the block to find
     * @returns {BemDomCollection}
     */
    findMixedBlocks : buildProxyMethodForMany('findMixedBlocks'),

    /**
     * Finds the first child elemen for every entities in collectiont
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {BemDomCollection}
     */
    findChildElem : buildProxyMethodForOne('findChildElem'),

    /**
     * Finds child element for every entities in collections
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {BemDomCollection}
     */
    findChildElems : buildProxyMethodForMany('findChildElems'),

    /**
     * Finds the first parent elemen for every entities in collectiont
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {BemDomCollection}
     */
    findParentElem : buildProxyMethodForOne('findParentElem'),

    /**
     * Finds parent element for every entities in collections
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @param {Boolean} [strictMode=false]
     * @returns {BemDomCollection}
     */
    findParentElems : buildProxyMethodForMany('findParentElems'),

    /**
     * Finds the first mixed elemen for every entities in collectiont
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @returns {BemDomCollection}
     */
    findMixedElem : buildProxyMethodForOne('findMixedElem'),

    /**
     * Finds mixed element for every entities in collections
     * @param {Function|String|Object} Elem Element class or name or description elem, modName, modVal
     * @returns {BemDomCollection}
     */
    findMixedElems : buildProxyMethodForMany('findMixedElems')
});

function collectionMapMethod(collection, methodName, args) {
    return collection.map(function(entity) {
        return entity[methodName].apply(entity, args);
    });
}

function buildProxyMethodForOne(methodName) {
    return function() {
        return new BemDomCollection(collectionMapMethod(this, methodName, arguments));
    };
}

function buildProxyMethodForMany(methodName) {
    return function() {
        var res = [];

        collectionMapMethod(this, methodName, arguments).forEach(function(collection) {
            collection.forEach(function(entity) {
                res.push(entity);
            });
        });

        return new BemDomCollection(res);
    };
}

provide(BemDomCollection);

});

/* ../../libs/bem-core/common.blocks/i-bem-dom/__collection/i-bem-dom__collection.js end */

/* ../../libs/bem-core/common.blocks/i-bem/__collection/i-bem__collection.js begin */
/**
 * @module i-bem__collection
 */
modules.define('i-bem__collection', ['inherit'], function(provide, inherit) {

/**
 * @class BemCollection
 */
var BemCollection = inherit(/** @lends BemCollection.prototype */{
    /**
     * @constructor
     * @param {Array} entities BEM entities
     */
    __constructor : function(entities) {
        var _entities = this._entities = [],
            uniq = {};
        (Array.isArray(entities)? entities : arraySlice.call(arguments)).forEach(function(entity) {
            if(!uniq[entity._uniqId]) {
                uniq[entity._uniqId] = true;
                _entities.push(entity);
            }
        });
    },

    /**
     * Sets the modifier for entities in Collection.
     * @param {String} modName Modifier name
     * @param {String|Boolean} [modVal=true] Modifier value. If not of type String or Boolean, it is casted to String
     * @returns {Collection} this
     */
    setMod : buildForEachEntityMethodProxyFn('setMod'),

    /**
     * Removes the modifier from entities in Collection.
     * @param {String} modName Modifier name
     * @returns {Collection} this
     */
    delMod : buildForEachEntityMethodProxyFn('delMod'),

    /**
     * Sets a modifier for entities in Collection, depending on conditions.
     * If the condition parameter is passed: when true, modVal1 is set; when false, modVal2 is set.
     * If the condition parameter is not passed: modVal1 is set if modVal2 was set, or vice versa.
     * @param {String} modName Modifier name
     * @param {String} modVal1 First modifier value
     * @param {String} [modVal2] Second modifier value
     * @param {Boolean} [condition] Condition
     * @returns {Collection} this
     */
    toggleMod : buildForEachEntityMethodProxyFn('toggleMod'),

    /**
     * Checks whether every entity in Collection has a modifier.
     * @param {String} modName Modifier name
     * @param {String|Boolean} [modVal] Modifier value. If not of type String or Boolean, it is casted to String
     * @returns {Boolean}
     */
    everyHasMod : buildComplexProxyFn('every', 'hasMod'),

    /**
     * Checks whether some entities in Collection has a modifier.
     * @param {String} modName Modifier name
     * @param {String|Boolean} [modVal] Modifier value. If not of type String or Boolean, it is casted to String
     * @returns {Boolean}
     */
    someHasMod : buildComplexProxyFn('some', 'hasMod'),

    /**
     * Returns entity by index.
     * @param {Number} i Index
     * @returns {BemEntity}
     */
    get : function(i) {
        return this._entities[i];
    },

    /**
     * Calls callback once for each entity in collection.
     * @param {Function} fn Callback
     * @param {Object} ctx Callback context
     */
    forEach : buildEntitiesMethodProxyFn('forEach'),

    /**
     * Creates an array with the results of calling callback on every entity in collection.
     * @param {Function} fn Callback
     * @param {Object} ctx Callback context
     * @returns {Array}
     */
    map : buildEntitiesMethodProxyFn('map'),

    /**
     * Applies callback against an accumulator and each entity in collection (from left-to-right)
     * to reduce it to a single value.
     * @param {Function} fn Callback
     * @param {Object} [initial] Initial value
     * @returns {Array}
     */
    reduce : buildEntitiesMethodProxyFn('reduce'),

    /**
     * Applies callback against an accumulator and each entity in collection (from right-to-left)
     * to reduce it to a single value.
     * @param {Function} fn Callback
     * @param {Object} [initial] Initial value
     * @returns {Array}
     */
    reduceRight : buildEntitiesMethodProxyFn('reduceRight'),

    /**
     * Creates a new collection with all entities that pass the test implemented by the provided callback.
     * @param {Function} fn Callback
     * @param {Object} ctx Callback context
     * @returns {Collection}
     */
    filter : function() {
        return new this.__self(buildEntitiesMethodProxyFn('filter').apply(this, arguments));
    },

    /**
     * Tests whether some entities in the collection passes the test implemented by the provided callback.
     * @param {Function} fn Callback
     * @param {Object} ctx Callback context
     * @returns {Boolean}
     */
    some : buildEntitiesMethodProxyFn('some'),

    /**
     * Tests whether every entities in the collection passes the test implemented by the provided callback.
     * @param {Function} fn Callback
     * @param {Object} ctx Callback context
     * @returns {Boolean}
     */
    every : buildEntitiesMethodProxyFn('every'),

    /**
     * Returns a boolean asserting whether an entity is present in the collection.
     * @param {BemEntity} entity BEM entity
     * @returns {Boolean}
     */
    has : function(entity) {
        return this._entities.indexOf(entity) > -1;
    },

    /**
     * Returns an entity, if it satisfies the provided testing callback.
     * @param {Function} fn Callback
     * @param {Object} ctx Callback context
     * @returns {BemEntity}
     */
    find : function(fn, ctx) {
        ctx || (ctx = this);
        var entities = this._entities,
            i = 0,
            entity;

        while(entity = entities[i])
            if(fn.call(ctx, entities[i], i++, this))
                return entity;

        return null;
    },

    /**
     * Returns a new collection comprised of collection on which it is called joined with
     * the collection(s) and/or array(s) and/or entity(es) provided as arguments.
     * @param {?...(Collection|Array|BemEntity)} args
     * @returns {Collection}
     */
    concat : function() {
        var i = 0,
            l = arguments.length,
            arg,
            argsForConcat = [];

        while(i < l) {
            arg = arguments[i++];
            argsForConcat.push(
                arg instanceof BemCollection?  arg._entities : arg);
        }

        return new BemCollection(arrayConcat.apply(this._entities, argsForConcat));
    },

    /**
     * Returns size of the collection.
     * @returns {Number}
     */
    size : function() {
        return this._entities.length;
    },

    /**
     * Converts the collection into array.
     * @returns {Array}
     */
    toArray : function() {
        return this._entities.slice();
    }
});

function buildForEachEntityMethodProxyFn(methodName) {
    return function() {
        var args = arguments;
        this._entities.forEach(function(entity) {
            entity[methodName].apply(entity, args);
        });
        return this;
    };
}

function buildEntitiesMethodProxyFn(methodName) {
    return function() {
        var entities = this._entities;
        return entities[methodName].apply(entities, arguments);
    };
}

function buildComplexProxyFn(arrayMethodName, entityMethodName) {
    return function() {
        var args = arguments;
        return this._entities[arrayMethodName](function(entity) {
            return entity[entityMethodName].apply(entity, args);
        });
    };
}

var arrayConcat = Array.prototype.concat,
    arraySlice = Array.prototype.slice;

provide(BemCollection);

});

/* ../../libs/bem-core/common.blocks/i-bem/__collection/i-bem__collection.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/__events/_type/i-bem-dom__events_type_dom.js begin */
/**
 * @module i-bem-dom__events_type_dom
 */
modules.define(
    'i-bem-dom__events_type_dom',
    [
        'i-bem-dom__events',
        'inherit',
        'jquery'
    ],
    function(
        provide,
        bemDomEvents,
        inherit,
        $) {

var eventBuilder = function(e) {
        return e;
    },
    /**
     * @class EventManagerFactory
     * @augments i-bem-dom__events:EventManagerFactory
     * @exports i-bem-dom__events_type_dom:EventManagerFactory
     */
    EventManagerFactory = inherit(bemDomEvents.EventManagerFactory,/** @lends EventManagerFactory.prototype */{
        /** @override */
        _createEventManager : function(ctx, params, isInstance) {
            function wrapperFn(fn) {
                return function(e) {
                    var instance;

                    if(isInstance) {
                        instance = ctx;
                    } else {
                        // TODO: we could optimize all these "closest" to a single traversing
                        var entityDomNode = $(e.target).closest(params.ctxSelector);
                        entityDomNode.length && (instance = entityDomNode.bem(ctx));
                    }

                    if(instance) {
                        params.bindEntityCls && (e.bemTarget = $(this).bem(params.bindEntityCls));
                        fn.call(instance, e);
                    }
                };
            }

            return new this._eventManagerCls(params, wrapperFn, eventBuilder);
        }
    });

provide({ EventManagerFactory : EventManagerFactory });

});

/* ../../libs/bem-core/common.blocks/i-bem-dom/__events/_type/i-bem-dom__events_type_dom.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/__events/_type/i-bem-dom__events_type_bem.js begin */
/**
 * @module i-bem-dom__events_type_bem
 */
modules.define(
    'i-bem-dom__events_type_bem',
    [
        'i-bem-dom__events',
        'i-bem__internal',
        'inherit',
        'functions',
        'jquery',
        'identify',
        'events'
    ],
    function(
        provide,
        bemDomEvents,
        bemInternal,
        inherit,
        functions,
        $,
        identify,
        events) {

var EVENT_PREFIX = '__bem__',
    MOD_CHANGE_EVENT = 'modchange',

    specialEvents = $.event.special,
    specialEventsStorage = {},

    createSpecialEvent = function(event) {
        return {
            setup : function() {
                specialEventsStorage[event] || (specialEventsStorage[event] = true);
            },
            teardown : functions.noop
        };
    },

    eventBuilder = function(e, params) {
        var event = EVENT_PREFIX + params.bindEntityCls.getEntityName() +
            (typeof e === 'object'?
                e instanceof events.Event?
                    e.type :
                    bemInternal.buildModPostfix(e.modName, e.modVal) :
                e);

        specialEvents[event] ||
            (specialEvents[event] = createSpecialEvent(event));

        return event;
    },

    /**
     * @class EventManagerFactory
     * @augments i-bem-dom__events:EventManagerFactory
     * @exports i-bem-dom__events_type_bem:EventManagerFactory
     */
    EventManagerFactory = inherit(bemDomEvents.EventManagerFactory,/** @lends EventManagerFactory.prototype */{
        /** @override */
        _createEventManager : function(ctx, params, isInstance) {
            function wrapperFn(fn, fnCtx, fnId) {
                return function(e, data, flags, originalEvent) {
                    if(flags.fns[fnId]) return;

                    var instance,
                        instanceDomElem;

                    if(isInstance) {
                        instance = ctx;
                        instanceDomElem = instance.domElem;
                    } else {
                        // TODO: we could optimize all these "closest" to a single traversing
                        instanceDomElem = $(e.target).closest(params.ctxSelector);
                        instanceDomElem.length && (instance = instanceDomElem.bem(ctx));
                    }

                    if(instance &&
                        (!flags.propagationStoppedDomNode ||
                            !$.contains(instanceDomElem[0], flags.propagationStoppedDomNode))) {
                        originalEvent.data = e.data;
                        // TODO: do we really need both target and bemTarget?
                        originalEvent.bemTarget = originalEvent.target;
                        flags.fns[fnId] = true;
                        fn.call(fnCtx || instance, originalEvent, data);

                        if(originalEvent.isPropagationStopped()) {
                            e.stopPropagation();
                            flags.propagationStoppedDomNode = instanceDomElem[0];
                        }
                    }
                };
            }

            return new this._eventManagerCls(params, wrapperFn, eventBuilder);
        }
    });

provide({
    /**
     * @param {BemDomEntity} ctx
     * @param {String|Object|events:Event} e Event name
     * @param {Object} [data]
     */
    emit : function(ctx, e, data) {
        var originalEvent;
        if(typeof e === 'string') {
            originalEvent = new events.Event(e, ctx);
        } else if(e.modName) {
            originalEvent = new events.Event(MOD_CHANGE_EVENT, ctx);
        } else if(!e.target) {
            e.target = ctx;
            originalEvent = e;
        }

        var event = eventBuilder(e, { bindEntityCls : ctx.__self });

        specialEventsStorage[event] &&
            ctx.domElem.trigger(event, [data, { fns : {}, propagationStoppedDomNode : null }, originalEvent]);
    },

    EventManagerFactory : EventManagerFactory
});

});

/* ../../libs/bem-core/common.blocks/i-bem-dom/__events/_type/i-bem-dom__events_type_bem.js end */

/* ../../libs/bem-core/common.blocks/functions/__debounce/functions__debounce.vanilla.js begin */
/**
 * @module functions__debounce
 */

modules.define('functions__debounce', function(provide) {

var global = this.global;

provide(
    /**
     * Debounces given function
     * @exports
     * @param {Function} fn function to debounce
     * @param {Number} timeout debounce interval
     * @param {Boolean} [invokeAsap=false] invoke before first interval
     * @param {Object} [ctx] context of function invocation
     * @returns {Function} debounced function
     */
    function(fn, timeout, invokeAsap, ctx) {
        if(arguments.length === 3 && typeof invokeAsap !== 'boolean') {
            ctx = invokeAsap;
            invokeAsap = false;
        }

        var timer;
        return function() {
            var args = arguments;
            ctx || (ctx = this);

            invokeAsap && !timer && fn.apply(ctx, args);

            global.clearTimeout(timer);

            timer = global.setTimeout(function() {
                invokeAsap || fn.apply(ctx, args);
                timer = null;
            }, timeout);
        };
    });
});

/* ../../libs/bem-core/common.blocks/functions/__debounce/functions__debounce.vanilla.js end */

/* ../../libs/bem-core/common.blocks/functions/__throttle/functions__throttle.vanilla.js begin */
/**
 * @module functions__throttle
 */

modules.define('functions__throttle', function(provide) {

var global = this.global;

provide(
    /**
     * Throttle given function
     * @exports
     * @param {Function} fn function to throttle
     * @param {Number} timeout throttle interval
     * @param {Boolean} [invokeAsap=true] invoke before first interval
     * @param {Object} [ctx] context of function invocation
     * @returns {Function} throttled function
     */
    function(fn, timeout, invokeAsap, ctx) {
        var typeofInvokeAsap = typeof invokeAsap;
        if(typeofInvokeAsap === 'undefined') {
            invokeAsap = true;
        } else if(arguments.length === 3 && typeofInvokeAsap !== 'boolean') {
            ctx = invokeAsap;
            invokeAsap = true;
        }

        var timer, args, needInvoke,
            wrapper = function() {
                if(needInvoke) {
                    fn.apply(ctx, args);
                    needInvoke = false;
                    timer = global.setTimeout(wrapper, timeout);
                } else {
                    timer = null;
                }
            };

        return function() {
            args = arguments;
            ctx || (ctx = this);
            needInvoke = true;

            if(!timer) {
                invokeAsap?
                    wrapper() :
                    timer = global.setTimeout(wrapper, timeout);
            }
        };
    });

});

/* ../../libs/bem-core/common.blocks/functions/__throttle/functions__throttle.vanilla.js end */

/* ../../libs/bem-core/common.blocks/i-bem-dom/__init/_auto/i-bem-dom__init_auto.js begin */
/**
 * Auto initialization on DOM ready
 */

modules.require(
    ['i-bem-dom__init', 'jquery', 'next-tick'],
    function(init, $, nextTick) {

$(function() {
    nextTick(init);
});

});

/* ../../libs/bem-core/common.blocks/i-bem-dom/__init/_auto/i-bem-dom__init_auto.js end */

/* ../../libs/bem-core/common.blocks/idle/idle.js begin */
/**
 * @module idle
 */

modules.define('idle', ['inherit', 'events', 'jquery'], function(provide, inherit, events, $) {

var IDLE_TIMEOUT = 3000,
    USER_EVENTS = 'mousemove keydown click',
    /**
     * @class Idle
     * @augments events:Emitter
     */
    Idle = inherit(events.Emitter, /** @lends Idle.prototype */{
        /**
         * @constructor
         */
        __constructor : function() {
            this._timer = null;
            this._isStarted = false;
            this._isIdle = false;
        },

        /**
         * Starts monitoring of idle state
         */
        start : function() {
            if(!this._isStarted) {
                this._isStarted = true;
                this._startTimer();
                $(document).on(USER_EVENTS, $.proxy(this._onUserAction, this));
            }
        },

        /**
         * Stops monitoring of idle state
         */
        stop : function() {
            if(this._isStarted) {
                this._isStarted = false;
                this._stopTimer();
                $(document).off(USER_EVENTS, this._onUserAction);
            }
        },

        /**
         * Returns whether state is idle
         * @returns {Boolean}
         */
        isIdle : function() {
            return this._isIdle;
        },

        _onUserAction : function() {
            if(this._isIdle) {
                this._isIdle = false;
                this.emit('wakeup');
            }

            this._stopTimer();
            this._startTimer();
        },

        _startTimer : function() {
            var _this = this;
            this._timer = setTimeout(
                function() {
                    _this._onTimeout();
                },
                IDLE_TIMEOUT);
        },

        _stopTimer : function() {
            this._timer && clearTimeout(this._timer);
        },

        _onTimeout : function() {
            this._isIdle = true;
            this.emit('idle');
        }
    });

provide(
    /**
     * @exports
     * @type Idle
     */
    new Idle());

});

/* ../../libs/bem-core/common.blocks/idle/idle.js end */

/* ../../libs/bem-core/common.blocks/idle/_start/idle_start_auto.js begin */
/**
 * Automatically starts idle module
 */

modules.require(['idle'], function(idle) {

idle.start();

});

/* ../../libs/bem-core/common.blocks/idle/_start/idle_start_auto.js end */

/* ../../libs/bem-core/common.blocks/jquery/__event/_type/jquery__event_type_pointerclick.js begin */
modules.define('jquery', ['next-tick'], function(provide, nextTick, $) {

var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    event = $.event.special.pointerclick = {
        setup : function() {
            if(isIOS) {
                $(this)
                    .on('pointerdown', event.onPointerdown)
                    .on('pointerup', event.onPointerup)
                    .on('pointerleave pointercancel', event.onPointerleave);
            } else {
                $(this).on('click', event.handler);
            }
        },

        teardown : function() {
            if(isIOS) {
                $(this)
                    .off('pointerdown', event.onPointerdown)
                    .off('pointerup', event.onPointerup)
                    .off('pointerleave pointercancel', event.onPointerleave);
            } else {
                $(this).off('click', event.handler);
            }
        },

        handler : function(e) {
            if(!e.button) {
                var type = e.type;
                e.type = 'pointerclick';
                $.event.dispatch.apply(this, arguments);
                e.type = type;
            }
        },

        onPointerdown : function(e) {
            pointerdownEvent = e;
        },

        onPointerleave : function() {
            pointerdownEvent = null;
        },

        onPointerup : function(e) {
            if(!pointerdownEvent) return;

            if(!pointerDownUpInProgress) {
                nextTick(function() {
                    pointerDownUpInProgress = false;
                    pointerdownEvent = null;
                });
                pointerDownUpInProgress = true;
            }

            event.handler.apply(this, arguments);
        }
    },
    pointerDownUpInProgress = false,
    pointerdownEvent;

provide($);

});

/* ../../libs/bem-core/common.blocks/jquery/__event/_type/jquery__event_type_pointerclick.js end */

/* ../../libs/bem-core/common.blocks/jquery/__event/_type/jquery__event_type_pointernative.js begin */
;(function(global, factory) {

if(typeof modules === 'object' && modules.isDefined('jquery')) {
    modules.define('jquery', function(provide, $) {
        factory(this.global, $);
        provide($);
    });
} else if(typeof jQuery === 'function') {
    factory(global, jQuery);
}

}(this, function(window, $) {

var jqEvent = $.event;

// NOTE: Remove jQuery special fixes for pointerevents – we fix them ourself
delete jqEvent.special.pointerenter;
delete jqEvent.special.pointerleave;

if(window.PointerEvent) {
    // Have native PointerEvent support, nothing to do than
    return;
}

/*!
 * Most of source code is taken from PointerEvents Polyfill
 * written by Polymer Team (https://github.com/Polymer/PointerEvents)
 * and licensed under the BSD License.
 */

var doc = document,
    HAS_BITMAP_TYPE = window.MSPointerEvent && typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number',
    undef;

/*!
 * Returns a snapshot of the event, with writable properties.
 *
 * @param {Event} event An event that contains properties to copy.
 * @returns {Object} An object containing shallow copies of `inEvent`'s
 *    properties.
 */
function cloneEvent(event) {
    var eventCopy = $.extend(new $.Event(), event);
    if(event.preventDefault) {
        eventCopy.preventDefault = function() {
            event.preventDefault();
        };
    }
    return eventCopy;
}

/*!
 * Dispatches the event to the target, taking event's bubbling into account.
 */
function dispatchEvent(event, target) {
    return event.bubbles?
        jqEvent.trigger(event, null, target) :
        jqEvent.dispatch.call(target, event);
}

var MOUSE_PROPS = {
        bubbles : false,
        cancelable : false,
        view : null,
        detail : null,
        screenX : 0,
        screenY : 0,
        clientX : 0,
        clientY : 0,
        ctrlKey : false,
        altKey : false,
        shiftKey : false,
        metaKey : false,
        button : 0,
        relatedTarget : null,
        pageX : 0,
        pageY : 0
    },
    mouseProps = Object.keys(MOUSE_PROPS),
    mousePropsLen = mouseProps.length,
    mouseDefaults = mouseProps.map(function(prop) { return MOUSE_PROPS[prop] });

/*!
 * Pointer event constructor
 *
 * @param {String} type
 * @param {Object} [params]
 * @returns {Event}
 * @constructor
 */
function PointerEvent(type, params) {
    params || (params = {});

    var e = $.Event(type);

    // define inherited MouseEvent properties
    for(var i = 0, p; i < mousePropsLen; i++) {
        p = mouseProps[i];
        e[p] = params[p] || mouseDefaults[i];
    }

    e.buttons = params.buttons || 0;

    // add x/y properties aliased to clientX/Y
    e.x = e.clientX;
    e.y = e.clientY;

    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;
    if(params.pressure) {
        pressure = params.pressure;
    } else {
        pressure = e.buttons? 0.5 : 0;
    }

    // define the properties of the PointerEvent interface
    e.pointerId = params.pointerId || 0;
    e.width = params.width || 0;
    e.height = params.height || 0;
    e.pressure = pressure;
    e.tiltX = params.tiltX || 0;
    e.tiltY = params.tiltY || 0;
    e.pointerType = params.pointerType || '';
    e.hwTimestamp = params.hwTimestamp || 0;
    e.isPrimary = params.isPrimary || false;

    // add some common jQuery properties
    e.which = typeof params.which === 'undefined'? 1 : params.which;

    return e;
}

function SparseArrayMap() {
    this.array = [];
    this.size = 0;
}

SparseArrayMap.prototype = {
    set : function(k, v) {
        if(v === undef) {
            return this['delete'](k);
        }
        if(!this.has(k)) {
            this.size++;
        }
        this.array[k] = v;
    },

    has : function(k) {
        return this.array[k] !== undef;
    },

    'delete' : function(k) {
        if(this.has(k)){
            delete this.array[k];
            this.size--;
        }
    },

    get : function(k) {
        return this.array[k];
    },

    clear : function() {
        this.array.length = 0;
        this.size = 0;
    },

    // return value, key, map
    forEach : function(callback, ctx) {
        return this.array.forEach(function(v, k) {
            callback.call(ctx, v, k, this);
        }, this);
    }
};

// jscs:disable requireMultipleVarDecl
var PointerMap = window.Map && window.Map.prototype.forEach? Map : SparseArrayMap,
    pointerMap = new PointerMap();

var dispatcher = {
    eventMap : {},
    eventSourceList : [],

    /*!
     * Add a new event source that will generate pointer events
     */
    registerSource : function(name, source) {
        var newEvents = source.events;
        if(newEvents) {
            newEvents.forEach(function(e) {
                source[e] && (this.eventMap[e] = function() { source[e].apply(source, arguments) });
            }, this);
            this.eventSourceList.push(source);
        }
    },

    register : function(element) {
        var len = this.eventSourceList.length;
        for(var i = 0, es; (i < len) && (es = this.eventSourceList[i]); i++) {
            // call eventsource register
            es.register.call(es, element);
        }
    },

    unregister : function(element) {
        var l = this.eventSourceList.length;
        for(var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
            // call eventsource register
            es.unregister.call(es, element);
        }
    },

    down : function(event) {
        event.bubbles = true;
        this.fireEvent('pointerdown', event);
    },

    move : function(event) {
        event.bubbles = true;
        this.fireEvent('pointermove', event);
    },

    up : function(event) {
        event.bubbles = true;
        this.fireEvent('pointerup', event);
    },

    enter : function(event) {
        event.bubbles = false;
        this.fireEvent('pointerenter', event);
    },

    leave : function(event) {
        event.bubbles = false;
        this.fireEvent('pointerleave', event);
    },

    over : function(event) {
        event.bubbles = true;
        this.fireEvent('pointerover', event);
    },

    out : function(event) {
        event.bubbles = true;
        this.fireEvent('pointerout', event);
    },

    cancel : function(event) {
        event.bubbles = true;
        this.fireEvent('pointercancel', event);
    },

    leaveOut : function(event) {
        this.out(event);
        this.enterLeave(event, this.leave);
    },

    enterOver : function(event) {
        this.over(event);
        this.enterLeave(event, this.enter);
    },

    enterLeave : function(event, fn) {
        var target = event.target,
            relatedTarget = event.relatedTarget;

        if(!this.contains(target, relatedTarget)) {
            while(target && target !== relatedTarget) {
                event.target = target;
                fn.call(this, event);

                target = target.parentNode;
            }
        }
    },

    contains : function(target, relatedTarget) {
        return target === relatedTarget || $.contains(target, relatedTarget);
    },

    // LISTENER LOGIC
    eventHandler : function(e) {
        // This is used to prevent multiple dispatch of pointerevents from
        // platform events. This can happen when two elements in different scopes
        // are set up to create pointer events, which is relevant to Shadow DOM.
        if(e._handledByPE) {
            return;
        }

        var type = e.type, fn;
        (fn = this.eventMap && this.eventMap[type]) && fn(e);

        e._handledByPE = true;
    },

    /*!
     * Sets up event listeners
     */
    listen : function(target, events) {
        events.forEach(function(e) {
            this.addEvent(target, e);
        }, this);
    },

    /*!
     * Removes event listeners
     */
    unlisten : function(target, events) {
        events.forEach(function(e) {
            this.removeEvent(target, e);
        }, this);
    },

    addEvent : function(target, eventName) {
        $(target).on(eventName, boundHandler);
    },

    removeEvent : function(target, eventName) {
        $(target).off(eventName, boundHandler);
    },

    getTarget : function(event) {
        return event._target;
    },

    /*!
     * Creates a new Event of type `type`, based on the information in `event`
     */
    makeEvent : function(type, event) {
        var e = new PointerEvent(type, event);
        if(event.preventDefault) {
            e.preventDefault = event.preventDefault;
        }

        e._target = e._target || event.target;

        return e;
    },

    /*!
     * Dispatches the event to its target
     */
    dispatchEvent : function(event) {
        var target = this.getTarget(event);
        if(target) {
            if(!event.target) {
                event.target = target;
            }

            return dispatchEvent(event, target);
        }
    },

    /*!
     * Makes and dispatch an event in one call
     */
    fireEvent : function(type, event) {
        var e = this.makeEvent(type, event);
        return this.dispatchEvent(e);
    }
};

function boundHandler() {
    dispatcher.eventHandler.apply(dispatcher, arguments);
}

var CLICK_COUNT_TIMEOUT = 200,
    // Radius around touchend that swallows mouse events
    MOUSE_DEDUP_DIST = 25,
    MOUSE_POINTER_ID = 1,
    // This should be long enough to ignore compat mouse events made by touch
    TOUCH_DEDUP_TIMEOUT = 2500,
    // A distance for which touchmove should fire pointercancel event
    TOUCHMOVE_HYSTERESIS = 20;

// handler block for native mouse events
var mouseEvents = {
    POINTER_TYPE : 'mouse',
    events : [
        'mousedown',
        'mousemove',
        'mouseup',
        'mouseover',
        'mouseout'
    ],

    register : function(target) {
        dispatcher.listen(target, this.events);
    },

    unregister : function(target) {
        dispatcher.unlisten(target, this.events);
    },

    lastTouches : [],

    // collide with the global mouse listener
    isEventSimulatedFromTouch : function(event) {
        var lts = this.lastTouches,
            x = event.clientX,
            y = event.clientY;

        for(var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
            // simulated mouse events will be swallowed near a primary touchend
            var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
            if(dx <= MOUSE_DEDUP_DIST && dy <= MOUSE_DEDUP_DIST) {
                return true;
            }
        }
    },

    prepareEvent : function(event) {
        var e = cloneEvent(event);
        e.pointerId = MOUSE_POINTER_ID;
        e.isPrimary = true;
        e.pointerType = this.POINTER_TYPE;
        return e;
    },

    mousedown : function(event) {
        if(!this.isEventSimulatedFromTouch(event)) {
            if(pointerMap.has(MOUSE_POINTER_ID)) {
                // http://crbug/149091
                this.cancel(event);
            }

            pointerMap.set(MOUSE_POINTER_ID, event);

            var e = this.prepareEvent(event);
            dispatcher.down(e);
        }
    },

    mousemove : function(event) {
        if(!this.isEventSimulatedFromTouch(event)) {
            var e = this.prepareEvent(event);
            dispatcher.move(e);
        }
    },

    mouseup : function(event) {
        if(!this.isEventSimulatedFromTouch(event)) {
            var p = pointerMap.get(MOUSE_POINTER_ID);
            if(p && p.button === event.button) {
                var e = this.prepareEvent(event);
                dispatcher.up(e);
                this.cleanupMouse();
            }
        }
    },

    mouseover : function(event) {
        if(!this.isEventSimulatedFromTouch(event)) {
            var e = this.prepareEvent(event);
            dispatcher.enterOver(e);
        }
    },

    mouseout : function(event) {
        if(!this.isEventSimulatedFromTouch(event)) {
            var e = this.prepareEvent(event);
            dispatcher.leaveOut(e);
        }
    },

    cancel : function(inEvent) {
        var e = this.prepareEvent(inEvent);
        dispatcher.cancel(e);
        this.cleanupMouse();
    },

    cleanupMouse : function() {
        pointerMap['delete'](MOUSE_POINTER_ID);
    }
};

var touchEvents = {
    events : [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel'
    ],

    register : function(target) {
        dispatcher.listen(target, this.events);
    },

    unregister : function(target) {
        dispatcher.unlisten(target, this.events);
    },

    POINTER_TYPE : 'touch',
    clickCount : 0,
    resetId : null,
    firstTouch : null,

    isPrimaryTouch : function(touch) {
        return this.firstTouch === touch.identifier;
    },

    /*!
     * Sets primary touch if there no pointers, or the only pointer is the mouse
     */
    setPrimaryTouch : function(touch) {
        if(pointerMap.size === 0 ||
                (pointerMap.size === 1 && pointerMap.has(MOUSE_POINTER_ID))) {
            this.firstTouch = touch.identifier;
            this.firstXY = { X : touch.clientX, Y : touch.clientY };
            this.scrolling = null;

            this.cancelResetClickCount();
        }
    },

    removePrimaryPointer : function(pointer) {
        if(pointer.isPrimary) {
            this.firstTouch = null;
            // TODO(@narqo): It seems that, flushing `firstXY` flag explicitly in `touchmove` handler is enough.
            // Original code from polymer doing `this.firstXY = null` on every `removePrimaryPointer` call, but looks
            // like it is harmful in some of our usecases.
            this.resetClickCount();
        }
    },

    resetClickCount : function() {
        var _this = this;
        this.resetId = setTimeout(function() {
            _this.clickCount = 0;
            _this.resetId = null;
        }, CLICK_COUNT_TIMEOUT);
    },

    cancelResetClickCount : function() {
        this.resetId && clearTimeout(this.resetId);
    },

    typeToButtons : function(type) {
        return type === 'touchstart' || type === 'touchmove'? 1 : 0;
    },

    findTarget : function(event) {
        // Currently we don't interested in shadow dom handling
        return doc.elementFromPoint(event.clientX, event.clientY);
    },

    touchToPointer : function(touch) {
        var cte = this.currentTouchEvent,
            e = cloneEvent(touch);

        // Spec specifies that pointerId 1 is reserved for Mouse.
        // Touch identifiers can start at 0.
        // Add 2 to the touch identifier for compatibility.
        e.pointerId = touch.identifier + 2;
        e.target = this.findTarget(e);
        e.bubbles = true;
        e.cancelable = true;
        e.detail = this.clickCount;
        e.button = 0;
        e.buttons = this.typeToButtons(cte.type);
        e.width = touch.webkitRadiusX || touch.radiusX || 0;
        e.height = touch.webkitRadiusY || touch.radiusY || 0;
        e.pressure = touch.mozPressure || touch.webkitForce || touch.force || 0.5;
        e.isPrimary = this.isPrimaryTouch(touch);
        e.pointerType = this.POINTER_TYPE;

        // forward touch preventDefaults
        var _this = this;
        e.preventDefault = function() {
            _this.scrolling = false;
            _this.firstXY = null;
            cte.preventDefault();
        };

        return e;
    },

    processTouches : function(event, fn) {
        var tl = event.originalEvent.changedTouches;
        this.currentTouchEvent = event;
        for(var i = 0, t; i < tl.length; i++) {
            t = tl[i];
            fn.call(this, this.touchToPointer(t));
        }
    },

    shouldScroll : function(touchEvent) {
        // return "true" for things to be much easier
        return true;
    },

    findTouch : function(touches, pointerId) {
        for(var i = 0, l = touches.length, t; i < l && (t = touches[i]); i++) {
            if(t.identifier === pointerId) {
                return true;
            }
        }
    },

    /*!
     * In some instances, a touchstart can happen without a touchend.
     * This leaves the pointermap in a broken state.
     * Therefore, on every touchstart, we remove the touches
     * that did not fire a touchend event.
     *
     * To keep state globally consistent, we fire a pointercancel
     * for this "abandoned" touch
     */
    vacuumTouches : function(touchEvent) {
        var touches = touchEvent.touches;
        // `pointermap.size` should be less than length of touches here, as the touchstart has not
        // been processed yet.
        if(pointerMap.size >= touches.length) {
            var d = [];

            pointerMap.forEach(function(pointer, pointerId) {
                // Never remove pointerId == 1, which is mouse.
                // Touch identifiers are 2 smaller than their pointerId, which is the
                // index in pointermap.
                if(pointerId === MOUSE_POINTER_ID || this.findTouch(touches, pointerId - 2)) return;
                d.push(pointer.outEvent);
            }, this);

            d.forEach(this.cancelOut, this);
        }
    },

    /*!
     * Prevents synth mouse events from creating pointer events
     */
    dedupSynthMouse : function(touchEvent) {
        var lts = mouseEvents.lastTouches,
            t = touchEvent.changedTouches[0];

        // only the primary finger will synth mouse events
        if(this.isPrimaryTouch(t)) {
            // remember x/y of last touch
            var lt = { x : t.clientX, y : t.clientY };
            lts.push(lt);

            setTimeout(function() {
                var i = lts.indexOf(lt);
                i > -1 && lts.splice(i, 1);
            }, TOUCH_DEDUP_TIMEOUT);
        }
    },

    touchstart : function(event) {
        var touchEvent = event.originalEvent;

        this.vacuumTouches(touchEvent);
        this.setPrimaryTouch(touchEvent.changedTouches[0]);
        this.dedupSynthMouse(touchEvent);

        if(!this.scrolling) {
            this.clickCount++;
            this.processTouches(event, this.overDown);
        }
    },

    touchmove : function(event) {
        var touchEvent = event.originalEvent;
        if(!this.scrolling) {
            if(this.scrolling === null && this.shouldScroll(touchEvent)) {
                this.scrolling = true;
            } else {
                event.preventDefault();
                this.processTouches(event, this.moveOverOut);
            }
        } else if(this.firstXY) {
            var firstXY = this.firstXY,
                touch = touchEvent.changedTouches[0],
                dx = touch.clientX - firstXY.X,
                dy = touch.clientY - firstXY.Y,
                dd = Math.sqrt(dx * dx + dy * dy);
            if(dd >= TOUCHMOVE_HYSTERESIS) {
                this.touchcancel(event);
                this.scrolling = true;
                this.firstXY = null;
            }
        }
    },

    touchend : function(event) {
        var touchEvent = event.originalEvent;
        this.dedupSynthMouse(touchEvent);
        this.processTouches(event, this.upOut);
    },

    touchcancel : function(event) {
        this.processTouches(event, this.cancelOut);
    },

    overDown : function(pEvent) {
        var target = pEvent.target;
        pointerMap.set(pEvent.pointerId, {
            target : target,
            outTarget : target,
            outEvent : pEvent
        });
        dispatcher.over(pEvent);
        dispatcher.enter(pEvent);
        dispatcher.down(pEvent);
    },

    moveOverOut : function(pEvent) {
        var pointer = pointerMap.get(pEvent.pointerId);

        // a finger drifted off the screen, ignore it
        if(!pointer) {
            return;
        }

        dispatcher.move(pEvent);

        var outEvent = pointer.outEvent,
            outTarget = pointer.outTarget;

        if(outEvent && outTarget !== pEvent.target) {
            pEvent.relatedTarget = outTarget;
            outEvent.relatedTarget = pEvent.target;
            // recover from retargeting by shadow
            outEvent.target = outTarget;

            if(pEvent.target) {
                dispatcher.leaveOut(outEvent);
                dispatcher.enterOver(pEvent);
            } else {
                // clean up case when finger leaves the screen
                pEvent.target = outTarget;
                pEvent.relatedTarget = null;
                this.cancelOut(pEvent);
            }
        }

        pointer.outEvent = pEvent;
        pointer.outTarget = pEvent.target;
    },

    upOut : function(pEvent) {
        dispatcher.up(pEvent);
        dispatcher.out(pEvent);
        dispatcher.leave(pEvent);

        this.cleanUpPointer(pEvent);
    },

    cancelOut : function(pEvent) {
        dispatcher.cancel(pEvent);
        dispatcher.out(pEvent);
        dispatcher.leave(pEvent);
        this.cleanUpPointer(pEvent);
    },

    cleanUpPointer : function(pEvent) {
        pointerMap['delete'](pEvent.pointerId);
        this.removePrimaryPointer(pEvent);
    }
};

var msEvents = {
    events : [
        'MSPointerDown',
        'MSPointerMove',
        'MSPointerUp',
        'MSPointerOut',
        'MSPointerOver',
        'MSPointerCancel'
    ],

    register : function(target) {
        dispatcher.listen(target, this.events);
    },

    unregister : function(target) {
        dispatcher.unlisten(target, this.events);
    },

    POINTER_TYPES : [
        '',
        'unavailable',
        'touch',
        'pen',
        'mouse'
    ],

    prepareEvent : function(event) {
        var e = cloneEvent(event);
        HAS_BITMAP_TYPE && (e.pointerType = this.POINTER_TYPES[event.pointerType]);
        return e;
    },

    MSPointerDown : function(event) {
        pointerMap.set(event.pointerId, event);
        var e = this.prepareEvent(event);
        dispatcher.down(e);
    },

    MSPointerMove : function(event) {
        var e = this.prepareEvent(event);
        dispatcher.move(e);
    },

    MSPointerUp : function(event) {
        var e = this.prepareEvent(event);
        dispatcher.up(e);
        this.cleanup(event.pointerId);
    },

    MSPointerOut : function(event) {
        var e = this.prepareEvent(event);
        dispatcher.leaveOut(e);
    },

    MSPointerOver : function(event) {
        var e = this.prepareEvent(event);
        dispatcher.enterOver(e);
    },

    MSPointerCancel : function(event) {
        var e = this.prepareEvent(event);
        dispatcher.cancel(e);
        this.cleanup(event.pointerId);
    },

    cleanup : function(id) {
        pointerMap['delete'](id);
    }
};

var navigator = window.navigator;
if(navigator.msPointerEnabled) {
    dispatcher.registerSource('ms', msEvents);
} else {
    dispatcher.registerSource('mouse', mouseEvents);
    if(typeof window.ontouchstart !== 'undefined') {
        dispatcher.registerSource('touch', touchEvents);
    }
}

dispatcher.register(doc);

}));

/* ../../libs/bem-core/common.blocks/jquery/__event/_type/jquery__event_type_pointernative.js end */

/* ../../libs/bem-core/common.blocks/jquery/__event/_type/jquery__event_type_pointerpressrelease.js begin */
modules.define('jquery', function(provide, $) {

$.each({
    pointerpress : 'pointerdown',
    pointerrelease : 'pointerup pointercancel'
}, function(fix, origEvent) {
    function eventHandler(e) {
        if(e.which === 1) {
            var fixedEvent = cloneEvent(e);
            fixedEvent.type = fix;
            fixedEvent.originalEvent = e;
            return $.event.dispatch.call(this, fixedEvent);
        }
    }

    $.event.special[fix] = {
        setup : function() {
            $(this).on(origEvent, eventHandler);
            return false;
        },
        teardown : function() {
            $(this).off(origEvent, eventHandler);
            return false;
        }
    };
});

function cloneEvent(event) {
    var eventCopy = $.extend(new $.Event(), event);
    if(event.preventDefault) {
        eventCopy.preventDefault = function() {
            event.preventDefault();
        };
    }
    return eventCopy;
}

provide($);

});

/* ../../libs/bem-core/common.blocks/jquery/__event/_type/jquery__event_type_pointerpressrelease.js end */

/* ../../libs/bem-core/common.blocks/keyboard/__codes/keyboard__codes.js begin */
/**
 * @module keyboard__codes
 */
modules.define('keyboard__codes', function(provide) {

provide(/** @exports */{
    /** @type {Number} */
    BACKSPACE : 8,
    /** @type {Number} */
    TAB : 9,
    /** @type {Number} */
    ENTER : 13,
    /** @type {Number} */
    CAPS_LOCK : 20,
    /** @type {Number} */
    ESC : 27,
    /** @type {Number} */
    SPACE : 32,
    /** @type {Number} */
    PAGE_UP : 33,
    /** @type {Number} */
    PAGE_DOWN : 34,
    /** @type {Number} */
    END : 35,
    /** @type {Number} */
    HOME : 36,
    /** @type {Number} */
    LEFT : 37,
    /** @type {Number} */
    UP : 38,
    /** @type {Number} */
    RIGHT : 39,
    /** @type {Number} */
    DOWN : 40,
    /** @type {Number} */
    INSERT : 45,
    /** @type {Number} */
    DELETE : 46
});

});

/* ../../libs/bem-core/common.blocks/keyboard/__codes/keyboard__codes.js end */

/* ../../libs/bem-core/common.blocks/loader/_type/loader_type_bundle.js begin */
/**
 * @module loader_type_bundle
 * @description Load BEM bundle (JS+CSS) from external URL.
 */

modules.define('loader_type_bundle', function(provide) {

var LOADING_TIMEOUT = 30000,
    global = this.global,
    doc = document,
    head,
    bundles = {},

    handleError = function(bundleId) {
        var bundleDesc = bundles[bundleId];

        if(!bundleDesc) return;

        var fns = bundleDesc.errorFns,
            fn;

        clearTimeout(bundleDesc.timer);

        while(fn = fns.shift()) fn();
        delete bundles[bundleId];
    },

    appendCss = function(css) {
        var style = doc.createElement('style');
        style.type = 'text/css';
        head.appendChild(style); // ie needs to insert style before setting content
        style.styleSheet?
            style.styleSheet.cssText = css :
            style.appendChild(doc.createTextNode(css));
    },

    /**
     * Loads bundle
     * @exports
     * @param {String} id
     * @param {String} url
     * @param {Function} onSuccess
     * @param {Function} [onError]
     */
    load = function(id, url, onSuccess, onError) {
        var bundle = bundles[id];
        if(bundle) {
            if(bundle.successFns) { // bundle is being loaded
                bundle.successFns.push(onSuccess);
                onError && bundle.errorFns.push(onError);
            } else { // bundle was loaded before
                setTimeout(onSuccess, 0);
            }
            return;
        }

        var script = doc.createElement('script'),
            errorFn = function() {
                handleError(id);
            };

        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = url;
        script.onerror = errorFn; // for browsers that support
        setTimeout(function() {
            (head || (head = doc.getElementsByTagName('head')[0])).insertBefore(script, head.firstChild);
        }, 0);

        bundles[id] = {
            successFns : [onSuccess],
            errorFns : onError? [onError] : [],
            timer : setTimeout(errorFn, LOADING_TIMEOUT)
        };
    };

load._loaded = function(bundle) {
    var bundleDesc = bundles[bundle.id];

    if(!bundleDesc) return;

    clearTimeout(bundleDesc.timer);

    bundle.js && bundle.js.call(global);

    bundle.css && appendCss(bundle.css);

    if(bundle.hcss) {
        var styles = [],
            _ycssjs = window._ycssjs;

        bundle.hcss.forEach(function(hsh) {
            if(_ycssjs) {
                if(hsh[0] in _ycssjs) return;
                _ycssjs(hsh[0]);
            }

            styles.push(hsh[1]);
        });

        styles.length && appendCss(styles.join(''));
    }

    function onSuccess() {
        var fns = bundleDesc.successFns, fn;
        while(fn = fns.shift()) fn();
        delete bundleDesc.successFns;
    }

    modules.isDefined('i-bem__dom_init')?
        modules.require(['i-bem__dom_init'], onSuccess) :
        onSuccess();
};

provide(load);

});

/* ../../libs/bem-core/common.blocks/loader/_type/loader_type_bundle.js end */

/* ../../libs/bem-core/touch.blocks/ua/ua.js begin */
/**
 * @module ua
 * @description Detect some user agent features
 */

modules.define('ua', ['jquery'], function(provide, $) {

var win = window,
    doc = document,
    ua = navigator.userAgent,
    platform = {},
    device = {},
    match;

if(match = ua.match(/Android\s+([\d.]+)/)) {
    platform.android = match[1];
} else if(ua.match(/\sHTC[\s_].*AppleWebKit/)) {
    // фэйковый десктопный UA по умолчанию у некоторых HTC (например, HTC Sensation)
    platform.android = '2.3';
} else if(match = ua.match(/iPhone\sOS\s([\d_]+)/)) {
    platform.ios = match[1].replace(/_/g, '.');
    device.iphone = true;
} else if(match = ua.match(/iPad.*OS\s([\d_]+)/)) {
    platform.ios = match[1].replace(/_/g, '.');
    device.ipad = true;
} else if(match = ua.match(/Bada\/([\d.]+)/)) {
    platform.bada = match[1];
} else if(match = ua.match(/Windows\sPhone.*\s([\d.]+)/)) {
    platform.wp = match[1];
} else {
    platform.other = true;
}

var browser = {};
if(win.opera) {
    browser.opera = win.opera.version();
} else if(match = ua.match(/\sCrMo\/([\d.]+)/)) {
    browser.chrome = match[1];
}

var support = {},
    connection = navigator.connection;

if(connection) {
    var connections = {};
    connections[connection.ETHERNET] = connections[connection.WIFI] = 'wifi';
    connections[connection.CELL_3G] = '3g';
    connections[connection.CELL_2G] = '2g';
    support.connection = connections[connection.type];
}

var videoElem = doc.createElement('video');
support.video = !!(videoElem.canPlayType && videoElem.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));

support.svg = !!(doc.createElementNS && doc.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);

var plugins = navigator.plugins,
    i = plugins.length;
if(plugins && i) {
    var plugin;
    while(plugin = plugins[--i])
        if(plugin.name === 'Shockwave Flash' && (match = plugin.description.match(/Flash ([\d.]+)/))) {
            support.flash = match[1];
            break;
        }
}

// http://stackoverflow.com/a/6603537
var lastOrient = win.innerWidth > win.innerHeight,
    lastWidth = win.innerWidth,
    $win = $(win).bind('resize', function() {
        var width = win.innerWidth,
            height = win.innerHeight,
            landscape = width > height;

        // http://alxgbsn.co.uk/2012/08/27/trouble-with-web-browser-orientation/
        // check previous device width to disallow Android shrink page and change orientation on opening software keyboard
        if(landscape !== lastOrient && width !== lastWidth) {
            $win.trigger('orientchange', {
                landscape : landscape,
                width : width,
                height : height
            });

            lastOrient = landscape;
            lastWidth = width;
        }
    });

provide(/** @exports */{
    /**
     * User agent
     * @type String
     */
    ua : ua,

    /**
     * iOS version
     * @type String|undefined
     */
    ios : platform.ios,

    /**
     * Is iPhone
     * @type Boolean|undefined
     */
    iphone : device.iphone,

    /**
     * Is iPad
     * @type Boolean|undefined
     */
    ipad : device.ipad,

    /**
     * Android version
     * @type String|undefined
     */
    android : platform.android,

    /**
     * Bada version
     * @type String|undefined
     */
    bada : platform.bada,

    /**
     * Windows Phone version
     * @type String|undefined
     */
    wp : platform.wp,

    /**
     * Undetected platform
     * @type Boolean|undefined
     */
    other : platform.other,

    /**
     * Opera version
     * @type String|undefined
     */
    opera : browser.opera,

    /**
     * Chrome version
     * @type String|undefined
     */
    chrome : browser.chrome,

    /**
     * Screen size, one of: large, normal, small
     * @type String
     */
    screenSize : screen.width > 320? 'large' : screen.width < 320? 'small' : 'normal',

    /**
     * Device pixel ratio
     * @type Number
     */
    dpr : win.devicePixelRatio || 1,

    /**
     * Connection type, one of: wifi, 3g, 2g
     * @type String
     */
    connection : support.connection,

    /**
     * Flash version
     * @type String|undefined
     */
    flash : support.flash,

    /**
     * Is video supported?
     * @type Boolean
     */
    video : support.video,

    /**
     * Is SVG supported?
     * @type Boolean
     */
    svg : support.svg,

    /**
     * Viewport width
     * @type Number
     */
    width : win.innerWidth,

    /**
     * Viewport height
     * @type Number
     */
    height : win.innerHeight,

    /**
     * Is landscape oriented?
     * @type Boolean
     */
    landscape : lastOrient
});

});

/* ../../libs/bem-core/touch.blocks/ua/ua.js end */

/* ../../libs/bem-core/touch.blocks/ua/__dom/ua__dom.js begin */
/**
 * @module ua
 * @description Use ua module to provide user agent features by modifiers and update some on orient change
 */
modules.define('ua', ['i-bem-dom'], function(provide, bemDom, ua) {

provide(/** @exports */bemDom.declBlock(this.name,
    {
        onSetMod : {
            'js' : {
                'inited' : function() {
                    this
                        .setMod('platform',
                            ua.ios? 'ios' :
                                ua.android? 'android' :
                                    ua.bada? 'bada' :
                                        ua.wp? 'wp' :
                                            ua.opera? 'opera' :
                                                'other')
                        .setMod('browser',
                            ua.opera? 'opera' :
                                ua.chrome? 'chrome' :
                                    '')
                        .setMod('ios', ua.ios? ua.ios.charAt(0) : '')
                        .setMod('android', ua.android? ua.android.charAt(0) : '')
                        .setMod('ios-subversion', ua.ios? ua.ios.match(/(\d\.\d)/)[1].replace('.', '') : '')
                        .setMod('screen-size', ua.screenSize)
                        .setMod('svg', ua.svg? 'yes' : 'no')
                        .setMod('orient', ua.landscape? 'landscape' : 'portrait')
                        .bindToWin(
                            'orientchange',
                            function(e, data) {
                                ua.width = data.width;
                                ua.height = data.height;
                                ua.landscape = data.landscape;
                                this.setMod('orient', data.landscape? 'landscape' : 'portrait');
                            });
                }
            }
        }
    },
    ua));

});

/* ../../libs/bem-core/touch.blocks/ua/__dom/ua__dom.js end */

/* ../../libs/bem-core/common.blocks/strings/__escape/strings__escape.vanilla.js begin */
/**
 * @module strings__escape
 * @description A set of string escaping functions
 */

modules.define('strings__escape', function(provide) {

var symbols = {
        '"' : '&quot;',
        '\'' : '&apos;',
        '&' : '&amp;',
        '<' : '&lt;',
        '>' : '&gt;'
    },
    mapSymbol = function(s) {
        return symbols[s] || s;
    },
    buildEscape = function(regexp) {
        regexp = new RegExp(regexp, 'g');
        return function(str) {
            return ('' + str).replace(regexp, mapSymbol);
        };
    };

provide(/** @exports */{
    /**
     * Escape string to use in XML
     * @type Function
     * @param {String} str
     * @returns {String}
     */
    xml : buildEscape('[&<>]'),

    /**
     * Escape string to use in HTML
     * @type Function
     * @param {String} str
     * @returns {String}
     */
    html : buildEscape('[&<>]'),

    /**
     * Escape string to use in attributes
     * @type Function
     * @param {String} str
     * @returns {String}
     */
    attr : buildEscape('["\'&<>]')
});

});

/* ../../libs/bem-core/common.blocks/strings/__escape/strings__escape.vanilla.js end */

/* ../../libs/bem-core/common.blocks/tick/tick.vanilla.js begin */
/**
 * @module tick
 * @description Helpers for polling anything
 */

modules.define('tick', ['inherit', 'events'], function(provide, inherit, events) {

var TICK_INTERVAL = 50,
    global = this.global,

    /**
     * @class Tick
     * @augments events:Emitter
     */
    Tick = inherit(events.Emitter, /** @lends Tick.prototype */{
        /**
         * @constructor
         */
        __constructor : function() {
            this._timer = null;
            this._isStarted = false;
        },

        /**
         * Starts polling
         */
        start : function() {
            if(!this._isStarted) {
                this._isStarted = true;
                this._scheduleTick();
            }
        },

        /**
         * Stops polling
         */
        stop : function() {
            if(this._isStarted) {
                this._isStarted = false;
                global.clearTimeout(this._timer);
            }
        },

        _scheduleTick : function() {
            var _this = this;
            this._timer = global.setTimeout(
                function() {
                    _this._onTick();
                },
                TICK_INTERVAL);
        },

        _onTick : function() {
            this.emit('tick');

            this._isStarted && this._scheduleTick();
        }
    });

provide(
    /**
     * @exports
     * @type Tick
     */
    new Tick());

});

/* ../../libs/bem-core/common.blocks/tick/tick.vanilla.js end */

/* ../../libs/bem-core/common.blocks/tick/_start/tick_start_auto.vanilla.js begin */
/**
 * Automatically starts tick module
 */

modules.require(['tick'], function(tick) {

tick.start();

});

/* ../../libs/bem-core/common.blocks/tick/_start/tick_start_auto.vanilla.js end */

/* ../../libs/bem-core/common.blocks/uri/uri.vanilla.js begin */
/**
 * @module uri
 * @description A set of helpers to work with URI
 */

modules.define('uri',  function(provide) {

// Equivalency table for cp1251 and utf8.
var map = { '%D0' : '%D0%A0', '%C0' : '%D0%90', '%C1' : '%D0%91', '%C2' : '%D0%92', '%C3' : '%D0%93', '%C4' : '%D0%94', '%C5' : '%D0%95', '%A8' : '%D0%81', '%C6' : '%D0%96', '%C7' : '%D0%97', '%C8' : '%D0%98', '%C9' : '%D0%99', '%CA' : '%D0%9A', '%CB' : '%D0%9B', '%CC' : '%D0%9C', '%CD' : '%D0%9D', '%CE' : '%D0%9E', '%CF' : '%D0%9F', '%D1' : '%D0%A1', '%D2' : '%D0%A2', '%D3' : '%D0%A3', '%D4' : '%D0%A4', '%D5' : '%D0%A5', '%D6' : '%D0%A6', '%D7' : '%D0%A7', '%D8' : '%D0%A8', '%D9' : '%D0%A9', '%DA' : '%D0%AA', '%DB' : '%D0%AB', '%DC' : '%D0%AC', '%DD' : '%D0%AD', '%DE' : '%D0%AE', '%DF' : '%D0%AF', '%E0' : '%D0%B0', '%E1' : '%D0%B1', '%E2' : '%D0%B2', '%E3' : '%D0%B3', '%E4' : '%D0%B4', '%E5' : '%D0%B5', '%B8' : '%D1%91', '%E6' : '%D0%B6', '%E7' : '%D0%B7', '%E8' : '%D0%B8', '%E9' : '%D0%B9', '%EA' : '%D0%BA', '%EB' : '%D0%BB', '%EC' : '%D0%BC', '%ED' : '%D0%BD', '%EE' : '%D0%BE', '%EF' : '%D0%BF', '%F0' : '%D1%80', '%F1' : '%D1%81', '%F2' : '%D1%82', '%F3' : '%D1%83', '%F4' : '%D1%84', '%F5' : '%D1%85', '%F6' : '%D1%86', '%F7' : '%D1%87', '%F8' : '%D1%88', '%F9' : '%D1%89', '%FA' : '%D1%8A', '%FB' : '%D1%8B', '%FC' : '%D1%8C', '%FD' : '%D1%8D', '%FE' : '%D1%8E', '%FF' : '%D1%8F' };

function convert(str) {
    // Symbol code in cp1251 (hex) : symbol code in utf8)
    return str.replace(
        /%.{2}/g,
        function($0) {
            return map[$0] || $0;
        });
}

function decode(fn,  str) {
    var decoded = '';

    // Try/catch block for getting the encoding of the source string.
    // Error is thrown if a non-UTF8 string is input.
    // If the string was not decoded, it is returned without changes.
    try {
        decoded = fn(str);
    } catch (e1) {
        try {
            decoded = fn(convert(str));
        } catch (e2) {
            decoded = str;
        }
    }

    return decoded;
}

provide(/** @exports */{
    /**
     * Decodes URI string
     * @param {String} str
     * @returns {String}
     */
    decodeURI : function(str) {
        return decode(decodeURI,  str);
    },

    /**
     * Decodes URI component string
     * @param {String} str
     * @returns {String}
     */
    decodeURIComponent : function(str) {
        return decode(decodeURIComponent,  str);
    }
});

});

/* ../../libs/bem-core/common.blocks/uri/uri.vanilla.js end */

/* ../../libs/bem-core/common.blocks/uri/__querystring/uri__querystring.vanilla.js begin */
/**
 * @module uri__querystring
 * @description A set of helpers to work with query strings
 */

modules.define('uri__querystring', ['uri'], function(provide, uri) {

var hasOwnProperty = Object.prototype.hasOwnProperty;

function addParam(res, name, val) {
    /* jshint eqnull: true */
    res.push(encodeURIComponent(name) + '=' + (val == null? '' : encodeURIComponent(val)));
}

provide(/** @exports */{
    /**
     * Parse a query string to an object
     * @param {String} str
     * @returns {Object}
     */
    parse : function(str) {
        if(!str) {
            return {};
        }

        return str.split('&').reduce(
            function(res, pair) {
                if(!pair) {
                    return res;
                }

                var eq = pair.indexOf('='),
                    name, val;

                if(eq >= 0) {
                    name = pair.substr(0, eq);
                    val = pair.substr(eq + 1);
                } else {
                    name = pair;
                    val = '';
                }

                name = uri.decodeURIComponent(name);
                val = uri.decodeURIComponent(val);

                hasOwnProperty.call(res, name)?
                    Array.isArray(res[name])?
                        res[name].push(val) :
                        res[name] = [res[name], val] :
                    res[name] = val;

                return res;
            },
            {});
    },

    /**
     * Serialize an object to a query string
     * @param {Object} obj
     * @returns {String}
     */
    stringify : function(obj) {
        return Object.keys(obj)
            .reduce(
                function(res, name) {
                    var val = obj[name];
                    Array.isArray(val)?
                        val.forEach(function(val) {
                            addParam(res, name, val);
                        }) :
                        addParam(res, name, val);
                    return res;
                },
                [])
            .join('&');
    }
});

});

/* ../../libs/bem-core/common.blocks/uri/__querystring/uri__querystring.vanilla.js end */

/* ../../libs/bem-core/common.blocks/vow/vow.vanilla.js begin */
/**
 * @module vow
 * @author Filatov Dmitry <dfilatov@yandex-team.ru>
 * @version 0.4.13
 * @license
 * Dual licensed under the MIT and GPL licenses:
 *   * http://www.opensource.org/licenses/mit-license.php
 *   * http://www.gnu.org/licenses/gpl.html
 */

(function(global) {

var undef,
    nextTick = (function() {
        var fns = [],
            enqueueFn = function(fn) {
                fns.push(fn);
                return fns.length === 1;
            },
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(typeof setImmediate === 'function') { // ie10, nodejs >= 0.10
            return function(fn) {
                enqueueFn(fn) && setImmediate(callFns);
            };
        }

        if(typeof process === 'object' && process.nextTick) { // nodejs < 0.10
            return function(fn) {
                enqueueFn(fn) && process.nextTick(callFns);
            };
        }

        var MutationObserver = global.MutationObserver || global.WebKitMutationObserver; // modern browsers
        if(MutationObserver) {
            var num = 1,
                node = document.createTextNode('');

            new MutationObserver(callFns).observe(node, { characterData : true });

            return function(fn) {
                enqueueFn(fn) && (node.data = (num *= -1));
            };
        }

        if(global.postMessage) {
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__promise' + Math.random() + '_' +new Date,
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    enqueueFn(fn) && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                };
                (doc.documentElement || doc.body).appendChild(script);
            };

            return function(fn) {
                enqueueFn(fn) && createScript();
            };
        }

        return function(fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })(),
    throwException = function(e) {
        nextTick(function() {
            throw e;
        });
    },
    isFunction = function(obj) {
        return typeof obj === 'function';
    },
    isObject = function(obj) {
        return obj !== null && typeof obj === 'object';
    },
    toStr = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === '[object Array]';
    },
    getArrayKeys = function(arr) {
        var res = [],
            i = 0, len = arr.length;
        while(i < len) {
            res.push(i++);
        }
        return res;
    },
    getObjectKeys = Object.keys || function(obj) {
        var res = [];
        for(var i in obj) {
            obj.hasOwnProperty(i) && res.push(i);
        }
        return res;
    },
    defineCustomErrorType = function(name) {
        var res = function(message) {
            this.name = name;
            this.message = message;
        };

        res.prototype = new Error();

        return res;
    },
    wrapOnFulfilled = function(onFulfilled, idx) {
        return function(val) {
            onFulfilled.call(this, val, idx);
        };
    };

/**
 * @class Deferred
 * @exports vow:Deferred
 * @description
 * The `Deferred` class is used to encapsulate newly-created promise object along with functions that resolve, reject or notify it.
 */

/**
 * @constructor
 * @description
 * You can use `vow.defer()` instead of using this constructor.
 *
 * `new vow.Deferred()` gives the same result as `vow.defer()`.
 */
var Deferred = function() {
    this._promise = new Promise();
};

Deferred.prototype = /** @lends Deferred.prototype */{
    /**
     * Returns the corresponding promise.
     *
     * @returns {vow:Promise}
     */
    promise : function() {
        return this._promise;
    },

    /**
     * Resolves the corresponding promise with the given `value`.
     *
     * @param {*} value
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promise = defer.promise();
     *
     * promise.then(function(value) {
     *     // value is "'success'" here
     * });
     *
     * defer.resolve('success');
     * ```
     */
    resolve : function(value) {
        this._promise.isResolved() || this._promise._resolve(value);
    },

    /**
     * Rejects the corresponding promise with the given `reason`.
     *
     * @param {*} reason
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promise = defer.promise();
     *
     * promise.fail(function(reason) {
     *     // reason is "'something is wrong'" here
     * });
     *
     * defer.reject('something is wrong');
     * ```
     */
    reject : function(reason) {
        if(this._promise.isResolved()) {
            return;
        }

        if(vow.isPromise(reason)) {
            reason = reason.then(function(val) {
                var defer = vow.defer();
                defer.reject(val);
                return defer.promise();
            });
            this._promise._resolve(reason);
        }
        else {
            this._promise._reject(reason);
        }
    },

    /**
     * Notifies the corresponding promise with the given `value`.
     *
     * @param {*} value
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promise = defer.promise();
     *
     * promise.progress(function(value) {
     *     // value is "'20%'", "'40%'" here
     * });
     *
     * defer.notify('20%');
     * defer.notify('40%');
     * ```
     */
    notify : function(value) {
        this._promise.isResolved() || this._promise._notify(value);
    }
};

var PROMISE_STATUS = {
    PENDING   : 0,
    RESOLVED  : 1,
    FULFILLED : 2,
    REJECTED  : 3
};

/**
 * @class Promise
 * @exports vow:Promise
 * @description
 * The `Promise` class is used when you want to give to the caller something to subscribe to,
 * but not the ability to resolve or reject the deferred.
 */

/**
 * @constructor
 * @param {Function} resolver See https://github.com/domenic/promises-unwrapping/blob/master/README.md#the-promise-constructor for details.
 * @description
 * You should use this constructor directly only if you are going to use `vow` as DOM Promises implementation.
 * In other case you should use `vow.defer()` and `defer.promise()` methods.
 * @example
 * ```js
 * function fetchJSON(url) {
 *     return new vow.Promise(function(resolve, reject, notify) {
 *         var xhr = new XMLHttpRequest();
 *         xhr.open('GET', url);
 *         xhr.responseType = 'json';
 *         xhr.send();
 *         xhr.onload = function() {
 *             if(xhr.response) {
 *                 resolve(xhr.response);
 *             }
 *             else {
 *                 reject(new TypeError());
 *             }
 *         };
 *     });
 * }
 * ```
 */
var Promise = function(resolver) {
    this._value = undef;
    this._status = PROMISE_STATUS.PENDING;

    this._fulfilledCallbacks = [];
    this._rejectedCallbacks = [];
    this._progressCallbacks = [];

    if(resolver) { // NOTE: see https://github.com/domenic/promises-unwrapping/blob/master/README.md
        var _this = this,
            resolverFnLen = resolver.length;

        resolver(
            function(val) {
                _this.isResolved() || _this._resolve(val);
            },
            resolverFnLen > 1?
                function(reason) {
                    _this.isResolved() || _this._reject(reason);
                } :
                undef,
            resolverFnLen > 2?
                function(val) {
                    _this.isResolved() || _this._notify(val);
                } :
                undef);
    }
};

Promise.prototype = /** @lends Promise.prototype */ {
    /**
     * Returns the value of the fulfilled promise or the reason in case of rejection.
     *
     * @returns {*}
     */
    valueOf : function() {
        return this._value;
    },

    /**
     * Returns `true` if the promise is resolved.
     *
     * @returns {Boolean}
     */
    isResolved : function() {
        return this._status !== PROMISE_STATUS.PENDING;
    },

    /**
     * Returns `true` if the promise is fulfilled.
     *
     * @returns {Boolean}
     */
    isFulfilled : function() {
        return this._status === PROMISE_STATUS.FULFILLED;
    },

    /**
     * Returns `true` if the promise is rejected.
     *
     * @returns {Boolean}
     */
    isRejected : function() {
        return this._status === PROMISE_STATUS.REJECTED;
    },

    /**
     * Adds reactions to the promise.
     *
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise} A new promise, see https://github.com/promises-aplus/promises-spec for details
     */
    then : function(onFulfilled, onRejected, onProgress, ctx) {
        var defer = new Deferred();
        this._addCallbacks(defer, onFulfilled, onRejected, onProgress, ctx);
        return defer.promise();
    },

    /**
     * Adds only a rejection reaction. This method is a shorthand for `promise.then(undefined, onRejected)`.
     *
     * @param {Function} onRejected Callback that will be called with a provided 'reason' as argument after the promise has been rejected
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    'catch' : function(onRejected, ctx) {
        return this.then(undef, onRejected, ctx);
    },

    /**
     * Adds only a rejection reaction. This method is a shorthand for `promise.then(null, onRejected)`. It's also an alias for `catch`.
     *
     * @param {Function} onRejected Callback to be called with the value after promise has been rejected
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    fail : function(onRejected, ctx) {
        return this.then(undef, onRejected, ctx);
    },

    /**
     * Adds a resolving reaction (for both fulfillment and rejection).
     *
     * @param {Function} onResolved Callback that will be invoked with the promise as an argument, after the promise has been resolved.
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    always : function(onResolved, ctx) {
        var _this = this,
            cb = function() {
                return onResolved.call(this, _this);
            };

        return this.then(cb, cb, ctx);
    },

    /**
     * Adds a progress reaction.
     *
     * @param {Function} onProgress Callback that will be called with a provided value when the promise has been notified
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    progress : function(onProgress, ctx) {
        return this.then(undef, undef, onProgress, ctx);
    },

    /**
     * Like `promise.then`, but "spreads" the array into a variadic value handler.
     * It is useful with the `vow.all` and the `vow.allResolved` methods.
     *
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.all([defer1.promise(), defer2.promise()]).spread(function(arg1, arg2) {
     *     // arg1 is "1", arg2 is "'two'" here
     * });
     *
     * defer1.resolve(1);
     * defer2.resolve('two');
     * ```
     */
    spread : function(onFulfilled, onRejected, ctx) {
        return this.then(
            function(val) {
                return onFulfilled.apply(this, val);
            },
            onRejected,
            ctx);
    },

    /**
     * Like `then`, but terminates a chain of promises.
     * If the promise has been rejected, this method throws it's "reason" as an exception in a future turn of the event loop.
     *
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     *
     * @example
     * ```js
     * var defer = vow.defer();
     * defer.reject(Error('Internal error'));
     * defer.promise().done(); // exception to be thrown
     * ```
     */
    done : function(onFulfilled, onRejected, onProgress, ctx) {
        this
            .then(onFulfilled, onRejected, onProgress, ctx)
            .fail(throwException);
    },

    /**
     * Returns a new promise that will be fulfilled in `delay` milliseconds if the promise is fulfilled,
     * or immediately rejected if the promise is rejected.
     *
     * @param {Number} delay
     * @returns {vow:Promise}
     */
    delay : function(delay) {
        var timer,
            promise = this.then(function(val) {
                var defer = new Deferred();
                timer = setTimeout(
                    function() {
                        defer.resolve(val);
                    },
                    delay);

                return defer.promise();
            });

        promise.always(function() {
            clearTimeout(timer);
        });

        return promise;
    },

    /**
     * Returns a new promise that will be rejected in `timeout` milliseconds
     * if the promise is not resolved beforehand.
     *
     * @param {Number} timeout
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var defer = vow.defer(),
     *     promiseWithTimeout1 = defer.promise().timeout(50),
     *     promiseWithTimeout2 = defer.promise().timeout(200);
     *
     * setTimeout(
     *     function() {
     *         defer.resolve('ok');
     *     },
     *     100);
     *
     * promiseWithTimeout1.fail(function(reason) {
     *     // promiseWithTimeout to be rejected in 50ms
     * });
     *
     * promiseWithTimeout2.then(function(value) {
     *     // promiseWithTimeout to be fulfilled with "'ok'" value
     * });
     * ```
     */
    timeout : function(timeout) {
        var defer = new Deferred(),
            timer = setTimeout(
                function() {
                    defer.reject(new vow.TimedOutError('timed out'));
                },
                timeout);

        this.then(
            function(val) {
                defer.resolve(val);
            },
            function(reason) {
                defer.reject(reason);
            });

        defer.promise().always(function() {
            clearTimeout(timer);
        });

        return defer.promise();
    },

    _vow : true,

    _resolve : function(val) {
        if(this._status > PROMISE_STATUS.RESOLVED) {
            return;
        }

        if(val === this) {
            this._reject(TypeError('Can\'t resolve promise with itself'));
            return;
        }

        this._status = PROMISE_STATUS.RESOLVED;

        if(val && !!val._vow) { // shortpath for vow.Promise
            val.isFulfilled()?
                this._fulfill(val.valueOf()) :
                val.isRejected()?
                    this._reject(val.valueOf()) :
                    val.then(
                        this._fulfill,
                        this._reject,
                        this._notify,
                        this);
            return;
        }

        if(isObject(val) || isFunction(val)) {
            var then;
            try {
                then = val.then;
            }
            catch(e) {
                this._reject(e);
                return;
            }

            if(isFunction(then)) {
                var _this = this,
                    isResolved = false;

                try {
                    then.call(
                        val,
                        function(val) {
                            if(isResolved) {
                                return;
                            }

                            isResolved = true;
                            _this._resolve(val);
                        },
                        function(err) {
                            if(isResolved) {
                                return;
                            }

                            isResolved = true;
                            _this._reject(err);
                        },
                        function(val) {
                            _this._notify(val);
                        });
                }
                catch(e) {
                    isResolved || this._reject(e);
                }

                return;
            }
        }

        this._fulfill(val);
    },

    _fulfill : function(val) {
        if(this._status > PROMISE_STATUS.RESOLVED) {
            return;
        }

        this._status = PROMISE_STATUS.FULFILLED;
        this._value = val;

        this._callCallbacks(this._fulfilledCallbacks, val);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    _reject : function(reason) {
        if(this._status > PROMISE_STATUS.RESOLVED) {
            return;
        }

        this._status = PROMISE_STATUS.REJECTED;
        this._value = reason;

        this._callCallbacks(this._rejectedCallbacks, reason);
        this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
    },

    _notify : function(val) {
        this._callCallbacks(this._progressCallbacks, val);
    },

    _addCallbacks : function(defer, onFulfilled, onRejected, onProgress, ctx) {
        if(onRejected && !isFunction(onRejected)) {
            ctx = onRejected;
            onRejected = undef;
        }
        else if(onProgress && !isFunction(onProgress)) {
            ctx = onProgress;
            onProgress = undef;
        }

        var cb;

        if(!this.isRejected()) {
            cb = { defer : defer, fn : isFunction(onFulfilled)? onFulfilled : undef, ctx : ctx };
            this.isFulfilled()?
                this._callCallbacks([cb], this._value) :
                this._fulfilledCallbacks.push(cb);
        }

        if(!this.isFulfilled()) {
            cb = { defer : defer, fn : onRejected, ctx : ctx };
            this.isRejected()?
                this._callCallbacks([cb], this._value) :
                this._rejectedCallbacks.push(cb);
        }

        if(this._status <= PROMISE_STATUS.RESOLVED) {
            this._progressCallbacks.push({ defer : defer, fn : onProgress, ctx : ctx });
        }
    },

    _callCallbacks : function(callbacks, arg) {
        var len = callbacks.length;
        if(!len) {
            return;
        }

        var isResolved = this.isResolved(),
            isFulfilled = this.isFulfilled(),
            isRejected = this.isRejected();

        nextTick(function() {
            var i = 0, cb, defer, fn;
            while(i < len) {
                cb = callbacks[i++];
                defer = cb.defer;
                fn = cb.fn;

                if(fn) {
                    var ctx = cb.ctx,
                        res;
                    try {
                        res = ctx? fn.call(ctx, arg) : fn(arg);
                    }
                    catch(e) {
                        defer.reject(e);
                        continue;
                    }

                    isResolved?
                        defer.resolve(res) :
                        defer.notify(res);
                }
                else if(isFulfilled) {
                    defer.resolve(arg);
                }
                else if(isRejected) {
                    defer.reject(arg);
                }
                else {
                    defer.notify(arg);
                }
            }
        });
    }
};

/** @lends Promise */
var staticMethods = {
    /**
     * Coerces the given `value` to a promise, or returns the `value` if it's already a promise.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    cast : function(value) {
        return vow.cast(value);
    },

    /**
     * Returns a promise, that will be fulfilled only after all the items in `iterable` are fulfilled.
     * If any of the `iterable` items gets rejected, then the returned promise will be rejected.
     *
     * @param {Array|Object} iterable
     * @returns {vow:Promise}
     */
    all : function(iterable) {
        return vow.all(iterable);
    },

    /**
     * Returns a promise, that will be fulfilled only when any of the items in `iterable` are fulfilled.
     * If any of the `iterable` items gets rejected, then the returned promise will be rejected.
     *
     * @param {Array} iterable
     * @returns {vow:Promise}
     */
    race : function(iterable) {
        return vow.anyResolved(iterable);
    },

    /**
     * Returns a promise that has already been resolved with the given `value`.
     * If `value` is a promise, the returned promise will have `value`'s state.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    resolve : function(value) {
        return vow.resolve(value);
    },

    /**
     * Returns a promise that has already been rejected with the given `reason`.
     *
     * @param {*} reason
     * @returns {vow:Promise}
     */
    reject : function(reason) {
        return vow.reject(reason);
    }
};

for(var prop in staticMethods) {
    staticMethods.hasOwnProperty(prop) &&
        (Promise[prop] = staticMethods[prop]);
}

var vow = /** @exports vow */ {
    Deferred : Deferred,

    Promise : Promise,

    /**
     * Creates a new deferred. This method is a factory method for `vow:Deferred` class.
     * It's equivalent to `new vow.Deferred()`.
     *
     * @returns {vow:Deferred}
     */
    defer : function() {
        return new Deferred();
    },

    /**
     * Static equivalent to `promise.then`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise}
     */
    when : function(value, onFulfilled, onRejected, onProgress, ctx) {
        return vow.cast(value).then(onFulfilled, onRejected, onProgress, ctx);
    },

    /**
     * Static equivalent to `promise.fail`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} onRejected Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    fail : function(value, onRejected, ctx) {
        return vow.when(value, undef, onRejected, ctx);
    },

    /**
     * Static equivalent to `promise.always`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} onResolved Callback that will be invoked with the promise as an argument, after the promise has been resolved.
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    always : function(value, onResolved, ctx) {
        return vow.when(value).always(onResolved, ctx);
    },

    /**
     * Static equivalent to `promise.progress`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} onProgress Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callback execution
     * @returns {vow:Promise}
     */
    progress : function(value, onProgress, ctx) {
        return vow.when(value).progress(onProgress, ctx);
    },

    /**
     * Static equivalent to `promise.spread`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Object} [ctx] Context of the callbacks execution
     * @returns {vow:Promise}
     */
    spread : function(value, onFulfilled, onRejected, ctx) {
        return vow.when(value).spread(onFulfilled, onRejected, ctx);
    },

    /**
     * Static equivalent to `promise.done`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
     * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
     * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
     * @param {Object} [ctx] Context of the callbacks execution
     */
    done : function(value, onFulfilled, onRejected, onProgress, ctx) {
        vow.when(value).done(onFulfilled, onRejected, onProgress, ctx);
    },

    /**
     * Checks whether the given `value` is a promise-like object
     *
     * @param {*} value
     * @returns {Boolean}
     *
     * @example
     * ```js
     * vow.isPromise('something'); // returns false
     * vow.isPromise(vow.defer().promise()); // returns true
     * vow.isPromise({ then : function() { }); // returns true
     * ```
     */
    isPromise : function(value) {
        return isObject(value) && isFunction(value.then);
    },

    /**
     * Coerces the given `value` to a promise, or returns the `value` if it's already a promise.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    cast : function(value) {
        return value && !!value._vow?
            value :
            vow.resolve(value);
    },

    /**
     * Static equivalent to `promise.valueOf`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {*}
     */
    valueOf : function(value) {
        return value && isFunction(value.valueOf)? value.valueOf() : value;
    },

    /**
     * Static equivalent to `promise.isFulfilled`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    isFulfilled : function(value) {
        return value && isFunction(value.isFulfilled)? value.isFulfilled() : true;
    },

    /**
     * Static equivalent to `promise.isRejected`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    isRejected : function(value) {
        return value && isFunction(value.isRejected)? value.isRejected() : false;
    },

    /**
     * Static equivalent to `promise.isResolved`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    isResolved : function(value) {
        return value && isFunction(value.isResolved)? value.isResolved() : true;
    },

    /**
     * Returns a promise that has already been resolved with the given `value`.
     * If `value` is a promise, the returned promise will have `value`'s state.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    resolve : function(value) {
        var res = vow.defer();
        res.resolve(value);
        return res.promise();
    },

    /**
     * Returns a promise that has already been fulfilled with the given `value`.
     * If `value` is a promise, the returned promise will be fulfilled with the fulfill/rejection value of `value`.
     *
     * @param {*} value
     * @returns {vow:Promise}
     */
    fulfill : function(value) {
        var defer = vow.defer(),
            promise = defer.promise();

        defer.resolve(value);

        return promise.isFulfilled()?
            promise :
            promise.then(null, function(reason) {
                return reason;
            });
    },

    /**
     * Returns a promise that has already been rejected with the given `reason`.
     * If `reason` is a promise, the returned promise will be rejected with the fulfill/rejection value of `reason`.
     *
     * @param {*} reason
     * @returns {vow:Promise}
     */
    reject : function(reason) {
        var defer = vow.defer();
        defer.reject(reason);
        return defer.promise();
    },

    /**
     * Invokes the given function `fn` with arguments `args`
     *
     * @param {Function} fn
     * @param {...*} [args]
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var promise1 = vow.invoke(function(value) {
     *         return value;
     *     }, 'ok'),
     *     promise2 = vow.invoke(function() {
     *         throw Error();
     *     });
     *
     * promise1.isFulfilled(); // true
     * promise1.valueOf(); // 'ok'
     * promise2.isRejected(); // true
     * promise2.valueOf(); // instance of Error
     * ```
     */
    invoke : function(fn, args) {
        var len = Math.max(arguments.length - 1, 0),
            callArgs;
        if(len) { // optimization for V8
            callArgs = Array(len);
            var i = 0;
            while(i < len) {
                callArgs[i++] = arguments[i];
            }
        }

        try {
            return vow.resolve(callArgs?
                fn.apply(global, callArgs) :
                fn.call(global));
        }
        catch(e) {
            return vow.reject(e);
        }
    },

    /**
     * Returns a promise, that will be fulfilled only after all the items in `iterable` are fulfilled.
     * If any of the `iterable` items gets rejected, the promise will be rejected.
     *
     * @param {Array|Object} iterable
     * @returns {vow:Promise}
     *
     * @example
     * with array:
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.all([defer1.promise(), defer2.promise(), 3])
     *     .then(function(value) {
     *          // value is "[1, 2, 3]" here
     *     });
     *
     * defer1.resolve(1);
     * defer2.resolve(2);
     * ```
     *
     * @example
     * with object:
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.all({ p1 : defer1.promise(), p2 : defer2.promise(), p3 : 3 })
     *     .then(function(value) {
     *          // value is "{ p1 : 1, p2 : 2, p3 : 3 }" here
     *     });
     *
     * defer1.resolve(1);
     * defer2.resolve(2);
     * ```
     */
    all : function(iterable) {
        var defer = new Deferred(),
            isPromisesArray = isArray(iterable),
            keys = isPromisesArray?
                getArrayKeys(iterable) :
                getObjectKeys(iterable),
            len = keys.length,
            res = isPromisesArray? [] : {};

        if(!len) {
            defer.resolve(res);
            return defer.promise();
        }

        var i = len;
        vow._forEach(
            iterable,
            function(value, idx) {
                res[keys[idx]] = value;
                if(!--i) {
                    defer.resolve(res);
                }
            },
            defer.reject,
            defer.notify,
            defer,
            keys);

        return defer.promise();
    },

    /**
     * Returns a promise, that will be fulfilled only after all the items in `iterable` are resolved.
     *
     * @param {Array|Object} iterable
     * @returns {vow:Promise}
     *
     * @example
     * ```js
     * var defer1 = vow.defer(),
     *     defer2 = vow.defer();
     *
     * vow.allResolved([defer1.promise(), defer2.promise()]).spread(function(promise1, promise2) {
     *     promise1.isRejected(); // returns true
     *     promise1.valueOf(); // returns "'error'"
     *     promise2.isFulfilled(); // returns true
     *     promise2.valueOf(); // returns "'ok'"
     * });
     *
     * defer1.reject('error');
     * defer2.resolve('ok');
     * ```
     */
    allResolved : function(iterable) {
        var defer = new Deferred(),
            isPromisesArray = isArray(iterable),
            keys = isPromisesArray?
                getArrayKeys(iterable) :
                getObjectKeys(iterable),
            i = keys.length,
            res = isPromisesArray? [] : {};

        if(!i) {
            defer.resolve(res);
            return defer.promise();
        }

        var onResolved = function() {
                --i || defer.resolve(iterable);
            };

        vow._forEach(
            iterable,
            onResolved,
            onResolved,
            defer.notify,
            defer,
            keys);

        return defer.promise();
    },

    allPatiently : function(iterable) {
        return vow.allResolved(iterable).then(function() {
            var isPromisesArray = isArray(iterable),
                keys = isPromisesArray?
                    getArrayKeys(iterable) :
                    getObjectKeys(iterable),
                rejectedPromises, fulfilledPromises,
                len = keys.length, i = 0, key, promise;

            if(!len) {
                return isPromisesArray? [] : {};
            }

            while(i < len) {
                key = keys[i++];
                promise = iterable[key];
                if(vow.isRejected(promise)) {
                    rejectedPromises || (rejectedPromises = isPromisesArray? [] : {});
                    isPromisesArray?
                        rejectedPromises.push(promise.valueOf()) :
                        rejectedPromises[key] = promise.valueOf();
                }
                else if(!rejectedPromises) {
                    (fulfilledPromises || (fulfilledPromises = isPromisesArray? [] : {}))[key] = vow.valueOf(promise);
                }
            }

            if(rejectedPromises) {
                throw rejectedPromises;
            }

            return fulfilledPromises;
        });
    },

    /**
     * Returns a promise, that will be fulfilled if any of the items in `iterable` is fulfilled.
     * If all of the `iterable` items get rejected, the promise will be rejected (with the reason of the first rejected item).
     *
     * @param {Array} iterable
     * @returns {vow:Promise}
     */
    any : function(iterable) {
        var defer = new Deferred(),
            len = iterable.length;

        if(!len) {
            defer.reject(Error());
            return defer.promise();
        }

        var i = 0, reason;
        vow._forEach(
            iterable,
            defer.resolve,
            function(e) {
                i || (reason = e);
                ++i === len && defer.reject(reason);
            },
            defer.notify,
            defer);

        return defer.promise();
    },

    /**
     * Returns a promise, that will be fulfilled only when any of the items in `iterable` is fulfilled.
     * If any of the `iterable` items gets rejected, the promise will be rejected.
     *
     * @param {Array} iterable
     * @returns {vow:Promise}
     */
    anyResolved : function(iterable) {
        var defer = new Deferred(),
            len = iterable.length;

        if(!len) {
            defer.reject(Error());
            return defer.promise();
        }

        vow._forEach(
            iterable,
            defer.resolve,
            defer.reject,
            defer.notify,
            defer);

        return defer.promise();
    },

    /**
     * Static equivalent to `promise.delay`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Number} delay
     * @returns {vow:Promise}
     */
    delay : function(value, delay) {
        return vow.resolve(value).delay(delay);
    },

    /**
     * Static equivalent to `promise.timeout`.
     * If `value` is not a promise, then `value` is treated as a fulfilled promise.
     *
     * @param {*} value
     * @param {Number} timeout
     * @returns {vow:Promise}
     */
    timeout : function(value, timeout) {
        return vow.resolve(value).timeout(timeout);
    },

    _forEach : function(promises, onFulfilled, onRejected, onProgress, ctx, keys) {
        var len = keys? keys.length : promises.length,
            i = 0;

        while(i < len) {
            vow.when(
                promises[keys? keys[i] : i],
                wrapOnFulfilled(onFulfilled, i),
                onRejected,
                onProgress,
                ctx);
            ++i;
        }
    },

    TimedOutError : defineCustomErrorType('TimedOut')
};

var defineAsGlobal = true;
if(typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = vow;
    defineAsGlobal = false;
}

if(typeof modules === 'object' && isFunction(modules.define)) {
    modules.define('vow', function(provide) {
        provide(vow);
    });
    defineAsGlobal = false;
}

if(typeof define === 'function') {
    define(function(require, exports, module) {
        module.exports = vow;
    });
    defineAsGlobal = false;
}

defineAsGlobal && (global.vow = vow);

})(typeof window !== 'undefined'? window : global);

/* ../../libs/bem-core/common.blocks/vow/vow.vanilla.js end */

/* ../../common.blocks/attach/attach.js begin */
/**
 * @module attach
 */

modules.define(
    'attach',
    ['i-bem-dom', 'i-bem__internal', 'control', 'button', 'jquery', 'strings__escape'],
    function(provide, bemDom, INTERNAL, Control, Button, $, escape) {

/**
 * @exports
 * @class attach
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends attach.prototype */{
    onSetMod : {
        'disabled' : function(modName, modVal) {
            this.__base.apply(this, arguments);
            this._getButton().setMod(modName, modVal);
        }
    },

    /**
     * Clear control value
     * @param {Object} [data] additional data
     * @returns {attach} this
     */
    clear : function(data) {
        if(!this.getVal()) return this;
        return this._clear(data);
    },

    _clear : function(data) {
        var control = this._elem('control').domElem,
            name = control.attr('name'),
            tabIndex = control.attr('tabindex');

        bemDom.replace(
            control,
            '<input' +
                ' class="' + control.attr('class') + '"' +
                ' type="file"' +
                (name? ' name="' + name + '"' : '') +
                (tabIndex? ' tabindex="' + tabIndex + '"' : '') +
            '/>');

        bemDom.destruct(this.findChildElem('file').domElem);

        this.domElem.append(this._elem('no-file').domElem); // use append because only detached before

        return this
            ._emitChange(data);
    },

    _onClearClick : function() {
        this.clear({ source : 'clear' });
    },

    _onChange : function() {
        this._elem('no-file').domElem.detach();
        this.getVal()?
            this
                ._updateFileElem()
                ._emitChange() :
            this._clear();
    },

    _emitChange : function(data) {
        return this._emit('change', data);
    },

    _updateFileElem : function() {
        var fileName = extractFileNameFromPath(this.getVal());

        this.findChildElem('file') && bemDom.destruct(this._elem('file').domElem);

        bemDom.append(
            this.domElem,
            '<span class="' +
                this.__self._buildClassName('file') + '">' +
                '<span class="' +
                    this.__self._buildClassName('text') + '">' +
                    escape.html(fileName) +
                '</span>' +
                '<span class="' + this.__self._buildClassName('clear') + '"/>' +
            '</span>');

        return this;
    },

    _getButton : function() {
        return this.findChildBlock(Button);
    }
}, /** @lends attach */{
    lazyInit : true,
    onInit : function() {
        this._domEvents('clear').on('pointerclick', this.prototype._onClearClick);
        this._domEvents('control').on('change', this.prototype._onChange);

        return this.__base.apply(this, arguments);
    }
}));

function extractFileNameFromPath(path) {
    return path.split('\\').pop(); // we need this only in windows
}

});

/* ../../common.blocks/attach/attach.js end */

/* ../../common.blocks/control/control.js begin */
/**
 * @module control
 */

modules.define(
    'control',
    ['i-bem-dom', 'dom', 'next-tick'],
    function(provide, bemDom, dom, nextTick) {

/**
 * @exports
 * @class control
 * @abstract
 * @bem
 */
provide(bemDom.declBlock(this.name, /** @lends control.prototype */{
    beforeSetMod : {
        'focused' : {
            'true' : function() {
                return !this.hasMod('disabled');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                var controlDomElem = this._elem('control').domElem;

                this._focused = dom.containsFocus(controlDomElem);
                this._focused?
                    // if control is already in focus, we need to force _onFocus
                    this._onFocus() :
                    // if block already has focused mod, we need to focus control
                    this.hasMod('focused') && this._focus();

                this._tabIndex = typeof this.params.tabIndex !== 'undefined'?
                    this.params.tabIndex :
                    controlDomElem.attr('tabindex');

                if(this.hasMod('disabled') && this._tabIndex !== 'undefined')
                    controlDomElem.removeAttr('tabindex');
            }
        },

        'focused' : {
            'true' : function() {
                this._focused || this._focus();
            },

            '' : function() {
                this._focused && this._blur();
            }
        },

        'disabled' : {
            'true' : function() {
                this._elem('control').domElem.attr('disabled', true);
                this.delMod('focused');
                typeof this._tabIndex !== 'undefined' &&
                    this._elem('control').domElem.removeAttr('tabindex');
            },

            '' : function() {
                this._elem('control').domElem.removeAttr('disabled');
                typeof this._tabIndex !== 'undefined' &&
                    this._elem('control').domElem.attr('tabindex', this._tabIndex);
            }
        }
    },

    /**
     * Returns name of control
     * @returns {String}
     */
    getName : function() {
        return this._elem('control').domElem.attr('name') || '';
    },

    /**
     * Returns control value
     * @returns {String}
     */
    getVal : function() {
        return this._elem('control').domElem.val();
    },

    _onFocus : function() {
        this._focused = true;
        this.setMod('focused');
    },

    _onBlur : function() {
        this._focused = false;
        this.delMod('focused');
    },

    _focus : function() {
        dom.isFocusable(this._elem('control').domElem)?
            this._elem('control').domElem.focus() :
            this._onFocus(); // issues/1456
    },

    _blur : function() {
        // force both `blur` and `_onBlur` for FF which can have disabled element as `document.activeElement`
        this._elem('control').domElem.blur();
        this._onBlur();
    }
}, /** @lends control */{
    lazyInit : true,
    onInit : function() {
        this._domEvents('control')
            .on('focusin', function() {
                this._focused || this._onFocus(); // to prevent double call of _onFocus in case of init by focus
            })
            .on('focusout', this.prototype._onBlur);

        var focused = dom.getFocused();
        if(focused.hasClass(this._buildClassName('control'))) {
            var _this = this;
            nextTick(function() {
                if(focused[0] === dom.getFocused()[0]) {
                    var block = focused.closest(_this._buildSelector());
                    block && block.bem(_this);
                }
            });
        }
    }
}));

});

/* ../../common.blocks/control/control.js end */

/* ../../common.blocks/button/button.js begin */
/**
 * @module button
 */

modules.define(
    'button',
    ['i-bem-dom', 'control', 'jquery', 'dom', 'functions', 'keyboard__codes'],
    function(provide, bemDom, Control, $, dom, functions, keyCodes) {

/**
 * @exports
 * @class button
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends button.prototype */{
    beforeSetMod : {
        'pressed' : {
            'true' : function() {
                return !this.hasMod('disabled') || this.hasMod('togglable');
            }
        },

        'focused' : {
            '' : function() {
                return !this._isPointerPressInProgress;
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._isPointerPressInProgress = false;
                this._focusedByPointer = false;
            }
        },

        'disabled' : {
            'true' : function() {
                this.__base.apply(this, arguments);
                this.hasMod('togglable') || this.delMod('pressed');
                this.domElem.attr('aria-disabled', true);
            },
            '' : function() {
                this.__base.apply(this, arguments);
                this.domElem.removeAttr('aria-disabled');
            }
        },

        'focused' : {
            'true' : function() {
                this.__base.apply(this, arguments);
                this._focusedByPointer || this.setMod('focused-hard');
            },

            '' : function() {
                this.__base.apply(this, arguments);
                this.delMod('focused-hard');
            }
        }
    },

    /**
     * Returns text of the button
     * @returns {String}
     */
    getText : function() {
        return this._elem('text').domElem.text();
    },

    /**
     * Sets text to the button
     * @param {String} text
     * @returns {button} this
     */
    setText : function(text) {
        this._elem('text').domElem.text(text || '');
        return this;
    },

    _onFocus : function() {
        if(this._isPointerPressInProgress) return;

        this.__base.apply(this, arguments);
        this._domEvents('control').on('keydown', this._onKeyDown);
    },

    _onBlur : function() {
        this._domEvents('control').un('keydown', this._onKeyDown);
        this.__base.apply(this, arguments);
    },

    _onMouseDown : function(e) {
        e.preventDefault(); // NOTE: prevents button from being blurred at least in FF and Safari
        this._domEvents().un('mousedown', this._onMouseDown);
    },

    _onPointerPress : function() {
        this._domEvents().on('mousedown', this._onMouseDown);
        if(!this.hasMod('disabled')) {
            this._isPointerPressInProgress = true;
            this._domEvents(bemDom.doc).on('pointerrelease', this._onPointerRelease);
            this.setMod('pressed');
        }
    },

    _onPointerRelease : function(e) {
        this._isPointerPressInProgress = false;
        this._domEvents(bemDom.doc).un('pointerrelease', this._onPointerRelease);

        if(e.originalEvent.type === 'pointerup' && dom.contains(this.findMixedElem('control').domElem, $(e.target))) {
            this._focusedByPointer = true;
            this._focus();
            this._focusedByPointer = false;
            this._domEvents().once('pointerclick', this._onPointerClick);
        } else {
            this._blur();
        }

        this.delMod('pressed');
    },

    _onPointerClick : function() {
        this
            ._updateChecked()
            ._emit('click');
    },

    _onKeyDown : function(e) {
        if(this.hasMod('disabled')) return;

        var keyCode = e.keyCode;
        if(keyCode === keyCodes.SPACE || keyCode === keyCodes.ENTER) {
            this._domEvents('control')
                .un('keydown', this._onKeyDown)
                .on('keyup', this._onKeyUp);

            this._updateChecked()
                .setMod('pressed');
        }
    },

    _onKeyUp : function(e) {
        this._domEvents('control')
            .un('keyup', this._onKeyUp)
            .on('keydown', this._onKeyDown);

        this.delMod('pressed');

        e.keyCode === keyCodes.SPACE && this._doAction();

        this._emit('click');
    },

    _updateChecked : function() {
        this.hasMod('togglable') &&
            (this.hasMod('togglable', 'check')?
                this.toggleMod('checked') :
                this.setMod('checked'));

        return this;
    },

    _doAction : functions.noop
}, /** @lends button */{
    lazyInit : true,
    onInit : function() {
        this._domEvents('control').on('pointerpress', this.prototype._onPointerPress);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/button/button.js end */

/* ../../common.blocks/button/_togglable/button_togglable.js begin */
/**
 * @module button
 */

modules.define('button', function(provide, Button) {

/**
 * @exports
 * @class button
 * @bem
 */

provide(Button.declMod({ modName : 'togglable', modVal : '*' }, /** @lends button.prototype */{
    onSetMod : {
        'checked' : function(_, modVal) {
            this.__base.apply(this, arguments);
            this.domElem.attr('aria-pressed', !!modVal);
        }
    }
}));

});

/* ../../common.blocks/button/_togglable/button_togglable.js end */

/* ../../common.blocks/button/_type/button_type_link.js begin */
/**
 * @module button
 */

modules.define('button', function(provide, Button) {

/**
 * @exports
 * @class button
 * @bem
 */
provide(Button.declMod({ modName : 'type', modVal : 'link' }, /** @lends button.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._url = this.params.url || this.domElem.attr('href');

                this.hasMod('disabled') && this.domElem.removeAttr('href');
            }
        },

        'disabled' : {
            'true' : function() {
                this.__base.apply(this, arguments);
                this.domElem
                    .removeAttr('href')
                    .attr('aria-disabled', true);
            },

            '' : function() {
                this.__base.apply(this, arguments);
                this.domElem
                    .attr('href', this._url)
                    .removeAttr('aria-disabled');
            }
        }
    },

    /**
     * Returns url
     * @returns {String}
     */
    getUrl : function() {
        return this._url;
    },

    /**
     * Sets url
     * @param {String} url
     * @returns {button} this
     */
    setUrl : function(url) {
        this._url = url;
        this.hasMod('disabled') || this.domElem.attr('href', url);
        return this;
    },

    _doAction : function() {
        this._url && (document.location = this._url);
    }
}));

});

/* ../../common.blocks/button/_type/button_type_link.js end */

/* ../../common.blocks/checkbox/checkbox.js begin */
/**
 * @module checkbox
 */

modules.define('checkbox', ['i-bem-dom', 'control'], function(provide, bemDom, Control) {

/**
 * @exports
 * @class checkbox
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends checkbox.prototype */{
    onSetMod : {
        'checked' : {
            'true' : function() {
                this._elem('control').domElem
                    .attr('checked', true)
                    .prop('checked', true);
            },
            '' : function() {
                this._elem('control').domElem
                    .removeAttr('checked')
                    .prop('checked', false);
            }
        }
    },

    _onChange : function() {
        this.setMod('checked', this._elem('control').domElem.prop('checked'));
    }
}, /** @lends checkbox */{
    lazyInit : true,
    onInit : function() {
        this._domEvents('control').on('change', this.prototype._onChange);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/checkbox/checkbox.js end */

/* ../../common.blocks/checkbox/_type/checkbox_type_button.js begin */
/**
 * @module checkbox
 */

modules.define('checkbox', ['button', 'functions'], function(provide, Button, functions, Checkbox) {

/**
 * @exports
 * @class checkbox
 * @bem
 */
provide(Checkbox.declMod({ modName : 'type', modVal : 'button' }, /** @lends checkbox.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._button = this.findChildBlock(Button);
                this._button._events()
                    .on(
                        { modName : 'checked', modVal : '*' },
                        proxyModFromButton,
                        this)
                    .on(
                        { modName : 'focused', modVal : '*' },
                        proxyModFromButton,
                        this);
            }
        },

        'checked' : function(_, checked) {
            proxyModToButton.apply(this, arguments);
            this._button.domElem
                .removeAttr('aria-pressed') // checkbox accepts aria-checked instead of aria-pressed
                .attr('aria-checked', !!checked);
        },
        'disabled' : proxyModToButton,
        'focused' : function(modName, modVal) {
            proxyModToButton.call(this, modName, modVal, false);
        }
    }
}, /** @lends checkbox */{
    lazyInit : true,
    onInit : function() {

        this._events(Button).on({ modName : 'js', modVal : 'inited' }, functions.noop);
        return this.__base.apply(this, arguments);
    }
}));

function proxyModToButton(modName, modVal, callBase) {
    callBase !== false && this.__base.apply(this, arguments);
    this._button.setMod(modName, modVal);
}

function proxyModFromButton(_, data) {
    this.setMod(data.modName, data.modVal);
}

});

/* ../../common.blocks/checkbox/_type/checkbox_type_button.js end */

/* ../../common.blocks/checkbox-group/checkbox-group.js begin */
/**
 * @module checkbox-group
 */

modules.define(
    'checkbox-group',
    ['i-bem-dom', 'jquery', 'dom', 'checkbox'],
    function(provide, bemDom, $, dom, Checkbox) {

var undef;
/**
 * @exports
 * @class checkbox-group
 * @bem
 */
provide(bemDom.declBlock(this.name, /** @lends checkbox-group.prototype */{
    beforeSetMod : {
        'focused' : {
            'true' : function() {
                return !this.hasMod('disabled');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._inSetVal = false;
                this._val = this._extractVal();
                this._checkboxes = undef;
            }
        },

        'disabled' : function(modName, modVal) {
            this.getCheckboxes().setMod(modName, modVal);
        },

        'focused' : {
            'true' : function() {
                if(dom.containsFocus(this.domElem)) return;

                var checkboxes = this.getCheckboxes(),
                    i = 0, checkbox;

                while(checkbox = checkboxes.get(i++)) {
                    if(checkbox.setMod('focused').hasMod('focused')) // we need to be sure that checkbox has got focus
                        return;
                }
            },

            '' : function() {
                var focusedCheckbox = this.findChildBlock({
                        block : Checkbox,
                        modName : 'focused',
                        modVal : true
                    });

                focusedCheckbox && focusedCheckbox.delMod('focused');
            }
        }
    },

    /**
     * Returns control value
     * @returns {String}
     */
    getVal : function() {
        return this._val;
    },

    /**
     * Sets control value
     * @param {Array[String]} val value
     * @param {Object} [data] additional data
     * @returns {checkbox-group} this
     */
    setVal : function(val, data) {
        val = val.map(String);

        var checkboxes = this.getCheckboxes(),
            wasChanged = false,
            notFoundValsCnt = val.length,
            checkboxesCheckedModVals = checkboxes.map(function(checkbox) {
                var isChecked = checkbox.hasMod('checked'),
                    hasEqVal = !!~val.indexOf(checkbox.getVal());

                if(hasEqVal) {
                    --notFoundValsCnt;
                    isChecked || (wasChanged = true);
                } else {
                    isChecked && (wasChanged = true);
                }

                return hasEqVal;
            });

        if(wasChanged && !notFoundValsCnt) {
            this._inSetVal = true;
            checkboxes.forEach(function(checkbox, i) {
                checkbox.setMod('checked', checkboxesCheckedModVals[i]);
            });
            this._inSetVal = false;
            this._val = val;
            this._emit('change', data);
        }

        return this;
    },

    /**
     * Returns name of control
     * @returns {String}
     */
    getName : function() {
        return this.getCheckboxes().get(0).getName();
    },

    /**
     * Returns checkboxes
     * @returns {Array[checkbox]}
     */
    getCheckboxes : function() {
        return this._checkboxes || (this._checkboxes = this.findChildBlocks(Checkbox));
    },

    _extractVal : function() {
        return this.getCheckboxes()
            .filter(function(checkbox) {
                return checkbox.hasMod('checked');
            })
            .map(function(checkbox) {
                return checkbox.getVal();
            });
    },

    _onCheckboxCheck : function() {
        if(!this._inSetVal) {
            this._val = this._extractVal();
            this._emit('change');
        }
    },

    _onCheckboxFocus : function(e) {
        this.setMod('focused', e.target.getMod('focused'));
    }
}, /** @lends checkbox-group */{
    lazyInit : true,
    onInit : function() {
        var ptp = this.prototype;
        this._events(Checkbox)
            .on({ modName : 'checked', modVal : '*' }, ptp._onCheckboxCheck)
            .on({ modName : 'focused', modVal : '*' }, ptp._onCheckboxFocus);
    }
}));

});

/* ../../common.blocks/checkbox-group/checkbox-group.js end */

/* ../../common.blocks/dropdown/dropdown.js begin */
/**
 * @module dropdown
 */

modules.define(
    'dropdown',
    ['i-bem-dom', 'popup'],
    function(provide, bemDom, Popup) {

/**
 * @exports
 * @class dropdown
 * @bem
 *
 * @bemmod opened Represents opened state
 */
provide(bemDom.declBlock(this.name, /** @lends dropdown.prototype */{
    beforeSetMod : {
        'opened' : {
            'true' : function() {
                if(this.hasMod('disabled')) return false;
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._switcher = null;
                this._popup = null;
            }
        },

        'opened' : function(_, modVal) {
            this.getPopup().setMod('visible', modVal);
            this._switcher.domElem.attr('aria-expanded', !!modVal);
        },

        'disabled' : {
            '*' : function(modName, modVal) {
                this.getSwitcher().setMod(modName, modVal);
            },

            'true' : function() {
                this.getPopup().delMod('visible');
            }
        }
    },

    /**
     * Returns popup
     * @returns {popup}
     */
    getPopup : function() {
        if(this._popup) return this._popup;

        this._popup = this.findMixedBlock(Popup).setAnchor(this.getSwitcher());
        this._popup._events().on({ modName : 'visible', modVal : '*' }, this._onPopupVisibilityChange, this);
        return this._popup;
    },

    /**
     * Returns switcher
     * @returns {i-bem-dom}
     */
    getSwitcher : function() {
        return this._switcher ||
            (this._switcher = this.findMixedBlock(this._getSwitcherClass()));
    },

    _getSwitcherClass : function() {
        return bemDom.declBlock(this.getMod('switcher'));
    },

    /**
     * On BEM click event handler
     * @param {events:Event} e
     * @protected
     */
    onSwitcherClick : function(e) {
        this._switcher || (this._switcher = e.target);
        this.toggleMod('opened');
    },

    _onPopupVisibilityChange : function(_, data) {
        this.setMod('opened', data.modVal);
    }
}, /** @lends dropdown */{
    lazyInit : true
}));

});

/* ../../common.blocks/dropdown/dropdown.js end */

/* ../../common.blocks/popup/popup.js begin */
/**
 * @module popup
 */

modules.define(
    'popup',
    ['i-bem-dom'],
    function(provide, bemDom) {

var ZINDEX_FACTOR = 1000,
    visiblePopupsZIndexes = {},
    undef;

/**
 * @exports
 * @class popup
 * @bem
 *
 * @param {Number} [zIndexGroupLevel=0] z-index group level
 *
 * @bemmod visible Represents visible state
 */
provide(bemDom.declBlock(this.name, /** @lends popup.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._parentPopup = undef;
                this._zIndex = null;
                this._zIndexGroupLevel = null;
                this._isAttachedToScope = false;
            },

            '' : function() {
                this.delMod('visible');
            }
        },

        'visible' : {
            'true' : function() {
                if(!this._isAttachedToScope) {
                    bemDom.scope.append(this.domElem);
                    this._isAttachedToScope = true;
                }

                this
                    ._captureZIndex()
                    ._bindToParentPopup()
                    ._domEvents().on('pointerpress pointerclick', this._setPreventHideByClick);

                this.domElem.removeAttr('aria-hidden');
            },

            '' : function() {
                this
                    ._releaseZIndex()
                    ._unbindFromParentPopup()
                    ._domEvents().un('pointerpress pointerclick', this._setPreventHideByClick);

                this.domElem.attr('aria-hidden', true);
            }
        }
    },

    /**
     * Sets content
     * @param {String|jQuery} content
     * @returns {popup} this
     */
    setContent : function(content) {
        bemDom.update(this.domElem, content);
        return this;
    },

    _calcZIndexGroupLevel : function() {
        var res = this.params.zIndexGroupLevel,
            parentPopup = this._getParentPopup();

        parentPopup && (res += parentPopup._zIndexGroupLevel);

        return res;
    },

    _setPreventHideByClick : function() {
        var curPopup = this;
        do {
            curPopup._preventHideByClick = true;
        } while(curPopup = curPopup._getParentPopup());
    },

    _bindToParentPopup : function() {
        var parentPopup = this._getParentPopup();
        parentPopup &&
            this._events(parentPopup).on({ modName : 'visible', modVal : '' }, this._onParentPopupHide, this);

        return this;
    },

    _unbindFromParentPopup : function() {
        this._parentPopup && this._events(this._parentPopup)
            .un({ modName : 'visible', modVal : '' }, this._onParentPopupHide, this);

        this._parentPopup = undef;

        return this;
    },

    _onParentPopupHide : function() {
        this.delMod('visible');
    },

    _getParentPopup : function() {
        return this._parentPopup;
    },

    _captureZIndex : function() {
        var level = this._zIndexGroupLevel === null?
                this._zIndexGroupLevel = this._calcZIndexGroupLevel() :
                this._zIndexGroupLevel,
            zIndexes = visiblePopupsZIndexes[level] || (visiblePopupsZIndexes[level] = [(level + 1) * ZINDEX_FACTOR]),
            prevZIndex = this._zIndex;

        this._zIndex = zIndexes[zIndexes.push(zIndexes[zIndexes.length - 1] + 1) - 1];
        this._zIndex !== prevZIndex && this.domElem.css('z-index', this._zIndex);

        return this;
    },

    _releaseZIndex : function() {
        var zIndexes = visiblePopupsZIndexes[this._zIndexGroupLevel];
        zIndexes.splice(zIndexes.indexOf(this._zIndex), 1);

        return this;
    },

    _recaptureZIndex : function() {
        this._releaseZIndex();
        this._zIndexGroupLevel = null;

        return this._captureZIndex();
    },

    _getDefaultParams : function() {
        return {
            zIndexGroupLevel : 0
        };
    }
}, /** @lends popup */{
    lazyInit : true
}));

});

/* ../../common.blocks/popup/popup.js end */

/* ../../common.blocks/popup/_autoclosable/popup_autoclosable.js begin */
/**
 * @module popup
 */

modules.define(
    'popup',
    ['jquery', 'i-bem-dom', 'ua', 'dom', 'keyboard__codes'],
    function(provide, $, bemDom, ua, dom, keyCodes, Popup) {

var KEYDOWN_EVENT = ua.opera && ua.version < 12.10? 'keypress' : 'keydown',
    visiblePopupsStack = [];

/**
 * @exports
 * @class popup
 * @bem
 */
provide(Popup.declMod({ modName : 'autoclosable', modVal : true }, /** @lends popup.prototype */{
    onSetMod : {
        'visible' : {
            'true' : function() {
                visiblePopupsStack.unshift(this);
                // NOTE: nextTick because of event bubbling to document
                this
                    ._nextTick(function() {
                        this._domEvents(bemDom.doc).on('pointerclick', this._onDocPointerClick);
                    })
                    .__base.apply(this, arguments);
            },

            '' : function() {
                visiblePopupsStack.splice(visiblePopupsStack.indexOf(this), 1);
                this._domEvents(bemDom.doc).un('pointerclick', this._onDocPointerClick);
                this.__base.apply(this, arguments);
            }
        }
    },

    _onDocPointerClick : function(e) {
        if(this.hasMod('target', 'anchor') && dom.contains(this._anchor, $(e.target)))
            return;

        this._preventHideByClick?
           this._preventHideByClick = null :
           this.delMod('visible');
    }
}, /** @lends popup */{
    lazyInit : true,
    onInit : function() {
        // TODO: checkme!
        // this._domEvents(bemDom.doc).on(KEYDOWN_EVENT, onDocKeyPress);
        bemDom.doc.on(KEYDOWN_EVENT, onDocKeyPress);
    }
}));

function onDocKeyPress(e) {
    e.keyCode === keyCodes.ESC &&
        // omit ESC in inputs, selects and etc.
        visiblePopupsStack.length &&
        !dom.isEditable($(e.target)) &&
            visiblePopupsStack[0].delMod('visible');
}

});

/* ../../common.blocks/popup/_autoclosable/popup_autoclosable.js end */

/* ../../common.blocks/popup/_target/popup_target.js begin */
/**
 * @module popup
 */

modules.define(
    'popup',
    ['i-bem-dom', 'objects'],
    function(provide, bemDom, objects, Popup) {

var VIEWPORT_ACCURACY_FACTOR = 0.99,
    DEFAULT_DIRECTIONS = [
        'bottom-left', 'bottom-center', 'bottom-right',
        'top-left', 'top-center', 'top-right',
        'right-top', 'right-center', 'right-bottom',
        'left-top', 'left-center', 'left-bottom'
    ],

    win = bemDom.win,
    undef;

/**
 * @exports
 * @class popup
 * @bem
 *
 * @param {Number} [mainOffset=0] offset along the main direction
 * @param {Number} [secondaryOffset=0] offset along the secondary direction
 * @param {Number} [viewportOffset=0] offset from the viewport (window)
 * @param {Array[String]} [directions] allowed directions
 */
provide(Popup.declMod({ modName : 'target', modVal : '*' }, /** @lends popup.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);

                this._lastDrawingCss = {
                    left : undef,
                    top : undef,
                    zIndex : undef,
                    display : undef
                };
            }
        },

        'visible' : {
            'true' : function() {
                this.__base.apply(this, arguments);
                this._domEvents(win).on('scroll resize', this._onWinScrollAndResize);
                this.redraw();
            },

            '' : function() {
                this.__base.apply(this, arguments);
                this._domEvents(win).un('scroll resize', this._onWinScrollAndResize);
            }
        }
    },

    /**
     * @override
     */
    setContent : function() {
        return this.__base.apply(this, arguments).redraw();
    },

    /**
     * Redraws popup
     * @returns {popup} this
     */
    redraw : function() {
        if(!this.hasMod('visible')) return this;

        var bestDrawingParams = this._calcBestDrawingParams();

        this.setMod('direction', bestDrawingParams.direction);

        var lastDrawingCss = this._lastDrawingCss,
            needUpdateCss = false;

        objects.each(
            this._calcDrawingCss(bestDrawingParams),
            function(val, name) {
                if(lastDrawingCss[name] !== val) {
                    lastDrawingCss[name] = val;
                    needUpdateCss = true;
                }
            });

        needUpdateCss && this.domElem.css(lastDrawingCss);

        return this;
    },

    _calcDrawingCss : function(drawingParams) {
        return {
            left : drawingParams.left,
            top : drawingParams.top
        };
    },

    /**
     * Returns possible directions to draw with max available width and height.
     * @returns {Array}
     */
    calcPossibleDrawingParams : function() {
        var target = this._calcTargetDimensions(),
            viewport = this._calcViewportDimensions(),
            params = this.params,
            mainOffset = params.mainOffset,
            secondaryOffset = params.secondaryOffset,
            viewportOffset = params.viewportOffset;

        return this.params.directions.map(function(direction) {
            var subRes = {
                    direction : direction,
                    width : 0,
                    height : 0,
                    left : 0,
                    top : 0
                };

            if(this._checkMainDirection(direction, 'bottom')) {
                subRes.top = target.top + target.height + mainOffset;
                subRes.height = viewport.bottom - subRes.top - viewportOffset;
            } else if(this._checkMainDirection(direction, 'top')) {
                subRes.height = target.top - viewport.top - mainOffset - viewportOffset;
                subRes.top = target.top - subRes.height - mainOffset;
            } else {
                if(this._checkSecondaryDirection(direction, 'center')) {
                    subRes.height = viewport.bottom - viewport.top - 2 * viewportOffset;
                    subRes.top = target.top + target.height / 2 - subRes.height / 2;
                } else if(this._checkSecondaryDirection(direction, 'bottom')) {
                    subRes.height = target.top + target.height - viewport.top - secondaryOffset - viewportOffset;
                    subRes.top = target.top + target.height - subRes.height - secondaryOffset;
                } else if(this._checkSecondaryDirection(direction, 'top')) {
                    subRes.top = target.top + secondaryOffset;
                    subRes.height = viewport.bottom - subRes.top - viewportOffset;
                }

                if(this._checkMainDirection(direction, 'left')) {
                    subRes.width = target.left - viewport.left - mainOffset - viewportOffset;
                    subRes.left = target.left - subRes.width - mainOffset;
                } else {
                    subRes.left = target.left + target.width + mainOffset;
                    subRes.width = viewport.right - subRes.left - viewportOffset;
                }
            }

            if(this._checkSecondaryDirection(direction, 'right')) {
                subRes.width = target.left + target.width - viewport.left - secondaryOffset - viewportOffset;
                subRes.left = target.left + target.width - subRes.width - secondaryOffset;
            } else if(this._checkSecondaryDirection(direction, 'left')) {
                subRes.left = target.left + secondaryOffset;
                subRes.width = viewport.right - subRes.left - viewportOffset;
            } else if(this._checkSecondaryDirection(direction, 'center')) {
                if(this._checkMainDirection(direction, 'top', 'bottom')) {
                    subRes.width = viewport.right - viewport.left - 2 * viewportOffset;
                    subRes.left = target.left + target.width / 2 - subRes.width / 2;
                }
            }

            return subRes;
        }, this);
    },

    _calcBestDrawingParams : function() {
        var popup = this._calcPopupDimensions(),
            target = this._calcTargetDimensions(),
            viewport = this._calcViewportDimensions(),
            directions = this.params.directions,
            i = 0,
            direction,
            pos,
            viewportFactor,
            bestDirection,
            bestPos,
            bestViewportFactor;

        while(direction = directions[i++]) {
            pos = this._calcPos(direction, target, popup);
            viewportFactor = this._calcViewportFactor(pos, viewport, popup);
            if(i === 1 ||
                    viewportFactor > bestViewportFactor ||
                    (!bestViewportFactor && this.hasMod('direction', direction))) {
                bestDirection = direction;
                bestViewportFactor = viewportFactor;
                bestPos = pos;
            }
            if(bestViewportFactor > VIEWPORT_ACCURACY_FACTOR) break;
        }

        return {
            direction : bestDirection,
            left : bestPos.left,
            top : bestPos.top
        };
    },

    _calcPopupDimensions : function() {
        var popupWidth = this.domElem.outerWidth(),
            popupHeight = this.domElem.outerHeight();

        return {
            width : popupWidth,
            height : popupHeight,
            area : popupWidth * popupHeight
        };
    },

    /**
     * @abstract
     * @protected
     * @returns {Object}
     */
    _calcTargetDimensions : function() {},

    _calcViewportDimensions : function() {
        var winTop = win.scrollTop(),
            winLeft = win.scrollLeft(),
            winWidth = win.width(),
            winHeight = win.height();

        return {
            top : winTop,
            left : winLeft,
            bottom : winTop + winHeight,
            right : winLeft + winWidth
        };
    },

    _calcPos : function(direction, target, popup) {
        var res = {},
            mainOffset = this.params.mainOffset,
            secondaryOffset = this.params.secondaryOffset;

        if(this._checkMainDirection(direction, 'bottom')) {
            res.top = target.top + target.height + mainOffset;
        } else if(this._checkMainDirection(direction, 'top')) {
            res.top = target.top - popup.height - mainOffset;
        } else if(this._checkMainDirection(direction, 'left')) {
            res.left = target.left - popup.width - mainOffset;
        } else if(this._checkMainDirection(direction, 'right')) {
            res.left = target.left + target.width + mainOffset;
        }

        if(this._checkSecondaryDirection(direction, 'right')) {
            res.left = target.left + target.width - popup.width - secondaryOffset;
        } else if(this._checkSecondaryDirection(direction, 'left')) {
            res.left = target.left + secondaryOffset;
        } else if(this._checkSecondaryDirection(direction, 'bottom')) {
            res.top = target.top + target.height - popup.height - secondaryOffset;
        } else if(this._checkSecondaryDirection(direction, 'top')) {
            res.top = target.top + secondaryOffset;
        } else if(this._checkSecondaryDirection(direction, 'center')) {
            if(this._checkMainDirection(direction, 'top', 'bottom')) {
                res.left = target.left + target.width / 2 - popup.width / 2;
            } else if(this._checkMainDirection(direction, 'left', 'right')) {
                res.top = target.top + target.height / 2 - popup.height / 2;
            }
        }

        return res;
    },

    _calcViewportFactor : function(pos, viewport, popup) {
        var viewportOffset = this.params.viewportOffset,
            intersectionLeft = Math.max(pos.left, viewport.left + viewportOffset),
            intersectionRight = Math.min(pos.left + popup.width, viewport.right - viewportOffset),
            intersectionTop = Math.max(pos.top, viewport.top + viewportOffset),
            intersectionBottom = Math.min(pos.top + popup.height, viewport.bottom - viewportOffset);

        return intersectionLeft < intersectionRight && intersectionTop < intersectionBottom? // has intersection
            (intersectionRight - intersectionLeft) *
                (intersectionBottom - intersectionTop) /
                popup.area :
            0;
    },

    _checkMainDirection : function(direction, mainDirection1, mainDirection2) {
        return !direction.indexOf(mainDirection1) || (mainDirection2 && !direction.indexOf(mainDirection2));
    },

    _checkSecondaryDirection : function(direction, secondaryDirection) {
        return ~direction.indexOf('-' + secondaryDirection);
    },

    _onWinScrollAndResize : function() {
        this.redraw();
    },

    _getDefaultParams : function() {
        return objects.extend(
            this.__base.apply(this, arguments),
            {
                mainOffset : 0,
                secondaryOffset : 0,
                viewportOffset : 0,
                directions : DEFAULT_DIRECTIONS
            });
    }
}));

});

/* ../../common.blocks/popup/_target/popup_target.js end */

/* ../../common.blocks/popup/_target/popup_target_anchor.js begin */
/**
 * @module popup
 */

modules.define(
    'popup',
    ['i-bem-dom', 'jquery', 'objects', 'functions__throttle', 'z-index-group'],
    function(provide, bemDom, $, objects, throttle, zIndexGroup, Popup) {

var body = $(bemDom.doc[0].body),
    UPDATE_TARGET_VISIBILITY_THROTTLING_INTERVAL = 100,
    undef;

/**
 * @exports
 * @class popup
 * @bem
 */
provide(Popup.declMod({ modName : 'target', modVal : 'anchor' }, /** @lends popup.prototype */{
    beforeSetMod : {
        'visible' : {
            'true' : function() {
                if(!this._anchor)
                    throw Error('Can\'t show popup without anchor');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);

                this._destructorClass = bemDom.declBlock('_' + this.__self.getName() + '-destructor');

                this._anchor = null;
                this._anchorParents = null;
                this._destructor = null;
                this._isAnchorVisible = undef;
                this._updateIsAnchorVisible = throttle(
                    this._updateIsAnchorVisible,
                    UPDATE_TARGET_VISIBILITY_THROTTLING_INTERVAL,
                    false,
                    this);
            },

            '' : function() {
                this.__base.apply(this, arguments);
                this._unbindFromDestructor(); // don't destruct anchor as it might be the same anchor for several popups
            }
        },

        'visible' : {
            'true' : function() {
                this._anchorParents = this._anchor.parents();
                this._bindToAnchorParents();

                this.__base.apply(this, arguments);
            },

            '' : function() {
                this.__base.apply(this, arguments);

                this._unbindFromAnchorParents();
                this._anchorParents = null;
                this._isAnchorVisible = undef;
            }
        }
    },

    /**
     * Sets target
     * @param {jQuery|bemDom} anchor DOM elem or anchor bemDom block
     * @returns {popup} this
     */
    setAnchor : function(anchor) {
        this
            ._unbindFromAnchorParents()
            ._unbindFromParentPopup()
            ._unbindFromDestructor();

        this._anchor = anchor.domElem || anchor;

        this._destructor = this._anchor.bem(this._destructorClass);
        this._isAnchorVisible = undef;

        this._bindToDestructor();

        if(this.hasMod('visible')) {
            this._anchorParents = this._anchor.parents();
            this
                ._recaptureZIndex()
                ._bindToAnchorParents()
                ._bindToParentPopup()
                .redraw();
        } else {
            this._anchorParents = null;
            this._zIndexGroupLevel = null;
        }

        return this;
    },

    /**
     * @override
     */
    _calcTargetDimensions : function() {
        var anchor = this._anchor,
            anchorOffset = anchor.offset(),
            bodyOffset = body.css('position') === 'static'?
                { left : 0, top : 0 } :
                body.offset();

        return {
            left : anchorOffset.left - bodyOffset.left,
            top : anchorOffset.top - bodyOffset.top,
            width : anchor.outerWidth(),
            height : anchor.outerHeight()
        };
    },

    /**
     * @override
     */
    _calcDrawingCss : function(drawingParams) {
        typeof this._isAnchorVisible === 'undefined' &&
            (this._isAnchorVisible = this._calcIsAnchorVisible());

        return objects.extend(
            this.__base(drawingParams),
            { display : this._isAnchorVisible? '' : 'none' });
    },

    /**
     * Calculates target visibility state
     * @private
     * @returns {Boolean} Whether state is visible
     */
    _calcIsAnchorVisible : function() {
        var anchor = this._anchor,
            anchorOffset = anchor.offset(),
            anchorLeft = anchorOffset.left,
            anchorTop = anchorOffset.top,
            anchorRight = anchorLeft + anchor.outerWidth(),
            anchorBottom = anchorTop + anchor.outerHeight(),
            direction = this.getMod('direction'),
            vertBorder = Math.floor(this._checkMainDirection(direction, 'top') ||
                    this._checkSecondaryDirection(direction, 'top')?
                anchorTop :
                anchorBottom),
            horizBorder = Math.floor(this._checkMainDirection(direction, 'left') ||
                    this._checkSecondaryDirection(direction, 'left')?
                anchorLeft :
                anchorRight),
            res = true;

        this._anchorParents.each(function() {
            if(this.tagName === 'BODY') return false;

            var parent = $(this),
                overflowY = parent.css('overflow-y'),
                checkOverflowY = overflowY === 'scroll' || overflowY === 'hidden' || overflowY === 'auto',
                overflowX = parent.css('overflow-x'),
                checkOverflowX = overflowX === 'scroll' || overflowX === 'hidden' || overflowX === 'auto';

            if(checkOverflowY || checkOverflowX) {
                var parentOffset = parent.offset();

                if(checkOverflowY) {
                    var parentTopOffset = Math.floor(parentOffset.top);
                    if(vertBorder < parentTopOffset || parentTopOffset + parent.outerHeight() < vertBorder) {
                        return res = false;
                    }
                }

                if(checkOverflowX) {
                    var parentLeftOffset = Math.floor(parentOffset.left);
                    return res = !(
                        horizBorder < parentLeftOffset ||
                        parentLeftOffset + parent.outerWidth() < horizBorder);
                }
            }
        });

        return res;
    },

    _calcZIndexGroupLevel : function() {
        var res = this.__base.apply(this, arguments);

        return this._destructor.findParentBlocks(zIndexGroup).reduce(
            function(res, zIndexGroupInstance) {
                return res + Number(zIndexGroupInstance.getMod('level'));
            },
            res);
    },

    _bindToAnchorParents : function() {
        this._domEvents(this._anchorParents).on('scroll', this._onAnchorParentsScroll);
        return this;
    },

    _unbindFromAnchorParents : function() {
        this._anchorParents && this._domEvents(this._anchorParents).un(
            'scroll',
            this._onAnchorParentsScroll);
        return this;
    },

    _onAnchorParentsScroll : function() {
        this
            .redraw()
            ._updateIsAnchorVisible();
    },

    /**
     * @override
     */
    _onWinScrollAndResize : function() {
        this.__base.apply(this, arguments);
        this._updateIsAnchorVisible();
    },

    _updateIsAnchorVisible : function() {
        if(!this.hasMod('js', 'inited') || !this.hasMod('visible'))
            return;

        var isAnchorVisible = this._calcIsAnchorVisible();
        if(isAnchorVisible !== this._isAnchorVisible) {
            this._isAnchorVisible = isAnchorVisible;
            this.redraw();
        }
    },

    _bindToDestructor : function() {
        this._events(this._destructor).on({ modName : 'js', modVal : '' }, this._onPopupAnchorDestruct, this);
        return this;
    },

    _unbindFromDestructor : function() {
        this._destructor &&
            this._events(this._destructor).un({ modName : 'js', modVal : '' }, this._onPopupAnchorDestruct, this);
        return this;
    },

    _onPopupAnchorDestruct : function() {
        bemDom.destruct(this.domElem);
    },

    _getParentPopup : function() {
        if(this._parentPopup) return this._parentPopup;

        var parentPopupDomElem = this._anchor.closest(Popup._buildSelector());

        return this._parentPopup = !!parentPopupDomElem.length && parentPopupDomElem.bem(Popup);
    }
}));

});

/* ../../common.blocks/popup/_target/popup_target_anchor.js end */

/* ../../common.blocks/z-index-group/z-index-group.js begin */
modules.define('z-index-group', ['i-bem-dom'], function(provide, bemDom) {

provide(bemDom.declBlock(this.name));

});

/* ../../common.blocks/z-index-group/z-index-group.js end */

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_button.js begin */
/**
 * @module dropdown
 */

modules.define('dropdown', ['button'], function(provide, Button, Dropdown) {

/**
 * @exports
 * @class dropdown
 * @bem
 */
provide(Dropdown.declMod({ modName : 'switcher', modVal : 'button' }, /** @lends dropdown.prototype */{
    onSetMod : {
        'opened' : function(_, modVal) {
            this.__base.apply(this, arguments);
            var switcher = this.getSwitcher();
            switcher.hasMod('togglable', 'check') && switcher.setMod('checked', modVal);
        }
    },
    getSwitcher : function() {
        return this._switcher ||
            (this._switcher = this.findMixedBlock(Button));
    }
}, /** @lends dropdown */{
    onInit : function() {
        this._events(Button).on('click', this.prototype.onSwitcherClick);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_button.js end */

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_link.js begin */
/**
 * @module dropdown
 */

modules.define('dropdown', ['link'], function(provide, Link, Dropdown) {

/**
 * @exports
 * @class dropdown
 * @bem
 */
provide(Dropdown.declMod({ modName : 'switcher', modVal : 'link' }, { /** @lends dropdown */
    getSwitcher : function() {
        return this._switcher ||
            (this._switcher = this.findMixedBlock(Link));
    }
}, {
    onInit : function() {
        this._events(Link).on('click', this.prototype.onSwitcherClick);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_link.js end */

/* ../../common.blocks/link/link.js begin */
/**
 * @module link
 */

modules.define(
    'link',
    ['i-bem-dom', 'control', 'events'],
    function(provide, bemDom, Control, events) {

/**
 * @exports
 * @class link
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends link.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._url = this.params.url || this.domElem.attr('href');

                this.hasMod('disabled') && this.domElem.removeAttr('href');
            }
        },

        'disabled' : {
            'true' : function() {
                this.__base.apply(this, arguments);
                this.domElem
                    .removeAttr('href')
                    .attr('aria-disabled', true);
            },

            '' : function() {
                this.__base.apply(this, arguments);
                this.domElem
                    .attr('href', this._url)
                    .removeAttr('aria-disabled');
            }
        }
    },

    /**
     * Returns url
     * @returns {String}
     */
    getUrl : function() {
        return this._url;
    },

    /**
     * Sets url
     * @param {String} url
     * @returns {link} this
     */
    setUrl : function(url) {
        this._url = url;
        this.hasMod('disabled') || this.domElem.attr('href', url);
        return this;
    },

    _onPointerClick : function(e) {
        if(this.hasMod('disabled')) {
            e.preventDefault();
        } else {
            var event = new events.Event('click');
            this._emit(event);
            event.isDefaultPrevented() && e.preventDefault();
        }
    }
}, /** @lends link */{
    lazyInit : true,
    onInit : function() {
        this._domEvents('control').on('pointerclick', this.prototype._onPointerClick);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/link/link.js end */

/* ../../common.blocks/link/_pseudo/link_pseudo.js begin */
/**
 * @module link
 */

modules.define('link', ['keyboard__codes'], function(provide, keyCodes, Link) {

/**
 * @exports
 * @class link
 * @bem
 */
provide(Link.declMod({ modName : 'pseudo', modVal : true }, /** @lends link.prototype */{
    onSetMod : {
        'focused' : {
            'true' : function() {
                this.__base.apply(this, arguments);

                this._domEvents('control').on('keydown', this._onKeyDown);
            },
            '' : function() {
                this.__base.apply(this, arguments);

                this._domEvents('control').un('keydown', this._onKeyDown);
            }
        }
    },

    _onPointerClick : function(e) {
        e.preventDefault();

        this.__base.apply(this, arguments);
    },

    _onKeyDown : function(e) {
        e.keyCode === keyCodes.ENTER && this._onPointerClick(e);
    }
}));

});

/* ../../common.blocks/link/_pseudo/link_pseudo.js end */

/* ../../common.blocks/input/input.js begin */
/**
 * @module input
 */

modules.define('input', ['i-bem-dom', 'control'], function(provide, bemDom, Control) {

/**
 * @exports
 * @class input
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends input.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._val = this._elem('control').domElem.val();
            }
        }
    },

    /**
     * Returns control value
     * @returns {String}
     * @override
     */
    getVal : function() {
        return this._val;
    },

    /**
     * Sets control value
     * @param {String} val value
     * @param {Object} [data] additional data
     * @returns {input} this
     */
    setVal : function(val, data) {
        val = String(val);

        if(this._val !== val) {
            this._val = val;

            var control = this._elem('control');
            control.domElem.val() !== val && control.domElem.val(val);

            this._emit('change', data);
        }

        return this;
    }
}, /** @lends input */{
    lazyInit : false,
    onInit : function() {
        this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/input/input.js end */

/* ../../touch.blocks/input/input.js begin */
/**
 * @module input
 */

modules.define('input', ['i-bem-dom'], function(provide, bemDom, Input) {

/**
 * @exports
 * @class input
 * @bem
 */
provide(bemDom.declBlock(Input, /** @lends input.prototype */{
    _onInputChanged : function() {
        this.setVal(this._elem('control').domElem.val());
    }
}, /** @lends input */{
    onInit : function() {
        this._domEvents('control').on('input', this.prototype._onInputChanged);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../touch.blocks/input/input.js end */

/* ../../common.blocks/input/_has-clear/input_has-clear.js begin */
/**
 * @module input
 */

modules.define('input', function(provide, Input) {

/**
 * @exports
 * @class input
 * @bem
 */
provide(Input.declMod({ modName : 'has-clear', modVal : true }, /** @lends input.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);

                this._events().on('change', this._updateClear);
                this._updateClear();
            }
        }
    },

    _onClearClick : function() {
        this
            .setVal('', { source : 'clear' })
            .setMod('focused');
    },

    _updateClear : function() {
        this._elem('clear').toggleMod('visible', true, !!this._val);
    }
}, /** @lends input */{
    onInit : function() {
        this._domEvents('clear').on('pointerclick', function() {
            this._onClearClick();
        });

        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/input/_has-clear/input_has-clear.js end */

/* ../../common.blocks/menu/menu.js begin */
/**
 * @module menu
 */

modules.define(
    'menu',
    ['i-bem-dom', 'control', 'keyboard__codes', 'menu__item'],
    function(provide, bemDom, Control, keyCodes, MenuItem) {

/** @const Number */
var TIMEOUT_KEYBOARD_SEARCH = 1500;

/**
 * @exports
 * @class menu
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends menu.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._hoveredItem = null;
                this._items = null;

                this._lastTyping = {
                    char : '',
                    text : '',
                    index : 0,
                    time : 0
                };
            }
        },

        'disabled' : {
            '*' : function(modName, modVal) {
                this.__base.apply(this, arguments);
                this.getItems().setMod(modName, modVal);
            },
            'true' : function() {
                this.__base.apply(this, arguments);
                this.domElem.attr('aria-disabled', true);
            },
            '' : function() {
                this.__base.apply(this, arguments);
                this.domElem.removeAttr('aria-disabled');
            }
        }
    },

    /**
     * Returns items
     * @returns {menu__item[]}
     */
    getItems : function() {
        return this._items || (this._items = this.findChildElems('item'));
    },

    /**
     * Sets content
     * @param {String|jQuery} content
     * @returns {menu} this
     */
    setContent : function(content) {
        bemDom.update(this.domElem, content);
        this._hoveredItem = null;
        this._items = null;
        return this;
    },

    /**
     * Search menu item by keyboard event
     * @param {jQuery.Event} e
     * @returns {menu__item}
     */
    searchItemByKeyboardEvent : function(e) {
        var currentTime = +new Date(),
            charCode = e.charCode,
            char = String.fromCharCode(charCode).toLowerCase(),
            lastTyping = this._lastTyping,
            index = lastTyping.index,
            isSameChar = char === lastTyping.char && lastTyping.text.length === 1,
            items = this.getItems();

        if(charCode <= keyCodes.SPACE || e.ctrlKey || e.altKey || e.metaKey) {
            lastTyping.time = currentTime;
            return null;
        }

        if(currentTime - lastTyping.time > TIMEOUT_KEYBOARD_SEARCH || isSameChar) {
            lastTyping.text = char;
        } else {
            lastTyping.text += char;
        }

        lastTyping.char = char;
        lastTyping.time = currentTime;

        // If key is pressed again, then continue to search to next menu item
        if(isSameChar && items.get(index).getText().search(lastTyping.char) === 0) {
            index = index >= items.size() - 1? 0 : index + 1;
        }

        // 2 passes: from index to items.size() and from 0 to index.
        var i = index, len = items.size();
        while(i < len) {
            if(this._doesItemMatchText(items.get(i), lastTyping.text)) {
                lastTyping.index = i;
                return items.get(i);
            }

            i++;

            if(i === items.size()) {
                i = 0;
                len = index;
            }
        }

        return null;
    },

    /** @override **/
    _onFocus : function() {
        this.__base.apply(this, arguments);
        this._domEvents(bemDom.doc) // NOTE: should be called after __base
            .on('keydown', this._onKeyDown)
            .on('keypress', this._onKeyPress);
    },

    /** @override **/
    _onBlur : function() {
        this._domEvents(bemDom.doc)
            .un('keydown', this._onKeyDown)
            .un('keypress', this._onKeyPress);

        this.__base.apply(this, arguments);
        this._hoveredItem && this._hoveredItem.delMod('hovered');
    },

    /**
     * @param {Object} item
     * @private
     */
    _onItemHover : function(item) {
        if(item.hasMod('hovered')) {
            this._hoveredItem && this._hoveredItem.delMod('hovered');
            this._scrollToItem(this._hoveredItem = item);
            this.domElem.attr('aria-activedescendant', item.domElem.attr('id'));
        } else if(this._hoveredItem === item) {
            this._hoveredItem = null;
            this.domElem.removeAttr('aria-activedescendant');
        }
        this._emit('item-hover', { item : item });
    },

    /**
     * @param {Object} item
     * @private
     */
    _scrollToItem : function(item) {
        var domElemOffsetTop = this.domElem.offset().top,
            itemDomElemOffsetTop = item.domElem.offset().top,
            relativeScroll;

        if((relativeScroll = itemDomElemOffsetTop - domElemOffsetTop) < 0 ||
            (relativeScroll =
                itemDomElemOffsetTop +
                item.domElem.outerHeight() -
                domElemOffsetTop -
                this.domElem.outerHeight()) > 0) {
            this.domElem.scrollTop(this.domElem.scrollTop() + relativeScroll);
        }
    },

    /**
     * @param {Object} item
     * @param {Object} data
     * @private
     */
    _onItemClick : function(item, data) {
        this._emit('item-click', { item : item, source : data.source });
    },

    /**
     * @param {jQuery.Event} e
     * @private
     */
    _onKeyDown : function(e) {
        var keyCode = e.keyCode,
            isArrow = keyCode === keyCodes.UP || keyCode === keyCodes.DOWN;

        if(isArrow && !e.shiftKey) {
            e.preventDefault();

            var dir = keyCode - 39, // using the features of key codes for "up"/"down" ;-)
                items = this.getItems(),
                len = items.size(),
                hoveredIdx = items.toArray().indexOf(this._hoveredItem),
                nextIdx = hoveredIdx,
                i = 0;

            do {
                nextIdx += dir;
                nextIdx = nextIdx < 0? len - 1 : nextIdx >= len? 0 : nextIdx;
                if(++i === len) return; // if we have no next item to hover
            } while(items.get(nextIdx).hasMod('disabled'));

            this._lastTyping.index = nextIdx;

            items.get(nextIdx).setMod('hovered');
        }
    },

    /**
     * @param {jQuery.Event} e
     * @private
     */
    _onKeyPress : function(e) {
        var item = this.searchItemByKeyboardEvent(e);
        item && item.setMod('hovered');
    },

    /**
     * @param {Object} item
     * @param {String} text
     * @private
     */
    _doesItemMatchText : function(item, text) {
        return !item.hasMod('disabled') &&
            item.getText().toLowerCase().search(text) === 0;
    }
}, /** @lends menu */{
    lazyInit : true,
    onInit : function() {
        this._events(MenuItem)
            .on({ modName : 'hovered', modVal : '*' }, function(e) {
                this._onItemHover(e.target);
            })
            .on('click', function(e, data) {
                this._onItemClick(e.target, data);
            });

        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/menu/menu.js end */

/* ../../common.blocks/menu/__item/menu__item.js begin */
/**
 * @module menu__item
 */

modules.define('menu__item', ['i-bem-dom'], function(provide, bemDom) {

/**
 * @exports
 * @class menu__item
 * @bem
 *
 * @param val Value of item
 */
provide(bemDom.declElem('menu', 'item', /** @lends menu__item.prototype */{
    beforeSetMod : {
        'hovered' : {
            'true' : function() {
                return !this.hasMod('disabled');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._domEvents().on('pointerleave', this._onPointerLeave);
            }
        },

        'disabled' : {
            'true' : function() {
                this
                    .delMod('hovered')
                    .domElem.attr('aria-disabled', true);
            },
            '' : function() {
                this.domElem.removeAttr('aria-disabled');
            }
        },

        'checked' : {
            '*' : function(_, modVal) {
                this.domElem.attr('aria-checked', !!modVal);
            }
        }
    },

    /**
     * Checks whether given value is equal to current value
     * @param {String|Number} val
     * @returns {Boolean}
     */
    isValEq : function(val) {
        // NOTE: String(true) == String(1) -> false
        return String(this.params.val) === String(val);
    },

    /**
     * Returns item value
     * @returns {*}
     */
    getVal : function() {
        return this.params.val;
    },

    /**
     * Returns item text
     * @returns {String}
     */
    getText : function() {
        return this.params.text || this.domElem.text();
    },

    _onPointerOver : function() {
        this.setMod('hovered');
    },

    _onPointerLeave : function() {
        this.delMod('hovered');
    },

    _onPointerClick : function() {
        this.hasMod('disabled') || this._emit('click', { source : 'pointer' });
    }
}, /** @lends menu__item */{
    lazyInit : true,
    onInit : function() {
        var ptp = this.prototype;

        this._domEvents()
            .on('pointerover', ptp._onPointerOver)
            .on('pointerclick', ptp._onPointerClick);
    }
}));

});

/* ../../common.blocks/menu/__item/menu__item.js end */

/* ../../common.blocks/menu/_mode/menu_mode.js begin */
/**
 * @module menu
 */

modules.define('menu', ['i-bem-dom', 'keyboard__codes'], function(provide, bemDom, keyCodes, Menu) {

/**
 * @exports
 * @class menu
 * @bem
 */
provide(Menu.declMod({ modName : 'mode', modVal : '*' }, /** @lends menu.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._val = null;
                this._isValValid = false;
            }
        }
    },

    _onKeyDown : function(e) {
        if(e.keyCode === keyCodes.ENTER || e.keyCode === keyCodes.SPACE) {
            this._domEvents(bemDom.doc)
                .un('keydown', this._onKeyDown)
                .on('keyup', this._onKeyUp);

            e.keyCode === keyCodes.SPACE && e.preventDefault();
            this._onItemClick(this._hoveredItem, { source : 'keyboard' });
        }
        this.__base.apply(this, arguments);
    },

    _onKeyUp : function() {
        this._domEvents(bemDom.doc).un('keyup', this._onKeyUp);
        // it could be unfocused while is key being pressed
        this.hasMod('focused') && this._domEvents(bemDom.doc).on('keydown', this._onKeyDown);
    },

    /**
     * Returns menu value
     * @returns {*}
     */
    getVal : function() {
        if(!this._isValValid) {
            this._val = this._getVal();
            this._isValValid = true;
        }
        return this._val;
    },

    /**
     * @abstract
     * @protected
     * @returns {*}
     */
    _getVal : function() {
        throw Error('_getVal is not implemented');
    },

    /**
     * Sets menu value
     * @param {*} val
     * @returns {menu} this
     */
    setVal : function(val) {
        if(this._setVal(val)) {
            this._val = val;
            this._isValValid = true;
            this._emit('change');
        }
        return this;
    },

    /**
     * @abstract
     * @protected
     * @param {*} val
     * @returns {Boolean} returns true if value was changed
     */
    _setVal : function() {
        throw Error('_setVal is not implemented');
    },

    _updateItemsCheckedMod : function(modVals) {
        var items = this.getItems();
        modVals.forEach(function(modVal, i) {
            items.get(i).setMod('checked', modVal);
        });
    },

    /**
     * Sets content
     * @override
     */
    setContent : function() {
        var res = this.__base.apply(this, arguments);
        this._isValValid = false;
        this._emit('change'); // NOTE: potentially unwanted event could be emitted
        return res;
    }
}));

});

/* ../../common.blocks/menu/_mode/menu_mode.js end */

/* ../../common.blocks/menu/_mode/menu_mode_check.js begin */
/**
 * @module menu
 */

modules.define('menu', function(provide, Menu) {

/**
 * @exports
 * @class menu
 * @bem
 */
provide(Menu.declMod({ modName : 'mode', modVal : 'check' }, /** @lends menu.prototype */{
    /**
     * @override
     */
    _getVal : function() {
        return this.getItems()
            .filter(function(item) { return item.hasMod('checked'); })
            .map(function(item) { return item.getVal(); });
    },

    /**
     * @override
     * @param {Array} vals
     */
    _setVal : function(vals) {
        var wasChanged = false,
            notFoundValsCnt = vals.length,
            itemsCheckedVals = this.getItems().map(function(item) {
                var isChecked = item.hasMod('checked'),
                    hasEqVal = vals.some(function(val) {
                        return item.isValEq(val);
                    });
                if(hasEqVal) {
                    --notFoundValsCnt;
                    isChecked || (wasChanged = true);
                } else {
                    isChecked && (wasChanged = true);
                }
                return hasEqVal;
            });

        if(!wasChanged || notFoundValsCnt)
            return false;

        this._updateItemsCheckedMod(itemsCheckedVals);

        return wasChanged;
    },

    /**
     * @override
     */
    _onItemClick : function(clickedItem) {
        this.__base.apply(this, arguments);

        this.getItems().forEach(function(item) {
            item === clickedItem && item.toggleMod('checked');
        });
        this._isValValid = false;
        this._emit('change');
    }
}));

});

/* ../../common.blocks/menu/_mode/menu_mode_check.js end */

/* ../../common.blocks/menu/_mode/menu_mode_radio-check.js begin */
/**
 * @module menu
 */

modules.define('menu', function(provide, Menu) {

/**
 * @exports
 * @class menu
 * @bem
 */
provide(Menu.declMod({ modName : 'mode', modVal : 'radio-check' }, /** @lends menu.prototype */{
    /**
     * @override
     */
    _getVal : function() {
        var items = this.getItems(),
            i = 0, item;
        while(item = items.get(i++))
            if(item.hasMod('checked'))
                return item.getVal();
    },

    /**
     * @override
     */
    _setVal : function(val) {
        var isValUndefined = typeof val === 'undefined',
            wasChanged = false,
            hasVal = false,
            itemsCheckedVals = this.getItems().map(function(item) {
                if(isValUndefined) {
                    item.hasMod('checked') && (wasChanged = true);
                    return false;
                }

                if(!item.isValEq(val)) return false;

                item.hasMod('checked') || (wasChanged = true);
                return hasVal = true;
            });

        if(!isValUndefined && !hasVal) return false;

        this._updateItemsCheckedMod(itemsCheckedVals);

        return wasChanged;
    },

    /**
     * @override
     */
    _onItemClick : function(clickedItem) {
        this.__base.apply(this, arguments);

        this.getItems().forEach(function(item) {
            item === clickedItem?
                item.toggleMod('checked') :
                item.delMod('checked');
        });
        this._isValValid = false;
        this._emit('change');
    }
}));

});

/* ../../common.blocks/menu/_mode/menu_mode_radio-check.js end */

/* ../../common.blocks/menu/_mode/menu_mode_radio.js begin */
/**
 * @module menu
 */

modules.define('menu', function(provide, Menu) {

/**
 * @exports
 * @class menu
 * @bem
 */
provide(Menu.declMod({ modName : 'mode', modVal : 'radio' }, /** @lends menu.prototype */{
    /**
     * @override
     */
    _getVal : function() {
        var items = this.getItems(),
            i = 0,
            item;

        while(item = items.get(i++))
            if(item.hasMod('checked'))
                return item.getVal();
    },

    /**
     * @override
     */
    _setVal : function(val) {
        var wasChanged = false,
            hasVal = false,
            itemsCheckedVals = this.getItems().map(function(item) {
                if(!item.isValEq(val)) return false;

                item.hasMod('checked') || (wasChanged = true);
                return hasVal = true;
            });

        if(!hasVal) return false;

        this._updateItemsCheckedMod(itemsCheckedVals);

        return wasChanged;
    },

    /**
     * @override
     */
    _onItemClick : function(clickedItem) {
        this.__base.apply(this, arguments);

        var isChanged = false;
        this.getItems().forEach(function(item) {
            if(item === clickedItem) {
                if(!item.hasMod('checked')) {
                    item.setMod('checked', true);
                    this._isValValid = false;
                    isChanged = true;
                }
            } else {
                item.delMod('checked');
            }
        }, this);
        isChanged && this._emit('change');
    }
}));

});

/* ../../common.blocks/menu/_mode/menu_mode_radio.js end */

/* ../../common.blocks/menu/__item/_type/menu__item_type_link.js begin */
/**
 * @module menu__item
 */

modules.define('menu__item', ['link'], function(provide, Link, MenuItem) {

/**
 * @exports
 * @class menu__item
 * @bem
 */
provide(MenuItem.declMod({ modName : 'type', modVal : 'link' }, /** @lends menu__item.prototype */{
    onSetMod : {
        'hovered' : {
            'true' : function() {
                this._block().hasMod('focused') &&
                    this._getLink().setMod('focused');
            },

            '' : function() {
                var menu = this._block();
                menu.hasMod('focused') && menu.domElem.focus(); // NOTE: keep DOM-based focus within our menu
            }
        },

        'disabled' : function(modName, modVal) {
            this.__base.apply(this, arguments);
            this._getLink().setMod(modName, modVal);
        }
    },

    _getLink : function() {
        return this._link || (this._link = this.findChildBlock(Link));
    },

    _onFocus : function() {
        this.setMod('hovered');
    }
}, /** @lends menu__item */{
    lazyInit : true,
    onInit : function() {
        this._domEvents().on('focusin', this.prototype._onFocus);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/menu/__item/_type/menu__item_type_link.js end */

/* ../../common.blocks/modal/modal.js begin */
/**
 * @module modal
 */

modules.define(
    'modal',
    ['i-bem-dom', 'popup'],
    function(provide, bemDom, Popup) {

/**
 * @exports
 * @class modal
 * @bem
 *
 * @bemmod visible Represents visible state
 */
provide(bemDom.declBlock(this.name, /** @lends modal.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._popup = this.findMixedBlock(Popup);
            },

            '' : function() {
                this.delMod('visible');
            }
        },

        'visible' : function(modName, modVal) {
            this._popup.setMod(modName, modVal);
        }
    },

    /**
     * Sets content
     * @param {String|jQuery} content
     * @returns {modal} this
     */
    setContent : function(content) {
        bemDom.update(this._elem('content').domElem, content);
        return this;
    }
}, /** @lends modal */{
    lazyInit : true
}));

});

/* ../../common.blocks/modal/modal.js end */

/* ../../common.blocks/modal/_autoclosable/modal_autoclosable.js begin */
/**
 * @module modal
 */

modules.define(
    'modal',
    ['jquery', 'dom'],
    function(provide, $, dom, Modal) {

/**
 * @exports
 * @class modal
 * @bem
 */
provide(Modal.declMod({ modName : 'autoclosable', modVal : true }, /** @lends modal.prototype */{
    onSetMod : {
        'visible' : {
            'true' : function() {
                this.__base.apply(this, arguments);

                this
                    ._nextTick(function() {
                        this._domEvents().on('pointerclick', this._onPointerClick);
                    })
                    ._popup._events().on({ modName : 'visible', modVal : '' }, this._onPopupHide, this);
            }
        }
    },

    _onPointerClick : function(e) {
        dom.contains(this._elem('content').domElem, $(e.target)) || this.delMod('visible');
    },

    _onPopupHide : function() {
        this.delMod('visible');
    }
}));

});

/* ../../common.blocks/modal/_autoclosable/modal_autoclosable.js end */

/* ../../common.blocks/popup/_target/popup_target_position.js begin */
/**
 * @module popup
 */

modules.define(
    'popup',
    function(provide, Popup) {

/**
 * @exports
 * @class popup
 * @bem
 */
provide(Popup.declMod({ modName : 'target', modVal : 'position' }, /** @lends popup.prototype */{
    beforeSetMod : {
        'visible' : {
            'true' : function() {
                if(!this._position)
                    throw Error('Can\'t show popup without position');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._position = null;
            }
        }
    },

    /**
     * Sets position
     * @param {Number} left x-coordinate
     * @param {Number} top y-coordinate
     * @returns {popup} this
     */
    setPosition : function(left, top) {
        this._position = { left : left, top : top };
        return this.redraw();
    },

    /**
     * @override
     */
    _calcTargetDimensions : function() {
        var pos = this._position;

        return {
            left : pos.left,
            top : pos.top,
            width : 0,
            height : 0
        };
    }
}));

});

/* ../../common.blocks/popup/_target/popup_target_position.js end */

/* ../../common.blocks/progressbar/progressbar.js begin */
/**
 * @module progressbar
 */

modules.define('progressbar', ['i-bem-dom'], function(provide, bemDom) {

/**
 * @exports
 * @class progressbar
 * @bem
 */
provide(bemDom.declBlock(this.name, /** @lends progressbar.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._val = this.params.val;
            }
        }
    },

    /**
     * Sets bar's width
     * @param {Number} val
     * @returns {progressbar} this
     */
    setVal : function(val) {
        this.domElem.attr('aria-valuenow', (this._val = val) + '%');
        this._elem('bar').domElem.css('width', val + '%');
        return this;
    },

    /**
     * Get bar's val
     * @returns {Number}
     */
    getVal : function() {
        return this._val;
    }

}, /** @lends progressbar */{
    lazyInit : true
}));

});

/* ../../common.blocks/progressbar/progressbar.js end */

/* ../../common.blocks/radio/radio.js begin */
/**
 * @module radio
 */

modules.define(
    'radio',
    ['i-bem-dom', 'control'],
    function(provide, bemDom, Control) {

/**
 * @exports
 * @class radio
 * @augments control
 * @bem
 */
provide(bemDom.declBlock(this.name, Control, /** @lends radio.prototype */{
    onSetMod : {
        'checked' : {
            'true' : function() {
                this._elem('control').domElem
                    .attr('checked', true)
                    .prop('checked', true);
            },
            '' : function() {
                this._elem('control').domElem
                    .removeAttr('checked')
                    .prop('checked', false);
            }
        }
    },

    _onChange : function() {
        this.hasMod('disabled') || this.setMod('checked');
    }
}, /** @lends radio */{
    lazyInit : true,
    onInit : function() {
        this._domEvents().on('change', this.prototype._onChange);
        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/radio/radio.js end */

/* ../../common.blocks/radio/_type/radio_type_button.js begin */
/**
 * @module radio
 */

modules.define('radio', ['button', 'functions'], function(provide, Button, Functions, Radio) {

/**
 * @exports
 * @class radio
 * @bem
 */
provide(Radio.declMod({ modName : 'type', modVal : 'button' }, /** @lends radio.prototype */{
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this._button = this.findChildBlock(Button);
                this._events(Button)
                    .on(
                        { modName : 'checked', modVal : '*' },
                        proxyModFromButton,
                        this)
                    .on(
                        { modName : 'focused', modVal : '*' },
                        proxyModFromButton,
                        this);
            }
        },

        'checked' : proxyModToButton,
        'disabled' : proxyModToButton,
        'focused' : function(modName, modVal) {
            proxyModToButton.call(this, modName, modVal, false);
        }
    }
}, /** @lends radio */{
    lazyInit : true,
    onInit : function() {
        this._events(Button).on({ modName : 'js', modVal : 'inited' }, Functions.noop);
        return this.__base.apply(this, arguments);
    }
}));

function proxyModToButton(modName, modVal, callBase) {
    callBase !== false && this.__base.apply(this, arguments);
    this._button.setMod(modName, modVal);
}

function proxyModFromButton(_, data) {
    this.setMod(data.modName, data.modVal);
}

});

/* ../../common.blocks/radio/_type/radio_type_button.js end */

/* ../../common.blocks/radio-group/radio-group.js begin */
/**
 * @module radio-group
 */

modules.define(
    'radio-group',
    ['i-bem-dom', 'jquery', 'dom', 'radio'],
    function(provide, bemDom, $, dom, Radio) {

var undef;
/**
 * @exports
 * @class radio-group
 * @bem
 */
provide(bemDom.declBlock(this.name, /** @lends radio-group.prototype */{
    beforeSetMod : {
        'focused' : {
            'true' : function() {
                return !this.hasMod('disabled');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._checkedRadio = this.findChildBlock({
                    block : Radio,
                    modName : 'checked',
                    modVal : true
                });

                this._inSetVal = false;
                this._val = this._checkedRadio? this._checkedRadio.getVal() : undef;
                this._radios = undef;
            }
        },

        'disabled' : function(modName, modVal) {
            this.getRadios().setMod(modName, modVal);
        },

        'focused' : {
            'true' : function() {
                if(dom.containsFocus(this.domElem)) return;

                var radios = this.getRadios(),
                    i = 0, radio;

                while(radio = radios.get(i++)) {
                    if(radio.setMod('focused').hasMod('focused')) { // we need to be sure that radio has got focus
                        return;
                    }
                }
            },

            '' : function() {
                var focusedRadio = this.findChildBlock({
                        block : Radio,
                        modName : 'focused',
                        modVal : true
                    });

                focusedRadio && focusedRadio.delMod('focused');
            }
        }
    },

    /**
     * Returns control value
     * @returns {String}
     */
    getVal : function() {
        return this._val;
    },

    /**
     * Sets control value
     * @param {String} val value
     * @param {Object} [data] additional data
     * @returns {radio-group} this
     */
    setVal : function(val, data) {
        var isValUndef = val === undef;

        isValUndef || (val = String(val));

        if(this._val !== val) {
            if(isValUndef) {
                this._val = undef;
                this._checkedRadio.delMod('checked');
                this._emit('change', data);
            } else {
                var radio = this._getRadioByVal(val);
                if(radio) {
                    this._inSetVal = true;

                    this._val !== undef && this._getRadioByVal(this._val).delMod('checked');
                    this._val = radio.getVal();
                    radio.setMod('checked');

                    this._inSetVal = false;
                    this._emit('change', data);
                }
            }
        }

        return this;
    },

    /**
     * Returns name of control
     * @returns {String}
     */
    getName : function() {
        return this.getRadios().get(0).getName();
    },

    /**
     * Returns options
     * @returns {radio[]}
     */
    getRadios : function() {
        return this._radios || (this._radios = this.findChildBlocks(Radio));
    },

    _getRadioByVal : function(val) {
        var radios = this.getRadios(),
            i = 0, option;

        while(option = radios.get(i++)) {
            if(option.getVal() === val) {
                return option;
            }
        }
    },

    _onRadioCheck : function(e) {
        var radioVal = (this._checkedRadio = e.target).getVal();
        if(!this._inSetVal) {
            if(this._val === radioVal) {
                // on block init value set in constructor, we need remove old checked and emit "change" event
                this.getRadios().forEach(function(radio) {
                    radio.getVal() !== radioVal && radio.delMod('checked');
                });
                this._emit('change');
            } else {
                this.setVal(radioVal);
            }
        }
    },

    _onRadioFocus : function(e) {
        this.setMod('focused', e.target.getMod('focused'));
    }
}, /** @lends radio-group */{
    lazyInit : true,
    onInit : function() {
        var ptp = this.prototype;
        this._events(Radio)
            .on({ modName : 'checked', modVal : true }, ptp._onRadioCheck)
            .on({ modName : 'focused', modVal : '*' }, ptp._onRadioFocus);
    }
}));

});

/* ../../common.blocks/radio-group/radio-group.js end */

/* ../../common.blocks/radio-group/_mode/radio-group_mode_radio-check.js begin */
/**
 * @module radio-group
 */

modules.define('radio-group', ['radio'], function(provide, Radio, RadioGroup) {

var undef;

/**
 * @exports
 * @class radio-group
 * @bem
 */
provide(RadioGroup.declMod({ modName : 'mode', modVal : 'radio-check' }, /** @lends radio-group.prototype */{
    _onRadioUncheck : function(e) {
        this._checkedRadio === e.target && this.setVal(undef);
    }
}, /** @lends radio-group */{
    lazyInit : true,
    onInit : function() {
        this._events(Radio).on(
            { modName : 'checked', modVal : '' },
            this.prototype._onRadioUncheck);

        return this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/radio-group/_mode/radio-group_mode_radio-check.js end */

/* ../../common.blocks/select/select.js begin */
/**
 * @module select
 */

modules.define(
    'select',
    ['i-bem-dom', 'popup', 'menu', 'menu__item', 'button', 'jquery', 'dom', 'keyboard__codes', 'strings__escape'],
    function(provide, bemDom, Popup, Menu, MenuItem, Button, $, dom, keyCodes, escape) {

/**
 * @exports
 * @class select
 * @bem
 *
 * @bemmod opened Represents opened state
 */
provide(bemDom.declBlock(this.name, /** @lends select.prototype */{
    beforeSetMod : {
        'opened' : {
            'true' : function() {
                return !this.hasMod('disabled');
            }
        },

        'focused' : {
            '' : function() {
                return !this._isPointerPressInProgress;
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._button = this.findChildBlock(Button);
                this._events(Button).on('click', this._onButtonClick, this);

                this._popup = this.findChildBlock(Popup)
                    .setAnchor(this._button);
                this._events(Popup).on({ modName : 'visible', modVal : '' }, this._onPopupHide, this);

                this._menu = this._popup.findChildBlock(Menu);
                this._events(this._menu)
                    .on('change', this._onMenuChange, this)
                    .on('item-click', this._onMenuItemClick, this)
                    .on('item-hover', this._onMenuItemHover, this);

                this._isPointerPressInProgress = false;
                this._buttonWidth = null;

                this.hasMod('focused') && this._focus();
            }
        },

        'focused' : {
            'true' : function() {
                this._focus();
            },

            '' : function() {
                this._blur();
            }
        },

        'opened' : {
            '*' : function(_, modVal) {
                this._menu.setMod('focused', modVal);
            },

            'true' : function() {
                this._buttonWidth === null && this._updateMenuWidth();

                this._updateMenuHeight();
                this._popup.setMod('visible');
                this._domEvents(bemDom.doc).on('pointerpress', this._onDocPointerPress);
                this.setMod('focused')
                    ._hoverCheckedOrFirstItem();
            },

            '' : function() {
                this._domEvents(bemDom.doc).un('pointerpress', this._onDocPointerPress);
                this._popup.delMod('visible');
            }
        },

        'disabled' : {
            '*' : function(modName, modVal) {
                this._button.setMod(modName, modVal);
                this._menu.setMod(modName, modVal);
            },

            'true' : function() {
                this._elems('control').forEach(function(control) {
                    control.domElem.attr('disabled', true);
                });
                this._popup.delMod('visible');
            },

            '' : function() {
                this._elems('control').forEach(function(control) {
                    control.domElem.removeAttr('disabled');
                });
            }
        }
    },

    /**
     * Get value
     * @returns {*}
     */
    getVal : function() {
        return this._menu.getVal();
    },

    /**
     * Set value
     * @param {*} val
     * @returns {select} this
     */
    setVal : function(val) {
        this._menu.setVal(val);
        return this;
    },

    /**
     * Get name
     * @returns {String}
     */
    getName : function() {
        return this.params.name;
    },

    _getDefaultParams : function() {
        return {
            optionsMaxHeight : Number.POSITIVE_INFINITY
        };
    },

    _focus : function() {
        this._domEvents('button')
            .on('keydown', this._onKeyDown)
            .on('keypress', this._onKeyPress);

        this._button.setMod('focused');
    },

    _blur : function() {
        this._domEvents('button')
            .un('keydown', this._onKeyDown)
            .un('keypress', this._onKeyPress);

        this.delMod('opened');
        this._button.delMod('focused');
    },

    _updateMenuWidth : function() {
        this._menu.domElem.css('min-width', this._buttonWidth = this._button.domElem.outerWidth());

        this._popup.redraw();
    },

    _updateMenuHeight : function() {
        var drawingParams = this._popup.calcPossibleDrawingParams(),
            menuDomElem = this._menu.domElem,
            menuWidth = menuDomElem.outerWidth(),
            bestHeight = 0;

        drawingParams.forEach(function(params) {
            params.width >= menuWidth && params.height > bestHeight && (bestHeight = params.height);
        });

        bestHeight && menuDomElem.css('max-height', Math.min(this.params.optionsMaxHeight, bestHeight));
    },

    _getCheckedItems : function() {
        return this._menu.getItems().filter(function(item) {
            return item.hasMod('checked');
        });
    },

    _hoverCheckedOrFirstItem : function() { // NOTE: may be it should be moved to menu
        (this._getCheckedItems().get(0) || this._menu.getItems().get(0))
            .setMod('hovered');
    },

    _onKeyDown : function(e) {
        if(this.hasMod('opened')) {
            if(e.keyCode === keyCodes.ESC) {
                // NOTE: stop propagation to prevent from being listened by global handlers
                e.stopPropagation();
                this.delMod('opened');
            }
        } else if((e.keyCode === keyCodes.UP || e.keyCode === keyCodes.DOWN) && !e.shiftKey) {
            e.preventDefault();
            this.setMod('opened');
        }
    },

    _onKeyPress : function(e) {
        // press a key: closed select - set value, opened select - set hover on menu-item.
        if(!this.hasMod('opened')) {
            var item = this._menu.searchItemByKeyboardEvent(e);
            item && this._setSingleVal(item.getVal());
        }
    },

    _setSingleVal : function(value) {
        this.setVal(value);
    },

    _onMenuChange : function() {
        this._updateControl();
        this._updateButton();

        this.hasMod('opened')?
            this._updateMenuWidth() :
            this._buttonWidth = null;

        this._emit('change');
    },

    _onMenuItemClick : function() {},

    _onMenuItemHover : function(e, data) {
        var item = data.item;
        item.hasMod('hovered')?
            this._button.domElem.attr('aria-activedescendant', item.domElem.attr('id')) :
            this._button.domElem.removeAttr('aria-activedescendant');
    },

    _updateControl : function() {},

    _updateButton : function() {},

    _onButtonClick : function() {
        this.toggleMod('opened');
    },

    _onButtonFocusChange : function(e, data) {
        this.setMod('focused', data.modVal);
    },

    _onPopupHide : function() {
        this.delMod('opened');
    },

    _onDocPointerPress : function(e) {
        if(this._isEventInPopup(e)) {
            e.pointerType === 'mouse' && e.preventDefault(); // prevents button blur in most desktop browsers
            this._isPointerPressInProgress = true;
            this._domEvents(bemDom.doc).on(
                'pointerrelease',
                { focusedHardMod : this._button.getMod('focused-hard') },
                this._onDocPointerRelease);
        }
    },

    _onDocPointerRelease : function(e) {
        this._isPointerPressInProgress = false;
        this._domEvents().un('pointerrelease', this._onDocPointerRelease);
        this._button
            .toggleMod('focused', true, '', this._isEventInPopup(e))
            .setMod('focused-hard', e.data.focusedHardMod);
    },

    _isEventInPopup : function(e) {
        return dom.contains(this._popup.domElem, $(e.target));
    }
}, /** @lends select */{
    lazyInit : true,
    onInit : function() {
        this._events(Button).on(
            { modName : 'focused', modVal : '*' },
            this.prototype._onButtonFocusChange);
    },

    _createControlHTML : function(name, val) {
        // Using string concatenation to not depend on template engines
        return '<input ' +
            'type="hidden" ' +
            'name="' + name + '" ' +
            'class="' + this._buildClassName('control') + '" ' +
            'value="' + escape.attr(val) + '"/>';
    }
}));

});

/* ../../common.blocks/select/select.js end */

/* ../../common.blocks/select/_mode/select_mode_check.js begin */
/**
 * @module select
 */

modules.define(
    'select',
    ['strings__escape'],
    function(provide, escape, Select) {

/**
 * @exports
 * @class select
 * @bem
 */
provide(Select.declMod({ modName : 'mode', modVal : 'check' }, /** @lends select.prototype */{
    _updateControl : function() {
        this.findChildElems('control').forEach(function(control) {
            control.domElem.remove();
        });

        var name = this.getName();
        this.domElem.prepend(
            this.getVal()
                .map(function(val) {
                    return Select._createControlHTML(name, val);
                }));
    },

    _updateButton : function() {
        var checkedItems = this._getCheckedItems();

        this._button
            .toggleMod('checked', true, '', !!checkedItems.size())
            .setText(
                checkedItems.size() === 1?
                    checkedItems.get(0).getText() : // one checked
                    checkedItems.reduce(function(res, item) { // many checked
                        return res + (res? ', ' : '') + (item.params.checkedText || item.getText());
                    }, '') ||
                        this.params.text); // none checked
    },

    _setSingleVal : function(value) {
        this.setVal([value]);
    },

    _onMenuItemClick : function(_, data) {
        data.source === 'keyboard' && (this._preventToToggleOpened = true);
    },

    _onButtonClick : function() {
        this._preventToToggleOpened?
            this._preventToToggleOpened = false :
            this.__base.apply(this, arguments);
    }
}));

});

/* ../../common.blocks/select/_mode/select_mode_check.js end */

/* ../../common.blocks/select/_mode/select_mode_radio-check.js begin */
/**
 * @module select
 */

modules.define('select', ['jquery'], function(provide, $, Select) {

/**
 * @exports
 * @class select
 * @bem
 */
provide(Select.declMod({ modName : 'mode', modVal : 'radio-check' }, /** @lends select.prototype */{
    _updateControl : function() {
        var val = this.getVal(),
            control = this._elem('control') && this._elem('control').domElem;

        if(!control || !control.length) {
            control = $(Select._createControlHTML(this.getName(), val));
        }

        if(typeof val === 'undefined') {
            // NOTE: because there is a possibility of whole select disabling,
            // "remove" is used instead of "disable"
            control.remove();
        } else {
            control.parent().length || this.domElem.prepend(control);
            control.val(val);
        }
    },

    _updateButton : function() {
        var checkedItem = this._getCheckedItems().get(0);

        this._button
            .toggleMod('checked', true, '', !!checkedItem)
            .setText(checkedItem? checkedItem.getText() : this.params.text);
    },

    _onMenuItemClick : function(_, data) {
        data.source === 'pointer' && this.delMod('opened');
    }
}));

});

/* ../../common.blocks/select/_mode/select_mode_radio-check.js end */

/* ../../common.blocks/select/_mode/select_mode_radio.js begin */
/**
 * @module select
 */

modules.define('select', function(provide, Select) {

/**
 * @exports
 * @class select
 * @bem
 */
provide(Select.declMod({ modName : 'mode', modVal : 'radio' }, /** @lends select.prototype */{
    _updateControl : function() {
        var val = this.getVal();
        this._elem('control').domElem.val(val);
    },

    _updateButton : function() {
        this._button.setText(this._getCheckedItems().get(0).getText());
    },

    _onMenuItemClick : function(_, data) {
        data.source === 'pointer' && this.delMod('opened');
    }
}));

});

/* ../../common.blocks/select/_mode/select_mode_radio.js end */

/* ../../common.blocks/spin/spin.js begin */
modules.define('spin', ['i-bem-dom'], function(provide, bemDom) {

provide(bemDom.declBlock(this.name));

});

/* ../../common.blocks/spin/spin.js end */

/* ../../common.blocks/textarea/textarea.js begin */
/**
 * @module textarea
 */

modules.define('textarea', ['i-bem-dom', 'input'], function(provide, bemDom, Input) {

/**
 * @exports
 * @class textarea
 * @augments input
 * @bem
 */
provide(bemDom.declBlock(this.name, Input));

});

/* ../../common.blocks/textarea/textarea.js end */

/* ../../design/common.blocks/popup/_theme/popup_theme_islands.js begin */
modules.define('popup', ['objects'], function(provide, objects, Popup) {

provide(Popup.declMod({ modName : 'theme', modVal : 'islands' }, {
    _getDefaultParams : function() {
        return objects.extend(
            this.__base(),
            {
                mainOffset : 5,
                viewportOffset : 10
            });
    }
}));

});

/* ../../design/common.blocks/popup/_theme/popup_theme_islands.js end */

/* ../../design/common.blocks/modal/_theme/modal_theme_islands.js begin */
/**
 * @module modal
 */

modules.define(
    'modal',
    function(provide, Modal) {

/**
 * @exports
 * @class modal
 * @bem
 */
provide(Modal.declMod({ modName : 'theme', modVal : 'islands' }, /** @lends modal.prototype */{
    onSetMod : {
        'visible' : {
            'true' : function() {
                this
                    // Apply the animation only at first opening, otherwise the animation will be played when block
                    // initialized.
                    .setMod('has-animation')
                    .__base.apply(this, arguments);
            }
        }
    }
}));

});

/* ../../design/common.blocks/modal/_theme/modal_theme_islands.js end */

/* ../../design/common.blocks/progressbar/_theme/progressbar_theme_simple.js begin */
/**
 * @module progressbar
 */

modules.define('progressbar', function(provide, Progressbar) {

/**
 * @exports
 * @class progressbar
 * @bem
 */
provide(Progressbar.declMod({ modName : 'theme', modVal : 'simple' }, /** @lends progressbar.prototype */{

    /**
     * Sets text
     * @override
     */
    setVal : function() {
        var res = this.__base.apply(this, arguments);
        this.elem('text').text(this._val);
        return res;
    }

}));

});

/* ../../design/common.blocks/progressbar/_theme/progressbar_theme_simple.js end */

var BEMHTML;

(function(global) {
    function buildBemXjst(__bem_xjst_libs__) {
        var exports = {};

        /// -------------------------------------
/// --------- BEM-XJST Runtime Start ----
/// -------------------------------------
var BEMHTML = function(module, exports) {
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bemhtml = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var inherits = require('inherits');
var Match = require('../bemxjst/match').Match;
var BemxjstEntity = require('../bemxjst/entity').Entity;

/**
 * @class Entity
 * @param {BEMXJST} bemxjst
 * @param {String} block
 * @param {String} elem
 * @param {Array} templates
 */
function Entity(bemxjst) {
  this.bemxjst = bemxjst;

  this.jsClass = null;

  // "Fast modes"
  this.tag = new Match(this, 'tag');
  this.attrs = new Match(this, 'attrs');
  this.js = new Match(this, 'js');
  this.mix = new Match(this, 'mix');
  this.bem = new Match(this, 'bem');
  this.cls = new Match(this, 'cls');

  BemxjstEntity.apply(this, arguments);
}

inherits(Entity, BemxjstEntity);
exports.Entity = Entity;

Entity.prototype.init = function init(block, elem) {
  this.block = block;
  this.elem = elem;

  // Class for jsParams
  this.jsClass = this.bemxjst.classBuilder.build(this.block, this.elem);
};

Entity.prototype._initRest = function _initRest(key) {
  if (key === 'default') {
    this.rest[key] = this.def;
  } else if (key === 'tag' ||
    key === 'attrs' ||
    key === 'js' ||
    key === 'mix' ||
    key === 'bem' ||
    key === 'cls' ||
    key === 'content') {
    this.rest[key] = this[key];
  } else {
    if (!this.rest.hasOwnProperty(key))
      this.rest[key] = new Match(this, key);
  }
};

Entity.prototype.defaultBody = function defaultBody(context) {
  var tag = this.tag.exec(context);

  var js;
  if (context.ctx.js !== false)
    js = this.js.exec(context);

  var bem = this.bem.exec(context);
  var cls = this.cls.exec(context);
  var mix = this.mix.exec(context);
  var attrs = this.attrs.exec(context);
  var content = this.content.exec(context);

  return this.bemxjst.render(context,
                             this,
                             tag,
                             js,
                             bem,
                             cls,
                             mix,
                             attrs,
                             content);
};

},{"../bemxjst/entity":5,"../bemxjst/match":8,"inherits":11}],2:[function(require,module,exports){
var inherits = require('inherits');
var utils = require('../bemxjst/utils');
var Entity = require('./entity').Entity;
var BEMXJST = require('../bemxjst');

function BEMHTML(options) {
  BEMXJST.apply(this, arguments);

  var xhtml = typeof options.xhtml === 'undefined' ? false : options.xhtml;
  this._shortTagCloser = xhtml ? '/>' : '>';

  this._elemJsInstances = options.elemJsInstances;
  this._omitOptionalEndTags = options.omitOptionalEndTags;
  this._unquotedAttrs = typeof options.unquotedAttrs === 'undefined' ?
    false :
    options.unquotedAttrs;
}

inherits(BEMHTML, BEMXJST);
module.exports = BEMHTML;

BEMHTML.prototype.Entity = Entity;

BEMHTML.prototype.runMany = function runMany(arr) {
  var out = '';
  var context = this.context;
  var prevPos = context.position;
  var prevNotNewList = context._notNewList;

  if (prevNotNewList) {
    context._listLength += arr.length - 1;
  } else {
    context.position = 0;
    context._listLength = arr.length;
  }
  context._notNewList = true;

  if (this.canFlush) {
    for (var i = 0; i < arr.length; i++)
      out += context._flush(this._run(arr[i]));
  } else {
    for (var i = 0; i < arr.length; i++)
      out += this._run(arr[i]);
  }

  if (!prevNotNewList)
    context.position = prevPos;

  return out;
};

BEMHTML.prototype.render = function render(context,
                                           entity,
                                           tag,
                                           js,
                                           bem,
                                           cls,
                                           mix,
                                           attrs,
                                           content) {
  var ctx = context.ctx;

  if (tag === undefined)
    tag = 'div';

  if (!tag)
    return this.renderNoTag(context, js, bem, cls, mix, attrs, content);

  var out = '<' + tag;

  var ctxJS = ctx.js;
  if (ctxJS !== false) {
    if (js === true)
      js = {};

    if (js && js !== ctx.js) {
      if (ctxJS !== true)
        js = utils.extend(ctxJS, js);
    }  else if (ctxJS === true) {
      js = {};
    }
  }

  var jsParams;
  if (js) {
    jsParams = {};
    jsParams[entity.jsClass] = js;
  }

  var isBEM = bem;
  if (isBEM === undefined) {
    if (ctx.bem === undefined)
      isBEM = entity.block || entity.elem;
    else
      isBEM = ctx.bem;
  }
  isBEM = !!isBEM;

  if (cls === undefined)
    cls = ctx.cls;

  var addJSInitClass = jsParams && (
    this._elemJsInstances ?
      (entity.block || entity.elem) :
      (entity.block && !entity.elem)
  );

  if (!isBEM && !cls) {
    return this.renderClose(out, context, tag, attrs, isBEM, ctx, content);
  }

  out += ' class=';
  var classValue = '';
  if (isBEM) {
    classValue += entity.jsClass;
    classValue += this.buildModsClasses(entity.block, entity.elem,
                                        entity.elem ?
                                          context.elemMods :
                                          context.mods);

    if (ctx.mix && mix && mix !== ctx.mix)
      mix = [].concat(mix, ctx.mix);

    if (mix) {
      var m = this.renderMix(entity, mix, jsParams, addJSInitClass);
      classValue += m.out;
      jsParams = m.jsParams;
      addJSInitClass = m.addJSInitClass;
    }

    if (cls)
      classValue += ' ' + (typeof cls === 'string' ?
                    utils.attrEscape(cls).trim() : cls);
  } else {
    if (cls)
      classValue += cls.trim ? utils.attrEscape(cls).trim() : cls;
  }

  if (addJSInitClass)
    classValue += ' i-bem';

  if (this._unquotedAttrs && utils.isUnquotedAttr(classValue)) {
    out += classValue;
  } else {
    out += '"' + classValue + '"';
  }

  if (isBEM && jsParams)
    out += ' data-bem=\'' + utils.jsAttrEscape(JSON.stringify(jsParams)) + '\'';

  return this.renderClose(out, context, tag, attrs, isBEM, ctx, content);
};

var OPTIONAL_END_TAGS = {
  // html4 https://html.spec.whatwg.org/multipage/syntax.html#optional-tags
  html: 1, head: 1, body: 1, p: 1, ul: 1, ol: 1, li: 1, dt: 1, dd: 1,
  colgroup: 1, thead: 1, tbody: 1, tfoot: 1, tr: 1, th: 1, td: 1, option: 1,

  // html5 https://www.w3.org/TR/html5/syntax.html#optional-tags
  /* dl — Neither tag is omissible */ rb: 1, rt: 1, rtc: 1, rp: 1, optgroup: 1
};

BEMHTML.prototype.renderClose = function renderClose(prefix,
                                                     context,
                                                     tag,
                                                     attrs,
                                                     isBEM,
                                                     ctx,
                                                     content) {
  var out = prefix;

  out += this.renderAttrs(attrs, ctx);

  if (utils.isShortTag(tag)) {
    out += this._shortTagCloser;
    if (this.canFlush)
      out = context._flush(out);
  } else {
    out += '>';
    if (this.canFlush)
      out = context._flush(out);

    // TODO(indutny): skip apply next flags
    if (content || content === 0)
      out += this.renderContent(content, isBEM);

    if (!this._omitOptionalEndTags || !OPTIONAL_END_TAGS.hasOwnProperty(tag))
      out += '</' + tag + '>';
  }

  if (this.canFlush)
    out = context._flush(out);
  return out;
};

BEMHTML.prototype.renderAttrs = function renderAttrs(attrs, ctx) {
  var out = '';

  // NOTE: maybe we need to make an array for quicker serialization
  if (utils.isObj(attrs) || utils.isObj(ctx.attrs)) {
    attrs = utils.extend(attrs, ctx.attrs);

    /* jshint forin : false */
    for (var name in attrs) {
      var attr = attrs[name];
      if (attr === undefined || attr === false || attr === null)
        continue;

      if (attr === true) {
        out += ' ' + name;
      } else {
        var attrVal = utils.isSimple(attr) ? attr : this.context.reapply(attr);
        out += ' ' + name + '=';

        if (this._unquotedAttrs)
          out += utils.isUnquotedAttr(attrVal) ?
            attrVal :
            ('"' + attrVal + '"');
        else
          out += '"' + utils.attrEscape(attrVal) + '"';
      }
    }
  }

  return out;
};

BEMHTML.prototype.renderMix = function renderMix(entity,
                                                 mix,
                                                 jsParams,
                                                 addJSInitClass) {
  var visited = {};
  var context = this.context;
  var js = jsParams;
  var addInit = addJSInitClass;

  visited[entity.jsClass] = true;

  // Transform mix to the single-item array if it's not array
  if (!Array.isArray(mix))
    mix = [ mix ];

  var classBuilder = this.classBuilder;

  var out = '';
  for (var i = 0; i < mix.length; i++) {
    var item = mix[i];
    if (!item)
      continue;
    if (typeof item === 'string')
      item = { block: item, elem: undefined };

    var hasItem = false;

    if (item.elem) {
      hasItem = item.elem !== entity.elem && item.elem !== context.elem ||
        item.block && item.block !== entity.block;
    } else if (item.block) {
      hasItem = !(item.block === entity.block && item.mods) ||
        item.mods && entity.elem;
    }

    var block = item.block || item._block || context.block;
    var elem = item.elem || item._elem || context.elem;
    var key = classBuilder.build(block, elem);

    var classElem = item.elem ||
                    item._elem ||
                    (item.block ? undefined : context.elem);
    if (hasItem)
      out += ' ' + classBuilder.build(block, classElem);

    out += this.buildModsClasses(block, classElem,
      (item.elem || !item.block && (item._elem || context.elem)) ?
        item.elemMods : item.mods);

    if (item.js) {
      if (!js)
        js = {};

      js[classBuilder.build(block, item.elem)] =
          item.js === true ? {} : item.js;
      if (!addInit)
        addInit = block && !item.elem;
    }

    // Process nested mixes
    if (!hasItem || visited[key])
      continue;

    visited[key] = true;
    var nestedEntity = this.entities[key];
    if (!nestedEntity)
      continue;

    var oldBlock = context.block;
    var oldElem = context.elem;
    var nestedMix = nestedEntity.mix.exec(context);
    context.elem = oldElem;
    context.block = oldBlock;

    if (!nestedMix)
      continue;

    for (var j = 0; j < nestedMix.length; j++) {
      var nestedItem = nestedMix[j];
      if (!nestedItem) continue;

      if (!nestedItem.block &&
          !nestedItem.elem ||
          !visited[classBuilder.build(nestedItem.block, nestedItem.elem)]) {
        if (nestedItem.block) continue;

        nestedItem._block = block;
        nestedItem._elem = elem;
        mix = mix.slice(0, i + 1).concat(
          nestedItem,
          mix.slice(i + 1)
        );
      }
    }
  }

  return {
    out: out,
    jsParams: js,
    addJSInitClass: addInit
  };
};

BEMHTML.prototype.buildModsClasses = function buildModsClasses(block,
                                                               elem,
                                                               mods) {
  if (!mods)
    return '';

  var res = '';

  var modName;

  /*jshint -W089 */
  for (modName in mods) {
    if (!mods.hasOwnProperty(modName) || modName === '')
      continue;

    var modVal = mods[modName];
    if (!modVal && modVal !== 0) continue;
    if (typeof modVal !== 'boolean')
      modVal += '';

    var builder = this.classBuilder;
    res += ' ' + (elem ?
                  builder.buildElemClass(block, elem, modName, modVal) :
                  builder.buildBlockClass(block, modName, modVal));
  }

  return res;
};

BEMHTML.prototype.renderNoTag = function renderNoTag(context,
                                                     js,
                                                     bem,
                                                     cls,
                                                     mix,
                                                     attrs,
                                                     content) {

  // TODO(indutny): skip apply next flags
  if (content || content === 0)
    return this._run(content);
  return '';
};

},{"../bemxjst":7,"../bemxjst/utils":10,"./entity":1,"inherits":11}],3:[function(require,module,exports){
function ClassBuilder(options) {
  this.modDelim = options.mod || '_';
  this.elemDelim = options.elem || '__';
}
exports.ClassBuilder = ClassBuilder;

ClassBuilder.prototype.build = function build(block, elem) {
  if (!elem)
    return block;
  else
    return block + this.elemDelim + elem;
};

ClassBuilder.prototype.buildModPostfix = function buildModPostfix(modName,
                                                                  modVal) {
  var res = this.modDelim + modName;
  if (modVal !== true) res += this.modDelim + modVal;
  return res;
};

ClassBuilder.prototype.buildBlockClass = function buildBlockClass(name,
                                                                  modName,
                                                                  modVal) {
  var res = name;
  if (modVal) res += this.buildModPostfix(modName, modVal);
  return res;
};

ClassBuilder.prototype.buildElemClass = function buildElemClass(block,
                                                                name,
                                                                modName,
                                                                modVal) {
  var res = this.buildBlockClass(block) + this.elemDelim + name;
  if (modVal) res += this.buildModPostfix(modName, modVal);
  return res;
};

ClassBuilder.prototype.split = function split(key) {
  return key.split(this.elemDelim, 2);
};

},{}],4:[function(require,module,exports){
var utils = require('./utils');

function Context(bemxjst) {
  this._bemxjst = bemxjst;

  this.ctx = null;
  this.block = '';

  // Save current block until the next BEM entity
  this._currBlock = '';

  this.elem = null;
  this.mods = {};
  this.elemMods = {};

  this.position = 0;
  this._listLength = 0;
  this._notNewList = false;

  // (miripiruni) this will be changed in next major release
  this.escapeContent = bemxjst.options.escapeContent === true;

  // Used in `OnceMatch` check to detect context change
  this._onceRef = {};
}
exports.Context = Context;

Context.prototype._flush = null;

Context.prototype.isSimple = utils.isSimple;

Context.prototype.isShortTag = utils.isShortTag;
Context.prototype.extend = utils.extend;
Context.prototype.identify = utils.identify;

Context.prototype.xmlEscape = utils.xmlEscape;
Context.prototype.attrEscape = utils.attrEscape;
Context.prototype.jsAttrEscape = utils.jsAttrEscape;

Context.prototype.isFirst = function isFirst() {
  return this.position === 1;
};

Context.prototype.isLast = function isLast() {
  return this.position === this._listLength;
};

Context.prototype.generateId = function generateId() {
  return utils.identify(this.ctx);
};

Context.prototype.reapply = function reapply(ctx) {
  return this._bemxjst.run(ctx);
};

},{"./utils":10}],5:[function(require,module,exports){
var utils = require('./utils');
var Match = require('./match').Match;
var tree = require('./tree');
var Template = tree.Template;
var PropertyMatch = tree.PropertyMatch;
var CompilerOptions = tree.CompilerOptions;

function Entity(bemxjst, block, elem, templates) {
  this.bemxjst = bemxjst;

  this.block = null;
  this.elem = null;

  // Compiler options via `xjstOptions()`
  this.options = {};

  // `true` if entity has just a default renderer for `def()` mode
  this.canFlush = true;

  // "Fast modes"
  this.def = new Match(this);
  this.content = new Match(this, 'content');

  // "Slow modes"
  this.rest = {};

  // Initialize
  this.init(block, elem);
  this.initModes(templates);
}
exports.Entity = Entity;

Entity.prototype.init = function init(block, elem) {
  this.block = block;
  this.elem = elem;
};

function contentMode() {
  return this.ctx.content;
}

Entity.prototype.initModes = function initModes(templates) {
  /* jshint maxdepth : false */
  for (var i = 0; i < templates.length; i++) {
    var template = templates[i];

    for (var j = template.predicates.length - 1; j >= 0; j--) {
      var pred = template.predicates[j];
      if (!(pred instanceof PropertyMatch))
        continue;

      if (pred.key !== '_mode')
        continue;

      template.predicates.splice(j, 1);
      this._initRest(pred.value);

      // All templates should go there anyway
      this.rest[pred.value].push(template);
      break;
    }

    if (j === -1)
      this.def.push(template);

    // Merge compiler options
    for (var j = template.predicates.length - 1; j >= 0; j--) {
      var pred = template.predicates[j];
      if (!(pred instanceof CompilerOptions))
        continue;

      this.options = utils.extend(this.options, pred.options);
    }
  }
};

Entity.prototype.prepend = function prepend(other) {
  // Prepend to the slow modes, fast modes are in this hashmap too anyway
  var keys = Object.keys(this.rest);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!other.rest[key])
      continue;

    this.rest[key].prepend(other.rest[key]);
  }

  // Add new slow modes
  keys = Object.keys(other.rest);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (this.rest[key])
      continue;

    this._initRest(key);
    this.rest[key].prepend(other.rest[key]);
  }
};

// NOTE: This could be potentially compiled into inlined invokations
Entity.prototype.run = function run(context) {
  if (this.def.count !== 0)
    return this.def.exec(context);

  return this.defaultBody(context);
};

Entity.prototype.setDefaults = function setDefaults() {
  // Default .content() template for applyNext()
  if (this.content.count !== 0)
    this.content.push(new Template([], contentMode));

  // .def() default
  if (this.def.count !== 0) {
    this.canFlush = this.options.flush || false;
    var self = this;
    this.def.push(new Template([], function defaultBodyProxy() {
      return self.defaultBody(this);
    }));
  }
};

},{"./match":8,"./tree":9,"./utils":10}],6:[function(require,module,exports){
function BEMXJSTError(msg, func) {
  this.name = 'BEMXJSTError';
  this.message = msg;

  if (Error.captureStackTrace)
    Error.captureStackTrace(this, func || this.constructor);
  else
    this.stack = (new Error()).stack;
}

BEMXJSTError.prototype = Object.create(Error.prototype);
BEMXJSTError.prototype.constructor = BEMXJSTError;

exports.BEMXJSTError = BEMXJSTError;

},{}],7:[function(require,module,exports){
var inherits = require('inherits');

var Tree = require('./tree').Tree;
var PropertyMatch = require('./tree').PropertyMatch;
var AddMatch = require('./tree').AddMatch;
var Context = require('./context').Context;
var ClassBuilder = require('./class-builder').ClassBuilder;
var utils = require('./utils');

function BEMXJST(options) {
  this.options = options || {};

  this.entities = null;
  this.defaultEnt = null;

  // Current tree
  this.tree = null;

  // Current match
  this.match = null;

  // Create new Context constructor for overriding prototype
  this.contextConstructor = function ContextChild(bemxjst) {
    Context.call(this, bemxjst);
  };
  inherits(this.contextConstructor, Context);
  this.context = null;

  this.classBuilder = new ClassBuilder(this.options.naming || {});

  // Execution depth, used to invalidate `applyNext` bitfields
  this.depth = 0;

  // Do not call `_flush` on overridden `def()` mode
  this.canFlush = false;

  // oninit templates
  this.oninit = null;

  // Initialize default entity (no block/elem match)
  this.defaultEnt = new this.Entity(this, '', '', []);
  this.defaultElemEnt = new this.Entity(this, '', '', []);
}
module.exports = BEMXJST;

BEMXJST.prototype.locals = Tree.methods
    .concat('local', 'applyCtx', 'applyNext', 'apply');

BEMXJST.prototype.compile = function compile(code) {
  var self = this;

  function applyCtx() {
    return self._run(self.context.ctx);
  }

  function applyCtxWrap(ctx, changes) {
    // Fast case
    if (!changes)
      return self.local({ ctx: ctx }, applyCtx);

    return self.local(changes, function() {
      return self.local({ ctx: ctx }, applyCtx);
    });
  }

  function apply(mode, changes) {
    return self.applyMode(mode, changes);
  }

  function localWrap(changes) {
    return function localBody(body) {
      return self.local(changes, body);
    };
  }

  var tree = new Tree({
    refs: {
      applyCtx: applyCtxWrap,
      local: localWrap,
      apply: apply
    }
  });

  // Yeah, let people pass functions to us!
  var templates = this.recompileInput(code);

  var out = tree.build(templates, [
    localWrap,
    applyCtxWrap,
    function applyNextWrap(changes) {
      if (changes)
        return self.local(changes, applyNextWrap);
      return self.applyNext();
    },
    apply
  ]);

  // Concatenate templates with existing ones
  // TODO(indutny): it should be possible to incrementally add templates
  if (this.tree) {
    out = {
      templates: out.templates.concat(this.tree.templates),
      oninit: this.tree.oninit.concat(out.oninit)
    };
  }
  this.tree = out;

  // Group block+elem entities into a hashmap
  var ent = this.groupEntities(out.templates);

  // Transform entities from arrays to Entity instances
  ent = this.transformEntities(ent);

  this.entities = ent;
  this.oninit = out.oninit;
};

BEMXJST.prototype.recompileInput = function recompileInput(code) {
  var args = BEMXJST.prototype.locals;
  // Reuse function if it already has right arguments
  if (typeof code === 'function' && code.length === args.length)
    return code;

  var out = code.toString();

  // Strip the function
  out = out.replace(/^function[^{]+{|}$/g, '');

  // And recompile it with right arguments
  out = new Function(args.join(', '), out);

  return out;
};

BEMXJST.prototype.groupEntities = function groupEntities(tree) {
  var res = {};
  for (var i = 0; i < tree.length; i++) {
    // Make sure to change only the copy, the original is cached in `this.tree`
    var template = tree[i].clone();
    var block = null;
    var elem;

    elem = undefined;
    for (var j = 0; j < template.predicates.length; j++) {
      var pred = template.predicates[j];
      if (!(pred instanceof PropertyMatch) &&
        !(pred instanceof AddMatch))
        continue;

      if (pred.key === 'block')
        block = pred.value;
      else if (pred.key === 'elem')
        elem = pred.value;
      else
        continue;

      // Remove predicate, we won't much against it
      template.predicates.splice(j, 1);
      j--;
    }

    if (block === null) {
      var msg = 'block(…) subpredicate is not found.\n' +
      '    See template with subpredicates:\n     * ';

      for (var j = 0; j < template.predicates.length; j++) {
        var pred = template.predicates[j];

        if (j !== 0)
          msg += '\n     * ';

        if (pred.key === '_mode') {
          msg += pred.value + '()';
        } else {
          if (Array.isArray(pred.key)) {
            msg += pred.key[0].replace('mods', 'mod')
              .replace('elemMods', 'elemMod') +
              '(\'' + pred.key[1] + '\', \'' + pred.value + '\')';
          } else if (!pred.value || !pred.key) {
            msg += 'match(…)';
          } else {
            msg += pred.key + '(\'' + pred.value + '\')';
          }
        }
      }

      msg += '\n    And template body: \n    (' +
        (typeof template.body === 'function' ?
          template.body :
          JSON.stringify(template.body)) + ')';

      if (typeof BEMXJSTError === 'undefined') {
        BEMXJSTError = require('./error').BEMXJSTError;
      }

      throw new BEMXJSTError(msg);
    }

    var key = this.classBuilder.build(block, elem);

    if (!res[key])
      res[key] = [];
    res[key].push(template);
  }
  return res;
};

BEMXJST.prototype.transformEntities = function transformEntities(entities) {
  var wildcardElems = [];

  var keys = Object.keys(entities);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    // TODO(indutny): pass this values over
    var parts = this.classBuilder.split(key);
    var block = parts[0];
    var elem = parts[1];

    if (elem === '*')
      wildcardElems.push(block);

    entities[key] = new this.Entity(
      this, block, elem, entities[key]);
  }

  // Merge wildcard block templates
  if (entities.hasOwnProperty('*')) {
    var wildcard = entities['*'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === '*')
        continue;

      entities[key].prepend(wildcard);
    }
    this.defaultEnt.prepend(wildcard);
    this.defaultElemEnt.prepend(wildcard);
  }

  // Merge wildcard elem templates
  for (var i = 0; i < wildcardElems.length; i++) {
    var block = wildcardElems[i];
    var wildcardKey = this.classBuilder.build(block, '*');
    var wildcard = entities[wildcardKey];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === wildcardKey)
        continue;

      var entity = entities[key];
      if (entity.block !== block)
        continue;

      if (entity.elem === undefined)
        continue;

      entities[key].prepend(wildcard);
    }
    this.defaultElemEnt.prepend(wildcard);
  }

  // Set default templates after merging with wildcard
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    entities[key].setDefaults();
    this.defaultEnt.setDefaults();
    this.defaultElemEnt.setDefaults();
  }

  return entities;
};

BEMXJST.prototype._run = function _run(context) {
  var res;
  if (context === undefined || context === '' || context === null)
    res = this.runEmpty();
  else if (Array.isArray(context))
    res = this.runMany(context);
  else if (
    typeof context.html === 'string' &&
    !context.tag &&
    typeof context.block === 'undefined' &&
    typeof context.elem === 'undefined' &&
    typeof context.cls === 'undefined' &&
    typeof context.attrs === 'undefined'
  )
    res = this.runUnescaped(context.html);
  else if (utils.isSimple(context))
    res = this.runSimple(context);
  else
    res = this.runOne(context);
  return res;
};

BEMXJST.prototype.run = function run(json) {
  var match = this.match;
  var context = this.context;

  this.match = null;
  this.context = new this.contextConstructor(this);
  this.canFlush = this.context._flush !== null;
  this.depth = 0;
  var res = this._run(json);

  if (this.canFlush)
    res = this.context._flush(res);

  this.match = match;
  this.context = context;

  return res;
};


BEMXJST.prototype.runEmpty = function runEmpty() {
  this.context._listLength--;
  return '';
};

BEMXJST.prototype.runUnescaped = function runUnescaped(context) {
  this.context._listLength--;
  return '' + context;
};

BEMXJST.prototype.runSimple = function runSimple(simple) {
  this.context._listLength--;
  var res = '';
  if (simple && simple !== true || simple === 0) {
    res += typeof simple === 'string' && this.context.escapeContent ?
      utils.xmlEscape(simple) :
      simple;
  }

  return res;
};

BEMXJST.prototype.runOne = function runOne(json) {
  var context = this.context;

  var oldCtx = context.ctx;
  var oldBlock = context.block;
  var oldCurrBlock = context._currBlock;
  var oldElem = context.elem;
  var oldMods = context.mods;
  var oldElemMods = context.elemMods;

  if (json.block || json.elem)
    context._currBlock = '';
  else
    context._currBlock = context.block;

  context.ctx = json;
  if (json.block) {
    context.block = json.block;

    if (json.mods)
      context.mods = json.mods;
    else if (json.block !== oldBlock || !json.elem)
      context.mods = {};
  } else {
    if (!json.elem)
      context.block = '';
    else if (oldCurrBlock)
      context.block = oldCurrBlock;
  }

  context.elem = json.elem;
  if (json.elemMods)
    context.elemMods = json.elemMods;
  else
    context.elemMods = {};

  var block = context.block || '';
  var elem = context.elem;

  // Control list position
  if (block || elem)
    context.position++;
  else
    context._listLength--;

  // To invalidate `applyNext` flags
  this.depth++;

  var key = this.classBuilder.build(block, elem);

  var restoreFlush = false;
  var ent = this.entities[key];
  if (ent) {
    if (this.canFlush && !ent.canFlush) {
      // Entity does not support flushing, do not flush anything nested
      restoreFlush = true;
      this.canFlush = false;
    }
  } else {
    // No entity - use default one
    ent = this.defaultEnt;
    if (elem !== undefined)
      ent = this.defaultElemEnt;
    ent.init(block, elem);
  }

  var res = this.options.production === true ?
    this.tryRun(context, ent) :
    ent.run(context);

  context.ctx = oldCtx;
  context.block = oldBlock;
  context.elem = oldElem;
  context.mods = oldMods;
  context.elemMods = oldElemMods;
  context._currBlock = oldCurrBlock;
  this.depth--;
  if (restoreFlush)
    this.canFlush = true;

  return res;
};

BEMXJST.prototype.tryRun = function tryRun(context, ent) {
  try {
    return ent.run(context);
  } catch (e) {
    console.error('BEMXJST ERROR: cannot render ' +
      [
        'block ' + context.block,
        'elem ' + context.elem,
        'mods ' + JSON.stringify(context.mods),
        'elemMods ' + JSON.stringify(context.elemMods)
      ].join(', '), e);
    return '';
  }
};

BEMXJST.prototype.renderContent = function renderContent(content, isBEM) {
  var context = this.context;
  var oldPos = context.position;
  var oldListLength = context._listLength;
  var oldNotNewList = context._notNewList;

  context._notNewList = false;
  if (isBEM) {
    context.position = 0;
    context._listLength = 1;
  }

  var res = this._run(content);

  context.position = oldPos;
  context._listLength = oldListLength;
  context._notNewList = oldNotNewList;

  return res;
};

BEMXJST.prototype.local = function local(changes, body) {
  var keys = Object.keys(changes);
  var restore = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var parts = key.split('.');

    var value = this.context;
    for (var j = 0; j < parts.length - 1; j++)
      value = value[parts[j]];

    restore.push({
      parts: parts,
      value: value[parts[j]]
    });
    value[parts[j]] = changes[key];
  }

  var res = body.call(this.context);

  for (var i = 0; i < restore.length; i++) {
    var parts = restore[i].parts;
    var value = this.context;
    for (var j = 0; j < parts.length - 1; j++)
      value = value[parts[j]];

    value[parts[j]] = restore[i].value;
  }

  return res;
};

BEMXJST.prototype.applyNext = function applyNext() {
  return this.match.exec(this.context);
};

BEMXJST.prototype.applyMode = function applyMode(mode, changes) {
  var match = this.match.entity.rest[mode];
  if (!match)
    return this.context.ctx[mode];

  if (!changes)
    return match.exec(this.context);

  var self = this;

  // Allocate function this way, to prevent allocation at the top of the
  // `applyMode`
  var fn = function localBody() {
    return match.exec(self.context);
  };
  return this.local(changes, fn);
};

BEMXJST.prototype.exportApply = function exportApply(exports) {
  var self = this;
  exports.apply = function apply(context) {
    return self.run(context);
  };

  // Add templates at run time
  exports.compile = function compile(templates) {
    return self.compile(templates);
  };

  var sharedContext = {};

  exports.BEMContext = this.contextConstructor;
  sharedContext.BEMContext = exports.BEMContext;

  for (var i = 0; i < this.oninit.length; i++) {
    var oninit = this.oninit[i];

    oninit(exports, sharedContext);
  }
};

},{"./class-builder":3,"./context":4,"./error":6,"./tree":9,"./utils":10,"inherits":11}],8:[function(require,module,exports){
var tree = require('./tree');
var PropertyMatch = tree.PropertyMatch;
var AddMatch = tree.AddMatch;
var WrapMatch = tree.WrapMatch;
var ExtendMatch = tree.ExtendMatch;
var CustomMatch = tree.CustomMatch;

function MatchProperty(template, pred) {
  this.template = template;
  this.key = pred.key;
  this.value = pred.value;
}

MatchProperty.prototype.exec = function exec(context) {
  return context[this.key] === this.value;
};

function MatchNested(template, pred) {
  this.template = template;
  this.keys = pred.key;
  this.value = pred.value;
}

MatchNested.prototype.exec = function exec(context) {
  var val = context;

  for (var i = 0; i < this.keys.length - 1; i++) {
    val = val[this.keys[i]];
    if (!val)
      return false;
  }

  val = val[this.keys[i]];

  if (this.value === true)
    return val !== undefined && val !== '' && val !== false && val !== null;

  return String(val) === this.value;
};

function MatchCustom(template, pred) {
  this.template = template;
  this.body = pred.body;
}

MatchCustom.prototype.exec = function exec(context) {
  return this.body.call(context, context, context.ctx);
};

function MatchWrap(template) {
  this.template = template;
  this.wrap = null;
}

MatchWrap.prototype.exec = function exec(context) {
  var res = this.wrap !== context.ctx;
  this.wrap = context.ctx;
  return res;
};

function MatchExtend(template) {
  this.template = template;
  this.wrap = null;
}

MatchExtend.prototype.exec = function exec(context) {
  var res = this.ext !== context.ctx;
  this.ext = context.ctx;
  return res;
};

function AddWrap(template, pred) {
  this.template = template;
  this.key = pred.key;
  this.value = pred.value;
}

AddWrap.prototype.exec = function exec(context) {
  return context[this.key] === this.value;
};

function MatchTemplate(mode, template) {
  this.mode = mode;
  this.predicates = new Array(template.predicates.length);
  this.body = template.body;

  var postpone = [];

  for (var i = 0, j = 0; i < this.predicates.length; i++, j++) {
    var pred = template.predicates[i];
    if (pred instanceof PropertyMatch) {
      if (Array.isArray(pred.key))
        this.predicates[j] = new MatchNested(this, pred);
      else
        this.predicates[j] = new MatchProperty(this, pred);
    } else if (pred instanceof ExtendMatch) {
      j--;
      postpone.push(new MatchExtend(this));
    } else if (pred instanceof AddMatch) {
      this.predicates[i] = new AddWrap(this, pred);
    } else if (pred instanceof CustomMatch) {
      this.predicates[j] = new MatchCustom(this, pred);

      // Push MatchWrap later, they should not be executed first.
      // Otherwise they will set flag too early, and body might not be executed
    } else if (pred instanceof WrapMatch) {
      j--;
      postpone.push(new MatchWrap(this));
    } else {
      // Skip
      j--;
    }
  }

  // Insert late predicates
  for (var i = 0; i < postpone.length; i++, j++)
    this.predicates[j] = postpone[i];

  if (this.predicates.length !== j)
    this.predicates.length = j;
}
exports.MatchTemplate = MatchTemplate;

function Match(entity, modeName) {
  this.entity = entity;
  this.modeName = modeName;
  this.bemxjst = this.entity.bemxjst;
  this.templates = [];

  // applyNext mask
  this.mask = [ 0 ];

  // We are going to create copies of mask for nested `applyNext()`
  this.maskSize = 0;
  this.maskOffset = 0;

  this.count = 0;
  this.depth = -1;

  this.thrownError = null;
}
exports.Match = Match;

Match.prototype.clone = function clone(entity) {
  var res = new Match(entity, this.modeName);

  res.templates = this.templates.slice();
  res.mask = this.mask.slice();
  res.maskSize = this.maskSize;
  res.count = this.count;

  return res;
};

Match.prototype.prepend = function prepend(other) {
  this.templates = other.templates.concat(this.templates);
  this.count += other.count;

  while (Math.ceil(this.count / 31) > this.mask.length)
    this.mask.push(0);

  this.maskSize = this.mask.length;
};

Match.prototype.push = function push(template) {
  this.templates.push(new MatchTemplate(this, template));
  this.count++;

  if (Math.ceil(this.count / 31) > this.mask.length)
    this.mask.push(0);

  this.maskSize = this.mask.length;
};

Match.prototype.tryCatch = function tryCatch(fn, ctx) {
  try {
    return fn.call(ctx, ctx, ctx.ctx);
  } catch (e) {
    this.thrownError = e;
  }
};

Match.prototype.exec = function exec(context) {
  var save = this.checkDepth();

  var template;
  var bitIndex = this.maskOffset;
  var mask = this.mask[bitIndex];
  var bit = 1;
  for (var i = 0; i < this.count; i++) {
    if ((mask & bit) === 0) {
      template = this.templates[i];
      for (var j = 0; j < template.predicates.length; j++) {
        var pred = template.predicates[j];

        /* jshint maxdepth : false */
        if (!pred.exec(context))
          break;
      }

      // All predicates matched!
      if (j === template.predicates.length)
        break;
    }

    if (bit === 0x40000000) {
      bitIndex++;
      mask = this.mask[bitIndex];
      bit = 1;
    } else {
      bit <<= 1;
    }
  }

  if (i === this.count)
    return context.ctx[this.modeName];

  var oldMask = mask;
  var oldMatch = this.bemxjst.match;
  this.mask[bitIndex] |= bit;
  this.bemxjst.match = this;

  this.thrownError = null;

  var out;
  if (typeof template.body === 'function')
    out = this.tryCatch(template.body, context);
  else
    out = template.body;

  this.mask[bitIndex] = oldMask;
  this.bemxjst.match = oldMatch;
  this.restoreDepth(save);

  var e = this.thrownError;
  if (e !== null) {
    this.thrownError = null;
    throw e;
  }

  return out;
};

Match.prototype.checkDepth = function checkDepth() {
  if (this.depth === -1) {
    this.depth = this.bemxjst.depth;
    return -1;
  }

  if (this.bemxjst.depth === this.depth)
    return this.depth;

  var depth = this.depth;
  this.depth = this.bemxjst.depth;

  this.maskOffset += this.maskSize;

  while (this.mask.length < this.maskOffset + this.maskSize)
    this.mask.push(0);

  return depth;
};

Match.prototype.restoreDepth = function restoreDepth(depth) {
  if (depth !== -1 && depth !== this.depth)
    this.maskOffset -= this.maskSize;
  this.depth = depth;
};

},{"./tree":9}],9:[function(require,module,exports){
var assert = require('minimalistic-assert');
var inherits = require('inherits');

function Template(predicates, body) {
  this.predicates = predicates;

  this.body = body;
}
exports.Template = Template;

Template.prototype.wrap = function wrap() {
  var body = this.body;
  for (var i = 0; i < this.predicates.length; i++) {
    var pred = this.predicates[i];
    body = pred.wrapBody(body);
  }
  this.body = body;
};

Template.prototype.clone = function clone() {
  return new Template(this.predicates.slice(), this.body);
};

function MatchBase() {
}
exports.MatchBase = MatchBase;

MatchBase.prototype.wrapBody = function wrapBody(body) {
  return body;
};

function Item(tree, children) {
  this.conditions = [];
  this.children = [];

  for (var i = children.length - 1; i >= 0; i--) {
    var arg = children[i];
    if (arg instanceof MatchBase)
      this.conditions.push(arg);
    else if (arg === tree.boundBody)
      this.children[i] = tree.queue.pop();
    else
      this.children[i] = arg;
  }
}

function WrapMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(WrapMatch, MatchBase);
exports.WrapMatch = WrapMatch;

WrapMatch.prototype.wrapBody = function wrapBody(body) {
  var applyCtx = this.refs.applyCtx;

  if (typeof body !== 'function') {
    return function inlineAdaptor() {
      return applyCtx(body);
    };
  }

  return function wrapAdaptor() {
    return applyCtx(body.call(this, this, this.ctx));
  };
};

function ReplaceMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(ReplaceMatch, MatchBase);
exports.ReplaceMatch = ReplaceMatch;

ReplaceMatch.prototype.wrapBody = function wrapBody(body) {
  var applyCtx = this.refs.applyCtx;

  if (typeof body !== 'function') {
    return function inlineAdaptor() {
      return applyCtx(body);
    };
  }

  return function replaceAdaptor() {
    return applyCtx(body.call(this, this, this.ctx));
  };
};

function ExtendMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(ExtendMatch, MatchBase);
exports.ExtendMatch = ExtendMatch;

ExtendMatch.prototype.wrapBody = function wrapBody(body) {
  var applyCtx = this.refs.applyCtx;
  var local = this.refs.local;

  if (typeof body !== 'function') {
    return function inlineAdaptor() {
      var changes = {};

      var keys = Object.keys(body);
      for (var i = 0; i < keys.length; i++)
        changes[keys[i]] = body[keys[i]];

      return local(changes)(function preApplyCtx() {
        return applyCtx(this.ctx);
      });
    };
  }

  return function localAdaptor() {
    var changes = {};

    var obj = body.call(this);
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++)
      changes[keys[i]] = obj[keys[i]];

    return local(changes)(function preApplyCtx() {
      return applyCtx(this.ctx);
    });
  };
};

function AddMatch(mode, refs) {
  MatchBase.call(this);

  this.mode = mode;
  this.refs = refs;
}
inherits(AddMatch, MatchBase);
exports.AddMatch = AddMatch;

AddMatch.prototype.wrapBody = function wrapBody(body) {
  return this[this.mode + 'WrapBody'](body);
};

AddMatch.prototype.appendContentWrapBody =
  function appendContentWrapBody(body) {
  var refs = this.refs;
  var applyCtx = refs.applyCtx;
  var apply = refs.apply;

  if (typeof body !== 'function') {
    return function inlineAppendContentAddAdaptor() {
      return [ apply('content') , body ];
    };
  }

  return function appendContentAddAdaptor() {
    return [ apply('content'), applyCtx(body.call(this, this, this.ctx)) ];
  };
};

AddMatch.prototype.prependContentWrapBody =
  function prependContentWrapBody(body) {
  var refs = this.refs;
  var applyCtx = refs.applyCtx;
  var apply = refs.apply;

  if (typeof body !== 'function') {
    return function inlinePrependContentAddAdaptor() {
      return [ body, apply('content') ];
    };
  }

  return function prependContentAddAdaptor() {
    return [ applyCtx(body.call(this, this, this.ctx)), apply('content') ];
  };
};

function CompilerOptions(options) {
  MatchBase.call(this);
  this.options = options;
}
inherits(CompilerOptions, MatchBase);
exports.CompilerOptions = CompilerOptions;

function PropertyMatch(key, value) {
  MatchBase.call(this);

  this.key = key;
  this.value = value;
}
inherits(PropertyMatch, MatchBase);
exports.PropertyMatch = PropertyMatch;

function CustomMatch(body) {
  MatchBase.call(this);

  this.body = body;
}
inherits(CustomMatch, MatchBase);
exports.CustomMatch = CustomMatch;

function Tree(options) {
  this.options = options;
  this.refs = this.options.refs;

  this.boundBody = this.body.bind(this);

  var methods = this.methods('body');
  for (var i = 0; i < methods.length; i++) {
    var method = methods[i];
    // NOTE: method.name is empty because of .bind()
    this.boundBody[Tree.methods[i]] = method;
  }

  this.queue = [];
  this.templates = [];
  this.initializers = [];
}
exports.Tree = Tree;

Tree.methods = [
  'match', 'wrap', 'block', 'elem', 'mode', 'mod',
  'elemMod', 'def', 'tag', 'attrs', 'cls', 'js',
  'bem', 'mix', 'content', 'replace', 'extend', 'oninit',
  'xjstOptions', 'appendContent', 'prependContent'
];

Tree.prototype.build = function build(templates, apply) {
  var methods = this.methods('global').concat(apply);
  methods[0] = this.match.bind(this);

  templates.apply({}, methods);

  return {
    templates: this.templates.slice().reverse(),
    oninit: this.initializers
  };
};

function methodFactory(self, kind, name) {
  var method = self[name];
  var boundBody = self.boundBody;

  if (kind !== 'body') {
    if (name === 'replace' || name === 'extend' || name === 'wrap') {
      return function wrapExtended() {
        return method.apply(self, arguments);
      };
    }

    return function wrapNotBody() {
      method.apply(self, arguments);
      return boundBody;
    };
  }

  return function wrapBody() {
    var res = method.apply(self, arguments);

    // Insert body into last item
    var child = self.queue.pop();
    var last = self.queue[self.queue.length - 1];
    last.conditions = last.conditions.concat(child.conditions);
    last.children = last.children.concat(child.children);

    if (name === 'replace' || name === 'extend' || name === 'wrap')
      return res;
    return boundBody;
  };
}

Tree.prototype.methods = function methods(kind) {
  var out = new Array(Tree.methods.length);

  for (var i = 0; i < out.length; i++) {
    var name = Tree.methods[i];
    out[i] = methodFactory(this, kind, name);
  }

  return out;
};

// Called after all matches
Tree.prototype.flush = function flush(conditions, item) {
  var subcond;

  if (item.conditions)
    subcond = conditions.concat(item.conditions);
  else
    subcond = item.conditions;

  for (var i = 0; i < item.children.length; i++) {
    var arg = item.children[i];

    // Go deeper
    if (arg instanceof Item) {
      this.flush(subcond, item.children[i]);

    // Body
    } else {
      var template = new Template(conditions, arg);
      template.wrap();
      this.templates.push(template);
    }
  }
};

Tree.prototype.body = function body() {
  var children = new Array(arguments.length);
  for (var i = 0; i < arguments.length; i++)
    children[i] = arguments[i];

  var child = new Item(this, children);
  this.queue[this.queue.length - 1].children.push(child);

  if (this.queue.length === 1)
    this.flush([], this.queue.shift());

  return this.boundBody;
};

Tree.prototype.match = function match() {
  var children = new Array(arguments.length);
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'function')
      arg = new CustomMatch(arg);
    assert(arg instanceof MatchBase, 'Wrong .match() argument');
    children[i] = arg;
  }

  this.queue.push(new Item(this, children));

  return this.boundBody;
};

Tree.prototype.applyMode = function applyMode(args, mode) {
  if (args.length) {
    throw new Error('Predicate should not have arguments but ' +
      JSON.stringify(args) + ' passed');
  }

  return this.mode(mode);
};

Tree.prototype.xjstOptions = function xjstOptions(options) {
  this.queue.push(new Item(this, [
    new CompilerOptions(options)
  ]));
  return this.boundBody;
};

Tree.prototype.block = function block(name) {
  return this.match(new PropertyMatch('block', name));
};

Tree.prototype.elem = function elem(name) {
  return this.match(new PropertyMatch('elem', name));
};

Tree.prototype.mode = function mode(name) {
  return this.match(new PropertyMatch('_mode', name));
};

Tree.prototype.mod = function mod(name, value) {
  return this.match(new PropertyMatch([ 'mods', name ],
                                  value === undefined ? true : String(value)));
};

Tree.prototype.elemMod = function elemMod(name, value) {
  return this.match(new PropertyMatch([ 'elemMods', name ],
                                  value === undefined ?  true : String(value)));
};

Tree.prototype.def = function def() {
  return this.applyMode(arguments, 'default');
};

Tree.prototype.tag = function tag() {
  return this.applyMode(arguments, 'tag');
};

Tree.prototype.attrs = function attrs() {
  return this.applyMode(arguments, 'attrs');
};

Tree.prototype.cls = function cls() {
  return this.applyMode(arguments, 'cls');
};

Tree.prototype.js = function js() {
  return this.applyMode(arguments, 'js');
};

Tree.prototype.bem = function bem() {
  return this.applyMode(arguments, 'bem');
};

Tree.prototype.mix = function mix() {
  return this.applyMode(arguments, 'mix');
};

Tree.prototype.content = function content() {
  return this.applyMode(arguments, 'content');
};

Tree.prototype.appendContent = function appendContent() {
  return this.content.apply(this, arguments)
    .match(new AddMatch('appendContent', this.refs));
};


Tree.prototype.prependContent = function prependContent() {
  return this.content.apply(this, arguments)
    .match(new AddMatch('prependContent', this.refs));
};

Tree.prototype.wrap = function wrap() {
  return this.def.apply(this, arguments).match(new WrapMatch(this.refs));
};

Tree.prototype.replace = function replace() {
  return this.def.apply(this, arguments).match(new ReplaceMatch(this.refs));
};

Tree.prototype.extend = function extend() {
  return this.def.apply(this, arguments).match(new ExtendMatch(this.refs));
};

Tree.prototype.oninit = function oninit(fn) {
  this.initializers.push(fn);
};

},{"inherits":11,"minimalistic-assert":12}],10:[function(require,module,exports){
var amp = '&amp;';
var lt = '&lt;';
var gt = '&gt;';
var quot = '&quot;';
var singleQuot = '&#39;';

var matchXmlRegExp = /[&<>]/;

exports.xmlEscape = function(string) {
  var str = '' + string;
  var match = matchXmlRegExp.exec(str);

  if (!match)
    return str;

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 38: // &
        escape = amp;
        break;
      case 60: // <
        escape = lt;
        break;
      case 62: // >
        escape = gt;
        break;
      default:
        continue;
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index);

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
};

var matchAttrRegExp = /["&]/;

exports.attrEscape = function(string) {
  var str = '' + string;
  var match = matchAttrRegExp.exec(str);

  if (!match)
    return str;

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = quot;
        break;
      case 38: // &
        escape = amp;
        break;
      default:
        continue;
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index);

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
};

var matchJsAttrRegExp = /['&]/;

exports.jsAttrEscape = function(string) {
  var str = '' + string;
  var match = matchJsAttrRegExp.exec(str);

  if (!match)
    return str;

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 38: // &
        escape = amp;
        break;
      case 39: // '
        escape = singleQuot;
        break;
      default:
        continue;
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index);

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
};

exports.extend = function extend(o1, o2) {
  if (!o1 || !o2)
    return o1 || o2;

  var res = {};
  var n;

  for (n in o1)
    if (o1.hasOwnProperty(n))
      res[n] = o1[n];
  for (n in o2)
    if (o2.hasOwnProperty(n))
      res[n] = o2[n];
  return res;
};

var SHORT_TAGS = { // hash for quick check if tag short
  area: 1, base: 1, br: 1, col: 1, command: 1, embed: 1, hr: 1, img: 1,
  input: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, wbr: 1
};

exports.isShortTag = function isShortTag(t) {
  return SHORT_TAGS.hasOwnProperty(t);
};

exports.isSimple = function isSimple(obj) {
  if (!obj || obj === true) return true;
  if (!obj.block &&
      !obj.elem &&
      !obj.tag &&
      !obj.cls &&
      !obj.attrs &&
      obj.hasOwnProperty('html') &&
      isSimple(obj.html))
    return true;
  return typeof obj === 'string' || typeof obj === 'number';
};

exports.isObj = function isObj(val) {
  return val && typeof val === 'object' && !Array.isArray(val) &&
    val !== null;
};

var uniqCount = 0;
var uniqId = +new Date();
var uniqExpando = '__' + uniqId;
var uniqPrefix = 'uniq' + uniqId;

function getUniq() {
  return uniqPrefix + (++uniqCount);
}
exports.getUniq = getUniq;

exports.identify = function identify(obj, onlyGet) {
  if (!obj)
    return getUniq();
  if (onlyGet || obj[uniqExpando])
    return obj[uniqExpando];

  var u = getUniq();
  obj[uniqExpando] = u;
  return u;
};

exports.fnToString = function fnToString(code) {
  // It is fine to compile without templates at first
  if (!code)
    return '';

  if (typeof code === 'function') {
    // Examples:
    //   function () { … }
    //   function name() { … }
    //   function (a, b) { … }
    //   function name(a, b) { … }
    var regularFunction = /^function\s*[^{]+{|}$/g;

    // Examples:
    //   () => { … }
    //   (a, b) => { … }
    //   _ => { … }
    var arrowFunction = /^(_|\(\w|[^=>]+\))\s=>\s{|}$/g;

    code = code.toString();
    code = code.replace(
      code.indexOf('function') === 0 ? regularFunction : arrowFunction,
    '');
  }

  return code;
};

/**
 * regexp for check may attribute be unquoted
 *
 * https://www.w3.org/TR/html4/intro/sgmltut.html#h-3.2.2
 * https://www.w3.org/TR/html5/syntax.html#attributes
 */
var UNQUOTED_ATTR_REGEXP = /^[:\w.-]+$/;

exports.isUnquotedAttr = function isUnquotedAttr(str) {
  return str && UNQUOTED_ATTR_REGEXP.exec(str);
};

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
module.exports = assert;

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

},{}]},{},[2])(2)
});;
  return module.exports ||
      exports.BEMHTML;
}({}, {});
/// -------------------------------------
/// --------- BEM-XJST Runtime End ------
/// -------------------------------------

var api = new BEMHTML({"elemJsInstances":true});
/// -------------------------------------
/// ------ BEM-XJST User-code Start -----
/// -------------------------------------
api.compile(function(match, wrap, block, elem, mode, mod, elemMod, def, tag, attrs, cls, js, bem, mix, content, replace, extend, oninit, xjstOptions, appendContent, prependContent, local, applyCtx, applyNext, apply) {
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/page.bemhtml.js */
block('page')(

    mode('doctype')(function() {
        return { html : this.ctx.doctype || '<!DOCTYPE html>' };
    }),

    wrap()(function() {
        var ctx = this.ctx;
        this._nonceCsp = ctx.nonce;

        return [
            apply('doctype'),
            {
                tag : 'html',
                attrs : { lang : ctx.lang },
                cls : 'ua_js_no',
                content : [
                    {
                        elem : 'head',
                        content : [
                            { tag : 'meta', attrs : { charset : 'utf-8' } },
                            ctx.uaCompatible === false? '' : {
                                tag : 'meta',
                                attrs : {
                                    'http-equiv' : 'X-UA-Compatible',
                                    content : ctx.uaCompatible || 'IE=edge'
                                }
                            },
                            { tag : 'title', content : ctx.title },
                            { block : 'ua', attrs : { nonce : ctx.nonce } },
                            ctx.head,
                            ctx.styles,
                            ctx.favicon? { elem : 'favicon', url : ctx.favicon } : ''
                        ]
                    },
                    ctx
                ]
            }
        ];
    }),

    tag()('body'),

    content()(function() {
        return [
            applyNext(),
            this.ctx.scripts
        ];
    }),

    elem('head')(
        bem()(false),
        tag()('head')
    ),

    elem('meta')(
        bem()(false),
        tag()('meta')
    ),

    elem('link')(
        bem()(false),
        tag()('link')
    ),

    elem('favicon')(
        bem()(false),
        tag()('link'),
        attrs()(function() { return { rel : 'shortcut icon', href : this.ctx.url }; })
    )

);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/page.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/touch.blocks/page/page.bemhtml.js */
block('page')(

    def()(function() {
        return applyNext({ _zoom : this.ctx.zoom });
    }),

    elem('head').content()(function() {
        return [
            applyNext(),
            {
                elem : 'meta',
                attrs : {
                    name : 'viewport',
                    content : 'width=device-width,' +
                        (this._zoom?
                            'initial-scale=1' :
                            'maximum-scale=1,initial-scale=1,user-scalable=no')
                }
            },
            { elem : 'meta', attrs : { name : 'format-detection', content : 'telephone=no' } },
            { elem : 'link', attrs : { name : 'apple-mobile-web-app-capable', content : 'yes' } }
        ];
    }),

    mix()(function() {
        var mix = applyNext(),
            uaMix = [{ block : 'ua', attrs : { nonce : this._nonceCsp }, js : true }];

        return mix? uaMix.concat(mix) : uaMix;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/touch.blocks/page/page.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/ua.bemhtml.js */
block('ua')(
    tag()('script'),
    bem()(false),
    content()([
        '(function(e,c){',
            'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");',
        '})(document.documentElement,"className");'
    ])
);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/ua.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/touch.blocks/ua/ua.bemhtml.js */
block('ua').js()(true);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/touch.blocks/ua/ua.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__css/page__css.bemhtml.js */
block('page').elem('css')(
    bem()(false),
    tag()('style'),
    match(function() { return this.ctx.url; })(
        tag()('link'),
        attrs()(function() { return { rel : 'stylesheet', href : this.ctx.url }; })
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__css/page__css.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__js/page__js.bemhtml.js */
block('page').elem('js')(
    bem()(false),
    tag()('script'),
    attrs()(function() {
        var attrs = {};
        if(this.ctx.url) {
            attrs.src = this.ctx.url;
        } else if(this._nonceCsp) {
            attrs.nonce = this._nonceCsp;
        }

        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__js/page__js.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml.js */
block('ua').content()(function() {
    return [
        applyNext(),
        {
            html : [
                '(function(d,n){',
                    'd.documentElement.className+=',
                    '" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");',
                '})(document,"createElementNS");'
            ].join('')
        }
    ];
});

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/touch.blocks/page/__icon/page__icon.bemhtml.js */
block('page').elem('icon').def()(function() {
    var ctx = this.ctx;
    return applyCtx([
        ctx.src16 && {
            elem : 'link',
            attrs : { rel : 'shortcut icon', href : ctx.src16 }
        },
        ctx.src114 && {
            elem : 'link',
            attrs : {
                rel : 'apple-touch-icon-precomposed',
                sizes : '114x114',
                href : ctx.src114
            }
        },
        ctx.src72 && {
            elem : 'link',
            attrs : {
                rel : 'apple-touch-icon-precomposed',
                sizes : '72x72',
                href : ctx.src72
            }
        },
        ctx.src57 && {
            elem : 'link',
            attrs : { rel : 'apple-touch-icon-precomposed', href : ctx.src57 }
        }
    ]);
});

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/touch.blocks/page/__icon/page__icon.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/attach.bemhtml.js */
block('attach')(
    def()(function() { return applyNext({ _attach : this.ctx }); }),

    tag()('span'),

    js()(true),

    content()(
        function() {
            var ctx = this.ctx,
                button = ctx.button;

            this.isSimple(button) && (button = {
                block : 'button',
                tag : 'span',
                text : button
            });

            var attachMods = this.mods,
                buttonMods = button.mods || (button.mods = {});
            ['size', 'theme', 'disabled', 'focused'].forEach(function(mod) {
                buttonMods[mod] || (buttonMods[mod] = attachMods[mod]);
            });

            return [
                button,
                {
                    elem : 'no-file',
                    content : this.ctx.noFileText
                }
            ];
        }
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/attach.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/button.bemhtml.js */
block('button')(
    def()(function() {
        var tag = apply('tag'),
            isRealButton = (tag === 'button') && (!this.mods.type || this.mods.type === 'submit');

        return applyNext({ _isRealButton : isRealButton });
    }),

    tag()(function() {
        return this.ctx.tag || 'button';
    }),

    js()(true),

    // NOTE: mix below is to satisfy interface of `control`
    mix()({ elem : 'control' }),

    attrs()(
        // Common attributes
        function() {
            var ctx = this.ctx,
                attrs = {
                    role : 'button',
                    tabindex : ctx.tabIndex,
                    id : ctx.id,
                    title : ctx.title
                };

            this.mods.disabled &&
                !this._isRealButton && (attrs['aria-disabled'] = 'true');

            return attrs;
        },

        // Attributes for button variant
        match(function() { return this._isRealButton; })(function() {
            var ctx = this.ctx,
                attrs = {
                    type : this.mods.type || 'button',
                    name : ctx.name,
                    value : ctx.val
                };

            this.mods.disabled && (attrs.disabled = 'disabled');

            return this.extend(applyNext(), attrs);
        })
    ),

    content()(
        function() {
            var ctx = this.ctx,
                content = [ctx.icon];
            // NOTE: wasn't moved to separate template for optimization
            /* jshint eqnull: true */
            ctx.text != null && content.push({ elem : 'text', content : ctx.text });
            return content;
        },
        match(function() { return typeof this.ctx.content !== 'undefined'; })(function() {
            return this.ctx.content;
        })
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/__text/button__text.bemhtml.js */
block('button').elem('text').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/__text/button__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_focused/button_focused.bemhtml.js */
block('button').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_focused/button_focused.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/icon/icon.bemhtml.js */
block('icon')(
    tag()('span'),
    attrs()(function() {
        var attrs = {},
            url = this.ctx.url;
        if(url) attrs.style = 'background-image:url(' + url + ')';
        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/icon/icon.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__button/attach__button.bemhtml.js */
block('button').match(function() { return this._attach; })(
    tag()('span'),
    content()(function() {
        return [
            { block : 'attach', elem : 'control' },
            applyNext()
        ];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__button/attach__button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__control/attach__control.bemhtml.js */
block('attach').elem('control')(

    tag()('input'),

    attrs()(function() {
        var attrs = { type : 'file' },
            attach = this._attach;

        // в js генерим html для attach__control без самого attach
        if(attach) {
            attrs.name = attach.name;
            attach.mods && attach.mods.disabled && (attrs.disabled = 'disabled');
            attach.tabIndex && (attrs.tabindex = attach.tabIndex);
        }

        return attrs;
    })

);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__control/attach__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__no-file/attach__no-file.bemhtml.js */
block('attach').elem('no-file').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__no-file/attach__no-file.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__file/attach__file.bemhtml.js */
block('attach').elem('file').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__file/attach__file.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__text/attach__text.bemhtml.js */
block('attach').elem('text').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__text/attach__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__clear/attach__clear.bemhtml.js */
block('attach').elem('clear').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__clear/attach__clear.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_check.bemhtml.js */
block('button').mod('togglable', 'check').attrs()(function() {
    return this.extend(applyNext(), { 'aria-pressed' : String(!!this.mods.checked) });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_radio.bemhtml.js */
block('button').mod('togglable', 'radio').attrs()(function() {
    return this.extend(applyNext(), { 'aria-pressed' : String(!!this.mods.checked) });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_type/button_type_link.bemhtml.js */
block('button').mod('type', 'link')(
    tag()('a'),

    attrs()(function() {
        var ctx = this.ctx,
            attrs = { role : 'link' };

        ctx.target && (attrs.target = ctx.target);
        this.mods.disabled?
            attrs['aria-disabled'] = 'true' :
            attrs.href = ctx.url;

        return this.extend(applyNext(), attrs);
    }),

    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { url : this.ctx.url });
        })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_type/button_type_link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/checkbox.bemhtml.js */
block('checkbox')(
    tag()('label'),

    js()(true),

    content()(function() {
        var ctx = this.ctx,
            mods = this.mods;

        return [
            {
                elem : 'box',
                content : {
                    elem : 'control',
                    checked : mods.checked,
                    disabled : mods.disabled,
                    name : ctx.name,
                    val : ctx.val
                }
            },
            ctx.text && {
                elem : 'text',
                content : ctx.text
            }
        ];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/checkbox.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__box/checkbox__box.bemhtml.js */
block('checkbox').elem('box').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__box/checkbox__box.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__control/checkbox__control.bemhtml.js */
block('checkbox').elem('control')(
    tag()('input'),

    attrs()(function() {
        // NOTE: don't remove autocomplete attribute, otherwise js and DOM may be desynced
        var attrs = { type : 'checkbox', autocomplete : 'off' },
            ctx = this.ctx;

        attrs.name = ctx.name;
        attrs.value = ctx.val;
        ctx.checked && (attrs.checked = 'checked');
        ctx.disabled && (attrs.disabled = 'disabled');

        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__control/checkbox__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__text/checkbox__text.bemhtml.js */
block('checkbox').elem('text')(
    tag()('span'),
    attrs()({ role : 'presentation' })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__text/checkbox__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/_type/checkbox_type_button.bemhtml.js */
block('checkbox').mod('type', 'button')(
    content()(function() {
        var ctx = this.ctx,
            mods = this.mods;

        return [{
            block : 'button',
            mods : {
                togglable : 'check',
                checked : mods.checked,
                disabled : mods.disabled,
                theme : mods.theme,
                size : mods.size
            },
            attrs : {
                role : 'checkbox',
                'aria-pressed' : undefined,
                'aria-checked' : String(!!mods.checked)
            },
            title : ctx.title,
            content : [
                ctx.icon,
                typeof ctx.text !== 'undefined'?
                    { elem : 'text', content : ctx.text } :
                    ''
            ]
        }, {
            block : 'checkbox',
            elem : 'control',
            checked : mods.checked,
            disabled : mods.disabled,
            name : ctx.name,
            val : ctx.val
        }];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/_type/checkbox_type_button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox-group/checkbox-group.bemhtml.js */
block('checkbox-group')(
    tag()('span'),

    attrs()({ role : 'group' }),

    js()(true),

    mix()([{ block : 'control-group' }]),

    content()(function() {
        var mods = this.mods,
            ctx = this.ctx,
            val = ctx.val,
            isValDef = typeof val !== 'undefined';

        if(isValDef && !Array.isArray(val)) throw Error('checkbox-group: val must be an array');

        return (ctx.options || []).map(function(option, i) {
            return [
                !!i && !mods.type && { tag : 'br' },
                {
                    block : 'checkbox',
                    mods : {
                        type : mods.type,
                        theme : mods.theme,
                        size : mods.size,
                        checked : isValDef && val.indexOf(option.val) > -1,
                        disabled : option.disabled || mods.disabled
                    },
                    name : ctx.name,
                    val : option.val,
                    text : option.text,
                    title : option.title,
                    icon : option.icon
                }
            ];
        });
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox-group/checkbox-group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/control-group/control-group.bemhtml.js */
block('control-group').attrs()({ role : 'group' });

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/control-group/control-group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/dropdown.bemhtml.js */
block('dropdown')(
    replace()(function() {
        return [{ elem : 'popup' }, { elem : 'switcher' }];
    }),
    def()(function() {
        var ctx = this.ctx;

        ctx.js = this.extend(apply('js'), ctx.js);
        return applyNext({ _dropdown : ctx, _popupId : this.generateId() });
    }),
    js()(function() {
        return { id : this.generateId() };
    }),
    elem('switcher').replace()(function() {
        var dropdown = this._dropdown,
            switcher = dropdown.switcher;

        switcher.block && (switcher.mix = apply('mix'));

        return switcher;
    }),
    elem('switcher').mix()(function() {
        var dropdown = this._dropdown;

        return [dropdown].concat(dropdown.switcher.mix || [], dropdown.mix || []);
    }),
    elem('popup').replace()(function() {
        var dropdown = this._dropdown,
            popup = dropdown.popup;

        if(this.isSimple(popup) || popup.block !== 'popup') {
            popup = { block : 'popup', content : popup };
        }

        var popupMods = popup.mods || (popup.mods = {}),
            popupAttrs = popup.attrs || (popup.attrs = {});
        popupMods.theme || (popupMods.theme = this.mods.theme);
        popupMods.hasOwnProperty('autoclosable') || (popupMods.autoclosable = true);

        popupMods.target = 'anchor';
        popupAttrs.id = this._popupId;

        popup.mix = [dropdown].concat(popup.mix || []);

        return popup;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/dropdown.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/popup/popup.bemhtml.js */
block('popup')(
    js()(function() {
        var ctx = this.ctx;
        return {
            mainOffset : ctx.mainOffset,
            secondaryOffset : ctx.secondaryOffset,
            viewportOffset : ctx.viewportOffset,
            directions : ctx.directions,
            zIndexGroupLevel : ctx.zIndexGroupLevel
        };
    }),
    attrs()({ 'aria-hidden' : 'true' })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/popup/popup.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml.js */
block('dropdown').mod('switcher', 'button').elem('switcher').replace()(function() {
    var dropdown = this._dropdown,
        switcher = dropdown.switcher;

    if(Array.isArray(switcher)) return switcher;

    var res = this.isSimple(switcher)?
        { block : 'button', text : switcher } :
        switcher;

    if(res.block === 'button') {
        var resMods = res.mods || (res.mods = {}),
            resAttrs = res.attrs || (res.attrs = {}),
            dropdownMods = this.mods;
        resMods.size || (resMods.size = dropdownMods.size);
        resMods.theme || (resMods.theme = dropdownMods.theme);
        resMods.disabled = dropdownMods.disabled;

        resAttrs['aria-haspopup'] = 'true';
        resAttrs['aria-controls'] = this._popupId;
        resAttrs['aria-expanded'] = 'false';

        res.mix = apply('mix');
    }

    return res;
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml.js */
block('dropdown').mod('switcher', 'link').elem('switcher').replace()(function() {
    var dropdown = this._dropdown,
        switcher = dropdown.switcher;

    if(Array.isArray(switcher)) return switcher;

    var res = this.isSimple(switcher)?
        { block : 'link', mods : { pseudo : true }, content : switcher } :
        switcher;

    if(res.block === 'link') {
        var resMods = res.mods || (res.mods = {}),
            resAttrs = res.attrs || (res.attrs = {}),
            dropdownMods = this.mods;
        resMods.theme || (resMods.theme = dropdownMods.theme);
        resMods.disabled = dropdownMods.disabled;

        resAttrs['aria-haspopup'] = 'true';
        resAttrs['aria-controls'] = this._popupId;
        resAttrs['aria-expanded'] = 'false';

        res.mix = apply('mix');
    }

    return res;
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/link.bemhtml.js */
block('link')(
    def()(function() {
        var ctx = this.ctx;
        typeof ctx.url === 'object' && // url could contain bemjson
            (ctx.url = this.reapply(ctx.url));
        return applyNext();
    }),

    tag()('a'),

    js()(true),

    // NOTE: mix below is to satisfy interface of `control`
    mix()([{ elem : 'control' }]),

    attrs()(function() {
        var ctx = this.ctx,
            attrs = { role : 'link' },
            tabIndex;

        if(!this.mods.disabled) {
            if(ctx.url) {
                attrs.href = ctx.url;
                tabIndex = ctx.tabIndex;
            } else {
                tabIndex = ctx.tabIndex || 0;
            }
        } else {
            attrs['aria-disabled'] = 'true';
        }

        typeof tabIndex === 'undefined' || (attrs.tabindex = tabIndex);

        ctx.title && (attrs.title = ctx.title);
        ctx.target && (attrs.target = ctx.target);

        return attrs;
    }),

    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { url : this.ctx.url });
        })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/_pseudo/link_pseudo.bemhtml.js */
block('link').mod('pseudo', true).match(function() { return !this.ctx.url; })(
    tag()('span'),
    attrs()(function() {
        return this.extend(applyNext(), { role : 'button' });
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/_pseudo/link_pseudo.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/image/image.bemhtml.js */
block('image')(
    attrs()({ role : 'img' }),

    tag()('span'),

    match(function() { return typeof this.ctx.content === 'undefined'; })(
        tag()('img'),
        attrs()(function() {
            var ctx = this.ctx;
            return this.extend(applyNext(),
                {
                    role : undefined,
                    src : ctx.url,
                    width : ctx.width,
                    height : ctx.height,
                    alt : ctx.alt,
                    title : ctx.title
                });
        })
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/image/image.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/input.bemhtml.js */
block('input')(
    tag()('span'),
    js()(true),
    def()(function() {
        return applyNext({ _input : this.ctx });
    }),
    content()({ elem : 'box', content : { elem : 'control' } })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/input.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__box/input__box.bemhtml.js */
block('input').elem('box').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__box/input__box.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__control/input__control.bemhtml.js */
block('input').elem('control')(
    tag()('input'),

    attrs()(function() {
        var input = this._input,
            attrs = {
                id : input.id,
                name : input.name,
                value : input.val,
                maxlength : input.maxLength,
                tabindex : input.tabIndex,
                placeholder : input.placeholder
            };

        input.autocomplete === false && (attrs.autocomplete = 'off');
        this.mods.disabled && (attrs.disabled = 'disabled');

        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__control/input__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/touch.blocks/input/__control/input__control.bemhtml.js */
block('input').elem('control')(

    attrs()(function() {
        return this.extend({
            autocomplete : 'off',
            autocorrect : 'off',
            autocapitalize : 'off',
            spellcheck : 'false'
        }, applyNext());
    })

);

/* end: /Users/tadatuta/projects/bem/bem-components/touch.blocks/input/__control/input__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_has-clear/input_has-clear.bemhtml.js */
block('input').mod('has-clear', true).elem('box')
    .content()(function() {
        return [this.ctx.content, { elem : 'clear' }];
    });

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_has-clear/input_has-clear.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__clear/input__clear.bemhtml.js */
block('input').elem('clear').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__clear/input__clear.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_password.bemhtml.js */
block('input').mod('type', 'password').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'password' });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_password.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_search.bemhtml.js */
block('input').mod('type', 'search').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'search' });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_search.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/menu.bemhtml.js */
block('menu')(
    def()(function() {
        var ctx = this.ctx,
            mods = this.mods,
            firstItem,
            checkedItems = [];

        if(ctx.content) {
            var isValDef = typeof ctx.val !== 'undefined',
                containsVal = function(val) {
                    return isValDef &&
                        (mods.mode === 'check'?
                            ctx.val.indexOf(val) > -1 :
                            ctx.val === val);
                },
                iterateItems = function(content) {
                    var i = 0, itemOrGroup;
                    while(itemOrGroup = content[i++]) {
                        if(itemOrGroup.elem === 'item') {
                            firstItem || (firstItem = itemOrGroup);
                            if(containsVal(itemOrGroup.val)) {
                                (itemOrGroup.elemMods = itemOrGroup.elemMods || {}).checked = true;
                                checkedItems.push(itemOrGroup);
                            }
                        } else if(itemOrGroup.content) { // menu__group
                            iterateItems(itemOrGroup.content);
                        }
                    }
                };

            if(!Array.isArray(ctx.content)) throw Error('menu: content must be an array of the menu items');

            iterateItems(ctx.content);
        }

        return applyNext({
            _firstItem : firstItem,
            _checkedItems : checkedItems,
            _menuMods : mods
        });
    }),
    attrs()(function() {
        var attrs = { role : 'menu' };

        this.mods.disabled?
            attrs['aria-disabled'] = 'true' :
            attrs.tabindex = 0;

        return attrs;
    }),
    js()(true),
    mix()({ elem : 'control' }),
    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { tabIndex : 0 });
        })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/menu.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_focused/menu_focused.bemhtml.js */
block('menu').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_focused/menu_focused.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/menu__item.bemhtml.js */
block('menu').elem('item')(
    def().match(function() { return this._menuMods; })(function() {
        var elemMods = this.elemMods;
        elemMods.theme = elemMods.theme || this._menuMods.theme;
        elemMods.disabled = elemMods.disabled || this._menuMods.disabled;
        return applyNext();
    }),
    js()(function() {
        return { val : this.ctx.val };
    }),
    attrs()(function(){
        var elemMods = this.elemMods,
            menuMode = this._menuMods && this._menuMods.mode,
            role = menuMode?
                        (menuMode === 'check'? 'menuitemcheckbox' : 'menuitemradio') :
                        'menuitem',
            attrs = {
                role : role,
                id : this.ctx.id || this.generateId(),
                'aria-disabled' : elemMods.disabled && 'true',
                'aria-checked' : menuMode && String(!!elemMods.checked)
            };

        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/menu__item.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__group/menu__group.bemhtml.js */
block('menu').elem('group')(
    attrs()({ role : 'group' }),
    match(function() { return typeof this.ctx.title !== 'undefined'; })(
        attrs()(function() {
            return this.extend(applyNext(), {
                'aria-label' : undefined,
                'aria-labelledby' : this.generateId()
            });
        }),
        content()(function() {
            return [
                {
                    elem : 'group-title',
                    attrs : {
                        role : 'presentation',
                        id : this.generateId()
                    },
                    content : this.ctx.title
                },
                applyNext()
            ];
        })
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__group/menu__group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_mode/menu_mode_radio.bemhtml.js */
block('menu')
    .mod('mode', 'radio')
    .match(function() {
        return this._firstItem && this._checkedItems && !this._checkedItems.length;
    })
    .def()(function() {
        (this._firstItem.elemMods || (this._firstItem.elemMods = {})).checked = true;
        return applyNext();
    });

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_mode/menu_mode_radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/_type/menu__item_type_link.bemhtml.js */
block('menu').elem('item').elemMod('type', 'link').elemMod('disabled', true).match(function() {
    return !this._menuItemDisabled;
}).def()(function() {
    return applyNext({ _menuItemDisabled : true });
});

block('link').match(function() {
    return this._menuItemDisabled;
}).def()(function() {
    delete this._menuItemDisabled;
    this.mods.disabled = true;
    return applyNext();
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/_type/menu__item_type_link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/modal/modal.bemhtml.js */
block('modal')(
    js()(true),

    mix()(function() {
        return {
            block : 'popup',
            js : { zIndexGroupLevel : this.ctx.zIndexGroupLevel || 20 },
            mods : { autoclosable : this.mods.autoclosable }
        };
    }),

    attrs()({
        role : 'dialog',
        'aria-hidden' : 'true'
    }),

    content()(function() {
        return {
            elem : 'table',
            content : {
                elem : 'cell',
                content : {
                    elem : 'content',
                    content : applyNext()
                }
            }
        };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/modal/modal.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/progressbar/progressbar.bemhtml.js */
block('progressbar')(
    def()(function() {
        return applyNext({ _val : this.ctx.val || 0 });
    }),

    js()(function(){
        return { val : this._val };
    }),

    attrs()(function() {
        return {
            role : 'progressbar',
            'aria-valuenow' : this._val + '%' /* NOTE: JAWS doesn't add 'percent' automatically */
        };
    }),

    content()(
        function() {
            return {
                elem : 'bar',
                attrs : { style : 'width:' + this._val + '%' }
            };
        },
        match(function() { return typeof this.ctx.content !== 'undefined'; })(function() {
            return this.ctx.content;
        })
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/progressbar/progressbar.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/radio.bemhtml.js */
block('radio')(
    tag()('label'),
    js()(true),
    content()(function() {
        var ctx = this.ctx;
        return [
            {
                elem : 'box',
                content : {
                    elem : 'control',
                    checked : this.mods.checked,
                    disabled : this.mods.disabled,
                    name : ctx.name,
                    val : ctx.val
                }
            },
            ctx.text && {
                elem : 'text',
                content : ctx.text
            }
        ];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__box/radio__box.bemhtml.js */
block('radio').elem('box').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__box/radio__box.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__control/radio__control.bemhtml.js */
block('radio').elem('control')(
    tag()('input'),

    attrs()(function() {
        // NOTE: don't remove autocomplete attribute, otherwise js and DOM may be desynced
        var ctx = this.ctx,
            attrs = {
                type : 'radio',
                autocomplete : 'off',
                name : ctx.name,
                value : ctx.val
            };

        ctx.checked && (attrs.checked = 'checked');
        ctx.disabled && (attrs.disabled = 'disabled');

        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__control/radio__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__text/radio__text.bemhtml.js */
block('radio').elem('text')(
    tag()('span'),
    attrs()(function() {
        return { role : 'presentation' };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__text/radio__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/_type/radio_type_button.bemhtml.js */
block('radio').mod('type', 'button')(
    content()(function() {
        var ctx = this.ctx,
            mods = this.mods;

        return [{
            block : 'button',
            mods : {
                togglable : mods.mode === 'radio-check'?
                    'check' :
                    'radio',
                checked : mods.checked,
                disabled : mods.disabled,
                theme : mods.theme,
                size : mods.size
            },
            title : ctx.title,
            content : [
                ctx.icon,
                typeof ctx.text !== 'undefined'?
                    { elem : 'text', content : ctx.text } :
                    ''
            ]
        }, {
            block : 'radio',
            elem : 'control',
            checked : mods.checked,
            disabled : mods.disabled,
            name : ctx.name,
            val : ctx.val
        }];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/_type/radio_type_button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/radio-group.bemhtml.js */
block('radio-group')(
    tag()('span'),

    attrs()({ role : 'radiogroup' }),

    js()(true),

    mix()([{ block : 'control-group' }]),

    content()(function() {
        var mods = this.mods,
            ctx = this.ctx,
            isValDef = typeof ctx.val !== 'undefined';

        return (ctx.options || []).map(function(option, i) {
            return [
                !!i && !mods.type && { tag : 'br' },
                {
                    block : 'radio',
                    mods : {
                        type : mods.type,
                        mode : mods.mode,
                        theme : mods.theme,
                        size : mods.size,
                        checked : isValDef && ctx.val === option.val,
                        disabled : option.disabled || mods.disabled
                    },
                    name : ctx.name,
                    val : option.val,
                    text : option.text,
                    title : option.title,
                    icon : option.icon
                }
            ];
        });
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/radio-group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml.js */
block('radio-group').mod('mode', 'radio-check')(
    def()(function() {
        if(this.mods.type !== 'button')
            throw Error('Modifier mode=radio-check can be only with modifier type=button');

        return applyNext();
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/select.bemhtml.js */
block('select')(
    def().match(function() { return !this._select; })(function() { // TODO: check BEM-XJST for proper applyNext
        if(!this.mods.mode) throw Error('Can\'t build select without mode modifier');

        var _this = this,
            ctx = this.ctx,
            isValDef = typeof ctx.val !== 'undefined',
            isModeCheck = this.mods.mode === 'check',
            firstOption, checkedOptions = [],
            optionIds = [],
            containsVal = function(val) {
                return isValDef &&
                    (isModeCheck?
                        ctx.val.indexOf(val) > -1 :
                        ctx.val === val);
            },
            iterateOptions = function(content) {
                var i = 0, option;
                while(option = content[i++]) {
                    if(option.group) {
                        iterateOptions(option.group);
                    } else {
                        firstOption || (firstOption = option);
                        optionIds.push(option.id = _this.identify(option));
                        if(containsVal(option.val)) {
                            option.checked = true;
                            checkedOptions.push(option);
                        }
                    }
                }
            };

        iterateOptions(ctx.options);

        return applyNext({
            _select : ctx,
            _checkedOptions : checkedOptions,
            _firstOption : firstOption,
            _optionIds : optionIds
        });
    }),

    js()(function() {
        var ctx = this.ctx;
        return {
            name : ctx.name,
            optionsMaxHeight : ctx.optionsMaxHeight
        };
    }),

    content()(function() {
        return [
            { elem : 'button' },
            {
                block : 'popup',
                mods : { target : 'anchor', theme : this.mods.theme, autoclosable : true },
                directions : ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
                content : { block : this.block, mods : this.mods, elem : 'menu' }
            }
        ];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/select.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_focused/select_focused.bemhtml.js */
block('select').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_focused/select_focused.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__control/select__control.bemhtml.js */
block('select').elem('control')(
    tag()('input'),
    attrs()(function() {
        return {
            type : 'hidden',
            name : this._select.name,
            value : this.ctx.val,
            disabled : this.mods.disabled? 'disabled' : undefined,
            autocomplete : 'off'
        };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__control/select__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__button/select__button.bemhtml.js */
block('select').elem('button')(
    replace()(function() {
        var select = this._select,
            mods = this.mods;

        return {
            block : 'button',
            mix : { block : this.block, elem : this.elem },
            mods : {
                size : mods.size,
                theme : mods.theme,
                view : mods.view,
                focused : mods.focused,
                disabled : mods.disabled,
                checked : mods.mode !== 'radio' && !!this._checkedOptions.length
            },
            attrs : {
                role : 'listbox',
                'aria-owns' : this._optionIds.join(' '),
                'aria-multiselectable' : mods.mode === 'check'? 'true' : undefined,
                'aria-labelledby' : this._selectTextId
            },
            id : select.id,
            tabIndex : select.tabIndex,
            content : [
                apply('content'),
                { block : 'icon', mix : { block : 'select', elem : 'tick' } }
            ]
        };
    }),
    def()(function() {
        return applyNext({ _selectTextId : this.generateId() });
    })
);

block('button').elem('text').match(function() { return this._select; })(
    attrs()(function() {
        return { id : this._selectTextId };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__button/select__button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__menu/select__menu.bemhtml.js */
block('select').elem('menu')(
    replace()(function() {
        var mods = this.mods,
            optionToMenuItem = function(option) {
                var res = {
                        block : 'menu',
                        elem : 'item',
                        elemMods : { disabled : mods.disabled || option.disabled },
                        attrs : { role : 'option' },
                        id : option.id,
                        val : option.val,
                        js : { checkedText : option.checkedText },
                        content : option.text
                    };

                if(option.icon) {
                    res.js.text = option.text;
                    res.content = [
                        option.icon,
                        res.content
                    ];
                }

                return res;
            };

        return {
            block : 'menu',
            mix : { block : this.block, elem : this.elem },
            mods : {
                size : mods.size,
                theme : mods.theme,
                disabled : mods.disabled,
                mode : mods.mode
            },
            val : this._select.val,
            attrs : { role : undefined, tabindex : undefined },
            content : this._select.options.map(function(optionOrGroup) {
                return optionOrGroup.group?
                    {
                        elem : 'group',
                        title : optionOrGroup.title,
                        content : optionOrGroup.group.map(optionToMenuItem)
                    } :
                    optionToMenuItem(optionOrGroup);
            })
        };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__menu/select__menu.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_check.bemhtml.js */
block('select').mod('mode', 'check')(
    js()(function() {
        return this.extend(applyNext(), { text : this.ctx.text });
    }),

    elem('button').content()(function() {
        var checkedOptions = this._checkedOptions;
        return [
            {
                elem : 'text',
                content : checkedOptions.length === 1?
                    checkedOptions[0].text :
                    checkedOptions.reduce(function(res, option) {
                        return res + (res? ', ' : '') + (option.checkedText || option.text);
                    }, '') ||
                        this._select.text
            }
            // TODO: with icons
        ];
    }),

    match(function() { return this._checkedOptions[0]; }).content()(function() {
        var res = this._checkedOptions.map(function(option) {
            return {
                elem : 'control',
                val : option.val
            };
        });
        res.push(applyNext());
        return res;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio-check.bemhtml.js */
block('select').mod('mode', 'radio-check')(
    js()(function() {
        return this.extend(applyNext(), { text : this.ctx.text });
    }),

    elem('button').content()(function() {
        return [
            { elem : 'text', content : (this._checkedOptions[0] || this._select).text }
            // TODO: with icons
        ];
    }),

    match(function() { return this._checkedOptions[0]; })(
        content()(function() {
            return [
                {
                    elem : 'control',
                    val : this._checkedOptions[0].val
                },
                applyNext()
            ];
        })
    )
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio-check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio.bemhtml.js */
block('select').mod('mode', 'radio')(
    def().match(function() { return this._checkedOptions; })(function() {
        var checkedOptions = this._checkedOptions,
            firstOption = this._firstOption;
        if(firstOption && !checkedOptions.length) {
            firstOption.checked = true;
            checkedOptions = [firstOption];
        }
        return applyNext({ _checkedOption : checkedOptions[0] });
    }),

    content()(function() {
        return [
            {
                elem : 'control',
                val : this._checkedOption.val
            },
            applyNext()
        ];
    }),

    elem('button').content()(function() {
        return [
            { elem : 'text', content : this._checkedOption.text }
            // TODO: with icons
        ];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/spin/spin.bemhtml.js */
block('spin')(
    tag()('span')
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/spin/spin.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/textarea/textarea.bemhtml.js */
block('textarea')(
    js()(true),
    tag()('textarea'),

    // NOTE: mix below is to satisfy interface of `control`
    mix()({ elem : 'control' }),

    attrs()(function() {
        var ctx = this.ctx,
            attrs = {
                id : ctx.id,
                name : ctx.name,
                tabindex : ctx.tabIndex,
                placeholder : ctx.placeholder
            };

        ctx.autocomplete === false && (attrs.autocomplete = 'off');
        this.mods.disabled && (attrs.disabled = 'disabled');

        return attrs;
    }),
    content()(function() {
        return this.ctx.val;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/textarea/textarea.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml.js */
block('progressbar').mod('theme', 'simple').content()(function() {
    return [
        {
            elem : 'box',
            content : applyNext()
        },
        {
            elem : 'text',
            content : this.ctx.val || 0
        }
    ];
});

/* end: /Users/tadatuta/projects/bem/bem-components/design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml.js */
oninit(function(exports, context) {
    var BEMContext = exports.BEMContext || context.BEMContext;
    // Provides third-party libraries from different modular systems
    BEMContext.prototype.require = function(lib) {
       return __bem_xjst_libs__[lib];
    };
});;
});
api.exportApply(exports);
/// -------------------------------------
/// ------ BEM-XJST User-code End -------
/// -------------------------------------


        return exports;
    };

    

    var defineAsGlobal = true;

    // Provide with CommonJS
    if (typeof module === 'object' && typeof module.exports === 'object') {
        exports['BEMHTML'] = buildBemXjst({
    
}
);
        defineAsGlobal = false;
    }

    // Provide to YModules
    if (typeof modules === 'object') {
        modules.define(
            'BEMHTML',
            [],
            function(
                provide
                
                ) {
                    provide(buildBemXjst({
    
}
));
                }
            );

        defineAsGlobal = false;
    }

    // Provide to global scope
    if (defineAsGlobal) {
        BEMHTML = buildBemXjst({
    
}
);
        global['BEMHTML'] = BEMHTML;
    }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
