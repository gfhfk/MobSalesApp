/*! 
* DevExpress PhoneJS
* Version: 13.2.3
* Build date: Nov 18, 2013
*
* Copyright (c) 2012 - 2013 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: http://phonejs.devexpress.com/EULA
*/

"use strict";

if (!window.DevExpress) {
    /*! Module core, file devexpress.js */
    (function($, global, undefined) {
        (function checkjQueryVersion(version) {
            version = version.split(".");
            if (version[0] < 1 || version[0] === 1 && version[1] < 10)
                throw Error("Your version of jQuery is too old. Please upgrade jQuery to 1.10.0 or later.");
        })($.fn.jquery);
        var Class = function() {
                var wrapOverridden = function(baseProto, methodName, method) {
                        return function() {
                                var prevCallBase = this.callBase;
                                this.callBase = baseProto[methodName];
                                try {
                                    return method.apply(this, arguments)
                                }
                                finally {
                                    this.callBase = prevCallBase
                                }
                            }
                    };
                var clonePrototype = function(obj) {
                        var func = function(){};
                        func.prototype = obj.prototype;
                        return new func
                    };
                var classImpl = function(){};
                var redefine = function(members) {
                        var self = this;
                        if (!members)
                            return self;
                        var memberNames = $.map(members, function(_, k) {
                                return k
                            });
                        $.each(["toString", "toLocaleString", "valueOf"], function() {
                            if (members[this])
                                memberNames.push(this)
                        });
                        $.each(memberNames, function() {
                            var overridden = $.isFunction(self.prototype[this]) && $.isFunction(members[this]);
                            self.prototype[this] = overridden ? wrapOverridden(self.parent.prototype, this, members[this]) : members[this]
                        });
                        return self
                    };
                var include = function() {
                        var classObj = this;
                        $.each(arguments, function() {
                            if (this.ctor)
                                classObj._includedCtors.push(this.ctor);
                            for (var name in this) {
                                if (name === "ctor")
                                    continue;
                                if (name in classObj.prototype)
                                    throw Error("Member name collision: " + name);
                                classObj.prototype[name] = this[name]
                            }
                        });
                        return classObj
                    };
                var subclassOf = function(parentClass) {
                        if (this.parent === parentClass)
                            return true;
                        if (!this.parent || !this.parent.subclassOf)
                            return false;
                        return this.parent.subclassOf(parentClass)
                    };
                classImpl.inherit = function(members) {
                    var inheritor = function() {
                            if (!this || this.constructor !== inheritor)
                                throw Error("A class must be instantiated using the 'new' keyword");
                            var instance = this,
                                ctor = instance.ctor;
                            if (ctor)
                                ctor.apply(instance, arguments);
                            $.each(instance.constructor._includedCtors, function() {
                                this.call(instance)
                            })
                        };
                    inheritor.prototype = clonePrototype(this);
                    inheritor.inherit = this.inherit;
                    inheritor.redefine = redefine;
                    inheritor.include = include;
                    inheritor.subclassOf = subclassOf;
                    inheritor.parent = this;
                    inheritor._includedCtors = this._includedCtors ? this._includedCtors.slice(0) : [];
                    inheritor.prototype.constructor = inheritor;
                    inheritor.redefine(members);
                    return inheritor
                };
                return classImpl
            }();
        function createQueue(discardPendingTasks) {
            var _tasks = [],
                _busy = false;
            function exec() {
                while (_tasks.length) {
                    var task = _tasks.shift(),
                        result = task();
                    if (result === undefined)
                        continue;
                    if (result.then) {
                        _busy = true;
                        $.when(result).always(exec);
                        return
                    }
                    throw Error("Queued task returned unexpected result");
                }
                _busy = false
            }
            function add(task, removeTaskCallback) {
                if (!discardPendingTasks)
                    _tasks.push(task);
                else {
                    if (_tasks[0] && removeTaskCallback)
                        removeTaskCallback(_tasks[0]);
                    _tasks = [task]
                }
                if (!_busy)
                    exec()
            }
            function busy() {
                return _busy
            }
            return {
                    add: add,
                    busy: busy
                }
        }
        var parseUrl = function() {
                var a = document.createElement("a"),
                    props = ["protocol", "hostname", "port", "pathname", "search", "hash"];
                var normalizePath = function(value) {
                        if (value.charAt(0) !== "/")
                            value = "/" + value;
                        return value
                    };
                return function(url) {
                        a.href = url;
                        var result = {};
                        $.each(props, function() {
                            result[this] = a[this]
                        });
                        result.pathname = normalizePath(result.pathname);
                        return result
                    }
            }();
        global.DevExpress = global.DevExpress || {};
        var enqueueAsync = function(task) {
                var deferred = $.Deferred();
                setTimeout(function() {
                    deferred.resolve(task())
                }, 60);
                return deferred
            };
        var backButtonCallback = function() {
                var callbacks = [];
                return {
                        add: function(callback) {
                            callbacks.push(callback)
                        },
                        remove: function(callback) {
                            var indexOfCallback = $.inArray(callback, callbacks);
                            if (indexOfCallback !== -1)
                                callbacks.splice(indexOfCallback, 1)
                        },
                        fire: function() {
                            var callback = callbacks.pop(),
                                result = !!callback;
                            if (result)
                                callback();
                            return result
                        }
                    }
            }();
        var overlayTargetContainer = function() {
                var defaultTargetContainer = ".dx-viewport";
                return function(targetContainer) {
                        if (arguments.length)
                            defaultTargetContainer = targetContainer;
                        return defaultTargetContainer
                    }
            }();
        $.extend(global.DevExpress, {
            abstract: function() {
                throw Error("Not implemented");
            },
            Class: Class,
            createQueue: createQueue,
            enqueue: createQueue().add,
            enqueueAsync: enqueueAsync,
            parseUrl: parseUrl,
            backButtonCallback: backButtonCallback,
            overlayTargetContainer: overlayTargetContainer
        })
    })(jQuery, this);
    /*! Module core, file inflector.js */
    (function($, DX, undefined) {
        var _normalize = function(text) {
                if (text === undefined || text === null)
                    return "";
                return String(text)
            };
        var _ucfirst = function(text) {
                return _normalize(text).charAt(0).toUpperCase() + text.substr(1)
            };
        var _chop = function(text) {
                return _normalize(text).replace(/([a-z\d])([A-Z])/g, "$1 $2").split(/[\s_-]+/)
            };
        var dasherize = function(text) {
                return $.map(_chop(text), function(p) {
                        return p.toLowerCase()
                    }).join("-")
            };
        var underscore = function(text) {
                return dasherize(text).replace(/-/g, "_")
            };
        var camelize = function(text, upperFirst) {
                return $.map(_chop(text), function(p, i) {
                        p = p.toLowerCase();
                        if (upperFirst || i > 0)
                            p = _ucfirst(p);
                        return p
                    }).join("")
            };
        var humanize = function(text) {
                return _ucfirst(dasherize(text).replace(/-/g, " "))
            };
        var titleize = function(text) {
                return $.map(_chop(text), function(p) {
                        return _ucfirst(p.toLowerCase())
                    }).join(" ")
            };
        DX.inflector = {
            dasherize: dasherize,
            camelize: camelize,
            humanize: humanize,
            titleize: titleize,
            underscore: underscore
        }
    })(jQuery, DevExpress);
    /*! Module core, file support.js */
    (function($, DX, window) {
        var cssPrefixes = ["", "Webkit", "Moz", "O", "ms"],
            styles = document.createElement("dx").style;
        var transitionEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd',
                msTransition: 'MsTransitionEnd',
                transition: 'transitionend'
            };
        var styleProp = function(prop) {
                prop = DX.inflector.camelize(prop, true);
                for (var i = 0, cssPrefixesCount = cssPrefixes.length; i < cssPrefixesCount; i++) {
                    var specific = cssPrefixes[i] + prop;
                    if (specific in styles)
                        return specific
                }
            };
        var supportProp = function(prop) {
                return !!styleProp(prop)
            };
        DX.support = {
            touch: "ontouchstart" in window,
            pointer: window.navigator.pointerEnabled,
            transform3d: supportProp("perspective"),
            transition: supportProp("transition"),
            transitionEndEventName: transitionEndEventNames[styleProp("transition")],
            animation: supportProp("animation"),
            winJS: "WinJS" in window,
            styleProp: styleProp,
            supportProp: supportProp,
            hasKo: !!window.ko,
            hasNg: !window.ko && !!window.angular,
            inputType: function(type) {
                if (type === "text")
                    return true;
                var input = document.createElement("input");
                try {
                    input.setAttribute("type", type);
                    input.value = "wrongValue";
                    return !input.value
                }
                catch(e) {
                    return false
                }
            }
        }
    })(jQuery, DevExpress, this);
    /*! Module core, file browser.js */
    (function($, DX, global, undefined) {
        var webkitRegExp = /(webkit)[ \/]([\w.]+)/,
            operaRegExp = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            ieRegExp = /(msie) ([\w.]+)/,
            mozillaRegExp = /(mozilla)(?:.*? rv:([\w.]+))?/;
        var ua = navigator.userAgent.toLowerCase();
        var browser = function() {
                var result = {},
                    matches = webkitRegExp.exec(ua) || operaRegExp.exec(ua) || ieRegExp.exec(ua) || ua.indexOf("compatible") < 0 && mozillaRegExp.exec(ua) || [],
                    browserName = matches[1],
                    browserVersion = matches[2];
                if (browserName) {
                    result[browserName] = true;
                    result.version = browserVersion
                }
                return result
            }();
        DX.browser = browser
    })(jQuery, DevExpress, this);
    /*! Module core, file position.js */
    (function($, DX, undefined) {
        var horzRe = /left|right/,
            vertRe = /top|bottom/,
            collisionRe = /fit|flip/;
        var splitPair = function(raw) {
                switch (typeof raw) {
                    case"string":
                        return raw.split(/\s+/, 2);
                    case"object":
                        return [raw.x || raw.h, raw.y || raw.v];
                    case"number":
                        return [raw];
                    default:
                        return raw
                }
            };
        var normalizeAlign = function(raw) {
                var result = {
                        h: "center",
                        v: "center"
                    };
                var pair = splitPair(raw);
                if (pair)
                    $.each(pair, function() {
                        var w = String(this).toLowerCase();
                        if (horzRe.test(w))
                            result.h = w;
                        else if (vertRe.test(w))
                            result.v = w
                    });
                return result
            };
        var normalizeOffset = function(raw) {
                var pair = splitPair(raw),
                    h = parseInt(pair && pair[0], 10),
                    v = parseInt(pair && pair[1], 10);
                if (!isFinite(h))
                    h = 0;
                if (!isFinite(v))
                    v = h;
                return {
                        h: h,
                        v: v
                    }
            };
        var normalizeCollision = function(raw) {
                var pair = splitPair(raw),
                    h = String(pair && pair[0]).toLowerCase(),
                    v = String(pair && pair[1]).toLowerCase();
                if (!collisionRe.test(h))
                    h = "none";
                if (!collisionRe.test(v))
                    v = h;
                return {
                        h: h,
                        v: v
                    }
            };
        var getAlignFactor = function(align) {
                switch (align) {
                    case"center":
                        return 0.5;
                    case"right":
                    case"bottom":
                        return 1;
                    default:
                        return 0
                }
            };
        var inverseAlign = function(align) {
                switch (align) {
                    case"left":
                        return "right";
                    case"right":
                        return "left";
                    case"top":
                        return "bottom";
                    case"bottom":
                        return "top";
                    default:
                        return align
                }
            };
        var initMyLocation = function(data) {
                data.myLocation = data.atLocation + getAlignFactor(data.atAlign) * data.atSize - getAlignFactor(data.myAlign) * data.mySize + data.offset
            };
        var decolliders = {
                fit: function(data, bounds) {
                    var result = false;
                    if (data.myLocation > bounds.max) {
                        data.myLocation = bounds.max;
                        result = true
                    }
                    if (data.myLocation < bounds.min) {
                        data.myLocation = bounds.min;
                        result = true
                    }
                    return result
                },
                flip: function(data, bounds) {
                    if (data.myAlign === "center" && data.atAlign === "center")
                        return false;
                    if (data.myLocation < bounds.min || data.myLocation > bounds.max) {
                        var inverseData = $.extend({}, data, {
                                myAlign: inverseAlign(data.myAlign),
                                atAlign: inverseAlign(data.atAlign),
                                offset: -data.offset
                            });
                        initMyLocation(inverseData);
                        if (inverseData.myLocation >= bounds.min && inverseData.myLocation <= bounds.max || inverseData.myLocation > data.myLocation)
                            data.myLocation = inverseData.myLocation;
                        return true
                    }
                    return false
                }
            };
        var scrollbarWidth;
        var defaultPositionResult = {
                h: {
                    location: 0,
                    flip: false,
                    fit: false
                },
                v: {
                    location: 0,
                    flip: false,
                    fit: false
                }
            };
        var calculatePosition = function(what, options) {
                var $what = $(what),
                    currentOffset = $what.offset(),
                    result = $.extend(true, {}, defaultPositionResult, {
                        h: {location: currentOffset.left},
                        v: {location: currentOffset.top}
                    });
                if (!options)
                    return result;
                var my = normalizeAlign(options.my),
                    at = normalizeAlign(options.at),
                    of = options.of || window,
                    offset = normalizeOffset(options.offset),
                    collision = normalizeCollision(options.collision);
                var h = {
                        mySize: $what.outerWidth(),
                        myAlign: my.h,
                        atAlign: at.h,
                        offset: offset.h,
                        collision: collision.h
                    };
                var v = {
                        mySize: $what.outerHeight(),
                        myAlign: my.v,
                        atAlign: at.v,
                        offset: offset.v,
                        collision: collision.v
                    };
                if (of.preventDefault) {
                    h.atLocation = of.pageX;
                    v.atLocation = of.pageY;
                    h.atSize = 0;
                    v.atSize = 0
                }
                else {
                    of = $(of);
                    if ($.isWindow(of[0])) {
                        h.atLocation = of.scrollLeft();
                        v.atLocation = of.scrollTop();
                        h.atSize = of.width();
                        v.atSize = of.height()
                    }
                    else if (of[0].nodeType === 9) {
                        h.atLocation = 0;
                        v.atLocation = 0;
                        h.atSize = of.width();
                        v.atSize = of.height()
                    }
                    else {
                        var o = of.offset();
                        h.atLocation = o.left;
                        v.atLocation = o.top;
                        h.atSize = of.outerWidth();
                        v.atSize = of.outerHeight()
                    }
                }
                initMyLocation(h);
                initMyLocation(v);
                var bounds = function() {
                        var win = $(window),
                            left = win.scrollLeft(),
                            top = win.scrollTop();
                        if (scrollbarWidth === undefined)
                            scrollbarWidth = calculateScrollbarWidth();
                        var hScrollbar = document.width > document.documentElement.clientWidth,
                            vScrollbar = document.height > document.documentElement.clientHeight,
                            hZoomLevel = DX.support.touch ? document.documentElement.clientWidth / (vScrollbar ? window.innerWidth - scrollbarWidth : window.innerWidth) : 1,
                            vZoomLevel = DX.support.touch ? document.documentElement.clientHeight / (hScrollbar ? window.innerHeight - scrollbarWidth : window.innerHeight) : 1;
                        return {
                                h: {
                                    min: left,
                                    max: left + win.width() / hZoomLevel - h.mySize
                                },
                                v: {
                                    min: top,
                                    max: top + win.height() / vZoomLevel - v.mySize
                                }
                            }
                    }();
                if (decolliders[h.collision])
                    result.h[h.collision] = decolliders[h.collision](h, bounds.h);
                if (decolliders[v.collision])
                    result.v[v.collision] = decolliders[v.collision](v, bounds.v);
                $.extend(true, result, {
                    h: {location: Math.round(h.myLocation)},
                    v: {location: Math.round(v.myLocation)}
                });
                return result
            };
        var position = function(what, options) {
                var $what = $(what);
                if (!options)
                    return $what.offset();
                var targetPosition = calculatePosition($what, options);
                $what.offset({
                    left: targetPosition.h.location,
                    top: targetPosition.v.location
                })
            };
        $.extend(DX, {
            calculatePosition: calculatePosition,
            position: position
        });
        var calculateScrollbarWidth = function() {
                var $scrollDiv = $("<div>").css({
                        width: 100,
                        height: 100,
                        overflow: "scroll",
                        position: "absolute",
                        top: -9999
                    }).appendTo($("body")),
                    result = $scrollDiv.get(0).offsetWidth - $scrollDiv.get(0).clientWidth;
                $scrollDiv.remove();
                return result
            }
    })(jQuery, DevExpress);
    /*! Module core, file action.js */
    (function($, DX, undefined) {
        var actionExecutors = {};
        var registerExecutor = function(name, executor) {
                if ($.isPlainObject(name)) {
                    $.each(name, registerExecutor);
                    return
                }
                actionExecutors[name] = executor
            };
        var unregisterExecutor = function(name) {
                var args = $.makeArray(arguments);
                $.each(args, function() {
                    delete actionExecutors[this]
                })
            };
        registerExecutor({
            func: {execute: function(e) {
                    if ($.isFunction(e.action)) {
                        e.result = e.action.apply(e.context, e.args);
                        e.handled = true
                    }
                }},
            url: {execute: function(e) {
                    if (typeof e.action === "string" && e.action.charAt(0) !== "#")
                        document.location = e.action
                }},
            hash: {execute: function(e) {
                    if (typeof e.action === "string" && e.action.charAt(0) === "#")
                        document.location.hash = e.action
                }}
        });
        var Action = DX.Class.inherit({
                ctor: function(action, config) {
                    config = config || {};
                    this._action = action || $.noop;
                    this._context = config.context || window;
                    this._beforeExecute = config.beforeExecute || $.noop;
                    this._afterExecute = config.afterExecute || $.noop;
                    this._component = config.component
                },
                execute: function() {
                    var e = {
                            action: this._action,
                            args: Array.prototype.slice.call(arguments),
                            context: this._context,
                            component: this._component,
                            canceled: false,
                            handled: false
                        };
                    if (!this._validateAction(e))
                        return;
                    this._beforeExecute.call(this._context, e);
                    if (e.canceled)
                        return;
                    var result = this._executeAction(e);
                    this._afterExecute.call(this._context, e);
                    return result
                },
                _validateAction: function(e) {
                    $.each(actionExecutors, function(index, executor) {
                        if (executor.validate)
                            executor.validate(e);
                        if (e.canceled)
                            return false
                    });
                    return !e.canceled
                },
                _executeAction: function(e) {
                    var result;
                    $.each(actionExecutors, function(index, executor) {
                        if (executor.execute)
                            executor.execute(e);
                        if (e.handled) {
                            result = e.result;
                            return false
                        }
                    });
                    return result
                }
            });
        $.extend(DX, {
            registerActionExecutor: registerExecutor,
            unregisterActionExecutor: unregisterExecutor,
            Action: Action
        });
        DX.__internals = {actionExecutors: actionExecutors}
    })(jQuery, DevExpress);
    /*! Module core, file utils.js */
    (function($, DX, undefined) {
        var PI = Math.PI,
            LN10 = Math.LN10;
        var cos = Math.cos,
            sin = Math.sin,
            abs = Math.abs,
            log = Math.log,
            floor = Math.floor,
            ceil = Math.ceil,
            max = Math.max,
            min = Math.min,
            isNaN = window.isNaN,
            Number = window.Number,
            NaN = window.NaN;
        var dateUnitIntervals = ['millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'];
        var isDefined = function(object) {
                return object !== null && object !== undefined
            };
        var isString = function(object) {
                return $.type(object) === 'string'
            };
        var isNumber = function(object) {
                return $.isNumeric(object)
            };
        var isObject = function(object) {
                return $.type(object) === 'object'
            };
        var isArray = function(object) {
                return $.type(object) === 'array'
            };
        var isDate = function(object) {
                return $.type(object) === 'date'
            };
        var isFunction = function(object) {
                return $.type(object) === 'function'
            };
        var toMilliseconds = function(value) {
                switch (value) {
                    case'millisecond':
                        return 1;
                    case'second':
                        return toMilliseconds('millisecond') * 1000;
                    case'minute':
                        return toMilliseconds('second') * 60;
                    case'hour':
                        return toMilliseconds('minute') * 60;
                    case'day':
                        return toMilliseconds('hour') * 24;
                    case'week':
                        return toMilliseconds('day') * 7;
                    case'month':
                        return toMilliseconds('day') * 30;
                    case'quarter':
                        return toMilliseconds('month') * 3;
                    case'year':
                        return toMilliseconds('day') * 365;
                    default:
                        return 0
                }
            };
        var convertDateUnitToMilliseconds = function(dateUnit, count) {
                return toMilliseconds(dateUnit) * count
            };
        var convertMillisecondsToDateUnits = function(value) {
                var i,
                    dateUnitCount,
                    dateUnitInterval,
                    dateUnitIntervals = ['millisecond', 'second', 'minute', 'hour', 'day', 'month', 'year'],
                    result = {};
                for (i = dateUnitIntervals.length - 1; i >= 0; i--) {
                    dateUnitInterval = dateUnitIntervals[i];
                    dateUnitCount = Math.floor(value / toMilliseconds(dateUnitInterval));
                    if (dateUnitCount > 0) {
                        result[dateUnitInterval + 's'] = dateUnitCount;
                        value -= convertDateUnitToMilliseconds(dateUnitInterval, dateUnitCount)
                    }
                }
                return result
            };
        var convertDateTickIntervalToMilliseconds = function(tickInterval) {
                var milliseconds = 0;
                if (isObject(tickInterval))
                    $.each(tickInterval, function(key, value) {
                        milliseconds += convertDateUnitToMilliseconds(key.substr(0, key.length - 1), value)
                    });
                if (isString(tickInterval))
                    milliseconds = convertDateUnitToMilliseconds(tickInterval, 1);
                return milliseconds
            };
        var getDatesDifferences = function(date1, date2) {
                var differences,
                    counter = 0;
                differences = {
                    year: date1.getFullYear() !== date2.getFullYear(),
                    month: date1.getMonth() !== date2.getMonth(),
                    day: date1.getDate() !== date2.getDate(),
                    hour: date1.getHours() !== date2.getHours(),
                    minute: date1.getMinutes() !== date2.getMinutes(),
                    second: date1.getSeconds() !== date2.getSeconds()
                };
                $.each(differences, function(key, value) {
                    if (value)
                        counter++
                });
                differences.count = counter;
                return differences
            };
        var getFraction = function(value) {
                var valueString,
                    dotIndex;
                if (isNumber(value)) {
                    valueString = value.toString();
                    dotIndex = valueString.indexOf('.');
                    if (dotIndex >= 0)
                        if (isExponential(value))
                            return valueString.substr(dotIndex + 1, valueString.indexOf('e') - dotIndex - 1);
                        else {
                            valueString = value.toFixed(20);
                            return valueString.substr(dotIndex + 1, valueString.length - dotIndex + 1)
                        }
                }
                return ''
            };
        var getSignificantDigitPosition = function(value) {
                var fraction = getFraction(value),
                    i;
                if (fraction)
                    for (i = 0; i < fraction.length; i++)
                        if (fraction.charAt(i) !== '0')
                            return i + 1;
                return 0
            };
        var addSubValues = function(value1, value2, isSub) {
                return value1 + (isSub ? -1 : 1) * value2
            };
        var isExponential = function(value) {
                return isNumber(value) && value.toString().indexOf('e') !== -1
            };
        var addInterval = function(value, interval, isNegative) {
                var result = null,
                    intervalObject;
                if (isDate(value)) {
                    intervalObject = isString(interval) ? getDateIntervalByString(interval.toLowerCase()) : interval;
                    result = new Date(value.getTime());
                    if (intervalObject.years)
                        result.setFullYear(addSubValues(result.getFullYear(), intervalObject.years, isNegative));
                    if (intervalObject.quarters)
                        result.setMonth(addSubValues(result.getMonth(), 3 * intervalObject.quarters, isNegative));
                    if (intervalObject.months)
                        result.setMonth(addSubValues(result.getMonth(), intervalObject.months, isNegative));
                    if (intervalObject.weeks)
                        result.setDate(addSubValues(result.getDate(), 7 * intervalObject.weeks, isNegative));
                    if (intervalObject.days)
                        result.setDate(addSubValues(result.getDate(), intervalObject.days, isNegative));
                    if (intervalObject.hours)
                        result.setHours(addSubValues(result.getHours(), intervalObject.hours, isNegative));
                    if (intervalObject.minutes)
                        result.setMinutes(addSubValues(result.getMinutes(), intervalObject.minutes, isNegative));
                    if (intervalObject.seconds)
                        result.setSeconds(addSubValues(result.getSeconds(), intervalObject.seconds, isNegative));
                    if (intervalObject.milliseconds)
                        result.setMilliseconds(addSubValues(value.getMilliseconds(), intervalObject.milliseconds, isNegative))
                }
                else
                    result = addSubValues(value, interval, isNegative);
                return result
            };
        var getDateUnitInterval = function(tickInterval) {
                var maxInterval = -1,
                    i;
                if (isString(tickInterval))
                    return tickInterval;
                if (isObject(tickInterval)) {
                    $.each(tickInterval, function(key, value) {
                        for (i = 0; i < dateUnitIntervals.length; i++)
                            if (value && (key === dateUnitIntervals[i] + 's' || key === dateUnitIntervals[i]) && maxInterval < i)
                                maxInterval = i
                    });
                    return dateUnitIntervals[maxInterval]
                }
                return ''
            };
        var correctDateWithUnitBeginning = function(date, dateInterval) {
                var dayMonth,
                    firstQuarterMonth,
                    dateUnitInterval = getDateUnitInterval(dateInterval);
                switch (dateUnitInterval) {
                    case'second':
                        date.setMilliseconds(0);
                        break;
                    case'minute':
                        date.setSeconds(0, 0);
                        break;
                    case'hour':
                        date.setMinutes(0, 0, 0);
                        break;
                    case'year':
                        date.setMonth(0);
                    case'month':
                        date.setDate(1);
                    case'day':
                        date.setHours(0, 0, 0, 0);
                        break;
                    case'week':
                        dayMonth = date.getDate();
                        if (date.getDay() !== 0)
                            dayMonth += 7 - date.getDay();
                        date.setDate(dayMonth);
                        date.setHours(0, 0, 0, 0);
                        break;
                    case'quarter':
                        firstQuarterMonth = DX.formatHelper.getFirstQuarterMonth(date.getMonth());
                        if (date.getMonth() !== firstQuarterMonth)
                            date.setMonth(firstQuarterMonth);
                        date.setDate(1);
                        date.setHours(0, 0, 0, 0);
                        break
                }
            };
        var roundValue = function(value, precision) {
                if (precision > 20)
                    precision = 20;
                if (isNumber(value))
                    if (isExponential(value))
                        return Number(value.toExponential(precision));
                    else
                        return Number(value.toFixed(precision))
            };
        var getPrecision = function(value) {
                var stringFraction,
                    stringValue = value.toString(),
                    pointIndex = stringValue.indexOf('.'),
                    startIndex,
                    precision;
                if (isExponential(value)) {
                    precision = getDecimalOrder(value);
                    if (precision < 0)
                        return Math.abs(precision);
                    else
                        return 0
                }
                if (pointIndex !== -1) {
                    startIndex = pointIndex + 1;
                    stringFraction = stringValue.substring(startIndex, startIndex + 20);
                    return stringFraction.length
                }
                return 0
            };
        var applyPrecisionByMinDelta = function(min, delta, value) {
                var minPrecision = getPrecision(min),
                    deltaPrecision = getPrecision(delta);
                return roundValue(value, minPrecision < deltaPrecision ? deltaPrecision : minPrecision)
            };
        var adjustValue = function(value) {
                var fraction = getFraction(value),
                    nextValue,
                    i;
                if (fraction)
                    for (i = 1; i <= fraction.length; i++) {
                        nextValue = roundValue(value, i);
                        if (nextValue !== 0 && fraction[i - 2] && fraction[i - 1] && fraction[i - 2] === fraction[i - 1])
                            return nextValue
                    }
                return value
            };
        var getDateIntervalByString = function(intervalString) {
                var result = {};
                switch (intervalString) {
                    case'year':
                        result.years = 1;
                        break;
                    case'month':
                        result.months = 1;
                        break;
                    case'quarter':
                        result.months = 3;
                        break;
                    case'week':
                        result.days = 7;
                        break;
                    case'day':
                        result.days = 1;
                        break;
                    case'hour':
                        result.hours = 1;
                        break;
                    case'minute':
                        result.minutes = 1;
                        break;
                    case'second':
                        result.seconds = 1;
                        break;
                    case'millisecond':
                        result.milliseconds = 1;
                        break
                }
                return result
            };
        var normalizeAngle = function(angle) {
                return (angle % 360 + 360) % 360
            };
        var convertAngleToRendererSpace = function(angle) {
                return 90 - angle
            };
        var degreesToRadians = function(value) {
                return PI * value / 180
            };
        var getCosAndSin = function(angle) {
                var angleInRadians = degreesToRadians(angle);
                return {
                        cos: cos(angleInRadians),
                        sin: sin(angleInRadians)
                    }
            };
        var DECIMAL_ORDER_THRESHOLD = 1E-14;
        var getDecimalOrder = function(number) {
                var n = abs(number),
                    cn;
                if (!isNaN(n)) {
                    if (n > 0) {
                        n = log(n) / LN10;
                        cn = ceil(n);
                        return cn - n < DECIMAL_ORDER_THRESHOLD ? cn : floor(n)
                    }
                    return 0
                }
                return NaN
            };
        var getAppropriateFormat = function(start, end, count) {
                var order = max(getDecimalOrder(start), getDecimalOrder(end)),
                    precision = -getDecimalOrder(abs(end - start) / count),
                    format;
                if (!isNaN(order) && !isNaN(precision)) {
                    if (abs(order) <= 4) {
                        format = 'fixedPoint';
                        precision < 0 && (precision = 0);
                        precision > 4 && (precision = 4)
                    }
                    else {
                        format = 'exponential';
                        precision += order - 1;
                        precision > 3 && (precision = 3)
                    }
                    return {
                            format: format,
                            precision: precision
                        }
                }
                return null
            };
        var createResizeHandler = function(callback) {
                var $window = $(window),
                    timeout;
                var debug_callback = arguments[1];
                var handler = function() {
                        var width = $window.width(),
                            height = $window.height();
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            $window.width() === width && $window.height() === height && callback();
                            debug_callback && debug_callback()
                        }, 100)
                    };
                handler.stop = function() {
                    clearTimeout(timeout);
                    return this
                };
                return handler
            };
        var logger = function() {
                var console = window.console;
                function info(text) {
                    if (!console || !$.isFunction(console.info))
                        return;
                    console.info(text)
                }
                function warn(text) {
                    if (!console || !$.isFunction(console.warn))
                        return;
                    console.warn(text)
                }
                function error(text) {
                    if (!console || !$.isFunction(console.error))
                        return;
                    console.error(text)
                }
                return {
                        info: info,
                        warn: warn,
                        error: error
                    }
            }();
        var debug = function() {
                function assert(condition, message) {
                    if (!condition)
                        throw new Error(message);
                }
                function assertParam(parameter, message) {
                    assert(parameter !== null && parameter !== undefined, message)
                }
                return {
                        assert: assert,
                        assertParam: assertParam
                    }
            }();
        var windowResizeCallbacks = function() {
                var prevSize,
                    callbacks = $.Callbacks(),
                    jqWindow = $(window);
                var formatSize = function() {
                        return [jqWindow.width(), jqWindow.height()].join()
                    };
                var handleResize = function() {
                        var now = formatSize();
                        if (now === prevSize)
                            return;
                        prevSize = now;
                        callbacks.fire()
                    };
                jqWindow.on("resize", handleResize);
                prevSize = formatSize();
                return callbacks
            }();
        var resetActiveElement = function() {
                var android4nativeBrowser = DX.devices.real.platform === "android" && /^4\.0(\.\d)?/.test(DX.devices.real.version.join(".")) && navigator.userAgent.indexOf("Chrome") === -1;
                function androidInputBlur() {
                    var $specInput = $("<input>").addClass("dx-hidden-input").appendTo("body");
                    setTimeout(function() {
                        $specInput.focus();
                        setTimeout(function() {
                            $specInput.hide();
                            $specInput.remove()
                        }, 100)
                    }, 100)
                }
                function standardInputBlur() {
                    var activeElement = document.activeElement;
                    if (activeElement && activeElement !== document.body && activeElement.blur)
                        activeElement.blur()
                }
                if (android4nativeBrowser)
                    androidInputBlur();
                else
                    standardInputBlur()
            };
        var createMarkupFromString = function(str) {
                var tempElement = $("<div />");
                if (window.WinJS)
                    WinJS.Utilities.setInnerHTMLUnsafe(tempElement.get(0), str);
                else
                    tempElement.append(str);
                return tempElement.contents()
            };
        var getNextClipId = function() {
                var numClipRect = 1;
                return function() {
                        return 'DevExpress_' + numClipRect++
                    }
            }();
        var getNextPatternId = function() {
                var numPattern = 1;
                return function() {
                        return 'DevExpressPattern_' + numPattern++
                    }
            }();
        var extendFromObject = function(target, source, overrideExistingValues) {
                target = target || {};
                for (var prop in source)
                    if (source.hasOwnProperty(prop)) {
                        var value = source[prop];
                        if (!(prop in target) || overrideExistingValues)
                            target[prop] = value
                    }
                return target
            };
        var clone = function() {
                function Clone(){}
                return function(obj) {
                        Clone.prototype = obj;
                        return new Clone
                    }
            }();
        var executeAsync = function(action, context) {
                var deferred = $.Deferred(),
                    normalizedContext = context || this;
                setTimeout(function() {
                    var result = action.call(normalizedContext);
                    if (result && result.done && $.isFunction(result.done))
                        result.done(function() {
                            deferred.resolveWith(normalizedContext)
                        });
                    else
                        deferred.resolveWith(normalizedContext)
                }, 0);
                return deferred.promise()
            };
        var getLog = function(value, base) {
                var a;
                a = Math.log(value) / Math.log(base);
                return a
            };
        var raiseTo = function(power, base) {
                var a;
                a = Math.pow(base, power);
                return a
            };
        var stringFormat = function() {
                var s = arguments[0];
                for (var i = 0; i < arguments.length - 1; i++) {
                    var reg = new RegExp("\\{" + i + "\\}", "gm");
                    s = s.replace(reg, arguments[i + 1])
                }
                return s
            };
        var getRootOffset = function(renderer) {
                var node,
                    result = {
                        left: {},
                        top: {}
                    },
                    root = renderer.getRoot();
                if (root) {
                    node = root.element;
                    if (node.getScreenCTM) {
                        var ctm = node.getScreenCTM();
                        if (ctm) {
                            result.left = node.createSVGPoint().matrixTransform(ctm).x + (document.body.scrollLeft || document.documentElement.scrollLeft);
                            result.top = node.createSVGPoint().matrixTransform(ctm).y + (document.body.scrollTop || document.documentElement.scrollTop)
                        }
                        else {
                            result.left = document.body.scrollLeft || document.documentElement.scrollLeft;
                            result.top = document.body.scrollTop || document.documentElement.scrollTop
                        }
                    }
                    else {
                        result.left = $(node).offset().left;
                        result.top = $(node).offset().top
                    }
                }
                return result
            };
        var findBestMatch = function(targetFilter, items) {
                var result = null,
                    maxMatchCount = 0;
                $.each(items, function(index, item) {
                    var matchCount = 0;
                    $.each(item, function(paramName) {
                        var value = targetFilter[paramName];
                        if (value !== item[paramName] && value !== undefined) {
                            matchCount = 0;
                            return false
                        }
                        else
                            matchCount++
                    });
                    if (matchCount > maxMatchCount) {
                        result = item;
                        maxMatchCount = matchCount
                    }
                });
                return result
            };
        var preg_quote = function(str) {
                return (str + "").replace(/([\+\*\?\\\.\[\^\]\$\(\)\{\}\>\<\|\=\!\:])/g, "\\$1")
            };
        var replaceAll = function(text, searchToken, replacementToken) {
                return text.replace(new RegExp("(" + preg_quote(searchToken) + ")", "gi"), replacementToken)
            };
        function icontains(elem, text) {
            return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((text || "").toLowerCase()) > -1
        }
        $.expr[":"].dxicontains = $.expr.createPseudo(function(text) {
            return function(elem) {
                    return icontains(elem, text)
                }
        });
        DX.utils = {
            dateUnitIntervals: dateUnitIntervals,
            isDefined: isDefined,
            isString: isString,
            isNumber: isNumber,
            isObject: isObject,
            isArray: isArray,
            isDate: isDate,
            isFunction: isFunction,
            getLog: getLog,
            raiseTo: raiseTo,
            normalizeAngle: normalizeAngle,
            convertAngleToRendererSpace: convertAngleToRendererSpace,
            degreesToRadians: degreesToRadians,
            getCosAndSin: getCosAndSin,
            getDecimalOrder: getDecimalOrder,
            getAppropriateFormat: getAppropriateFormat,
            getFraction: getFraction,
            adjustValue: adjustValue,
            convertMillisecondsToDateUnits: convertMillisecondsToDateUnits,
            convertDateTickIntervalToMilliseconds: convertDateTickIntervalToMilliseconds,
            convertDateUnitToMilliseconds: convertDateUnitToMilliseconds,
            getDateUnitInterval: getDateUnitInterval,
            getDatesDifferences: getDatesDifferences,
            correctDateWithUnitBeginning: correctDateWithUnitBeginning,
            roundValue: roundValue,
            isExponential: isExponential,
            applyPrecisionByMinDelta: applyPrecisionByMinDelta,
            getSignificantDigitPosition: getSignificantDigitPosition,
            addInterval: addInterval,
            getDateIntervalByString: getDateIntervalByString,
            logger: logger,
            debug: debug,
            createResizeHandler: createResizeHandler,
            windowResizeCallbacks: windowResizeCallbacks,
            resetActiveElement: resetActiveElement,
            createMarkupFromString: createMarkupFromString,
            getNextClipId: getNextClipId,
            getNextPatternId: getNextPatternId,
            extendFromObject: extendFromObject,
            clone: clone,
            executeAsync: executeAsync,
            stringFormat: stringFormat,
            getRootOffset: getRootOffset,
            findBestMatch: findBestMatch,
            replaceAll: replaceAll
        };
        DX.utils.getPrecision = getPrecision
    })(jQuery, DevExpress);
    /*! Module core, file translator.js */
    (function($, DX, undefined) {
        var support = DX.support,
            TRANSFORM_MATRIX_REGEX = /matrix(3d)?\((.+?)\)/,
            TRANSLATE_REGEX = /translate(?:3d)?\((.+?)\)/;
        var locate = function($element) {
                var result,
                    position;
                if (support.transform3d) {
                    var translate = getTranslate($element);
                    result = {
                        left: translate.x,
                        top: translate.y
                    }
                }
                else {
                    position = $element.position();
                    result = {
                        left: position.left,
                        top: position.top
                    }
                }
                return result
            };
        var move = function($element, position) {
                if (!support.transform3d) {
                    $element.css(position);
                    return
                }
                var translate = getTranslate($element),
                    left = position.left,
                    top = position.top;
                if (left !== undefined)
                    translate.x = left;
                if (top !== undefined)
                    translate.y = top;
                $element.css({
                    transform: getTranslateCss(translate),
                    transformOrigin: "0% 0%"
                })
            };
        var getTranslate = function($element) {
                var transformValue = $element.css("transform"),
                    matrix = transformValue.match(TRANSFORM_MATRIX_REGEX),
                    is3D = matrix && matrix[1];
                if (matrix) {
                    matrix = matrix[2].split(",");
                    if (is3D === "3d")
                        matrix = matrix.slice(12, 15);
                    else {
                        matrix.push(0);
                        matrix = matrix.slice(4, 7)
                    }
                }
                else
                    matrix = [0, 0, 0];
                return {
                        x: parseFloat(matrix[0]),
                        y: parseFloat(matrix[1]),
                        z: parseFloat(matrix[2])
                    }
            };
        var parseTranslate = function(translateString) {
                var result = translateString.match(TRANSLATE_REGEX);
                if (!result || !result[1])
                    return;
                result = result[1].split(",");
                result = {
                    x: parseFloat(result[0]),
                    y: parseFloat(result[1]),
                    z: parseFloat(result[2])
                };
                return result
            };
        var getTranslateCss = function(translate) {
                return "translate3d(" + (translate.x || 0) + "px, " + (translate.y || 0) + "px, " + (translate.z || 0) + "px) scale(1)"
            };
        DX.translator = {
            move: move,
            locate: locate,
            parseTranslate: parseTranslate,
            getTranslate: getTranslate,
            getTranslateCss: getTranslateCss
        }
    })(jQuery, DevExpress);
    /*! Module core, file animator.js */
    (function($, DX, undefined) {
        DX.Animator = DX.Class.inherit({
            ctor: function() {
                this._finished = true;
                this._stopped = false
            },
            start: function() {
                this._stopped = false;
                this._finished = false;
                this._stepCore()
            },
            stop: function() {
                this._stopped = true
            },
            _stepCore: function() {
                if (this._isStopped()) {
                    this._stop();
                    return
                }
                if (this._isFinished()) {
                    this._finished = true;
                    this._complete();
                    return
                }
                this._step();
                DX.requestAnimationFrame.call(window, $.proxy(this._stepCore, this))
            },
            _step: DX.abstract,
            _isFinished: $.noop,
            _stop: $.noop,
            _complete: $.noop,
            _isStopped: function() {
                return this._stopped
            },
            inProgress: function() {
                return !(this._stopped || this._finished)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file devices.js */
    (function($, DX, undefined) {
        var knownUATable = {
                iPhone: "iPhone",
                iPhone5: "iPhone 5",
                iPad: "iPad",
                iPadMini: "iPad Mini",
                androidPhone: "Android Mobile",
                androidTablet: "Android",
                win8: "MSAppHost",
                win8Phone: "Windows Phone 8",
                msSurface: "MSIE ARM Tablet PC",
                desktop: "desktop",
                tizen: "Tizen Mobile",
                generic: "generic"
            };
        var knownMajorVersion = {
                ios: [5, 6, 7],
                android: [2, 3, 4],
                win8: [8],
                tizen: [2],
                desktop: [],
                generic: []
            };
        var device;
        var current = function(deviceOrName) {
                if (deviceOrName)
                    device = getDevice(deviceOrName);
                else {
                    if (!device) {
                        var deviceOrName = undefined;
                        try {
                            deviceOrName = getDeviceOrNameFromWindowScope()
                        }
                        catch(e) {
                            deviceOrName = getDeviceNameFromSessionStorage()
                        }
                        finally {
                            if (!deviceOrName)
                                deviceOrName = getDeviceNameFromSessionStorage()
                        }
                        device = getDevice(deviceOrName)
                    }
                    return device
                }
            };
        var getDevice = function(deviceName) {
                if ($.isPlainObject(deviceName))
                    return fromConfig(deviceName);
                else {
                    var ua;
                    if (deviceName) {
                        ua = knownUATable[deviceName];
                        if (!ua)
                            throw Error("Unknown device");
                    }
                    else
                        ua = navigator.userAgent;
                    return fromUA(ua)
                }
            };
        var fromConfig = function(config) {
                var shortcuts = {
                        phone: config.deviceType === "phone",
                        tablet: config.deviceType === "tablet",
                        android: config.platform === "android",
                        ios: config.platform === "ios",
                        win8: config.platform === "win8",
                        tizen: config.platform === "tizen",
                        generic: config.platform === "generic"
                    };
                return $.extend({}, defaultDevice, shortcuts, config)
            };
        var fromUA = function(ua) {
                return deviceParser.ios(ua) || deviceParser.android(ua) || deviceParser.win8(ua) || deviceParser.tizen(ua) || deviceParser.desktop(ua) || genericDevice
            };
        var defaultDevice = {
                deviceType: "",
                platform: "",
                version: [],
                phone: false,
                tablet: false,
                android: false,
                ios: false,
                win8: false,
                tizen: false,
                generic: false
            };
        var genericDevice = $.extend(defaultDevice, {
                platform: "generic",
                deviceType: "phone"
            });
        var deviceParser = {
                ios: function(userAgent) {
                    if (!/ip(hone|od|ad)/i.test(userAgent))
                        return;
                    var isPhone = /ip(hone|od)/i.test(userAgent);
                    var matches = userAgent.match(/os (\d+)_(\d+)_?(\d+)?/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3] || 0, 10)] : [];
                    return fromConfig({
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "ios",
                            version: version
                        })
                },
                android: function(userAgent) {
                    if (!/android|htc_|silk/i.test(userAgent))
                        return;
                    var isPhone = /mobile/i.test(userAgent);
                    var matches = userAgent.match(/android (\d+)\.(\d+)\.?(\d+)?/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3] || 0, 10)] : [];
                    return fromConfig({
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "android",
                            version: version
                        })
                },
                win8: function(userAgent) {
                    var isPhone = /windows phone/i.test(userAgent),
                        isTablet = /msie(.*)arm(.*)tablet\spc/i.test(userAgent),
                        isDesktop = !isTablet && /msapphost/i.test(userAgent);
                    if (!(isPhone || isTablet || isDesktop))
                        return;
                    var matches = userAgent.match(/windows phone (\d+).(\d+)/i) || userAgent.match(/windows nt (\d+).(\d+)/i),
                        version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [];
                    return fromConfig({
                            deviceType: isPhone ? "phone" : isTablet ? "tablet" : "desktop",
                            platform: "win8",
                            version: version
                        })
                },
                tizen: function(userAgent) {
                    if (!/tizen/i.test(userAgent))
                        return;
                    var isPhone = /mobile/i.test(userAgent);
                    var matches = userAgent.match(/tizen (\d+)\.(\d+)/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [];
                    return fromConfig({
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "tizen",
                            version: version
                        })
                },
                desktop: function(userAgent) {
                    if (!/desktop/i.test(userAgent))
                        return;
                    return fromConfig({
                            deviceType: "desktop",
                            platform: "desktop"
                        })
                }
            };
        var getDeviceOrNameFromWindowScope = function() {
                var result = undefined;
                if (window.top["dx-force-device-object"] || window.top["dx-force-device"])
                    result = window.top["dx-force-device-object"] || window.top["dx-force-device"];
                return result
            };
        var getDeviceNameFromSessionStorage = function() {
                return window.sessionStorage && (sessionStorage.getItem("dx-force-device") || sessionStorage.getItem("dx-simulator-device"))
            };
        var getDeviceMajorVersionClass = function(device) {
                var versions = knownMajorVersion[device.platform],
                    deviceVersion = device.version && device.version[0],
                    lastVersion = versions[versions.length - 1];
                if (deviceVersion) {
                    var isKnownVersion = $.inArray(parseInt(deviceVersion, 10), versions) !== -1,
                        version = isKnownVersion ? deviceVersion : lastVersion;
                    return " dx-version-major-" + version
                }
                return lastVersion ? " dx-version-major-" + lastVersion : ""
            };
        DX.devices = {
            attachCss: function(element, device) {
                var $element = $(element);
                device = device || this.current();
                var deviceTypeClass = device.deviceType ? " dx-device-" + device.deviceType : "";
                $element.addClass("dx-theme-" + device.platform).addClass("dx-theme-" + device.platform + "-typography").addClass(deviceTypeClass).addClass(getDeviceMajorVersionClass(device))
            },
            current: current,
            real: getDevice(),
            isRippleEmulator: function() {
                return !!window.tinyHippos
            }
        };
        DX.devices.__internals = {fromUA: fromUA}
    })(jQuery, DevExpress);
    /*! Module core, file fx.js */
    (function($, DX, undefined) {
        var translator = DX.translator,
            support = DX.support,
            transitionEndEventName = support.transitionEndEventName + ".dxFX";
        var CSS_TRANSITION_EASING_REGEX = /cubic-bezier\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\)/,
            SIMULATED_TRANSITIONEND_TIMEOUT_DATA_KEY = "dxSimulatedTransitionTimeoutKey",
            ANIM_DATA_KEY = "dxAnimData",
            TRANSFORM_PROP = "transform",
            FRAME_ANIMATION_STEP_TIME = 1000 / 60;
        var TransitionAnimationStrategy = {
                animate: function($element, config) {
                    var deferred = $.Deferred(),
                        transitionEndFired = $.Deferred(),
                        simulatedTransitionEndFired = $.Deferred();
                    $element.one(transitionEndEventName, function() {
                        transitionEndFired.reject()
                    });
                    $element.data(SIMULATED_TRANSITIONEND_TIMEOUT_DATA_KEY, setTimeout(function() {
                        simulatedTransitionEndFired.reject()
                    }, config.duration + config.delay));
                    $.when(transitionEndFired, simulatedTransitionEndFired).fail($.proxy(function() {
                        this._cleanup($element);
                        deferred.resolveWith($element, [config, $element])
                    }, this));
                    translator.getTranslate($element);
                    $element.css({
                        transitionProperty: "all",
                        transitionDelay: config.delay + "ms",
                        transitionDuration: config.duration + "ms",
                        transitionTimingFunction: config.easing
                    });
                    setProps($element, config.to);
                    if (!config.duration)
                        $element.trigger(transitionEndEventName);
                    return deferred.promise()
                },
                _cleanup: function($element) {
                    $element.css("transition", "none").off(transitionEndEventName);
                    var simulatedEndEventTimer = $element.data(SIMULATED_TRANSITIONEND_TIMEOUT_DATA_KEY);
                    clearTimeout(simulatedEndEventTimer);
                    $element.removeData(SIMULATED_TRANSITIONEND_TIMEOUT_DATA_KEY)
                },
                stop: function($element, jumpToEnd) {
                    var config = $element.data(ANIM_DATA_KEY);
                    if (!config)
                        return;
                    if (jumpToEnd)
                        $element.trigger(transitionEndEventName);
                    else {
                        $.each(config.to, function(key) {
                            $element.css(key, $element.css(key))
                        });
                        this._cleanup($element)
                    }
                }
            };
        var requestAnimationFrame = DX.requestAnimationFrame = function() {
                return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
                        window.setTimeout(callback, FRAME_ANIMATION_STEP_TIME)
                    }
            }();
        var FrameAnimationStrategy = {
                animate: function($element, config) {
                    var deferred = $.Deferred(),
                        animationData = $element.data(ANIM_DATA_KEY),
                        self = this;
                    if (!animationData)
                        return deferred.reject().promise();
                    $.each(config.to, function(prop) {
                        if (config.from[prop] === undefined)
                            config.from[prop] = self._normalizeValue($element.css(prop))
                    });
                    if (config.to[TRANSFORM_PROP]) {
                        config.from[TRANSFORM_PROP] = self._parseTransform(config.from[TRANSFORM_PROP]);
                        config.to[TRANSFORM_PROP] = self._parseTransform(config.to[TRANSFORM_PROP])
                    }
                    animationData.frameAnimation = {
                        to: config.to,
                        from: config.from,
                        currentValue: config.from,
                        easing: convertTransitionTimingFuncToJQueryEasing(config.easing),
                        duration: config.duration,
                        startTime: (new Date).valueOf(),
                        finish: function() {
                            this.currentValue = this.to;
                            this.draw();
                            deferred.resolve()
                        },
                        draw: function() {
                            var currentValue = $.extend({}, this.currentValue);
                            if (currentValue[TRANSFORM_PROP])
                                currentValue[TRANSFORM_PROP] = $.map(currentValue[TRANSFORM_PROP], function(value, prop) {
                                    if (prop === "translate")
                                        return translator.getTranslateCss(value);
                                    else if (prop === "scale")
                                        return "scale(" + value + ")";
                                    else if (prop.substr(0, prop.length - 1) === "rotate")
                                        return prop + "(" + value + "deg)"
                                }).join(" ");
                            $element.css(currentValue)
                        }
                    };
                    if (config.delay) {
                        animationData.frameAnimation.startTime += config.delay;
                        animationData.frameAnimation.delayTimeout = setTimeout(function() {
                            self._animationStep($element)
                        }, config.delay)
                    }
                    else
                        self._animationStep($element);
                    return deferred.promise()
                },
                _parseTransform: function(transformString) {
                    var result = {};
                    $.each(transformString.match(/(\w|\d)+\([^\)]*\)\s*/g), function(i, part) {
                        var translateData = translator.parseTranslate(part),
                            scaleData = part.match(/scale\((.+?)\)/),
                            rotateData = part.match(/(rotate.)\((.+)deg\)/);
                        if (translateData)
                            result.translate = translateData;
                        if (scaleData && scaleData[1])
                            result.scale = parseFloat(scaleData[1]);
                        if (rotateData && rotateData[1])
                            result[rotateData[1]] = parseFloat(rotateData[2])
                    });
                    return result
                },
                stop: function($element, jumpToEnd) {
                    var animationData = $element.data(ANIM_DATA_KEY),
                        frameAnimation = animationData && animationData.frameAnimation;
                    if (!frameAnimation)
                        return;
                    clearTimeout(frameAnimation.delayTimeout);
                    if (jumpToEnd)
                        frameAnimation.finish()
                },
                _animationStep: function($element) {
                    var animationData = $element.data(ANIM_DATA_KEY),
                        frameAnimation = animationData && animationData.frameAnimation;
                    if (!frameAnimation)
                        return;
                    var now = (new Date).valueOf();
                    if (now >= frameAnimation.startTime + frameAnimation.duration) {
                        frameAnimation.finish();
                        return
                    }
                    frameAnimation.currentValue = this._calcStepValue(frameAnimation, now - frameAnimation.startTime);
                    frameAnimation.draw();
                    requestAnimationFrame($.proxy(function() {
                        this._animationStep($element)
                    }, this))
                },
                _calcStepValue: function(frameAnimation, currentDuration) {
                    var calcValueRecursively = function(from, to) {
                            var result = $.isArray(to) ? [] : {};
                            var calcEasedValue = function(propName) {
                                    var x = currentDuration / frameAnimation.duration,
                                        t = currentDuration,
                                        b = 1 * from[propName],
                                        c = to[propName] - from[propName],
                                        d = frameAnimation.duration;
                                    return $.easing[frameAnimation.easing](x, t, b, c, d)
                                };
                            $.each(to, function(propName, endPropValue) {
                                if (typeof endPropValue === "string" && parseFloat(endPropValue, 10) === false)
                                    return true;
                                result[propName] = typeof endPropValue === "object" ? calcValueRecursively(from[propName], endPropValue) : calcEasedValue(propName)
                            });
                            return result
                        };
                    return calcValueRecursively(frameAnimation.from, frameAnimation.to)
                },
                _normalizeValue: function(value) {
                    var numericValue = parseFloat(value, 10);
                    if (numericValue === false)
                        return value;
                    return numericValue
                }
            };
        var animationStrategies = {
                transition: support.transition ? TransitionAnimationStrategy : FrameAnimationStrategy,
                frame: FrameAnimationStrategy
            };
        var getAnimationStrategy = function(config) {
                return animationStrategies[config && config.strategy || "transition"]
            };
        var TransitionTimingFuncMap = {
                linear: "cubic-bezier(0, 0, 1, 1)",
                ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
                "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
                "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)"
            };
        var convertTransitionTimingFuncToJQueryEasing = function(cssTransitionEasing) {
                cssTransitionEasing = TransitionTimingFuncMap[cssTransitionEasing] || cssTransitionEasing;
                var bezCoeffs = cssTransitionEasing.match(CSS_TRANSITION_EASING_REGEX);
                if (!bezCoeffs)
                    return "linear";
                bezCoeffs = bezCoeffs.slice(1, 5);
                $.each(bezCoeffs, function(index, value) {
                    bezCoeffs[index] = parseFloat(value)
                });
                var easingName = "cubicbezier_" + bezCoeffs.join("_").replace(/\./g, "p");
                if (!$.isFunction($.easing[easingName])) {
                    var polynomBezier = function(x1, y1, x2, y2) {
                            var Cx = 3 * x1,
                                Bx = 3 * (x2 - x1) - Cx,
                                Ax = 1 - Cx - Bx,
                                Cy = 3 * y1,
                                By = 3 * (y2 - y1) - Cy,
                                Ay = 1 - Cy - By;
                            var bezierX = function(t) {
                                    return t * (Cx + t * (Bx + t * Ax))
                                };
                            var bezierY = function(t) {
                                    return t * (Cy + t * (By + t * Ay))
                                };
                            var findXfor = function(t) {
                                    var x = t,
                                        i = 0,
                                        z;
                                    while (i < 14) {
                                        z = bezierX(x) - t;
                                        if (Math.abs(z) < 1e-3)
                                            break;
                                        x = x - z / derivativeX(x);
                                        i++
                                    }
                                    return x
                                };
                            var derivativeX = function(t) {
                                    return Cx + t * (2 * Bx + t * 3 * Ax)
                                };
                            return function(t) {
                                    return bezierY(findXfor(t))
                                }
                        };
                    $.easing[easingName] = function(x, t, b, c, d) {
                        return c * polynomBezier(bezCoeffs[0], bezCoeffs[1], bezCoeffs[2], bezCoeffs[3])(t / d) + b
                    }
                }
                return easingName
            };
        var baseConfigValidator = function(config, animationType) {
                $.each(["from", "to"], function() {
                    if (!$.isPlainObject(config[this]))
                        throw Error("Animation with the '" + animationType + "' type requires '" + this + "' configuration as an plain object.");
                })
            };
        var CustomAnimationConfigurator = {setup: function($element, config){}};
        var SlideAnimationConfigurator = {
                validateConfig: function(config) {
                    baseConfigValidator(config, "slide")
                },
                setup: function($element, config) {
                    var animStrategy = getAnimationStrategy(config);
                    if (!support.transform3d || animStrategy !== TransitionAnimationStrategy && animStrategy !== FrameAnimationStrategy)
                        return;
                    this._setupConfig($element, config.from);
                    this._setupConfig($element, config.to)
                },
                _setupConfig: function($element, config) {
                    var translate = translator.getTranslate($element),
                        left = config.left,
                        top = config.top;
                    if (left !== undefined) {
                        translate.x = left;
                        delete config.left
                    }
                    if (top !== undefined) {
                        translate.y = top;
                        delete config.top
                    }
                    config[TRANSFORM_PROP] = translator.getTranslateCss(translate)
                }
            };
        var FadeAnimationConfigurator = {setup: function($element, config) {
                    var from = config.from,
                        fromOpacity = $.isPlainObject(from) ? $element.css("opacity") : String(from),
                        toOpacity = String(config.to);
                    config.from = {opacity: fromOpacity};
                    config.to = {opacity: toOpacity}
                }};
        var PopAnimationConfigurator = {
                validateConfig: function(config) {
                    baseConfigValidator(config, "pop")
                },
                setup: function($element, config) {
                    if (!support.transform3d)
                        return;
                    var from = config.from,
                        to = config.to,
                        fromOpacity = "opacity" in from ? from.opacity : $element.css("opacity"),
                        toOpacicy = "opacity" in to ? to.opacity : 1,
                        fromScale = "scale" in from ? from.scale : 0,
                        toScale = "scale" in to ? to.scale : 1;
                    config.from = {opacity: fromOpacity};
                    config.from[TRANSFORM_PROP] = this._getCssTransform(fromScale);
                    config.to = {opacity: toOpacicy};
                    config.to[TRANSFORM_PROP] = this._getCssTransform(toScale)
                },
                _getCssTransform: function(scale) {
                    return "scale(" + scale + ")"
                }
            };
        var animationConfigurators = {
                custom: CustomAnimationConfigurator,
                slide: SlideAnimationConfigurator,
                fade: FadeAnimationConfigurator,
                pop: PopAnimationConfigurator
            };
        var getAnimationConfigurator = function(type) {
                var result = animationConfigurators[type];
                if (!result)
                    throw Error("Unknown animation type \"" + type + "\"");
                return result
            };
        var defaultConfig = {
                type: "custom",
                from: {},
                to: {},
                duration: 400,
                complete: $.noop,
                easing: "ease",
                delay: 0
            };
        var animate = function(element, config) {
                config = $.extend(true, {}, defaultConfig, config);
                var $element = $(element),
                    configurator = getAnimationConfigurator(config.type);
                if (!$element.length)
                    return $.Deferred().resolve().promise();
                if ($.isFunction(configurator.validateConfig))
                    configurator.validateConfig(config);
                configurator.setup($element, config);
                stop($element);
                setProps($element, config.from);
                return executeAnimation($element, config).done(config.complete)
            };
        var setProps = function($element, props) {
                $.each(props, function(key, value) {
                    $element.css(key, value)
                })
            };
        var executeAnimation = function($element, config) {
                var deferred = $.Deferred();
                $element.data(ANIM_DATA_KEY, config);
                if (DX.fx.off)
                    config.duration = 0;
                getAnimationStrategy(config).animate($element, config).done(function() {
                    $element.removeData(ANIM_DATA_KEY);
                    deferred.resolveWith(this, [$element, config])
                });
                return deferred.promise()
            };
        var animating = function($element) {
                return !!$element.data(ANIM_DATA_KEY)
            };
        var stop = function(element, jumpToEnd) {
                var $element = $(element);
                getAnimationStrategy($element.data(ANIM_DATA_KEY)).stop($element, jumpToEnd);
                $element.removeData(ANIM_DATA_KEY)
            };
        DX.fx = {
            off: false,
            animationTypes: animationConfigurators,
            animate: animate,
            animating: animating,
            stop: stop
        };
        DX.fx.__internals = {convertTransitionTimingFuncToJQueryEasing: convertTransitionTimingFuncToJQueryEasing}
    })(jQuery, DevExpress);
    /*! Module core, file endpointSelector.js */
    (function($, DX, undefined) {
        var location = window.location,
            DXPROXY_HOST = "dxproxy.devexpress.com:8000",
            WIN_JS = location.protocol === "ms-appx:",
            IS_DXPROXY = location.host === DXPROXY_HOST,
            IS_LOCAL = isLocalHostName(location.hostname);
        function isLocalHostName(url) {
            return /^(localhost$|127\.)/i.test(url)
        }
        var extractProxyAppId = function() {
                return location.pathname.split("/")[1]
            };
        var formatProxyUrl = function(localUrl) {
                var urlData = DX.parseUrl(localUrl);
                if (!isLocalHostName(urlData.hostname))
                    return localUrl;
                return "http://" + DXPROXY_HOST + "/" + extractProxyAppId() + "_" + urlData.port + urlData.pathname + urlData.search
            };
        var EndpointSelector = DX.EndpointSelector = function(config) {
                this.config = config
            };
        EndpointSelector.prototype = {urlFor: function(key) {
                var bag = this.config[key];
                if (!bag)
                    throw Error("Unknown endpoint key");
                if (IS_DXPROXY)
                    return formatProxyUrl(bag.local);
                if (bag.production)
                    if (WIN_JS && !Debug.debuggerEnabled || !WIN_JS && !IS_LOCAL)
                        return bag.production;
                return bag.local
            }}
    })(jQuery, DevExpress);
    /*! Module core, file formatHelper.js */
    (function($, DX, undefined) {
        var utils = DX.utils;
        DX.NumericFormat = {
            currency: 'C',
            fixedpoint: 'N',
            exponential: '',
            percent: 'P',
            decimal: 'D'
        };
        DX.LargeNumberFormatPostfixes = {
            1: 'K',
            2: 'M',
            3: 'B',
            4: 'T'
        };
        var MAX_LARGE_NUMBER_POWER = 4,
            DECIMAL_BASE = 10;
        DX.LargeNumberFormatPowers = {
            largenumber: 'auto',
            thousands: 1,
            millions: 2,
            billions: 3,
            trillions: 4
        };
        DX.DateTimeFormat = {
            longdate: 'D',
            longtime: 'T',
            monthandday: 'M',
            monthandyear: 'Y',
            quarterandyear: 'qq',
            shortdate: 'd',
            shorttime: 't',
            millisecond: 'fff',
            second: 'T',
            minute: 't',
            hour: 't',
            day: 'dd',
            week: 'dd',
            month: 'MMMM',
            quarter: 'qq',
            year: 'yyyy',
            longdatelongtime: 'D',
            shortdateshorttime: 'd'
        };
        DX.formatHelper = {
            romanDigits: ['I', 'II', 'III', 'IV'],
            _addFormatSeparator: function(format1, format2) {
                var separator = ' ';
                if (format2)
                    return format1 + separator + format2;
                return format1
            },
            _getDateTimeFormatPattern: function(dateTimeFormat) {
                return Globalize.findClosestCulture().calendar.patterns[DX.DateTimeFormat[dateTimeFormat.toLowerCase()]]
            },
            _isDateFormatContains: function(format) {
                var result = false;
                $.each(DX.DateTimeFormat, function(key, value) {
                    result = key === format.toLowerCase();
                    return !result
                });
                return result
            },
            getQuarter: function(month) {
                return Math.floor(month / 3)
            },
            getQuarterString: function(date, format) {
                var resultQuarter = '',
                    quarter = this.getQuarter(date.getMonth());
                switch (format) {
                    case'q':
                        resultQuarter = this.romanDigits[quarter];
                        break;
                    case'qq':
                        resultQuarter = 'Q' + this.romanDigits[quarter];
                        break;
                    case'Q':
                        resultQuarter = (quarter + 1).toString();
                        break;
                    case'QQ':
                        resultQuarter = 'Q' + (quarter + 1).toString();
                        break
                }
                return resultQuarter
            },
            getFirstQuarterMonth: function(month) {
                return this.getQuarter(month) * 3
            },
            _formatCustomString: function(value, format) {
                var regExp = /qq|q|QQ|Q/g,
                    quarterFormat,
                    result = '',
                    index = 0;
                while (index < format.length) {
                    quarterFormat = regExp.exec(format);
                    if (!quarterFormat || quarterFormat.index > index)
                        result += Globalize.format(value, format.substring(index, quarterFormat ? quarterFormat.index : format.length));
                    if (quarterFormat) {
                        result += this.getQuarterString(value, quarterFormat[0]);
                        index = quarterFormat.index + quarterFormat[0].length
                    }
                    else
                        index = format.length
                }
                return result
            },
            _parseNumberFormatString: function(format) {
                var formatList,
                    formatObject = {};
                if (!format || typeof format !== 'string')
                    return;
                formatList = format.toLowerCase().split(' ');
                $.each(formatList, function(index, value) {
                    if (value in DX.NumericFormat)
                        formatObject.formatType = value;
                    else if (value in DX.LargeNumberFormatPowers)
                        formatObject.power = DX.LargeNumberFormatPowers[value]
                });
                if (formatObject.power && !formatObject.formatType)
                    formatObject.formatType = 'fixedpoint';
                if (formatObject.formatType)
                    return formatObject
            },
            _calculateNumberPower: function(value, base, minPower, maxPower) {
                var number = Math.abs(value);
                var power = 0;
                if (number > 1)
                    while (number && number >= base && (maxPower === undefined || power < maxPower)) {
                        power++;
                        number = number / base
                    }
                else if (number > 0 && number < 1)
                    while (number < 1 && (minPower === undefined || power > minPower)) {
                        power--;
                        number = number * base
                    }
                return power
            },
            _getNumberByPower: function(number, power, base) {
                var result = number;
                while (power > 0) {
                    result = result / base;
                    power--
                }
                while (power < 0) {
                    result = result * base;
                    power++
                }
                return result
            },
            _formatNumber: function(value, formatObject, precision) {
                var powerPostfix;
                if (formatObject.power === 'auto')
                    formatObject.power = this._calculateNumberPower(value, 1000, 0, MAX_LARGE_NUMBER_POWER);
                if (formatObject.power)
                    value = this._getNumberByPower(value, formatObject.power, 1000);
                powerPostfix = DX.LargeNumberFormatPostfixes[formatObject.power] || '';
                return this._formatNumberCore(value, formatObject.formatType, precision) + powerPostfix
            },
            _formatNumberExponential: function(value, precision) {
                var power = this._calculateNumberPower(value, DECIMAL_BASE),
                    number = this._getNumberByPower(value, power, DECIMAL_BASE),
                    powString;
                precision = precision === undefined ? 1 : precision;
                if (number.toFixed(precision || 0) >= DECIMAL_BASE) {
                    power++;
                    number = number / DECIMAL_BASE
                }
                powString = (power >= 0 ? '+' : '') + power.toString();
                return this._formatNumberCore(number, 'fixedpoint', precision) + 'E' + powString
            },
            _formatNumberCore: function(value, format, precision) {
                if (format === 'exponential')
                    return this._formatNumberExponential(value, precision);
                else
                    return Globalize.format(value, DX.NumericFormat[format] + (utils.isNumber(precision) ? precision : 0))
            },
            _formatDate: function(date, format, formatString) {
                var resultFormat = DX.DateTimeFormat[format.toLowerCase()];
                format = format.toLowerCase();
                if (format === 'quarterandyear')
                    resultFormat = this.getQuarterString(date, resultFormat) + ' yyyy';
                if (format === 'quarter')
                    return this.getQuarterString(date, resultFormat);
                if (format === 'longdatelongtime')
                    return this._formatDate(date, 'longdate') + ' ' + this._formatDate(date, 'longtime');
                if (format === 'shortdateshorttime')
                    return this._formatDate(date, 'shortDate') + ' ' + this._formatDate(date, 'shortTime');
                return Globalize.format(date, resultFormat)
            },
            format: function(value, format, precision) {
                if (format && format.format)
                    if (format.dateType)
                        return this._formatDateEx(value, format);
                    else if (utils.isNumber(value) && isFinite(value))
                        return this._formatNumberEx(value, format);
                return this._format(value, format, precision)
            },
            _format: function(value, format, precision) {
                var numberFormatObject;
                if (!utils.isString(format) || format === '' || !utils.isNumber(value) && !utils.isDate(value))
                    return utils.isDefined(value) ? value.toString() : '';
                numberFormatObject = this._parseNumberFormatString(format);
                if (utils.isNumber(value) && numberFormatObject)
                    return this._formatNumber(value, numberFormatObject, precision);
                if (utils.isDate(value) && this._isDateFormatContains(format))
                    return this._formatDate(value, format);
                if (!numberFormatObject && !this._isDateFormatContains(format))
                    return this._formatCustomString(value, format)
            },
            _formatNumberEx: function(value, formatInfo) {
                var self = this,
                    numericFormatType = DX.NumericFormat[formatInfo.format.toLowerCase()],
                    numberFormat = Globalize.culture().numberFormat,
                    currencyFormat = formatInfo.currencyCulture && Globalize.cultures[formatInfo.currencyCulture] ? Globalize.cultures[formatInfo.currencyCulture].numberFormat.currency : numberFormat.currency,
                    percentFormat = numberFormat.percent,
                    formatSettings = self._getUnitFormatSettings(value, formatInfo),
                    unit = formatSettings.unit,
                    precision = formatSettings.precision,
                    showTrailingZeros = formatSettings.showTrailingZeros,
                    includeGroupSeparator = formatSettings.includeGroupSeparator,
                    groupSymbol = numberFormat[","],
                    floatingSymbol = numberFormat["."],
                    number,
                    isNegative,
                    pattern,
                    currentFormat,
                    regexParts = /n|\$|-|%/g,
                    result = "";
                value = self._applyUnitToValue(value, unit);
                number = Math.abs(value);
                isNegative = value < 0;
                switch (numericFormatType) {
                    case"D":
                        pattern = "n";
                        number = Math[isNegative ? "ceil" : "floor"](number);
                        if (precision > 0) {
                            var str = "" + number;
                            for (var i = str.length; i < precision; i += 1)
                                str = "0" + str;
                            number = str
                        }
                        if (isNegative)
                            number = "-" + number;
                        break;
                    case"N":
                        currentFormat = numberFormat;
                    case"C":
                        currentFormat = currentFormat || currencyFormat;
                    case"P":
                        currentFormat = currentFormat || percentFormat;
                        pattern = isNegative ? currentFormat.pattern[0] : currentFormat.pattern[1] || "n";
                        number = Globalize.format(number * (numericFormatType === "P" ? 100 : 1), "N" + precision);
                        if (!showTrailingZeros)
                            number = self._excludeTrailingZeros(number, floatingSymbol);
                        if (!includeGroupSeparator)
                            number = number.replace(new RegExp('\\' + groupSymbol, 'g'), '');
                        break;
                    default:
                        throw"Illegal numeric format: '" + numericFormatType + "'";
                }
                for (; ; ) {
                    var lastIndex = regexParts.lastIndex,
                        matches = regexParts.exec(pattern);
                    result += pattern.slice(lastIndex, matches ? matches.index : pattern.length);
                    if (matches)
                        switch (matches[0]) {
                            case"-":
                                if (/[1-9]/.test(number))
                                    result += numberFormat["-"];
                                break;
                            case"$":
                                result += currencyFormat.symbol;
                                break;
                            case"%":
                                result += percentFormat.symbol;
                                break;
                            case"n":
                                result += number + unit;
                                break
                        }
                    else
                        break
                }
                return (formatInfo.plus && value > 0 ? "+" : '') + result
            },
            _excludeTrailingZeros: function(strValue, floatingSymbol) {
                var floatingIndex = strValue.indexOf(floatingSymbol),
                    stopIndex,
                    i;
                if (floatingIndex < 0)
                    return strValue;
                stopIndex = strValue.length;
                for (i = stopIndex - 1; i >= floatingIndex && (strValue[i] === '0' || i === floatingIndex); i--)
                    stopIndex--;
                return strValue.substring(0, stopIndex)
            },
            _getUnitFormatSettings: function(value, formatInfo) {
                var unit = formatInfo.unit || '',
                    precision = formatInfo.precision || 0,
                    includeGroupSeparator = formatInfo.includeGroupSeparator || false,
                    showTrailingZeros = formatInfo.showTrailingZeros === undefined ? true : formatInfo.showTrailingZeros,
                    significantDigits = formatInfo.significantDigits || 1,
                    absValue;
                if (unit.toLowerCase() === 'auto') {
                    showTrailingZeros = false;
                    absValue = Math.abs(value);
                    if (significantDigits < 1)
                        significantDigits = 1;
                    if (absValue >= 1000000000) {
                        unit = 'B';
                        absValue /= 1000000000
                    }
                    else if (absValue >= 1000000) {
                        unit = 'M';
                        absValue /= 1000000
                    }
                    else if (absValue >= 1000) {
                        unit = 'K';
                        absValue /= 1000
                    }
                    else
                        unit = '';
                    if (absValue == 0)
                        precision = 0;
                    else if (absValue < 1) {
                        precision = significantDigits;
                        var smallValue = Math.pow(10, -significantDigits);
                        while (absValue < smallValue) {
                            smallValue /= 10;
                            precision++
                        }
                    }
                    else if (absValue >= 100)
                        precision = significantDigits - 3;
                    else if (absValue >= 10)
                        precision = significantDigits - 2;
                    else
                        precision = significantDigits - 1
                }
                if (precision < 0)
                    precision = 0;
                return {
                        unit: unit,
                        precision: precision,
                        showTrailingZeros: showTrailingZeros,
                        includeGroupSeparator: includeGroupSeparator
                    }
            },
            _applyUnitToValue: function(value, unit) {
                if (unit == 'B')
                    return value.toFixed(1) / 1000000000;
                if (unit == 'M')
                    return value / 1000000;
                if (unit == 'K')
                    return value / 1000;
                return value
            },
            _formatDateEx: function(value, formatInfo) {
                var self = this,
                    quarterPrefix = 'Q',
                    format = formatInfo.format,
                    dateType = formatInfo.dateType,
                    calendar = Globalize.culture().calendars.standard,
                    time = undefined,
                    index,
                    dateStr;
                format = format.toLowerCase();
                if (dateType !== 'num' || format === 'dayofweek')
                    switch (format) {
                        case'monthyear':
                            return self._formatDate(value, 'monthandyear');
                        case'quarteryear':
                            return self.getQuarterString(value, 'QQ') + ' ' + value.getFullYear();
                        case'daymonthyear':
                            return self._formatDate(value, dateType + 'Date');
                        case'datehour':
                            time = new Date(value.getTime());
                            time.setMinutes(0);
                            dateStr = dateType === 'timeOnly' ? '' : self._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? self._formatDate(time, 'shorttime') : dateStr + ' ' + self._formatDate(time, 'shorttime');
                        case'datehourminute':
                            dateStr = dateType === 'timeOnly' ? '' : self._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? self._formatDate(value, 'shorttime') : dateStr + ' ' + self._formatDate(value, 'shorttime');
                        case'datehourminutesecond':
                            dateStr = dateType === 'timeOnly' ? '' : self._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? self._formatDate(value, 'longtime') : dateStr + ' ' + self._formatDate(value, 'longtime');
                        case'year':
                            dateStr = value.toString();
                            return dateType === 'abbr' ? dateStr.slice(2, 4) : dateStr;
                        case'quarter':
                            return quarterPrefix + value.toString();
                        case'month':
                            index = value - 1;
                            return dateType === 'abbr' ? calendar.months.namesAbbr[index] : calendar.months.names[index];
                        case'hour':
                            if (dateType === 'long') {
                                time = new Date;
                                time.setHours(value);
                                time.setMinutes(0);
                                return self._formatDate(time, 'shorttime')
                            }
                            else
                                return value.toString();
                        case'dayofweek':
                            index = $.inArray(value, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
                            if (dateType !== 'num')
                                return dateType === 'abbr' ? calendar.days.namesAbbr[index] : calendar.days.names[index];
                            else
                                return ((index - calendar.firstDay + 1 + 7) % 8).toString();
                        default:
                            return value.toString()
                    }
                else
                    return value.toString()
            },
            getTimeFormat: function(showSecond) {
                if (showSecond)
                    return this._getDateTimeFormatPattern('longtime');
                return this._getDateTimeFormatPattern('shorttime')
            },
            getDateFormatByDifferences: function(dateDifferences) {
                var resultFormat = '';
                if (dateDifferences.millisecond)
                    resultFormat = DX.DateTimeFormat.millisecond;
                if (dateDifferences.hour || dateDifferences.minute || dateDifferences.second)
                    resultFormat = this._addFormatSeparator(this.getTimeFormat(dateDifferences.second), resultFormat);
                if (dateDifferences.year && dateDifferences.month && dateDifferences.day)
                    return this._addFormatSeparator(this._getDateTimeFormatPattern('shortdate'), resultFormat);
                if (dateDifferences.year && dateDifferences.month)
                    return DX.DateTimeFormat['monthandyear'];
                if (dateDifferences.year)
                    return DX.DateTimeFormat['year'];
                if (dateDifferences.month && dateDifferences.day)
                    return this._addFormatSeparator(this._getDateTimeFormatPattern('monthandday'), resultFormat);
                if (dateDifferences.month)
                    return DX.DateTimeFormat['month'];
                if (dateDifferences.day)
                    return this._addFormatSeparator('dddd, dd', resultFormat);
                return resultFormat
            },
            getDateFormatByTicks: function(ticks) {
                var resultFormat,
                    maxDif,
                    currentDif,
                    i,
                    dateUnitInterval;
                if (ticks.length > 1) {
                    maxDif = utils.getDatesDifferences(ticks[0], ticks[1]);
                    for (i = 1; i < ticks.length - 1; i++) {
                        currentDif = utils.getDatesDifferences(ticks[i], ticks[i + 1]);
                        if (maxDif.count < currentDif.count)
                            maxDif = currentDif
                    }
                }
                else
                    maxDif = {
                        year: true,
                        month: true,
                        day: true,
                        hour: ticks[0].getHours() > 0,
                        minute: ticks[0].getMinutes() > 0,
                        second: ticks[0].getSeconds() > 0
                    };
                resultFormat = this.getDateFormatByDifferences(maxDif);
                return resultFormat
            },
            getDateFormatByTickInterval: function(startValue, endValue, tickInterval) {
                var resultFormat,
                    dateDifferences,
                    dateUnitInterval,
                    dateDifferencesConverter = {
                        quarter: 'month',
                        week: 'day'
                    },
                    correctDateDifferences = function(dateDifferences, tickInterval, value) {
                        switch (tickInterval) {
                            case'year':
                                dateDifferences.month = value;
                            case'quarter':
                            case'month':
                                dateDifferences.day = value;
                            case'week':
                            case'day':
                                dateDifferences.hour = value;
                            case'hour':
                                dateDifferences.minute = value;
                            case'minute':
                                dateDifferences.second = value;
                            case'second':
                                dateDifferences.millisecond = value
                        }
                    },
                    correctDifferencesByMaxDate = function(differences, minDate, maxDate) {
                        if (!maxDate.getMilliseconds() && maxDate.getSeconds()) {
                            if (maxDate.getSeconds() - minDate.getSeconds() === 1) {
                                differences.millisecond = true;
                                differences.second = false
                            }
                        }
                        else if (!maxDate.getSeconds() && maxDate.getMinutes()) {
                            if (maxDate.getMinutes() - minDate.getMinutes() === 1) {
                                differences.second = true;
                                differences.minute = false
                            }
                        }
                        else if (!maxDate.getMinutes() && maxDate.getHours()) {
                            if (maxDate.getHours() - minDate.getHours() === 1) {
                                differences.minute = true;
                                differences.hour = false
                            }
                        }
                        else if (!maxDate.getHours() && maxDate.getDate() > 1) {
                            if (maxDate.getDate() - minDate.getDate() === 1) {
                                differences.hour = true;
                                differences.day = false
                            }
                        }
                        else if (maxDate.getDate() === 1 && maxDate.getMonth()) {
                            if (maxDate.getMonth() - minDate.getMonth() === 1) {
                                differences.day = true;
                                differences.month = false
                            }
                        }
                        else if (!maxDate.getMonth() && maxDate.getFullYear())
                            if (maxDate.getFullYear() - minDate.getFullYear() === 1) {
                                differences.month = true;
                                differences.year = false
                            }
                    };
                tickInterval = utils.isString(tickInterval) ? tickInterval.toLowerCase() : tickInterval;
                dateDifferences = utils.getDatesDifferences(startValue, endValue);
                if (startValue !== endValue)
                    correctDifferencesByMaxDate(dateDifferences, startValue > endValue ? endValue : startValue, startValue > endValue ? startValue : endValue);
                dateUnitInterval = utils.getDateUnitInterval(dateDifferences);
                correctDateDifferences(dateDifferences, dateUnitInterval, true);
                dateUnitInterval = utils.getDateUnitInterval(tickInterval || 'second');
                correctDateDifferences(dateDifferences, dateUnitInterval, false);
                dateDifferences[dateDifferencesConverter[dateUnitInterval] || dateUnitInterval] = true;
                resultFormat = this.getDateFormatByDifferences(dateDifferences);
                return resultFormat
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file color.js */
    (function(DX, undefined) {
        var standardColorNames = {
                aliceblue: 'f0f8ff',
                antiquewhite: 'faebd7',
                aqua: '00ffff',
                aquamarine: '7fffd4',
                azure: 'f0ffff',
                beige: 'f5f5dc',
                bisque: 'ffe4c4',
                black: '000000',
                blanchedalmond: 'ffebcd',
                blue: '0000ff',
                blueviolet: '8a2be2',
                brown: 'a52a2a',
                burlywood: 'deb887',
                cadetblue: '5f9ea0',
                chartreuse: '7fff00',
                chocolate: 'd2691e',
                coral: 'ff7f50',
                cornflowerblue: '6495ed',
                cornsilk: 'fff8dc',
                crimson: 'dc143c',
                cyan: '00ffff',
                darkblue: '00008b',
                darkcyan: '008b8b',
                darkgoldenrod: 'b8860b',
                darkgray: 'a9a9a9',
                darkgreen: '006400',
                darkkhaki: 'bdb76b',
                darkmagenta: '8b008b',
                darkolivegreen: '556b2f',
                darkorange: 'ff8c00',
                darkorchid: '9932cc',
                darkred: '8b0000',
                darksalmon: 'e9967a',
                darkseagreen: '8fbc8f',
                darkslateblue: '483d8b',
                darkslategray: '2f4f4f',
                darkturquoise: '00ced1',
                darkviolet: '9400d3',
                deeppink: 'ff1493',
                deepskyblue: '00bfff',
                dimgray: '696969',
                dodgerblue: '1e90ff',
                feldspar: 'd19275',
                firebrick: 'b22222',
                floralwhite: 'fffaf0',
                forestgreen: '228b22',
                fuchsia: 'ff00ff',
                gainsboro: 'dcdcdc',
                ghostwhite: 'f8f8ff',
                gold: 'ffd700',
                goldenrod: 'daa520',
                gray: '808080',
                green: '008000',
                greenyellow: 'adff2f',
                honeydew: 'f0fff0',
                hotpink: 'ff69b4',
                indianred: 'cd5c5c',
                indigo: '4b0082',
                ivory: 'fffff0',
                khaki: 'f0e68c',
                lavender: 'e6e6fa',
                lavenderblush: 'fff0f5',
                lawngreen: '7cfc00',
                lemonchiffon: 'fffacd',
                lightblue: 'add8e6',
                lightcoral: 'f08080',
                lightcyan: 'e0ffff',
                lightgoldenrodyellow: 'fafad2',
                lightgrey: 'd3d3d3',
                lightgreen: '90ee90',
                lightpink: 'ffb6c1',
                lightsalmon: 'ffa07a',
                lightseagreen: '20b2aa',
                lightskyblue: '87cefa',
                lightslateblue: '8470ff',
                lightslategray: '778899',
                lightsteelblue: 'b0c4de',
                lightyellow: 'ffffe0',
                lime: '00ff00',
                limegreen: '32cd32',
                linen: 'faf0e6',
                magenta: 'ff00ff',
                maroon: '800000',
                mediumaquamarine: '66cdaa',
                mediumblue: '0000cd',
                mediumorchid: 'ba55d3',
                mediumpurple: '9370d8',
                mediumseagreen: '3cb371',
                mediumslateblue: '7b68ee',
                mediumspringgreen: '00fa9a',
                mediumturquoise: '48d1cc',
                mediumvioletred: 'c71585',
                midnightblue: '191970',
                mintcream: 'f5fffa',
                mistyrose: 'ffe4e1',
                moccasin: 'ffe4b5',
                navajowhite: 'ffdead',
                navy: '000080',
                oldlace: 'fdf5e6',
                olive: '808000',
                olivedrab: '6b8e23',
                orange: 'ffa500',
                orangered: 'ff4500',
                orchid: 'da70d6',
                palegoldenrod: 'eee8aa',
                palegreen: '98fb98',
                paleturquoise: 'afeeee',
                palevioletred: 'd87093',
                papayawhip: 'ffefd5',
                peachpuff: 'ffdab9',
                peru: 'cd853f',
                pink: 'ffc0cb',
                plum: 'dda0dd',
                powderblue: 'b0e0e6',
                purple: '800080',
                red: 'ff0000',
                rosybrown: 'bc8f8f',
                royalblue: '4169e1',
                saddlebrown: '8b4513',
                salmon: 'fa8072',
                sandybrown: 'f4a460',
                seagreen: '2e8b57',
                seashell: 'fff5ee',
                sienna: 'a0522d',
                silver: 'c0c0c0',
                skyblue: '87ceeb',
                slateblue: '6a5acd',
                slategray: '708090',
                snow: 'fffafa',
                springgreen: '00ff7f',
                steelblue: '4682b4',
                tan: 'd2b48c',
                teal: '008080',
                thistle: 'd8bfd8',
                tomato: 'ff6347',
                turquoise: '40e0d0',
                violet: 'ee82ee',
                violetred: 'd02090',
                wheat: 'f5deb3',
                white: 'ffffff',
                whitesmoke: 'f5f5f5',
                yellow: 'ffff00',
                yellowgreen: '9acd32'
            };
        var standardColorTypes = [{
                    re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 10), parseInt(colorString[2], 10), parseInt(colorString[3], 10)]
                    }
                }, {
                    re: /^#(\w{2})(\w{2})(\w{2})$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 16), parseInt(colorString[2], 16), parseInt(colorString[3], 16)]
                    }
                }, {
                    re: /^#(\w{1})(\w{1})(\w{1})$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1] + colorString[1], 16), parseInt(colorString[2] + colorString[2], 16), parseInt(colorString[3] + colorString[3], 16)]
                    }
                }];
        function Color(value) {
            this.baseColor = value;
            var color;
            if (value) {
                color = String(value).toLowerCase().replace(/ /g, '');
                color = standardColorNames[color] ? '#' + standardColorNames[color] : color;
                color = parseColor(color)
            }
            color = color || {};
            this.r = normalize(color[0]);
            this.g = normalize(color[1]);
            this.b = normalize(color[2])
        }
        function parseColor(color) {
            var result,
                i = 0,
                ii = standardColorTypes.length,
                str;
            for (; i < ii; ++i) {
                str = standardColorTypes[i].re.exec(color);
                if (str)
                    return standardColorTypes[i].process(str)
            }
            return null
        }
        function normalize(colorComponent) {
            return colorComponent < 0 || isNaN(colorComponent) ? 0 : colorComponent > 255 ? 255 : colorComponent
        }
        function toHexFromRgb(r, g, b) {
            return '#' + (0X01000000 | r << 16 | g << 8 | b).toString(16).slice(1)
        }
        var _round = Math.round;
        Color.prototype = {
            constructor: Color,
            highlight: function(step) {
                step = step || 10;
                return toHexFromRgb(normalize(this.r + step), normalize(this.g + step), normalize(this.b + step))
            },
            darken: function(step) {
                step = step || 10;
                return toHexFromRgb(normalize(this.r - step), normalize(this.g - step), normalize(this.b - step))
            },
            blend: function(blendColor, opacity) {
                var other = blendColor instanceof Color ? blendColor : new Color(blendColor),
                    result = new Color;
                result.r = normalize(_round(this.r * (1 - opacity) + other.r * opacity));
                result.g = normalize(_round(this.g * (1 - opacity) + other.g * opacity));
                result.b = normalize(_round(this.b * (1 - opacity) + other.b * opacity));
                return result
            },
            toHex: function() {
                return toHexFromRgb(this.r, this.g, this.b)
            }
        };
        DX.Color = Color
    })(DevExpress);
    /*! Module core, file localization.js */
    (function($, DX, undefined) {
        var localization = function() {
                var newMessages = {};
                return {
                        setup: function(localizablePrefix) {
                            this.localizeString = function(text) {
                                var regex = new RegExp("(^|[^a-zA-Z_0-9" + localizablePrefix + "-]+)(" + localizablePrefix + "{1,2})([a-zA-Z_0-9-]+)", "g"),
                                    escapeString = localizablePrefix + localizablePrefix;
                                return text.replace(regex, function(str, prefix, escape, localizationKey) {
                                        var result = prefix + localizablePrefix + localizationKey;
                                        if (escape !== escapeString)
                                            if (Globalize.cultures["default"].messages[localizationKey])
                                                result = prefix + Globalize.localize(localizationKey);
                                            else
                                                newMessages[localizationKey] = DX.inflector.humanize(localizationKey);
                                        return result
                                    })
                            }
                        },
                        localizeNode: function(node) {
                            var self = this;
                            $(node).each(function(index, nodeItem) {
                                if (nodeItem.nodeType === 3)
                                    nodeItem.nodeValue = self.localizeString(nodeItem.nodeValue);
                                else {
                                    $.each(nodeItem.attributes || [], function(index, attr) {
                                        if (typeof attr.value === "string")
                                            attr.value = self.localizeString(attr.value)
                                    });
                                    $(nodeItem).contents().each(function(index, node) {
                                        self.localizeNode(node)
                                    })
                                }
                            })
                        },
                        getDictionary: function(onlyNew) {
                            if (onlyNew)
                                return newMessages;
                            return $.extend({}, newMessages, Globalize.cultures["default"].messages)
                        }
                    }
            }();
        localization.setup("@");
        DX.localization = localization
    })(jQuery, DevExpress);
    /*! Module core, file localization.en.js */
    Globalize.addCultureInfo("default", {messages: {
            Yes: "Yes",
            No: "No",
            Cancel: "Cancel",
            Clear: "Clear",
            Done: "Done",
            Loading: "Loading...",
            Select: "Select...",
            Search: "Search",
            Back: "Back",
            "dxLookup-searchPlaceholder": "Minimum character number: {0}",
            "dxCollectionContainerWidget-noDataText": "No data to display",
            "dxList-pullingDownText": "Pull down to refresh...",
            "dxList-pulledDownText": "Release to refresh...",
            "dxList-refreshingText": "Refreshing...",
            "dxList-pageLoadingText": "Loading...",
            "dxListEditDecorator-delete": "Delete",
            "dxScrollView-pullingDownText": "Pull down to refresh...",
            "dxScrollView-pulledDownText": "Release to refresh...",
            "dxScrollView-refreshingText": "Refreshing...",
            "dxScrollView-reachBottomText": "Loading...",
            "dxSwitch-onText": "ON",
            "dxSwitch-offText": "OFF"
        }});
    /*! Module core, file data.js */
    (function($, DX, undefined) {
        var HAS_KO = DX.support.hasKo;
        var bracketsToDots = function(expr) {
                return expr.replace(/\[/g, ".").replace(/\]/g, "")
            };
        var unwrapObservable = function(value) {
                if (HAS_KO)
                    return ko.utils.unwrapObservable(value);
                return value
            };
        var isObservable = function(value) {
                return HAS_KO && ko.isObservable(value)
            };
        var assign = function(obj, propName, value) {
                var propValue = obj[propName];
                if (isObservable(propValue))
                    propValue(value);
                else
                    obj[propName] = value
            };
        var compileGetter = function(expr) {
                if (arguments.length > 1)
                    expr = $.makeArray(arguments);
                if (!expr || expr === "this")
                    return function(obj) {
                            return obj
                        };
                if ($.isFunction(expr))
                    return expr;
                if ($.isArray(expr))
                    return combineGetters(expr);
                expr = bracketsToDots(expr);
                var path = expr.split(".");
                return function(obj, options) {
                        options = options || {};
                        var current = unwrapObservable(obj);
                        $.each(path, function() {
                            if (!current)
                                return false;
                            var next = unwrapObservable(current[this]);
                            if ($.isFunction(next) && !options.functionsAsIs)
                                next = next.call(current);
                            current = next
                        });
                        return current
                    }
            };
        var combineGetters = function(getters) {
                var compiledGetters = {};
                $.each(getters, function() {
                    compiledGetters[this] = compileGetter(this)
                });
                return function(obj, options) {
                        var result = {};
                        $.each(compiledGetters, function(name) {
                            var value = this(obj, options),
                                current,
                                path,
                                last,
                                i;
                            if (value === undefined)
                                return;
                            current = result;
                            path = name.split(".");
                            last = path.length - 1;
                            for (i = 0; i < last; i++)
                                current = current[path[i]] = {};
                            current[path[i]] = value
                        });
                        return result
                    }
            };
        function deepExtendArraySafe(target, changes) {
            var prevValue,
                newValue;
            for (var name in changes) {
                prevValue = target[name];
                newValue = changes[name];
                if (target === newValue)
                    continue;
                if ($.isPlainObject(newValue))
                    target[name] = deepExtendArraySafe($.isPlainObject(prevValue) ? prevValue : {}, newValue);
                else if (newValue !== undefined)
                    target[name] = newValue
            }
            return target
        }
        var compileSetter = function(expr) {
                if (!expr || expr === "this")
                    throw Error("Cannot assign to self");
                expr = bracketsToDots(expr);
                var pos = expr.lastIndexOf("."),
                    targetGetter = compileGetter(expr.substr(0, pos)),
                    targetExpr = expr.substr(1 + pos);
                return function(obj, value, options) {
                        options = options || {};
                        var target = targetGetter(obj, {functionsAsIs: options.functionsAsIs}),
                            prevTargetValue = target[targetExpr];
                        if (!options.functionsAsIs && $.isFunction(prevTargetValue) && !isObservable(prevTargetValue))
                            target[targetExpr](value);
                        else {
                            prevTargetValue = unwrapObservable(prevTargetValue);
                            if (options.merge && $.isPlainObject(value) && (prevTargetValue === undefined || $.isPlainObject(prevTargetValue))) {
                                if (!prevTargetValue)
                                    assign(target, targetExpr, {});
                                deepExtendArraySafe(unwrapObservable(target[targetExpr]), value)
                            }
                            else
                                assign(target, targetExpr, value)
                        }
                    }
            };
        var normalizeBinaryCriterion = function(crit) {
                return [crit[0], crit.length < 3 ? "=" : crit[1].toLowerCase(), crit.length < 2 ? true : crit[crit.length - 1]]
            };
        var normalizeSortingInfo = function(info) {
                if (!$.isArray(info))
                    info = [info];
                return $.map(info, function(i) {
                        return {
                                selector: $.isFunction(i) || typeof i === "string" ? i : i.field || i.selector,
                                desc: !!(i.desc || String(i.dir).charAt(0).toLowerCase() === "d")
                            }
                    })
            };
        var Guid = DX.Class.inherit({
                ctor: function(value) {
                    if (value)
                        value = String(value);
                    this._value = this._normalize(value || this._generate())
                },
                _normalize: function(value) {
                    value = value.replace(/[^a-f0-9]/ig, "").toLowerCase();
                    while (value.length < 32)
                        value += "0";
                    return [value.substr(0, 8), value.substr(8, 4), value.substr(12, 4), value.substr(16, 4), value.substr(20)].join("-")
                },
                _generate: function() {
                    var value = "";
                    for (var i = 0; i < 32; i++)
                        value += Math.round(Math.random() * 16).toString(16);
                    return value
                },
                toString: function() {
                    return this._value
                },
                valueOf: function() {
                    return this._value
                },
                toJSON: function() {
                    return this._value
                }
            });
        var toComparable = function(value, caseSensitive) {
                if (value instanceof Date)
                    return value.getTime();
                if (value instanceof Guid)
                    return value.valueOf();
                if (!caseSensitive && typeof value === "string")
                    return value.toLowerCase();
                return value
            };
        var keysEqual = function(keyExpr, key1, key2) {
                if ($.isArray(keyExpr)) {
                    var names = $.map(key1, function(v, k) {
                            return k
                        }),
                        name;
                    for (var i = 0; i < names.length; i++) {
                        name = names[i];
                        if (toComparable(key1[name], true) != toComparable(key2[name], true))
                            return false
                    }
                    return true
                }
                return toComparable(key1, true) == toComparable(key2, true)
            };
        var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var base64_encode = function(input) {
                if (!$.isArray(input))
                    input = stringToByteArray(String(input));
                var result = "";
                for (var i = 0; i < input.length; i += 3) {
                    var octet1 = input[i],
                        octet2 = input[i + 1],
                        octet3 = input[i + 2];
                    result += $.map([octet1 >> 2, (octet1 & 3) << 4 | octet2 >> 4, isNaN(octet2) ? 64 : (octet2 & 15) << 2 | octet3 >> 6, isNaN(octet3) ? 64 : octet3 & 63], function(item) {
                        return BASE64_CHARS.charAt(item)
                    }).join("")
                }
                return result
            };
        var stringToByteArray = function(str) {
                var bytes = [],
                    code,
                    i;
                for (i = 0; i < str.length; i++) {
                    code = str.charCodeAt(i);
                    if (code < 128)
                        bytes.push(code);
                    else if (code < 2048)
                        bytes.push(192 + (code >> 6), 128 + (code & 63));
                    else if (code < 65536)
                        bytes.push(224 + (code >> 12), 128 + (code >> 6 & 63), 128 + (code & 63));
                    else if (code < 2097152)
                        bytes.push(240 + (code >> 18), 128 + (code >> 12 & 63), 128 + (code >> 6 & 63), 128 + (code & 63))
                }
                return bytes
            };
        var errorMessageFromXhr = function() {
                var textStatusMessages = {
                        timeout: "Network connection timeout",
                        error: "Unspecified network error",
                        parsererror: "Unexpected server response"
                    };
                var textStatusDetails = {
                        timeout: "possible causes: the remote host is not accessible, overloaded or is not included into the domain white-list when being run in the native container",
                        error: "if the remote host is located on another domain, make sure it properly supports cross-origin resource sharing (CORS), or use the JSONP approach instead",
                        parsererror: "the remote host did not respond with valid JSON data"
                    };
                var explainTextStatus = function(textStatus) {
                        var result = textStatusMessages[textStatus];
                        if (!result)
                            return textStatus;
                        result += " (" + textStatusDetails[textStatus] + ")";
                        return result
                    };
                return function(xhr, textStatus) {
                        if (xhr.status < 400)
                            return explainTextStatus(textStatus);
                        return xhr.statusText
                    }
            }();
        var data = DX.data = {
                utils: {
                    compileGetter: compileGetter,
                    compileSetter: compileSetter,
                    normalizeBinaryCriterion: normalizeBinaryCriterion,
                    normalizeSortingInfo: normalizeSortingInfo,
                    toComparable: toComparable,
                    keysEqual: keysEqual,
                    errorMessageFromXhr: errorMessageFromXhr
                },
                Guid: Guid,
                base64_encode: base64_encode,
                queryImpl: {},
                queryAdapters: {},
                query: function() {
                    var impl = $.isArray(arguments[0]) ? "array" : "remote";
                    return data.queryImpl[impl].apply(this, arguments)
                },
                errorHandler: null,
                _handleError: function(error) {
                    if (window.console)
                        console.warn("[DevExpress.data]: " + error);
                    if (data.errorHandler)
                        data.errorHandler(error)
                }
            }
    })(jQuery, DevExpress);
    /*! Module core, file data.query.array.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            data = DX.data,
            queryImpl = data.queryImpl,
            compileGetter = data.utils.compileGetter,
            toComparable = data.utils.toComparable;
        var Iterator = Class.inherit({
                toArray: function() {
                    var result = [];
                    this.reset();
                    while (this.next())
                        result.push(this.current());
                    return result
                },
                countable: function() {
                    return false
                }
            });
        var ArrayIterator = Iterator.inherit({
                ctor: function(array) {
                    this.array = array;
                    this.index = -1
                },
                next: function() {
                    if (this.index + 1 < this.array.length) {
                        this.index++;
                        return true
                    }
                    return false
                },
                current: function() {
                    return this.array[this.index]
                },
                reset: function() {
                    this.index = -1
                },
                toArray: function() {
                    return this.array.slice(0)
                },
                countable: function() {
                    return true
                },
                count: function() {
                    return this.array.length
                }
            });
        var WrappedIterator = Iterator.inherit({
                ctor: function(iter) {
                    this.iter = iter
                },
                next: function() {
                    return this.iter.next()
                },
                current: function() {
                    return this.iter.current()
                },
                reset: function() {
                    return this.iter.reset()
                }
            });
        var SortIterator = Iterator.inherit({
                ctor: function(iter, getter, desc) {
                    this.iter = iter;
                    this.rules = [{
                            getter: getter,
                            desc: desc
                        }]
                },
                thenBy: function(getter, desc) {
                    var result = new SortIterator(this.sortedIter || this.iter, getter, desc);
                    if (!this.sortedIter)
                        result.rules = this.rules.concat(result.rules);
                    return result
                },
                next: function() {
                    this._ensureSorted();
                    return this.sortedIter.next()
                },
                current: function() {
                    this._ensureSorted();
                    return this.sortedIter.current()
                },
                reset: function() {
                    delete this.sortedIter
                },
                countable: function() {
                    return this.sortedIter || this.iter.countable()
                },
                count: function() {
                    if (this.sortedIter)
                        return this.sortedIter.count();
                    return this.iter.count()
                },
                _ensureSorted: function() {
                    if (this.sortedIter)
                        return;
                    $.each(this.rules, function() {
                        this.getter = compileGetter(this.getter)
                    });
                    this.sortedIter = new ArrayIterator(this.iter.toArray().sort($.proxy(this._compare, this)))
                },
                _compare: function(x, y) {
                    if (x === y)
                        return 0;
                    for (var i = 0, rulesCount = this.rules.length; i < rulesCount; i++) {
                        var rule = this.rules[i],
                            xValue = toComparable(rule.getter(x)),
                            yValue = toComparable(rule.getter(y)),
                            factor = rule.desc ? -1 : 1;
                        if (xValue < yValue)
                            return -factor;
                        if (xValue > yValue)
                            return factor;
                        if (xValue !== yValue)
                            return !xValue ? -factor : factor
                    }
                    return 0
                }
            });
        var compileCriteria = function() {
                var compileGroup = function(crit) {
                        var operands = [],
                            bag = ["return function(d) { return "],
                            index = 0,
                            pushAnd = false;
                        $.each(crit, function() {
                            if ($.isArray(this) || $.isFunction(this)) {
                                if (pushAnd)
                                    bag.push(" && ");
                                operands.push(compileCriteria(this));
                                bag.push("op[", index, "](d)");
                                index++;
                                pushAnd = true
                            }
                            else {
                                bag.push(/and|&/i.test(this) ? " && " : " || ");
                                pushAnd = false
                            }
                        });
                        bag.push(" }");
                        return new Function("op", bag.join(""))(operands)
                    };
                var toString = function(value) {
                        return DX.utils.isDefined(value) ? value.toString() : ''
                    };
                var compileBinary = function(crit) {
                        crit = data.utils.normalizeBinaryCriterion(crit);
                        var getter = compileGetter(crit[0]),
                            op = crit[1],
                            value = crit[2];
                        value = toComparable(value);
                        switch (op.toLowerCase()) {
                            case"=":
                                return function(obj) {
                                        return toComparable(getter(obj)) == value
                                    };
                            case"<>":
                                return function(obj) {
                                        return toComparable(getter(obj)) != value
                                    };
                            case">":
                                return function(obj) {
                                        return toComparable(getter(obj)) > value
                                    };
                            case"<":
                                return function(obj) {
                                        return toComparable(getter(obj)) < value
                                    };
                            case">=":
                                return function(obj) {
                                        return toComparable(getter(obj)) >= value
                                    };
                            case"<=":
                                return function(obj) {
                                        return toComparable(getter(obj)) <= value
                                    };
                            case"startswith":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) === 0
                                    };
                            case"endswith":
                                return function(obj) {
                                        var getterValue = toComparable(toString(getter(obj)));
                                        return getterValue.lastIndexOf(value) === getterValue.length - toString(value).length
                                    };
                            case"contains":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) > -1
                                    };
                            case"notcontains":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) === -1
                                    }
                        }
                    };
                return function(crit) {
                        if ($.isFunction(crit))
                            return crit;
                        if ($.isArray(crit[0]))
                            return compileGroup(crit);
                        return compileBinary(crit)
                    }
            }();
        var FilterIterator = WrappedIterator.inherit({
                ctor: function(iter, criteria) {
                    this.callBase(iter);
                    this.criteria = compileCriteria(criteria)
                },
                next: function() {
                    while (this.iter.next())
                        if (this.criteria(this.current()))
                            return true;
                    return false
                }
            });
        var GroupIterator = Iterator.inherit({
                ctor: function(iter, getter) {
                    this.iter = iter;
                    this.getter = getter
                },
                next: function() {
                    this._ensureGrouped();
                    return this.groupedIter.next()
                },
                current: function() {
                    this._ensureGrouped();
                    return this.groupedIter.current()
                },
                reset: function() {
                    delete this.groupedIter
                },
                countable: function() {
                    return !!this.groupedIter
                },
                count: function() {
                    return this.groupedIter.count()
                },
                _ensureGrouped: function() {
                    if (this.groupedIter)
                        return;
                    var hash = {},
                        keys = [],
                        iter = this.iter,
                        getter = compileGetter(this.getter);
                    iter.reset();
                    while (iter.next()) {
                        var current = iter.current(),
                            key = getter(current);
                        if (key in hash)
                            hash[key].push(current);
                        else {
                            hash[key] = [current];
                            keys.push(key)
                        }
                    }
                    this.groupedIter = new ArrayIterator($.map(keys, function(key) {
                        return {
                                key: key,
                                items: hash[key]
                            }
                    }))
                }
            });
        var SelectIterator = WrappedIterator.inherit({
                ctor: function(iter, getter) {
                    this.callBase(iter);
                    this.getter = compileGetter(getter)
                },
                current: function() {
                    return this.getter(this.callBase())
                },
                countable: function() {
                    return this.iter.countable()
                },
                count: function() {
                    return this.iter.count()
                }
            });
        var SliceIterator = WrappedIterator.inherit({
                ctor: function(iter, skip, take) {
                    this.callBase(iter);
                    this.skip = Math.max(0, skip);
                    this.take = Math.max(0, take);
                    this.pos = 0
                },
                next: function() {
                    if (this.pos >= this.skip + this.take)
                        return false;
                    while (this.pos < this.skip && this.iter.next())
                        this.pos++;
                    this.pos++;
                    return this.iter.next()
                },
                reset: function() {
                    this.callBase();
                    this.pos = 0
                },
                countable: function() {
                    return this.iter.countable()
                },
                count: function() {
                    return Math.min(this.iter.count() - this.skip, this.take)
                }
            });
        queryImpl.array = function(iter, queryOptions) {
            queryOptions = queryOptions || {};
            if (!(iter instanceof Iterator))
                iter = new ArrayIterator(iter);
            var handleError = function(error) {
                    var handler = queryOptions.errorHandler;
                    if (handler)
                        handler(error);
                    data._handleError(error)
                };
            var aggregate = function(seed, step, finalize) {
                    var d = $.Deferred().fail(handleError);
                    try {
                        iter.reset();
                        if (arguments.length < 2) {
                            step = arguments[0];
                            seed = iter.next() ? iter.current() : undefined
                        }
                        var accumulator = seed;
                        while (iter.next())
                            accumulator = step(accumulator, iter.current());
                        d.resolve(finalize ? finalize(accumulator) : accumulator)
                    }
                    catch(x) {
                        d.reject(x)
                    }
                    return d.promise()
                };
            var select = function(getter) {
                    if (!$.isFunction(getter) && !$.isArray(getter))
                        getter = $.makeArray(arguments);
                    return chainQuery(new SelectIterator(iter, getter))
                };
            var selectProp = function(name) {
                    return select(compileGetter(name))
                };
            var chainQuery = function(iter) {
                    return queryImpl.array(iter, queryOptions)
                };
            return {
                    toArray: function() {
                        return iter.toArray()
                    },
                    enumerate: function() {
                        var d = $.Deferred().fail(handleError);
                        try {
                            d.resolve(iter.toArray())
                        }
                        catch(x) {
                            d.reject(x)
                        }
                        return d.promise()
                    },
                    sortBy: function(getter, desc) {
                        return chainQuery(new SortIterator(iter, getter, desc))
                    },
                    thenBy: function(getter, desc) {
                        if (iter instanceof SortIterator)
                            return chainQuery(iter.thenBy(getter, desc));
                        throw Error();
                    },
                    filter: function(criteria) {
                        if (!$.isArray(criteria))
                            criteria = $.makeArray(arguments);
                        return chainQuery(new FilterIterator(iter, criteria))
                    },
                    slice: function(skip, take) {
                        if (take === undefined)
                            take = Number.MAX_VALUE;
                        return chainQuery(new SliceIterator(iter, skip, take))
                    },
                    select: select,
                    groupBy: function(getter) {
                        return chainQuery(new GroupIterator(iter, getter))
                    },
                    aggregate: aggregate,
                    count: function() {
                        if (iter.countable()) {
                            var d = $.Deferred().fail(handleError);
                            try {
                                d.resolve(iter.count())
                            }
                            catch(x) {
                                d.reject(x)
                            }
                            return d.promise()
                        }
                        return aggregate(0, function(count) {
                                return 1 + count
                            })
                    },
                    sum: function(getter) {
                        if (getter)
                            return selectProp(getter).sum();
                        return aggregate(0, function(sum, item) {
                                return sum + item
                            })
                    },
                    min: function(getter) {
                        if (getter)
                            return selectProp(getter).min();
                        return aggregate(function(min, item) {
                                return item < min ? item : min
                            })
                    },
                    max: function(getter) {
                        if (getter)
                            return selectProp(getter).max();
                        return aggregate(function(max, item) {
                                return item > max ? item : max
                            })
                    },
                    avg: function(getter) {
                        if (getter)
                            return selectProp(getter).avg();
                        var count = 0;
                        return aggregate(0, function(sum, item) {
                                count++;
                                return sum + item
                            }, function(sum) {
                                return count ? sum / count : undefined
                            })
                    }
                }
        }
    })(jQuery, DevExpress);
    /*! Module core, file data.query.remote.js */
    (function($, DX, undefined) {
        var data = DX.data,
            queryImpl = data.queryImpl;
        queryImpl.remote = function(url, queryOptions, tasks) {
            tasks = tasks || [];
            queryOptions = queryOptions || {};
            var createTask = function(name, args) {
                    return {
                            name: name,
                            args: args
                        }
                };
            var exec = function(executorTask) {
                    var d = $.Deferred(),
                        adapterFactory,
                        adapter,
                        taskQueue,
                        currentTask;
                    var rejectWithNotify = function(error) {
                            var handler = queryOptions.errorHandler;
                            if (handler)
                                handler(error);
                            data._handleError(error);
                            d.reject(error)
                        };
                    try {
                        adapterFactory = queryOptions.adapter || "odata";
                        if (!$.isFunction(adapterFactory))
                            adapterFactory = data.queryAdapters[adapterFactory];
                        adapter = adapterFactory(queryOptions);
                        taskQueue = [].concat(tasks).concat(executorTask);
                        while (taskQueue.length) {
                            currentTask = taskQueue[0];
                            if (String(currentTask.name) !== "enumerate")
                                if (!adapter[currentTask.name] || adapter[currentTask.name].apply(adapter, currentTask.args) === false)
                                    break;
                            taskQueue.shift()
                        }
                        adapter.exec(url).done(function(result, extra) {
                            if (!taskQueue.length)
                                d.resolve(result, extra);
                            else {
                                var clientChain = queryImpl.array(result, {errorHandler: queryOptions.errorHandler});
                                $.each(taskQueue, function() {
                                    clientChain = clientChain[this.name].apply(clientChain, this.args)
                                });
                                clientChain.done($.proxy(d.resolve, d)).fail($.proxy(d.reject, d))
                            }
                        }).fail(rejectWithNotify)
                    }
                    catch(x) {
                        rejectWithNotify(x)
                    }
                    return d.promise()
                };
            var query = {};
            $.each(["sortBy", "thenBy", "filter", "slice", "select", "groupBy"], function() {
                var name = this;
                query[name] = function() {
                    return queryImpl.remote(url, queryOptions, tasks.concat(createTask(name, arguments)))
                }
            });
            $.each(["count", "min", "max", "sum", "avg", "aggregate", "enumerate"], function() {
                var name = this;
                query[name] = function() {
                    return exec.call(this, createTask(name, arguments))
                }
            });
            return query
        }
    })(jQuery, DevExpress);
    /*! Module core, file data.odata.js */
    (function($, DX, undefined) {
        var data = DX.data,
            Guid = data.Guid;
        var JSON_VERBOSE_MIME_TYPE = "application/json;odata=verbose";
        var ajaxOptionsForRequest = function(request, requestOptions) {
                request = $.extend({
                    method: "get",
                    url: "",
                    params: {},
                    payload: null,
                    headers: {}
                }, request);
                requestOptions = requestOptions || {};
                var beforeSend = requestOptions.beforeSend;
                if (beforeSend)
                    beforeSend(request);
                var method = (request.method || "get").toLowerCase(),
                    isGet = method === "get",
                    useJsonp = isGet && requestOptions.jsonp,
                    params = $.extend({}, request.params),
                    ajaxData = isGet ? params : JSON.stringify(request.payload),
                    qs = !isGet && $.param(params),
                    url = request.url,
                    contentType = !isGet && JSON_VERBOSE_MIME_TYPE;
                if (qs)
                    url += (url.indexOf("?") > -1 ? "&" : "?") + qs;
                if (useJsonp)
                    ajaxData["$format"] = "json";
                return {
                        url: url,
                        data: ajaxData,
                        dataType: useJsonp ? "jsonp" : "json",
                        jsonp: useJsonp && "$callback",
                        type: method,
                        timeout: 30000,
                        headers: request.headers,
                        contentType: contentType,
                        accepts: {json: [JSON_VERBOSE_MIME_TYPE, "text/plain"].join()},
                        xhrFields: {withCredentials: requestOptions.withCredentials}
                    }
            };
        var sendRequest = function(request, requestOptions) {
                var d = $.Deferred();
                $.ajax(ajaxOptionsForRequest(request, requestOptions)).always(function(obj, textStatus) {
                    var tuplet = interpretVerboseJsonFormat(obj, textStatus),
                        error = tuplet.error,
                        data = tuplet.data,
                        nextUrl = tuplet.nextUrl,
                        extra;
                    if (error)
                        d.reject(error);
                    else if (requestOptions.countOnly)
                        d.resolve(tuplet.count);
                    else if (nextUrl)
                        sendRequest({url: nextUrl}, requestOptions).fail($.proxy(d.reject, d)).done(function(nextData) {
                            d.resolve(data.concat(nextData))
                        });
                    else {
                        if (isFinite(tuplet.count))
                            extra = {totalCount: tuplet.count};
                        d.resolve(data, extra)
                    }
                });
                return d.promise()
            };
        var formatDotNetError = function(errorObj) {
                var message,
                    currentError = errorObj;
                if ("message" in errorObj)
                    if (errorObj.message.value)
                        message = errorObj.message.value;
                    else
                        message = errorObj.message;
                while (currentError = currentError.innererror || currentError.internalexception) {
                    message = currentError.message;
                    if (currentError.internalexception && message.indexOf("inner exception") === -1)
                        break
                }
                return message
            };
        var errorFromResponse = function(obj, textStatus) {
                if (textStatus === "nocontent")
                    return null;
                var httpStatus = 200,
                    message = "Unknown error",
                    response = obj;
                if (textStatus !== "success") {
                    httpStatus = obj.status;
                    message = data.utils.errorMessageFromXhr(obj, textStatus);
                    try {
                        response = $.parseJSON(obj.responseText)
                    }
                    catch(x) {}
                }
                var errorObj = response && response.error;
                if (errorObj) {
                    message = formatDotNetError(errorObj) || message;
                    if (httpStatus === 200)
                        httpStatus = 500;
                    if (response.error.code)
                        httpStatus = Number(response.error.code);
                    return $.extend(Error(message), {
                            httpStatus: httpStatus,
                            errorDetails: errorObj
                        })
                }
                else if (httpStatus !== 200)
                    return $.extend(Error(message), {httpStatus: httpStatus})
            };
        var interpretVerboseJsonFormat = function(obj, textStatus) {
                var error = errorFromResponse(obj, textStatus);
                if (error)
                    return {error: error};
                if (!$.isPlainObject(obj))
                    return {data: obj};
                var data = obj.d;
                if (!data)
                    return {error: Error("Malformed or unsupported JSON response received")};
                data = data.results || data;
                recognizeDates(data);
                return {
                        data: data,
                        nextUrl: obj.d.__next,
                        count: obj.d.__count
                    }
            };
        var EdmLiteral = DX.Class.inherit({
                ctor: function(value) {
                    this._value = value
                },
                valueOf: function() {
                    return this._value
                }
            });
        var serializeDate = function() {
                var pad = function(part) {
                        part = String(part);
                        if (part.length < 2)
                            part = "0" + part;
                        return part
                    };
                return function(date) {
                        var result = ["datetime'", date.getUTCFullYear(), "-", pad(date.getUTCMonth() + 1), "-", pad(date.getUTCDate())];
                        if (date.getUTCHours() || date.getUTCMinutes() || date.getUTCSeconds() || date.getUTCMilliseconds()) {
                            result.push("T", pad(date.getUTCHours()), ":", pad(date.getUTCMinutes()), ":", pad(date.getUTCSeconds()));
                            if (date.getUTCMilliseconds())
                                result.push(".", date.getUTCMilliseconds())
                        }
                        result.push("'");
                        return result.join("")
                    }
            }();
        var serializePropName = function(propName) {
                if (propName instanceof EdmLiteral)
                    return propName.valueOf();
                return propName.replace(/\./g, "/")
            };
        var serializeValue = function(value) {
                if (value instanceof Date)
                    return serializeDate(value);
                if (value instanceof Guid)
                    return "guid'" + value + "'";
                if (value instanceof EdmLiteral)
                    return value.valueOf();
                if (typeof value === "string")
                    return "'" + value.replace(/'/g, "''") + "'";
                return String(value)
            };
        var serializeKey = function(key) {
                if ($.isPlainObject(key)) {
                    var parts = [];
                    $.each(key, function(k, v) {
                        parts.push(serializePropName(k) + "=" + serializeValue(v))
                    });
                    return parts.join()
                }
                return serializeValue(key)
            };
        var recognizeDates = function(list) {
                $.each(list, function(i, val) {
                    if (val !== null && typeof val === "object")
                        recognizeDates(val);
                    else if (typeof val === "string") {
                        var matches = val.match(/^\/Date\((-?\d+)((\+|-)?(\d+)?)\)\/$/);
                        if (matches)
                            list[i] = new Date(Number(matches[1]) + matches[2] * 60000)
                    }
                })
            };
        var keyConverters = {
                String: function(value) {
                    return value + ""
                },
                Int32: function(value) {
                    return ~~value
                },
                Int64: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "L")
                },
                Guid: function(value) {
                    if (value instanceof Guid)
                        return value;
                    return new Guid(value)
                }
            };
        var compileCriteria = function() {
                var createBinaryOperationFormatter = function(op) {
                        return function(prop, val, bag) {
                                bag.push(prop, " ", op, " ", val)
                            }
                    };
                var createStringFuncFormatter = function(op, reverse) {
                        return function(prop, val, bag) {
                                if (reverse)
                                    bag.push(op, "(", val, ",", prop, ")");
                                else
                                    bag.push(op, "(", prop, ",", val, ")")
                            }
                    };
                var formatters = {
                        "=": createBinaryOperationFormatter("eq"),
                        "<>": createBinaryOperationFormatter("ne"),
                        ">": createBinaryOperationFormatter("gt"),
                        ">=": createBinaryOperationFormatter("ge"),
                        "<": createBinaryOperationFormatter("lt"),
                        "<=": createBinaryOperationFormatter("le"),
                        startswith: createStringFuncFormatter("startswith"),
                        endswith: createStringFuncFormatter("endswith"),
                        contains: createStringFuncFormatter("substringof", true),
                        notcontains: createStringFuncFormatter("not substringof", true)
                    };
                var compileBinary = function(criteria, bag) {
                        criteria = data.utils.normalizeBinaryCriterion(criteria);
                        formatters[criteria[1]](serializePropName(criteria[0]), serializeValue(criteria[2]), bag)
                    };
                var compileGroup = function(criteria, bag) {
                        var pushAnd = false;
                        $.each(criteria, function() {
                            if ($.isArray(this)) {
                                if (pushAnd)
                                    bag.push(" and ");
                                bag.push("(");
                                compileCore(this, bag);
                                bag.push(")");
                                pushAnd = true
                            }
                            else {
                                bag.push(/and|&/i.test(this) ? " and " : " or ");
                                pushAnd = false
                            }
                        })
                    };
                var compileCore = function(criteria, bag) {
                        if ($.isArray(criteria[0]))
                            compileGroup(criteria, bag);
                        else
                            compileBinary(criteria, bag)
                    };
                return function(criteria) {
                        var bag = [];
                        compileCore(criteria, bag);
                        return bag.join("")
                    }
            }();
        var createODataQueryAdapter = function(queryOptions) {
                var sorting = [],
                    criteria = [],
                    select,
                    skip,
                    take,
                    countQuery;
                var hasSlice = function() {
                        return skip || take !== undefined
                    };
                var sortCore = function(getter, desc, reset) {
                        if (hasSlice() || typeof getter !== "string")
                            return false;
                        if (reset)
                            sorting = [];
                        var rule = serializePropName(getter);
                        if (desc)
                            rule += " desc";
                        sorting.push(rule)
                    };
                var generateExpand = function() {
                        var hash = {};
                        if (queryOptions.expand)
                            $.each($.makeArray(queryOptions.expand), function() {
                                hash[serializePropName(this)] = 1
                            });
                        if (select)
                            $.each(select, function() {
                                var path = this.split(".");
                                if (path.length < 2)
                                    return;
                                path.pop();
                                hash[serializePropName(path.join("."))] = 1
                            });
                        return $.map(hash, function(k, v) {
                                return v
                            }).join() || undefined
                    };
                var requestData = function() {
                        var result = {};
                        if (!countQuery) {
                            if (sorting.length)
                                result["$orderby"] = sorting.join(",");
                            if (skip)
                                result["$skip"] = skip;
                            if (take !== undefined)
                                result["$top"] = take;
                            if (select)
                                result["$select"] = serializePropName(select.join());
                            result["$expand"] = generateExpand()
                        }
                        if (criteria.length)
                            result["$filter"] = compileCriteria(criteria.length < 2 ? criteria[0] : criteria);
                        if (countQuery)
                            result["$top"] = 0;
                        if (queryOptions.requireTotalCount || countQuery)
                            result["$inlinecount"] = "allpages";
                        return result
                    };
                return {
                        exec: function(url) {
                            return sendRequest({
                                    url: url,
                                    params: $.extend(requestData(), queryOptions && queryOptions.params)
                                }, {
                                    beforeSend: queryOptions.beforeSend,
                                    jsonp: queryOptions.jsonp,
                                    withCredentials: queryOptions.withCredentials,
                                    countOnly: countQuery
                                })
                        },
                        sortBy: function(getter, desc) {
                            return sortCore(getter, desc, true)
                        },
                        thenBy: function(getter, desc) {
                            return sortCore(getter, desc, false)
                        },
                        slice: function(skipCount, takeCount) {
                            if (hasSlice())
                                return false;
                            skip = skipCount;
                            take = takeCount
                        },
                        filter: function(criterion) {
                            if (hasSlice() || $.isFunction(criterion))
                                return false;
                            if (!$.isArray(criterion))
                                criterion = $.makeArray(arguments);
                            if (criteria.length)
                                criteria.push("and");
                            criteria.push(criterion)
                        },
                        select: function(expr) {
                            if (select || $.isFunction(expr))
                                return false;
                            if (!$.isArray(expr))
                                expr = $.makeArray(arguments);
                            select = expr
                        },
                        count: function() {
                            countQuery = true
                        }
                    }
            };
        $.extend(true, data, {
            EdmLiteral: EdmLiteral,
            utils: {odata: {
                    sendRequest: sendRequest,
                    serializePropName: serializePropName,
                    serializeValue: serializeValue,
                    serializeKey: serializeKey,
                    keyConverters: keyConverters
                }},
            queryAdapters: {odata: createODataQueryAdapter}
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.abstract.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            abstract = DX.abstract,
            data = DX.data,
            normalizeSortingInfo = data.utils.normalizeSortingInfo;
        var STORE_CALLBACK_NAMES = ["loading", "loaded", "modifying", "modified", "inserting", "inserted", "updating", "updated", "removing", "removed"];
        function multiLevelGroup(query, groupInfo) {
            query = query.groupBy(groupInfo[0].selector);
            if (groupInfo.length > 1)
                query = query.select(function(g) {
                    return $.extend({}, g, {items: multiLevelGroup(data.query(g.items), groupInfo.slice(1)).toArray()})
                });
            return query
        }
        data.Store = Class.inherit({
            ctor: function(options) {
                var self = this;
                options = options || {};
                $.each(STORE_CALLBACK_NAMES, function() {
                    var callbacks = self[this] = $.Callbacks();
                    if (this in options)
                        callbacks.add(options[this])
                });
                this._key = options.key;
                this._errorHandler = options.errorHandler;
                this._useDefaultSearch = true
            },
            _customLoadOptions: function() {
                return null
            },
            key: function() {
                return this._key
            },
            keyOf: function(obj) {
                if (!this._keyGetter)
                    this._keyGetter = data.utils.compileGetter(this.key());
                return this._keyGetter(obj)
            },
            _requireKey: function() {
                if (!this.key())
                    throw Error("Key expression is required for this operation");
            },
            load: function(options) {
                var self = this;
                options = options || {};
                this.loading.fire(options);
                return this._loadImpl(options).done(function(result, extra) {
                        self.loaded.fire(result, extra)
                    })
            },
            _loadImpl: function(options) {
                var filter = options.filter,
                    sort = options.sort,
                    select = options.select,
                    group = options.group,
                    skip = options.skip,
                    take = options.take,
                    q = this.createQuery(options);
                if (filter)
                    q = q.filter(filter);
                if (group)
                    group = normalizeSortingInfo(group);
                if (sort || group) {
                    sort = normalizeSortingInfo(sort || []);
                    if (group)
                        sort = group.concat(sort);
                    $.each(sort, function(index) {
                        q = q[index ? "thenBy" : "sortBy"](this.selector, this.desc)
                    })
                }
                if (select)
                    q = q.select(select);
                if (group)
                    q = multiLevelGroup(q, group);
                if (take || skip)
                    q = q.slice(skip || 0, take);
                return q.enumerate()
            },
            createQuery: abstract,
            totalCount: function(options) {
                return this._addFailHandlers(this._totalCountImpl(options))
            },
            _totalCountImpl: function(options) {
                options = options || {};
                var q = this.createQuery(),
                    group = options.group,
                    filter = options.filter;
                if (filter)
                    q = q.filter(filter);
                if (group) {
                    group = normalizeSortingInfo(group);
                    q = multiLevelGroup(q, group)
                }
                return q.count()
            },
            byKey: function(key, extraOptions) {
                return this._addFailHandlers(this._byKeyImpl(key, extraOptions))
            },
            _byKeyImpl: abstract,
            insert: function(values) {
                var self = this;
                self.modifying.fire();
                self.inserting.fire(values);
                return self._addFailHandlers(self._insertImpl(values).done(function(callbackValues, callbackKey) {
                        self.inserted.fire(callbackValues, callbackKey);
                        self.modified.fire()
                    }))
            },
            _insertImpl: abstract,
            update: function(key, values) {
                var self = this;
                self.modifying.fire();
                self.updating.fire(key, values);
                return self._addFailHandlers(self._updateImpl(key, values).done(function(callbackKey, callbackValues) {
                        self.updated.fire(callbackKey, callbackValues);
                        self.modified.fire()
                    }))
            },
            _updateImpl: abstract,
            remove: function(key) {
                var self = this;
                self.modifying.fire();
                self.removing.fire(key);
                return self._addFailHandlers(self._removeImpl(key).done(function(callbackKey) {
                        self.removed.fire(callbackKey);
                        self.modified.fire()
                    }))
            },
            _removeImpl: abstract,
            _addFailHandlers: function(deferred) {
                return deferred.fail(this._errorHandler, data._handleError)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.array.js */
    (function($, DX, undefined) {
        var data = DX.data,
            Guid = data.Guid;
        var trivialPromise = function(_) {
                var d = $.Deferred();
                return d.resolve.apply(d, arguments).promise()
            };
        var rejectedPromise = function(_) {
                var d = $.Deferred();
                return d.reject.apply(d, arguments).promise()
            };
        data.ArrayStore = data.Store.inherit({
            ctor: function(options) {
                if ($.isArray(options))
                    options = {data: options};
                else
                    options = options || {};
                this.callBase(options);
                this._array = options.data || []
            },
            createQuery: function() {
                return data.query(this._array, {errorHandler: this._errorHandler})
            },
            _byKeyImpl: function(key) {
                return trivialPromise(this._array[this._indexByKey(key)])
            },
            _insertImpl: function(values) {
                var keyExpr = this.key(),
                    keyValue,
                    obj = {};
                $.extend(obj, values);
                if (keyExpr) {
                    keyValue = this.keyOf(obj);
                    if (keyValue === undefined || typeof keyValue === "object" && $.isEmptyObject(keyValue)) {
                        if ($.isArray(keyExpr))
                            throw Error("Compound keys cannot be auto-generated");
                        keyValue = obj[keyExpr] = String(new Guid)
                    }
                    else if (this._array[this._indexByKey(keyValue)] !== undefined)
                        return rejectedPromise(Error("Attempt to insert an item with the duplicate key"))
                }
                else
                    keyValue = obj;
                this._array.push(obj);
                return trivialPromise(values, keyValue)
            },
            _updateImpl: function(key, values) {
                var target;
                if (this.key()) {
                    var index = this._indexByKey(key);
                    if (index < 0)
                        return rejectedPromise(Error("Data item not found"));
                    target = this._array[index]
                }
                else
                    target = key;
                $.extend(true, target, values);
                return trivialPromise(key, values)
            },
            _removeImpl: function(key) {
                var index = this._indexByKey(key);
                if (index > -1)
                    this._array.splice(index, 1);
                return trivialPromise(key)
            },
            _indexByKey: function(key) {
                for (var i = 0, arrayLength = this._array.length; i < arrayLength; i++)
                    if (data.utils.keysEqual(this.key(), this.keyOf(this._array[i]), key))
                        return i;
                return -1
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.local.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            abstract = DX.abstract,
            data = DX.data;
        var LocalStoreBackend = Class.inherit({
                ctor: function(store, storeOptions) {
                    this._store = store;
                    this._dirty = false;
                    var immediate = this._immediate = storeOptions.immediate;
                    var flushInterval = Math.max(100, storeOptions.flushInterval || 10 * 1000);
                    if (!immediate) {
                        var saveProxy = $.proxy(this.save, this);
                        setInterval(saveProxy, flushInterval);
                        $(window).on("beforeunload", saveProxy);
                        if (window.cordova)
                            document.addEventListener("pause", saveProxy, false)
                    }
                },
                notifyChanged: function() {
                    this._dirty = true;
                    if (this._immediate)
                        this.save()
                },
                load: function() {
                    this._store._array = this._loadImpl();
                    this._dirty = false
                },
                save: function() {
                    if (!this._dirty)
                        return;
                    this._saveImpl(this._store._array);
                    this._dirty = false
                },
                _loadImpl: abstract,
                _saveImpl: abstract
            });
        var DomLocalStoreBackend = LocalStoreBackend.inherit({
                ctor: function(store, storeOptions) {
                    this.callBase(store, storeOptions);
                    var name = storeOptions.name;
                    if (!name)
                        throw Error("Name is required");
                    this._key = "dx-data-localStore-" + name
                },
                _loadImpl: function() {
                    var raw = localStorage.getItem(this._key);
                    if (raw)
                        return JSON.parse(raw);
                    return []
                },
                _saveImpl: function(array) {
                    if (!array.length)
                        localStorage.removeItem(this._key);
                    else
                        localStorage.setItem(this._key, JSON.stringify(array))
                }
            });
        var localStoreBackends = {dom: DomLocalStoreBackend};
        data.LocalStore = data.ArrayStore.inherit({
            ctor: function(options) {
                if (typeof options === "string")
                    options = {name: options};
                else
                    options = options || {};
                this.callBase(options);
                this._backend = new localStoreBackends[options.backend || "dom"](this, options);
                this._backend.load()
            },
            clear: function() {
                this._array = [];
                this._backend.notifyChanged()
            },
            _insertImpl: function(values) {
                var b = this._backend;
                return this.callBase(values).done($.proxy(b.notifyChanged, b))
            },
            _updateImpl: function(key, values) {
                var b = this._backend;
                return this.callBase(key, values).done($.proxy(b.notifyChanged, b))
            },
            _removeImpl: function(key) {
                var b = this._backend;
                return this.callBase(key).done($.proxy(b.notifyChanged, b))
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.odata.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            data = DX.data,
            odataUtils = data.utils.odata;
        var escapeServiceOperationParams = function(params) {
                if (!params)
                    return params;
                var result = {};
                $.each(params, function(k, v) {
                    result[k] = odataUtils.serializeValue(v)
                });
                return result
            };
        var convertSimpleKey = function(keyType, keyValue) {
                var converter = odataUtils.keyConverters[keyType];
                if (!converter)
                    throw Error("Unknown key type: " + keyType);
                return converter(keyValue)
            };
        var SharedMethods = {
                _extractServiceOptions: function(options) {
                    options = options || {};
                    this._url = String(options.url).replace(/\/+$/, "");
                    this._beforeSend = options.beforeSend;
                    this._jsonp = options.jsonp;
                    this._withCredentials = options.withCredentials
                },
                _sendRequest: function(url, method, params, payload) {
                    return odataUtils.sendRequest({
                            url: url,
                            method: method,
                            params: params || {},
                            payload: payload
                        }, {
                            beforeSend: this._beforeSend,
                            jsonp: this._jsonp,
                            withCredentials: this._withCredentials
                        })
                }
            };
        var ODataStore = data.Store.inherit({
                ctor: function(options) {
                    this.callBase(options);
                    this._extractServiceOptions(options);
                    this._keyType = options.keyType
                },
                _customLoadOptions: function() {
                    return ["expand", "customQueryParams"]
                },
                _byKeyImpl: function(key, extraOptions) {
                    var params = {};
                    if (extraOptions)
                        if (extraOptions.expand)
                            params["$expand"] = $.map($.makeArray(extraOptions.expand), odataUtils.serializePropName).join();
                    return this._sendRequest(this._byKeyUrl(key), "GET", params)
                },
                createQuery: function(loadOptions) {
                    loadOptions = loadOptions || {};
                    return data.query(this._url, {
                            beforeSend: this._beforeSend,
                            errorHandler: this._errorHandler,
                            jsonp: this._jsonp,
                            withCredentials: this._withCredentials,
                            params: escapeServiceOperationParams(loadOptions.customQueryParams),
                            expand: loadOptions.expand,
                            requireTotalCount: loadOptions.requireTotalCount
                        })
                },
                _insertImpl: function(values) {
                    this._requireKey();
                    var self = this,
                        d = $.Deferred();
                    $.when(this._sendRequest(this._url, "POST", null, values)).done(function(serverResponse) {
                        d.resolve(values, self.keyOf(serverResponse))
                    }).fail($.proxy(d.reject, d));
                    return d.promise()
                },
                _updateImpl: function(key, values) {
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._byKeyUrl(key), "MERGE", null, values)).done(function() {
                        d.resolve(key, values)
                    }).fail($.proxy(d.reject, d));
                    return d.promise()
                },
                _removeImpl: function(key) {
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._byKeyUrl(key), "DELETE")).done(function() {
                        d.resolve(key)
                    }).fail($.proxy(d.reject, d));
                    return d.promise()
                },
                _byKeyUrl: function(key) {
                    var keyType = this._keyType;
                    if ($.isPlainObject(keyType))
                        $.each(keyType, function(subKeyName, subKeyType) {
                            key[subKeyName] = convertSimpleKey(subKeyType, key[subKeyName])
                        });
                    else if (keyType)
                        key = convertSimpleKey(keyType, key);
                    return this._url + "(" + encodeURIComponent(odataUtils.serializeKey(key)) + ")"
                }
            }).include(SharedMethods);
        var ODataContext = Class.inherit({
                ctor: function(options) {
                    var self = this;
                    self._extractServiceOptions(options);
                    self._errorHandler = options.errorHandler;
                    $.each(options.entities || [], function(entityAlias, entityOptions) {
                        self[entityAlias] = new ODataStore($.extend({}, options, {url: self._url + "/" + encodeURIComponent(entityOptions.name || entityAlias)}, entityOptions))
                    })
                },
                get: function(operationName, params) {
                    return this.invoke(operationName, params, "GET")
                },
                invoke: function(operationName, params, httpMethod) {
                    httpMethod = httpMethod || "POST";
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._url + "/" + encodeURIComponent(operationName), httpMethod, escapeServiceOperationParams(params))).done(function(r) {
                        if (r && operationName in r)
                            r = r[operationName];
                        d.resolve(r)
                    }).fail([this._errorHandler, data._handleError, $.proxy(d.reject, d)]);
                    return d.promise()
                },
                objectLink: function(entityAlias, key) {
                    var store = this[entityAlias];
                    if (!store)
                        throw Error("Unknown entity name or alias: " + entityAlias);
                    return {__metadata: {uri: store._byKeyUrl(key)}}
                }
            }).include(SharedMethods);
        $.extend(data, {
            ODataStore: ODataStore,
            ODataContext: ODataContext
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.rest.js */
    (function($, DX, undefined) {
        var data = DX.data;
        function createAjaxFailureHandler(deferred) {
            return function(xhr, textStatus) {
                    if (!xhr || !xhr.getResponseHeader)
                        deferred.reject.apply(deferred, arguments);
                    else
                        deferred.reject(Error(data.utils.errorMessageFromXhr(xhr, textStatus)))
                }
        }
        function operationCustomizerPropName(operationName) {
            return "_customize" + DX.inflector.camelize(operationName, true)
        }
        function pathPropName(operationName) {
            return "_" + operationName + "Path"
        }
        data.RestStore = data.Store.inherit({
            ctor: function(options) {
                DX.utils.logger.warn("RestStore is deprecated, use CustomStore instead");
                var self = this;
                self.callBase(options);
                options = options || {};
                self._url = String(options.url).replace(/\/+$/, "");
                self._jsonp = options.jsonp;
                self._withCredentials = options.withCredentials;
                $.each(["Load", "Insert", "Update", "Remove", "ByKey", "Operation"], function() {
                    var value = options["customize" + this];
                    if (value)
                        self[operationCustomizerPropName(this)] = value
                });
                $.each(["load", "insert", "update", "remove", "byKey"], function() {
                    var value = options[this + "Path"];
                    if (value)
                        self[pathPropName(this)] = value
                })
            },
            _loadImpl: function(options) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlNoKey("load"),
                        type: "GET"
                    };
                $.when(this._createAjax(ajaxOptions, "load", options)).done($.proxy(d.resolve, d)).fail(createAjaxFailureHandler(d));
                return this._addFailHandlers(d.promise())
            },
            createQuery: function() {
                throw Error("Not supported");
            },
            _insertImpl: function(values) {
                var d = $.Deferred(),
                    self = this,
                    ajaxOptions = {
                        url: this._formatUrlNoKey("insert"),
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(values)
                    };
                $.when(this._createAjax(ajaxOptions, "insert")).done(function(serverResponse) {
                    d.resolve(values, self.key() && self.keyOf(serverResponse))
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _updateImpl: function(key, values) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlWithKey("update", key),
                        type: "PUT",
                        contentType: "application/json",
                        data: JSON.stringify(values)
                    };
                $.when(this._createAjax(ajaxOptions, "update")).done(function() {
                    d.resolve(key, values)
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _removeImpl: function(key) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlWithKey("remove", key),
                        type: "DELETE"
                    };
                $.when(this._createAjax(ajaxOptions, "remove")).done(function() {
                    d.resolve(key)
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _byKeyImpl: function(key) {
                var d = $.Deferred(),
                    ajaxOptions = {
                        url: this._formatUrlWithKey("byKey", key),
                        type: "GET"
                    };
                $.when(this._createAjax(ajaxOptions, "byKey")).done(function(data) {
                    d.resolve(data)
                }).fail(createAjaxFailureHandler(d));
                return d.promise()
            },
            _createAjax: function(ajaxOptions, operationName, extra) {
                var customizationFunc,
                    customizationResult;
                function isDeferred(obj) {
                    return "done" in obj && "fail" in obj
                }
                if (this._jsonp && ajaxOptions.type === "GET")
                    ajaxOptions.dataType = "jsonp";
                else
                    $.extend(true, ajaxOptions, {xhrFields: {withCredentials: this._withCredentials}});
                customizationFunc = this[operationCustomizerPropName("operation")];
                if (customizationFunc) {
                    customizationResult = customizationFunc(ajaxOptions, operationName, extra);
                    if (customizationResult) {
                        if (isDeferred(customizationResult))
                            return customizationResult;
                        ajaxOptions = customizationResult
                    }
                }
                customizationFunc = this[operationCustomizerPropName(operationName)];
                if (customizationFunc) {
                    customizationResult = customizationFunc(ajaxOptions, extra);
                    if (customizationResult) {
                        if (isDeferred(customizationResult))
                            return customizationResult;
                        ajaxOptions = customizationResult
                    }
                }
                return $.ajax(ajaxOptions)
            },
            _formatUrlNoKey: function(operationName) {
                var url = this._url,
                    path = this[pathPropName(operationName)];
                if (!path)
                    return url;
                if ($.isFunction(path))
                    return path(url);
                return url + "/" + path
            },
            _formatUrlWithKey: function(operationName, key) {
                var url = this._url,
                    path = this[pathPropName(operationName)];
                if (!path)
                    return url + "/" + encodeURIComponent(key);
                if ($.isFunction(path))
                    return path(url, key);
                return url + "/" + path + "/" + encodeURIComponent(key)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.custom.js */
    (function($, DX, undefined) {
        var data = DX.data;
        var ERROR_QUERY_NOT_SUPPORTED = "CustomStore does not support creating queries",
            ERROR_MISSING_USER_FUNC = "Required option is not specified or is not a function: ",
            ERROR_INVALID_RETURN = "Invalid return value: ";
        var TOTAL_COUNT = "totalCount",
            LOAD = "load",
            BY_KEY = "byKey",
            INSERT = "insert",
            UPDATE = "update",
            REMOVE = "remove";
        function isPromise(obj) {
            return obj && $.isFunction(obj.done) && $.isFunction(obj.fail) && $.isFunction(obj.promise)
        }
        function trivialPromise(value) {
            return $.Deferred().resolve(value).promise()
        }
        function ensureRequiredFuncOption(name, obj) {
            if (!$.isFunction(obj))
                throw Error(ERROR_MISSING_USER_FUNC + name);
        }
        function throwInvalidUserFuncResult(name) {
            throw Error(ERROR_INVALID_RETURN + name);
        }
        function createUserFuncFailureHandler(pendingDeferred) {
            function errorMessageFromXhr(promiseArguments) {
                var xhr = promiseArguments[0],
                    textStatus = promiseArguments[1];
                if (!xhr || !xhr.getResponseHeader)
                    return null;
                return data.utils.errorMessageFromXhr(xhr, textStatus)
            }
            return function(arg) {
                    var error;
                    if (arg instanceof Error)
                        error = arg;
                    else
                        error = Error(errorMessageFromXhr(arguments) || arg && String(arg) || "Unknown error");
                    pendingDeferred.reject(error)
                }
        }
        data.CustomStore = data.Store.inherit({
            ctor: function(options) {
                options = options || {};
                this.callBase(options);
                this._useDefaultSearch = false;
                this._loadFunc = options[LOAD];
                this._totalCountFunc = options[TOTAL_COUNT];
                this._byKeyFunc = options[BY_KEY] || options.lookup;
                this._insertFunc = options[INSERT];
                this._updateFunc = options[UPDATE];
                this._removeFunc = options[REMOVE]
            },
            createQuery: function() {
                throw Error(ERROR_QUERY_NOT_SUPPORTED);
            },
            _totalCountImpl: function(options) {
                var userFunc = this._totalCountFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(TOTAL_COUNT, userFunc);
                userResult = userFunc(options);
                if (!isPromise(userResult)) {
                    userResult = Number(userResult);
                    if (!isFinite(userResult))
                        throwInvalidUserFuncResult(TOTAL_COUNT);
                    userResult = trivialPromise(userResult)
                }
                userResult.done(function(count) {
                    d.resolve(Number(count))
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _loadImpl: function(options) {
                var userFunc = this._loadFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(LOAD, userFunc);
                userResult = userFunc(options);
                if ($.isArray(userResult))
                    userResult = trivialPromise(userResult);
                else if (userResult === null || userResult === undefined)
                    userResult = trivialPromise([]);
                else if (!isPromise(userResult))
                    throwInvalidUserFuncResult(LOAD);
                userResult.done(function(data, extra) {
                    d.resolve(data, extra)
                }).fail(createUserFuncFailureHandler(d));
                return this._addFailHandlers(d.promise())
            },
            _byKeyImpl: function(key) {
                var userFunc = this._byKeyFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(BY_KEY, userFunc);
                userResult = userFunc(key);
                if (!isPromise(userResult))
                    userResult = trivialPromise(userResult);
                userResult.done(function(obj) {
                    d.resolve(obj)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _insertImpl: function(values) {
                var userFunc = this._insertFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(INSERT, userFunc);
                userResult = userFunc(values);
                if (!isPromise(userResult))
                    userResult = trivialPromise(userResult);
                userResult.done(function(newKey) {
                    d.resolve(values, newKey)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _updateImpl: function(key, values) {
                var userFunc = this._updateFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(UPDATE, userFunc);
                userResult = userFunc(key, values);
                if (!isPromise(userResult))
                    userResult = trivialPromise();
                userResult.done(function() {
                    d.resolve(key, values)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            },
            _removeImpl: function(key) {
                var userFunc = this._removeFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(REMOVE, userFunc);
                userResult = userFunc(key);
                if (!isPromise(userResult))
                    userResult = trivialPromise();
                userResult.done(function() {
                    d.resolve(key)
                }).fail(createUserFuncFailureHandler(d));
                return d.promise()
            }
        });
        data.CustomStore_internals = {ERRORS: {
                QUERY_NOT_SUPPORTED: ERROR_QUERY_NOT_SUPPORTED,
                MISSING_USER_FUNC: ERROR_MISSING_USER_FUNC,
                INVALID_RETURN: ERROR_INVALID_RETURN
            }}
    })(jQuery, DevExpress);
    /*! Module core, file data.dataSource.js */
    (function($, DX, undefined) {
        var data = DX.data,
            CustomStore = data.CustomStore,
            Class = DX.Class;
        var storeTypeRegistry = {
                jaydata: "JayDataStore",
                breeze: "BreezeStore",
                odata: "ODataStore",
                local: "LocalStore",
                array: "ArrayStore"
            };
        function normalizeDataSourceOptions(options) {
            var store;
            function createCustomStoreFromLoadFunc() {
                var storeConfig = {};
                $.each(["load", "byKey", "lookup", "totalCount", "insert", "update", "remove"], function() {
                    storeConfig[this] = options[this];
                    delete options[this]
                });
                return new CustomStore(storeConfig)
            }
            function createStoreFromConfig(storeConfig) {
                var storeCtor = data[storeTypeRegistry[storeConfig.type]];
                delete storeConfig.type;
                return new storeCtor(storeConfig)
            }
            function createCustomStoreFromUrl(url) {
                return new CustomStore({load: function() {
                            return $.getJSON(url)
                        }})
            }
            if (typeof options === "string")
                options = createCustomStoreFromUrl(options);
            if (options === undefined)
                options = [];
            if ($.isArray(options) || options instanceof data.Store)
                options = {store: options};
            else
                options = $.extend({}, options);
            store = options.store;
            if ("load" in options)
                store = createCustomStoreFromLoadFunc();
            else if ($.isArray(store))
                store = new data.ArrayStore(store);
            else if ($.isPlainObject(store))
                store = createStoreFromConfig($.extend({}, store));
            options.store = store;
            return options
        }
        function generateStoreLoadOptionAccessor(optionName) {
            return function(expr) {
                    var argc = arguments.length;
                    if (argc) {
                        if (argc > 1)
                            expr = $.makeArray(arguments);
                        this._storeLoadOptions[optionName] = expr
                    }
                    return this._storeLoadOptions[optionName]
                }
        }
        function addOldUserDataSourceBackwardCompatibilityOptions(dataSource, storeLoadOptions) {
            storeLoadOptions.refresh = !dataSource._paginate || dataSource._pageIndex === 0;
            if (storeLoadOptions.searchValue !== null)
                storeLoadOptions.searchString = storeLoadOptions.searchValue
        }
        var DataSource = Class.inherit({
                ctor: function(options) {
                    options = normalizeDataSourceOptions(options);
                    this._store = options.store;
                    this._storeLoadOptions = this._extractLoadOptions(options);
                    this._mapFunc = options.map;
                    this._postProcessFunc = options.postProcess;
                    this._pageIndex = 0;
                    this._pageSize = options.pageSize !== undefined ? options.pageSize : 20;
                    this._items = [];
                    this._totalCount = -1;
                    this._isLoaded = false;
                    this._loadingCount = 0;
                    this._preferSync = options._preferSync;
                    this._loadQueue = this._createLoadQueue();
                    this._searchValue = "searchValue" in options ? options.searchValue : null;
                    this._searchOperation = options.searchOperation || "contains";
                    this._searchExpr = options.searchExpr;
                    this._paginate = options.paginate;
                    if (this._paginate === undefined)
                        this._paginate = !this.group();
                    this._isLastPage = !this._paginate;
                    this._userData = {};
                    this.changed = $.Callbacks();
                    this.loadError = $.Callbacks();
                    this.loadingChanged = $.Callbacks()
                },
                dispose: function() {
                    this.changed.empty();
                    this.loadError.empty();
                    this.loadingChanged.empty();
                    delete this._store;
                    this._disposed = true
                },
                _extractLoadOptions: function(options) {
                    var result = {},
                        names = ["sort", "filter", "select", "group", "requireTotalCount"],
                        customNames = this._store._customLoadOptions();
                    if (customNames)
                        names = names.concat(customNames);
                    $.each(names, function() {
                        result[this] = options[this]
                    });
                    return result
                },
                loadOptions: function() {
                    return this._storeLoadOptions
                },
                items: function() {
                    return this._items
                },
                pageIndex: function(newIndex) {
                    if (newIndex !== undefined) {
                        this._pageIndex = newIndex;
                        this._isLastPage = !this._paginate
                    }
                    return this._pageIndex
                },
                isLastPage: function() {
                    return this._isLastPage
                },
                sort: generateStoreLoadOptionAccessor("sort"),
                filter: generateStoreLoadOptionAccessor("filter"),
                group: generateStoreLoadOptionAccessor("group"),
                select: generateStoreLoadOptionAccessor("select"),
                searchValue: function(value) {
                    if (value !== undefined)
                        this._searchValue = value;
                    return this._searchValue
                },
                searchOperation: function(op) {
                    if (op !== undefined)
                        this._searchOperation = op;
                    return this._searchOperation
                },
                searchExpr: function(expr) {
                    var argc = arguments.length;
                    if (argc) {
                        if (argc > 1)
                            expr = $.makeArray(arguments);
                        this._searchExpr = expr
                    }
                    return this._searchExpr
                },
                store: function() {
                    return this._store
                },
                key: function() {
                    return this._store && this._store.key()
                },
                totalCount: function() {
                    return this._totalCount
                },
                isLoaded: function() {
                    return this._isLoaded
                },
                isLoading: function() {
                    return this._loadingCount > 0
                },
                _createLoadQueue: function() {
                    return DX.createQueue()
                },
                _changeLoadingCount: function(increment) {
                    var oldLoading = this.isLoading(),
                        newLoading;
                    this._loadingCount += increment;
                    newLoading = this.isLoading();
                    if (oldLoading ^ newLoading)
                        this.loadingChanged.fire(newLoading)
                },
                _scheduleLoadCallbacks: function(deferred) {
                    var thisSource = this;
                    thisSource._changeLoadingCount(1);
                    deferred.always(function() {
                        thisSource._changeLoadingCount(-1)
                    })
                },
                _scheduleChangedCallbacks: function(deferred) {
                    var self = this;
                    deferred.done(function() {
                        self.changed.fire()
                    })
                },
                load: function() {
                    var thisSource = this,
                        d = $.Deferred(),
                        errorCallback = this.loadError,
                        storeLoadOptions;
                    this._scheduleLoadCallbacks(d);
                    this._scheduleChangedCallbacks(d);
                    storeLoadOptions = this._createStoreLoadOptions();
                    function loadTask() {
                        if (thisSource._disposed)
                            return undefined;
                        return thisSource._loadFromStore(storeLoadOptions, d)
                    }
                    this._loadQueue.add(function() {
                        loadTask();
                        return d.promise()
                    }, function() {
                        thisSource._changeLoadingCount(-1)
                    });
                    return d.promise().fail($.proxy(errorCallback.fire, errorCallback))
                },
                _addSearchOptions: function(storeLoadOptions) {
                    if (this._disposed)
                        return;
                    if (this.store()._useDefaultSearch)
                        this._addSearchFilter(storeLoadOptions);
                    else {
                        storeLoadOptions.searchValue = this._searchValue;
                        storeLoadOptions.searchExpr = this._searchExpr
                    }
                },
                _createStoreLoadOptions: function() {
                    var result = $.extend({}, this._storeLoadOptions);
                    this._addSearchOptions(result);
                    if (this._paginate) {
                        result.pageIndex = this._pageIndex;
                        if (this._pageSize) {
                            result.skip = this._pageIndex * this._pageSize;
                            result.take = this._pageSize
                        }
                    }
                    result.userData = this._userData;
                    addOldUserDataSourceBackwardCompatibilityOptions(this, result);
                    return result
                },
                _addSearchFilter: function(storeLoadOptions) {
                    var value = this._searchValue,
                        op = this._searchOperation,
                        selector = this._searchExpr,
                        searchFilter = [];
                    if (!value)
                        return;
                    if (!selector)
                        selector = "this";
                    if (!$.isArray(selector))
                        selector = [selector];
                    $.each(selector, function(i, item) {
                        if (searchFilter.length)
                            searchFilter.push("or");
                        searchFilter.push([item, op, value])
                    });
                    if (storeLoadOptions.filter)
                        storeLoadOptions.filter = [searchFilter, storeLoadOptions.filter];
                    else
                        storeLoadOptions.filter = searchFilter
                },
                _loadFromStore: function(storeLoadOptions, pendingDeferred) {
                    var thisSource = this;
                    function handleSuccess(data, extra) {
                        function processResult() {
                            thisSource._processStoreLoadResult(data, extra, storeLoadOptions, pendingDeferred)
                        }
                        if (thisSource._preferSync)
                            processResult();
                        else
                            DX.utils.executeAsync(processResult)
                    }
                    return this.store().load(storeLoadOptions).done(handleSuccess).fail($.proxy(pendingDeferred.reject, pendingDeferred))
                },
                _processStoreLoadResult: function(data, extra, storeLoadOptions, pendingDeferred) {
                    var thisSource = this;
                    function resolvePendingDeferred() {
                        thisSource._isLoaded = true;
                        thisSource._totalCount = isFinite(extra.totalCount) ? extra.totalCount : -1;
                        return pendingDeferred.resolve(data, extra)
                    }
                    function proceedLoadingTotalCount() {
                        thisSource.store().totalCount(storeLoadOptions).done(function(count) {
                            extra.totalCount = count;
                            resolvePendingDeferred()
                        }).fail(function(){})
                    }
                    if (thisSource._disposed)
                        return;
                    data = thisSource._transformLoadedData(data);
                    if (!$.isPlainObject(extra))
                        extra = {};
                    thisSource._items = data;
                    if (!data.length || !thisSource._paginate || thisSource._pageSize && data.length < thisSource._pageSize)
                        thisSource._isLastPage = true;
                    if (storeLoadOptions.requireTotalCount && !isFinite(extra.totalCount))
                        proceedLoadingTotalCount();
                    else
                        resolvePendingDeferred()
                },
                _transformLoadedData: function(data) {
                    var result = $.makeArray(data);
                    if (this._mapFunc)
                        result = $.map(result, this._mapFunc);
                    if (this._postProcessFunc)
                        result = this._postProcessFunc(result);
                    return result
                }
            });
        data.Store.redefine({toDataSource: function(options) {
                DX.utils.logger.warn("toDataSource() method is deprecated, use 'new DevExpress.data.DataSource(...)' instead");
                return new DataSource($.extend({store: this}, options))
            }});
        $.extend(true, data, {
            DataSource: DataSource,
            createDataSource: function(options) {
                DX.utils.logger.warn("createDataSource() method is deprecated, use 'new DevExpress.data.DataSource(...)' instead");
                return new DataSource(options)
            },
            utils: {
                storeTypeRegistry: storeTypeRegistry,
                normalizeDataSourceOptions: normalizeDataSourceOptions
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file social.js */
    DevExpress.social = {};
    /*! Module core, file facebook.js */
    (function($, DX, undefined) {
        function notifyDeprecated() {
            DX.utils.logger.warn("DevExpress.social API is deprecated. Use official Facebook library instead")
        }
        var social = DX.social;
        var location = window.location,
            navigator = window.navigator,
            encodeURIComponent = window.encodeURIComponent,
            decodeURIComponent = window.decodeURIComponent,
            iosStandaloneMode = navigator.standalone,
            cordovaMode = false;
        if (window.cordova)
            $(document).on("deviceready", function() {
                cordovaMode = true
            });
        var ACCESS_TOKEN_KEY = "dx-facebook-access-token",
            IOS_STANDALONE_STEP1_KEY = "dx-facebook-step1",
            IOS_STANDALONE_STEP2_KEY = "dx-facebook-step2";
        var accessToken = null,
            expires = null,
            connectionChanged = $.Callbacks();
        var pendingLoginRedirectUrl;
        var isConnected = function() {
                return !!accessToken
            };
        var getAccessTokenObject = function() {
                return {
                        accessToken: accessToken,
                        expiresIn: accessToken ? expires : 0
                    }
            };
        var FB = social.Facebook = {
                loginRedirectUrl: "FacebookLoginCallback.html",
                connectionChanged: connectionChanged,
                isConnected: isConnected,
                getAccessTokenObject: getAccessTokenObject,
                jsonp: false
            };
        var login = function(appId, options) {
                notifyDeprecated();
                options = options || {};
                if (cordovaMode)
                    pendingLoginRedirectUrl = "https://www.facebook.com/connect/login_success.html";
                else
                    pendingLoginRedirectUrl = formatLoginRedirectUrl();
                var scope = (options.permissions || []).join(),
                    url = "https://www.facebook.com/dialog/oauth?display=popup&client_id=" + appId + "&redirect_uri=" + encodeURIComponent(pendingLoginRedirectUrl) + "&scope=" + encodeURIComponent(scope) + "&response_type=token";
                if (iosStandaloneMode)
                    putData(IOS_STANDALONE_STEP1_KEY, location.href);
                if (cordovaMode)
                    startLogin_cordova(url);
                else
                    startLogin_browser(url)
            };
        var formatLoginRedirectUrl = function() {
                var pathSegments = location.pathname.split(/\//g);
                pathSegments.pop();
                pathSegments.push(FB.loginRedirectUrl);
                return location.protocol + "//" + location.host + pathSegments.join("/")
            };
        var startLogin_browser = function(loginUrl) {
                var width = 512,
                    height = 320,
                    left = (screen.width - width) / 2,
                    top = (screen.height - height) / 2;
                window.open(loginUrl, null, "width=" + width + ",height=" + height + ",toolbar=0,scrollbars=0,status=0,resizable=0,menuBar=0,left=" + left + ",top=" + top)
            };
        var startLogin_cordova = function(loginUrl) {
                var ref = window.open(loginUrl, "_blank");
                ref.addEventListener('exit', function(event) {
                    pendingLoginRedirectUrl = null
                });
                ref.addEventListener('loadstop', function(event) {
                    var url = unescape(event.url);
                    if (url.indexOf(pendingLoginRedirectUrl) === 0) {
                        ref.close();
                        _processLoginRedirectUrl(url)
                    }
                })
            };
        var handleLoginRedirect = function() {
                var opener = window.opener;
                if (iosStandaloneMode) {
                    putData(IOS_STANDALONE_STEP2_KEY, location.href);
                    location.href = getData(IOS_STANDALONE_STEP1_KEY)
                }
                else if (opener && opener.DevExpress) {
                    opener.DevExpress.social.Facebook._processLoginRedirectUrl(location.href);
                    window.close()
                }
            };
        var _processLoginRedirectUrl = function(url) {
                var params = parseUrlFragment(url);
                expires = params.expires_in;
                changeToken(params.access_token);
                pendingLoginRedirectUrl = null
            };
        var parseUrlFragment = function(url) {
                var hash = url.split("#")[1];
                if (!hash)
                    return {};
                var pairs = hash.split(/&/g),
                    result = {};
                $.each(pairs, function(i) {
                    var splitPair = this.split("=");
                    result[splitPair[0]] = decodeURIComponent(splitPair[1])
                });
                return result
            };
        var logout = function() {
                notifyDeprecated();
                changeToken(null)
            };
        var changeToken = function(value) {
                if (value === accessToken)
                    return;
                accessToken = value;
                putData(ACCESS_TOKEN_KEY, value);
                connectionChanged.fire(!!value)
            };
        var api = function(resource, method, params) {
                notifyDeprecated();
                if (!isConnected())
                    throw Error("Not connected");
                if (typeof method !== "string") {
                    params = method;
                    method = undefined
                }
                method = (method || "get").toLowerCase();
                var d = $.Deferred();
                var args = arguments;
                $.ajax({
                    url: "https://graph.facebook.com/" + resource,
                    type: method,
                    data: $.extend({access_token: accessToken}, params),
                    dataType: FB.jsonp && method === "get" ? "jsonp" : "json"
                }).done(function(response) {
                    response = response || simulateErrorResponse();
                    if (response.error)
                        d.reject(response.error);
                    else
                        d.resolve(response)
                }).fail(function(xhr) {
                    var response;
                    try {
                        response = $.parseJSON(xhr.responseText);
                        var tries = args[3] || 0;
                        if (tries++ < 3 && response.error.code == 190 && response.error.error_subcode == 466) {
                            setTimeout(function() {
                                api(resource, method, params, tries).done(function(result) {
                                    d.resolve(result)
                                }).fail(function(error) {
                                    d.reject(error)
                                })
                            }, 500);
                            return
                        }
                    }
                    catch(x) {
                        response = simulateErrorResponse()
                    }
                    d.reject(response.error)
                });
                return d.promise()
            };
        var simulateErrorResponse = function() {
                return {error: {message: "Unknown error"}}
            };
        var ensureStorageBackend = function() {
                if (!hasStorageBackend())
                    throw Error("HTML5 sessionStorage or jQuery.cookie plugin is required");
            };
        var hasStorageBackend = function() {
                return !!($.cookie || window.sessionStorage)
            };
        var putData = function(key, data) {
                ensureStorageBackend();
                data = JSON.stringify(data);
                if (window.sessionStorage)
                    if (data === null)
                        sess.removeItem(key);
                    else
                        sessionStorage.setItem(key, data);
                else
                    $.cookie(key, data)
            };
        var getData = function(key) {
                ensureStorageBackend();
                try {
                    return JSON.parse(window.sessionStorage ? sessionStorage.getItem(key) : $.cookie(key))
                }
                catch(x) {
                    return null
                }
            };
        if (hasStorageBackend())
            accessToken = getData(ACCESS_TOKEN_KEY);
        if (iosStandaloneMode) {
            var url = getData(IOS_STANDALONE_STEP2_KEY);
            if (url) {
                _processLoginRedirectUrl(url);
                putData(IOS_STANDALONE_STEP1_KEY, null);
                putData(IOS_STANDALONE_STEP2_KEY, null)
            }
        }
        $.extend(FB, {
            login: login,
            logout: logout,
            handleLoginRedirect: handleLoginRedirect,
            _processLoginRedirectUrl: _processLoginRedirectUrl,
            api: api
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.js */
    (function($, DX, undefined) {
        var ui = DX.ui = {};
        var initViewport = function(options) {
                options = $.extend({}, options);
                var device = DX.devices.real;
                var allowZoom = options.allowZoom,
                    allowPan = options.allowPan;
                var metaSelector = "meta[name=viewport]";
                if (!$(metaSelector).length)
                    $("<meta />").attr("name", "viewport").appendTo("head");
                var metaVerbs = ["width=device-width"],
                    msTouchVerbs = [];
                if (allowZoom)
                    msTouchVerbs.push("pinch-zoom");
                else
                    metaVerbs.push("initial-scale=1.0", "maximum-scale=1.0");
                if (allowPan)
                    msTouchVerbs.push("pan-x", "pan-y");
                if (!allowPan && !allowZoom)
                    $("html, body").css("overflow", "hidden");
                else
                    $("html").css("-ms-overflow-style", "-ms-autohiding-scrollbar");
                $(metaSelector).attr("content", metaVerbs.join());
                $("html").css("-ms-touch-action", msTouchVerbs.join(" ") || "none");
                if (DX.support.touch)
                    $(document).off(".dxInitViewport").on("touchmove.dxInitViewport", function(e) {
                        var count = e.originalEvent.touches.length,
                            zoomDisabled = !allowZoom && count > 1,
                            panDisabled = !allowPan && count === 1 && !e.isScrollingEvent;
                        if (zoomDisabled || panDisabled)
                            e.preventDefault()
                    });
                if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
                    $(document.head).append($("<style/>").text("@-ms-viewport{ width:auto!important; user-zoom: fixed; max-zoom: 1; min-zoom: 1; }"));
                    $(window).bind("load resize", function(e) {
                        var TOP_BAR_W = 44,
                            TOP_BAR_H = 21,
                            ADDRESS_BAR_H = 72;
                        var isStandalone = 'Notify' in window.external;
                        var barWidth = isStandalone ? TOP_BAR_W : 0,
                            barHeight = isStandalone ? TOP_BAR_H : ADDRESS_BAR_H;
                        var actualHeight = $(window).width() < $(window).height() ? Math.round(screen.availHeight * (document.body.clientWidth / screen.availWidth)) - barHeight : Math.round(screen.availWidth * (document.body.clientHeight / screen.availHeight)) - barWidth;
                        document.body.style.setProperty("min-height", actualHeight + "px", "important")
                    })
                }
                var hideAddressBar = function() {
                        var ADDRESS_BAR_HEIGHT = 60,
                            isIphone = device.phone,
                            isSafari = !navigator.standalone && /safari/i.test(navigator.userAgent) && !/crios/i.test(navigator.userAgent);
                        var doHide = function() {
                                window.scrollTo(0, 1)
                            };
                        var isInput = function($who) {
                                return $who.is(":input")
                            };
                        return function(e) {
                                var height,
                                    $target = $(e.target),
                                    $active = $(document.activeElement),
                                    isTouch = e.type === "touchstart";
                                if (isTouch) {
                                    if (isInput($target))
                                        return;
                                    if (isInput($active))
                                        $active.blur()
                                }
                                else if (isInput($active))
                                    return;
                                if (isIphone && isSafari) {
                                    height = $(window).height() + ADDRESS_BAR_HEIGHT;
                                    if ($(document.body).height() !== height)
                                        $(document.body).height(height)
                                }
                                doHide()
                            }
                    }();
                if (isNeedToHideAddressBar()) {
                    $(window).on("load touchstart orientationchange", hideAddressBar);
                    $(function() {
                        $(document.body).on("focusout", function() {
                            var fix_Q477825 = window.pageYOffset
                        })
                    })
                }
                function isNeedToHideAddressBar() {
                    var inFrame = top != self,
                        isApp = !/http|https/i.test(window.location.protocol),
                        isIOS = device.ios,
                        isIOS7 = isIOS && device.version[0] === 7;
                    if (isApp)
                        return false;
                    if (inFrame)
                        return false;
                    if (isIOS7)
                        return false;
                    return isIOS
                }
            };
        var TemplateProvider = DX.Class.inherit({
                getTemplateClass: function() {
                    return Template
                },
                supportDefaultTemplate: function() {
                    return false
                },
                getDefaultTemplate: function() {
                    return null
                }
            });
        var Template = DX.Class.inherit({
                ctor: function(element) {
                    this._template = this._element = $(element).detach()
                },
                render: function(container) {
                    var renderedTemplate = this._template.clone();
                    container.append(renderedTemplate);
                    return renderedTemplate
                },
                dispose: $.noop
            });
        DX.registerActionExecutor({
            designMode: {validate: function(e) {
                    if (DX.designMode && !(e.context === ui.dxScrollable) && !(ui.dxScrollable && e.context instanceof ui.dxScrollable) && !(ui.dxScrollView && e.context instanceof ui.dxScrollView))
                        e.canceled = true
                }},
            gesture: {validate: function(e) {
                    if (!e.args.length)
                        return;
                    var args = e.args[0],
                        element = args.itemElement || args.element;
                    if (args.isGesture)
                        return;
                    while (element && element.length) {
                        if (element.data("dxGesture")) {
                            e.canceled = true;
                            break
                        }
                        element = element.parent()
                    }
                }},
            disabled: {validate: function(e) {
                    if (!e.args.length)
                        return;
                    var args = e.args[0],
                        element = args.itemElement || args.element;
                    if (args.isDisabledResistant)
                        return;
                    if (element && element.is(".dx-state-disabled, .dx-state-disabled *"))
                        e.canceled = true
                }}
        });
        $.extend(ui, {
            TemplateProvider: TemplateProvider,
            Template: Template,
            initViewport: initViewport
        });
        ui.__internals = {Template: Template}
    })(jQuery, DevExpress);
    /*! Module core, file ui.dialog.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var DEFAULT_BUTTON = {
                text: "Ok",
                clickAction: function() {
                    return true
                }
            };
        var DX_DIALOG_CLASSNAME = "dx-dialog",
            DX_DIALOG_WRAPPER_CLASSNAME = DX_DIALOG_CLASSNAME + "-wrapper",
            DX_DIALOG_ROOT_CLASSNAME = DX_DIALOG_CLASSNAME + "-root",
            DX_DIALOG_CONTENT_CLASSNAME = DX_DIALOG_CLASSNAME + "-content",
            DX_DIALOG_MESSAGE_CLASSNAME = DX_DIALOG_CLASSNAME + "-message",
            DX_DIALOG_BUTTONS_CLASSNAME = DX_DIALOG_CLASSNAME + "-buttons",
            DX_DIALOG_BUTTON_CLASSNAME = DX_DIALOG_CLASSNAME + "-button";
        var dialog = function(options) {
                var self = this,
                    result;
                if (!ui.dxPopup)
                    throw new Error("DevExpress.ui.dxPopup required");
                var deferred = $.Deferred();
                options = $.extend(ui.optionsByDevice(DX.devices.current(), "dxDialog"), options);
                var $holder = $(".dx-viewport");
                var $element = $("<div/>").addClass(DX_DIALOG_CLASSNAME).appendTo($holder);
                var $message = $("<div/>").addClass(DX_DIALOG_MESSAGE_CLASSNAME).html(String(options.message));
                var $buttons = $("<div/>").addClass(DX_DIALOG_BUTTONS_CLASSNAME);
                var popupInstance = $element.dxPopup({
                        title: options.title || self.title,
                        height: "auto",
                        width: function() {
                            var isPortrait = $(window).height() > $(window).width(),
                                key = (isPortrait ? "p" : "l") + "Width";
                            return options.hasOwnProperty(key) ? options[key] : options["width"]
                        },
                        contentReadyAction: function() {
                            popupInstance.content().addClass(DX_DIALOG_CONTENT_CLASSNAME).append($message).append($buttons)
                        }
                    }).data("dxPopup");
                popupInstance._wrapper().addClass(DX_DIALOG_WRAPPER_CLASSNAME);
                $.each(options.buttons || [DEFAULT_BUTTON], function() {
                    var button = $("<div/>").addClass(DX_DIALOG_BUTTON_CLASSNAME).appendTo($buttons);
                    var action = new DX.Action(this.clickAction, {context: popupInstance});
                    button.dxButton($.extend(this, {clickAction: function() {
                            result = action.execute(arguments);
                            hide()
                        }}))
                });
                popupInstance._wrapper().addClass(DX_DIALOG_ROOT_CLASSNAME);
                function show() {
                    popupInstance.show();
                    return deferred.promise()
                }
                function hide(value) {
                    popupInstance.hide().done(function() {
                        popupInstance._element().remove()
                    });
                    deferred.resolve(result || value)
                }
                return {
                        show: show,
                        hide: hide
                    }
            };
        var alert = function(message, title) {
                var dialogInstance,
                    options = $.isPlainObject(message) ? message : {
                        title: title,
                        message: message
                    };
                dialogInstance = ui.dialog.custom(options);
                return dialogInstance.show()
            };
        var confirm = function(message, title) {
                var dialogInstance,
                    options = $.isPlainObject(message) ? message : {
                        title: title,
                        message: message,
                        buttons: [{
                                text: Globalize.localize("Yes"),
                                clickAction: function() {
                                    return true
                                }
                            }, {
                                text: Globalize.localize("No"),
                                clickAction: function() {
                                    return false
                                }
                            }]
                    };
                dialogInstance = ui.dialog.custom(options);
                return dialogInstance.show()
            };
        var notify = function(message, type, displayTime) {
                var options,
                    instance;
                options = $.isPlainObject(message) ? message : {message: message};
                if (!ui.dxToast) {
                    alert(options.message);
                    return
                }
                if (type)
                    options.type = type;
                if (displayTime)
                    options.displayTime = displayTime;
                instance = $("<div/>").appendTo(".dx-viewport").addClass("dx-static").dxToast(options).data("dxToast");
                instance.option("hiddenAction", function(args) {
                    args.element.remove();
                    new DX.Action(options.hiddenAction, {context: args.model}).execute(arguments)
                });
                instance.show()
            };
        $.extend(ui, {
            notify: notify,
            dialog: {
                custom: dialog,
                alert: alert,
                confirm: confirm
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.dataHelper.js */
    (function($, DX, undefined) {
        var data = DX.data;
        var DATA_SOURCE_OPTIONS_METHOD = "_dataSourceOptions",
            DATA_SOURCE_CHANGED_METHOD = "_handleDataSourceChanged",
            DATA_SOURCE_LOAD_ERROR_METHOD = "_handleDataSourceLoadError",
            DATA_SOURCE_LOADING_CHANGED_METHOD = "_handleDataSourceLoadingChanged";
        DX.ui.DataHelperMixin = {
            ctor: function() {
                this.disposing.add(function() {
                    this._disposeDataSource()
                })
            },
            _refreshDataSource: function() {
                this._initDataSource();
                this._loadDataSource()
            },
            _initDataSource: function() {
                var dataSourceOptions = this.option("dataSource"),
                    widgetDataSourceOptions,
                    dataSourceType;
                this._disposeDataSource();
                if (dataSourceOptions) {
                    if (dataSourceOptions instanceof data.DataSource) {
                        this._isSharedDataSource = true;
                        this._dataSource = dataSourceOptions
                    }
                    else {
                        widgetDataSourceOptions = DATA_SOURCE_OPTIONS_METHOD in this ? this[DATA_SOURCE_OPTIONS_METHOD]() : {};
                        dataSourceType = this._dataSourceType ? this._dataSourceType() : data.DataSource;
                        this._dataSource = new dataSourceType($.extend(true, {}, widgetDataSourceOptions, data.utils.normalizeDataSourceOptions(dataSourceOptions)))
                    }
                    this._addDataSourceHandlers()
                }
            },
            _addDataSourceHandlers: function() {
                if (DATA_SOURCE_CHANGED_METHOD in this)
                    this._addDataSourceChangeHandler();
                if (DATA_SOURCE_LOAD_ERROR_METHOD in this)
                    this._addDataSourceLoadErrorHandler();
                if (DATA_SOURCE_LOADING_CHANGED_METHOD in this)
                    this._addDataSourceLoadingChangedHandler()
            },
            _addDataSourceChangeHandler: function() {
                var self = this,
                    dataSource = this._dataSource;
                this._dataSourceChangedHandler = function() {
                    self[DATA_SOURCE_CHANGED_METHOD](dataSource.items())
                };
                dataSource.changed.add(this._dataSourceChangedHandler)
            },
            _addDataSourceLoadErrorHandler: function() {
                this._dataSourceLoadErrorHandler = $.proxy(this[DATA_SOURCE_LOAD_ERROR_METHOD], this);
                this._dataSource.loadError.add(this._dataSourceLoadErrorHandler)
            },
            _addDataSourceLoadingChangedHandler: function() {
                this._dataSourceLoadingChangedHandler = $.proxy(this[DATA_SOURCE_LOADING_CHANGED_METHOD], this);
                this._dataSource.loadingChanged.add(this._dataSourceLoadingChangedHandler)
            },
            _loadDataSource: function() {
                if (this._dataSource) {
                    var dataSource = this._dataSource;
                    if (dataSource.isLoaded())
                        this._dataSourceChangedHandler();
                    else
                        dataSource.load()
                }
            },
            _disposeDataSource: function() {
                if (this._dataSource) {
                    if (this._isSharedDataSource) {
                        delete this._isSharedDataSource;
                        this._dataSource.changed.remove(this._dataSourceChangedHandler);
                        this._dataSource.loadError.remove(this._dataSourceLoadErrorHandler);
                        this._dataSource.loadingChanged.remove(this._dataSourceLoadingChangedHandler)
                    }
                    else
                        this._dataSource.dispose();
                    delete this._dataSource;
                    delete this._dataSourceChangedHandler;
                    delete this._dataSourceLoadErrorHandler;
                    delete this._dataSourceLoadingChangedHandler
                }
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            EVENT_SOURCES_REGEX = {
                mouse: /^mouse/i,
                touch: /^touch/i,
                keyboard: /^key/i,
                pointer: /pointer/i
            };
        var eventSource = function(e) {
                var result = "other";
                $.each(EVENT_SOURCES_REGEX, function(key) {
                    if (this.test(e.type)) {
                        result = key;
                        return false
                    }
                });
                return result
            };
        var isPointerEvent = function(e) {
                return eventSource(e) === "pointer"
            };
        var isMouseEvent = function(e) {
                return eventSource(e) === "mouse" || isPointerEvent(e) && e.pointerType === "mouse"
            };
        var isTouchEvent = function(e) {
                return eventSource(e) === "touch" || isPointerEvent(e) && e.pointerType === "touch"
            };
        var isKeyboardEvent = function(e) {
                return eventSource(e) === "keyboard"
            };
        var addNamespace = function(eventNames, namespace) {
                if (!namespace)
                    throw Error("Namespace is not defined");
                if (typeof eventNames === "string")
                    return addNamespace(eventNames.split(/\s+/g), namespace);
                $.each(eventNames, function(index, eventName) {
                    if (/^(start|move|end|cancel)$/.test(eventName))
                        throw Error("Use DX Pointer Event instead of '" + eventName + "'");
                    if (eventName === "wheel")
                        throw Error("Use 'mousewheel' instead of 'wheel' event");
                    if (eventName === "click")
                        throw Error("Use 'dxclick' instead of 'click' event");
                    eventNames[index] = eventName + "." + namespace
                });
                return eventNames.join(" ")
            };
        var eventData = function(e) {
                if (isPointerEvent(e) && isTouchEvent(e)) {
                    var touch = (e.originalEvent.originalEvent || e.originalEvent).changedTouches[0];
                    return {
                            x: touch.pageX,
                            y: touch.pageY,
                            time: e.timeStamp
                        }
                }
                if (isMouseEvent(e))
                    return {
                            x: e.pageX,
                            y: e.pageY,
                            time: e.timeStamp
                        };
                if (isTouchEvent(e)) {
                    var touch = (e.changedTouches || e.originalEvent.changedTouches)[0];
                    return {
                            x: touch.pageX,
                            y: touch.pageY,
                            time: e.timeStamp
                        }
                }
            };
        var eventDelta = function(from, to) {
                return {
                        x: to.x - from.x,
                        y: to.y - from.y,
                        time: to.time - from.time || 1
                    }
            };
        var hasTouches = function(e) {
                if (isMouseEvent(e) || isPointerEvent(e))
                    return 0;
                if (isTouchEvent(e))
                    return e.originalEvent.touches.length
            };
        var needSkipEvent = function(e) {
                if (isMouseEvent(e))
                    return $(e.target).is("input, textarea, select") || e.which > 1;
                if (isTouchEvent(e))
                    return (e.originalEvent.changedTouches || e.originalEvent.originalEvent.changedTouches).length !== 1
            };
        var createEvent = function(sourceEvent, props) {
                var event = $.Event(sourceEvent, props),
                    originalEvent = event.originalEvent,
                    propNames = $.event.props.slice();
                if (isMouseEvent(sourceEvent) || isTouchEvent(sourceEvent))
                    $.merge(propNames, $.event.mouseHooks.props);
                if (isKeyboardEvent(sourceEvent))
                    $.merge(propNames, $.event.keyHooks.props);
                if (originalEvent)
                    $.each(propNames, function() {
                        event[this] = originalEvent[this]
                    });
                return event
            };
        var fireEvent = function(props) {
                var event = createEvent(props.originalEvent, props);
                $.event.trigger(event, null, props.target || event.target);
                return event
            };
        ui.events = {
            eventSource: eventSource,
            isPointerEvent: isPointerEvent,
            isMouseEvent: isMouseEvent,
            isTouchEvent: isTouchEvent,
            isKeyboardEvent: isKeyboardEvent,
            addNamespace: addNamespace,
            hasTouches: hasTouches,
            eventData: eventData,
            eventDelta: eventDelta,
            needSkipEvent: needSkipEvent,
            createEvent: createEvent,
            fireEvent: fireEvent
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            support = DX.support,
            device = DX.devices.real,
            events = ui.events,
            eventNS = $.event,
            specialNS = eventNS.special,
            MOUSE_EVENT_LOCK_TIMEOUT = 100,
            mouseLocked = false,
            unlockMouseTimer = null;
        var POINTER_EVENTS_NAMESPACE = "dxPointerEvents",
            MouseStrategyEventMap = {
                dxpointerdown: "mousedown",
                dxpointermove: "mousemove",
                dxpointerup: "mouseup",
                dxpointercancel: ""
            },
            TouchStrategyEventMap = {
                dxpointerdown: "touchstart",
                dxpointermove: "touchmove",
                dxpointerup: "touchend",
                dxpointercancel: "touchcancel"
            },
            PointerStrategyEventMap = {
                dxpointerdown: "pointerdown",
                dxpointermove: "pointermove",
                dxpointerup: "pointerup",
                dxpointercancel: "pointercancel"
            },
            MouseAndTouchStrategyEventMap = {
                dxpointerdown: "touchstart mousedown",
                dxpointermove: "touchmove mousemove",
                dxpointerup: "touchend mouseup",
                dxpointercancel: "touchcancel"
            };
        var eventMap = function() {
                if (support.touch && !(device.tablet || device.phone))
                    return MouseAndTouchStrategyEventMap;
                if (support.touch)
                    return TouchStrategyEventMap;
                return MouseStrategyEventMap
            }();
        $.each(eventMap, function(pointerEvent, originalEvents) {
            var SingleEventStrategy = {
                    EVENT_NAMESPACE: [POINTER_EVENTS_NAMESPACE, ".", pointerEvent].join(""),
                    _handlerCount: 0,
                    _handler: function(e) {
                        return events.fireEvent({
                                type: pointerEvent,
                                pointerType: events.eventSource(e),
                                originalEvent: e
                            })
                    },
                    setup: function() {
                        if (pointerEventNS._handlerCount > 0)
                            return;
                        $(document).on(events.addNamespace(originalEvents, SingleEventStrategy.EVENT_NAMESPACE), pointerEventNS._handler)
                    },
                    add: function() {
                        pointerEventNS._handlerCount++
                    },
                    remove: function() {
                        pointerEventNS._handlerCount--
                    },
                    teardown: function() {
                        if (pointerEventNS._handlerCount)
                            return;
                        $(document).off("." + pointerEventNS.EVENT_NAMESPACE)
                    }
                };
            var MultiEventStrategy = $.extend({}, SingleEventStrategy, {_handler: function(e) {
                        if (events.isTouchEvent(e))
                            pointerEventNS._skipNextEvents = true;
                        if (events.isMouseEvent(e) && mouseLocked)
                            return;
                        if (events.isMouseEvent(e) && pointerEventNS._skipNextEvents) {
                            pointerEventNS._skipNextEvents = false;
                            mouseLocked = true;
                            clearTimeout(unlockMouseTimer);
                            unlockMouseTimer = setTimeout(function() {
                                mouseLocked = false
                            }, MOUSE_EVENT_LOCK_TIMEOUT);
                            return
                        }
                        return SingleEventStrategy._handler(e)
                    }});
            var pointerEventNS = specialNS[pointerEvent] = eventMap === MouseAndTouchStrategyEventMap ? MultiEventStrategy : SingleEventStrategy
        });
        DX.ui.events.__internals = DX.ui.events.__internals || {};
        $.extend(DX.ui.events.__internals, {
            mouseLocked: function(value) {
                if (value === undefined)
                    return mouseLocked;
                mouseLocked = value
            },
            unlockMouseTimer: function() {
                return unlockMouseTimer
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.click.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            jqSpecialEvent = $.event.special,
            EVENTS_NAME_SPACE = "dxSpecialEvents",
            CLICK_NAME_SPACE = "dxClick",
            CLICK_EVENT_NAME = "dxclick",
            CLICK_DATA_KEY = EVENTS_NAME_SPACE + "." + CLICK_NAME_SPACE,
            SCROLLABLE_PARENT_DATA_KEY = "dxClickScrollableParent",
            SCROLLABLE_PARENT_SCROLL_OFFSET_DATA_KEY = "dxClickScrollableParentOffset";
        var click = jqSpecialEvent[CLICK_EVENT_NAME] = {
                TOUCH_BOUNDARY: 10,
                _startX: 0,
                _startY: 0,
                _handlerCount: 0,
                _touchWasMoved: function(e) {
                    var boundary = click.TOUCH_BOUNDARY;
                    return Math.abs(e.pageX - click._startX) > boundary || Math.abs(e.pageY - click._startY) > boundary
                },
                _getClosestScrollable: function($element) {
                    var $scrollParent = $();
                    if ($element.data(SCROLLABLE_PARENT_DATA_KEY))
                        $scrollParent = $element.data(SCROLLABLE_PARENT_DATA_KEY);
                    else {
                        var $current = $element;
                        while ($current.length) {
                            if ($current[0].scrollHeight > $current[0].offsetHeight) {
                                $scrollParent = $current;
                                $element.data(SCROLLABLE_PARENT_DATA_KEY, $scrollParent);
                                break
                            }
                            $current = $current.parent()
                        }
                    }
                    return $scrollParent
                },
                _saveClosestScrollableOffset: function($element) {
                    var $scrollable = click._getClosestScrollable($element);
                    if ($scrollable.length)
                        $element.data(SCROLLABLE_PARENT_SCROLL_OFFSET_DATA_KEY, $scrollable.scrollTop())
                },
                _closestScrollableWasMoved: function($element) {
                    var $scrollable = $element.data(SCROLLABLE_PARENT_DATA_KEY);
                    return $scrollable && $scrollable.scrollTop() !== $element.data(SCROLLABLE_PARENT_SCROLL_OFFSET_DATA_KEY)
                },
                _handleStart: function(e) {
                    if (events.isMouseEvent(e) && e.which !== 1)
                        return;
                    $(e.currentTarget).data(CLICK_DATA_KEY).trackingClick = true;
                    click._saveClosestScrollableOffset($(e.target));
                    click._startX = e.pageX;
                    click._startY = e.pageY
                },
                _handleEnd: function(e) {
                    var data = $(e.currentTarget).data(CLICK_DATA_KEY);
                    if (click._touchWasMoved(e)) {
                        data.trackingClick = false;
                        return
                    }
                    if (!data.trackingClick)
                        return;
                    data.trackingClick = false;
                    if (click._closestScrollableWasMoved($(e.target)))
                        return;
                    events.fireEvent({
                        type: CLICK_EVENT_NAME,
                        originalEvent: e
                    })
                },
                _handleCancel: function(e) {
                    $(e.currentTarget).data(CLICK_DATA_KEY).trackingClick = false
                },
                setup: function() {
                    if (click._handlerCount > 0)
                        return;
                    $(document).data(CLICK_DATA_KEY, {}).on(events.addNamespace("dxpointerdown", CLICK_NAME_SPACE), $.proxy(click._handleStart, this)).on(events.addNamespace("dxpointerup", CLICK_NAME_SPACE), $.proxy(click._handleEnd, this)).on(events.addNamespace("dxpointercancel", CLICK_NAME_SPACE), $.proxy(click._handleCancel, this))
                },
                add: function() {
                    click._handlerCount++
                },
                remove: function() {
                    click._handlerCount--
                },
                teardown: function() {
                    if (click._handlerCount)
                        return;
                    $(document).off("." + CLICK_NAME_SPACE).removeData(CLICK_DATA_KEY)
                }
            }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.hold.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            jqSpecialEvent = $.event.special,
            EVENTS_NAME_SPACE = "dxSpecialEvents",
            HOLD_NAME_SPACE = "dxHold",
            HOLD_EVENT_NAME = "dxhold",
            HOLD_TIMER_DATA_KEY = EVENTS_NAME_SPACE + "HoldTimer";
        var hold = jqSpecialEvent[HOLD_EVENT_NAME] = {
                HOLD_TIMEOUT: 750,
                setup: function(data) {
                    var element = this,
                        $element = $(element);
                    var handleStart = function(e) {
                            if ($element.data(HOLD_TIMER_DATA_KEY))
                                return;
                            $element.data(HOLD_TIMER_DATA_KEY, setTimeout(function() {
                                $element.removeData(HOLD_TIMER_DATA_KEY);
                                events.fireEvent({
                                    type: HOLD_EVENT_NAME,
                                    originalEvent: e
                                })
                            }, data && "timeout" in data ? data.timeout : hold.HOLD_TIMEOUT))
                        };
                    var handleEnd = function() {
                            clearTimeout($element.data(HOLD_TIMER_DATA_KEY));
                            $element.removeData(HOLD_TIMER_DATA_KEY)
                        };
                    $element.on(events.addNamespace("dxpointerdown", HOLD_NAME_SPACE), handleStart).on(events.addNamespace("dxpointerup", HOLD_NAME_SPACE), handleEnd)
                },
                teardown: function() {
                    var $element = $(this);
                    clearTimeout($element.data(HOLD_TIMER_DATA_KEY));
                    $element.removeData(HOLD_TIMER_DATA_KEY).off("." + HOLD_NAME_SPACE)
                }
            }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.swipe.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            jqSpecialEvent = $.event.special,
            SWIPE_START_EVENT_NAME = "dxswipestart",
            SWIPE_EVENT_NAME = "dxswipe",
            SWIPE_END_EVENT_NAME = "dxswipeend",
            SWIPE_CANCEL_EVENT_NAME = "dxswipecancel",
            SWIPEABLE_DATA_KEY = "dxSwipeEventDataKey",
            GESTURE_LOCK_KEY = "dxGesture";
        var HorizontalStrategy = {
                defaultItemSizeFunc: function() {
                    return this._activeSwipeable.width()
                },
                isSwipeAngleAllowed: function(delta) {
                    return Math.abs(delta.y) <= Math.abs(delta.x)
                },
                getBounds: function() {
                    return [this._maxLeftOffset, this._maxRightOffset]
                },
                calcOffsetRatio: function(e) {
                    var endEventData = events.eventData(e);
                    return (endEventData.x - (this._startEventData && this._startEventData.x || 0)) / this._itemSizeFunc().call(this, e)
                },
                isFastSwipe: function(e) {
                    var endEventData = events.eventData(e);
                    return this.FAST_SWIPE_SPEED_LIMIT * Math.abs(endEventData.x - this._tickData.x) >= endEventData.time - this._tickData.time
                }
            };
        var VerticalStrategy = {
                defaultItemSizeFunc: function() {
                    return this._activeSwipeable.height()
                },
                isSwipeAngleAllowed: function(delta) {
                    return Math.abs(delta.y) >= Math.abs(delta.x)
                },
                getBounds: function() {
                    return [this._maxTopOffset, this._maxBottomOffset]
                },
                calcOffsetRatio: function(e) {
                    var endEventData = events.eventData(e);
                    return (endEventData.y - (this._startEventData && this._startEventData.y || 0)) / this._itemSizeFunc().call(this, e)
                },
                isFastSwipe: function(e) {
                    var endEventData = events.eventData(e);
                    return this.FAST_SWIPE_SPEED_LIMIT * Math.abs(endEventData.y - this._tickData.y) >= endEventData.time - this._tickData.time
                }
            };
        var STRATEGIES = {
                horizontal: HorizontalStrategy,
                vertical: VerticalStrategy
            };
        var SwipeDispatcher = DX.Class.inherit({
                STAGE_SLEEP: 0,
                STAGE_TOUCHED: 1,
                STAGE_SWIPING: 2,
                TICK_INTERVAL: 300,
                FAST_SWIPE_SPEED_LIMIT: 5,
                ctor: function() {
                    this._attachEvents()
                },
                _getStrategy: function() {
                    return STRATEGIES[this._data("direction")]
                },
                _defaultItemSizeFunc: function() {
                    return this._getStrategy().defaultItemSizeFunc.call(this)
                },
                _itemSizeFunc: function() {
                    return this._data("itemSizeFunc") || this._defaultItemSizeFunc
                },
                _data: function(key, value) {
                    var data = this._activeSwipeable.data(SWIPEABLE_DATA_KEY);
                    if (arguments.length === 1)
                        return data[key];
                    else if (arguments.length === 2)
                        data[key] = value
                },
                _closestSwipeable: function(e) {
                    var current = $(e.target);
                    while (current.length) {
                        var swipeable = $(current).data(SWIPEABLE_DATA_KEY);
                        if (swipeable)
                            return $(current);
                        current = current.parent()
                    }
                },
                _handleStart: function(e) {
                    if (events.needSkipEvent(e))
                        return;
                    if (this._swipeStage > this.STAGE_SLEEP)
                        return;
                    var activeSwipeable = this._activeSwipeable = this._closestSwipeable(e);
                    if (!activeSwipeable)
                        return;
                    this._startEventData = events.eventData(e);
                    this._tickData = {time: 0};
                    this._swipeStage = this.STAGE_TOUCHED;
                    if (events.isMouseEvent(e))
                        if (this._data("forceBlur")) {
                            utils.resetActiveElement();
                            e.preventDefault()
                        }
                },
                _handleMove: function(e) {
                    if (!this._activeSwipeable || this._swipeStage === this.STAGE_SLEEP)
                        return;
                    if (this._swipeStage === this.STAGE_TOUCHED)
                        this._handleFirstMove(e);
                    if (this._swipeStage === this.STAGE_SWIPING)
                        this._handleNextMoves(e)
                },
                _handleFirstMove: function(e) {
                    var delta = events.eventDelta(this._startEventData, events.eventData(e));
                    if (!delta.x && !delta.y)
                        return;
                    if (!this._getStrategy().isSwipeAngleAllowed.call(this, delta) || events.needSkipEvent(e)) {
                        this._reset();
                        return
                    }
                    this._activeSwipeable.data(GESTURE_LOCK_KEY, true);
                    if (this._data("forceBlur"))
                        utils.resetActiveElement();
                    e = events.fireEvent({
                        type: "dxswipestart",
                        originalEvent: e,
                        target: this._activeSwipeable.get(0)
                    });
                    if (e.cancel) {
                        events.fireEvent({
                            type: "dxswipecancel",
                            originalEvent: e,
                            target: this._activeSwipeable.get(0)
                        });
                        this._reset();
                        return
                    }
                    this._maxLeftOffset = e.maxLeftOffset;
                    this._maxRightOffset = e.maxRightOffset;
                    this._maxTopOffset = e.maxTopOffset;
                    this._maxBottomOffset = e.maxBottomOffset;
                    this._swipeStage = this.STAGE_SWIPING
                },
                _handleNextMoves: function(e) {
                    var strategy = this._getStrategy(),
                        moveEventData = events.eventData(e),
                        offset = strategy.calcOffsetRatio.call(this, e);
                    offset = this._fitOffset(offset, this._data("elastic"));
                    if (moveEventData.time - this._tickData.time > this.TICK_INTERVAL)
                        this._tickData = moveEventData;
                    events.fireEvent({
                        type: "dxswipe",
                        originalEvent: e,
                        offset: offset,
                        target: this._activeSwipeable.get(0)
                    })
                },
                _handleEnd: function(e) {
                    if (!DX.devices.isRippleEmulator() && events.hasTouches(e) || !this._activeSwipeable)
                        return;
                    if (this._swipeStage !== this.STAGE_SWIPING) {
                        this._reset();
                        return
                    }
                    var strategy = this._getStrategy(),
                        offsetRatio = strategy.calcOffsetRatio.call(this, e),
                        fast = strategy.isFastSwipe.call(this, e),
                        startOffset = offsetRatio,
                        targetOffset = this._calcTargetOffset(offsetRatio, fast);
                    startOffset = this._fitOffset(startOffset, this._data("elastic"));
                    targetOffset = this._fitOffset(targetOffset, false);
                    events.fireEvent({
                        type: "dxswipeend",
                        offset: startOffset,
                        targetOffset: targetOffset,
                        target: this._activeSwipeable.get(0),
                        originalEvent: e
                    });
                    this._reset()
                },
                _fitOffset: function(offset, elastic) {
                    var strategy = this._getStrategy(),
                        bounds = strategy.getBounds.call(this);
                    if (offset < -bounds[0])
                        return elastic ? (-2 * bounds[0] + offset) / 3 : -bounds[0];
                    if (offset > bounds[1])
                        return elastic ? (2 * bounds[1] + offset) / 3 : bounds[1];
                    return offset
                },
                _calcTargetOffset: function(offsetRatio, fast) {
                    var result;
                    if (fast) {
                        result = Math.ceil(Math.abs(offsetRatio));
                        if (offsetRatio < 0)
                            result = -result
                    }
                    else
                        result = Math.round(offsetRatio);
                    return result
                },
                _reset: function() {
                    this._activeSwipeable.data(GESTURE_LOCK_KEY, false);
                    this._activeSwipeable = null;
                    this._swipeStage = this.STAGE_SLEEP
                },
                _attachEvents: function() {
                    $(document).on(events.addNamespace("dxpointerdown", "dxSwipe"), $.proxy(this._handleStart, this)).on(events.addNamespace("dxpointermove", "dxSwipe"), $.proxy(this._handleMove, this)).on(events.addNamespace("dxpointerup", "dxSwipe"), $.proxy(this._handleEnd, this))
                },
                isDisposed: function() {
                    return this._disposed
                },
                dispose: function() {
                    this._disposed = true;
                    if (this._activeSwipeable)
                        this._reset();
                    $(document).off(".dxSwipe")
                }
            });
        var swipeDispatcher = null;
        $.each([SWIPE_START_EVENT_NAME, SWIPE_EVENT_NAME, SWIPE_END_EVENT_NAME, SWIPE_CANCEL_EVENT_NAME], function() {
            jqSpecialEvent[this] = {
                noBubble: true,
                setup: function(data) {
                    $(this).data(SWIPEABLE_DATA_KEY, $.extend($(this).data(SWIPEABLE_DATA_KEY) || {
                        elastic: true,
                        direction: "horizontal",
                        forceBlur: true
                    }, data));
                    if (!swipeDispatcher || swipeDispatcher.isDisposed())
                        swipeDispatcher = new SwipeDispatcher
                },
                add: function() {
                    var data = $(this).data(SWIPEABLE_DATA_KEY);
                    data.handlerCount = data.handlerCount || 0;
                    data.handlerCount++
                },
                remove: function() {
                    var data = $(this).data(SWIPEABLE_DATA_KEY);
                    data.handlerCount = data.handlerCount || 0;
                    data.handlerCount--
                },
                teardown: function() {
                    var element = $(this),
                        data = $(this).data(SWIPEABLE_DATA_KEY);
                    if (data && data.handlerCount)
                        return;
                    element.removeData(SWIPEABLE_DATA_KEY);
                    if (!swipeDispatcher)
                        return;
                    swipeDispatcher.dispose();
                    swipeDispatcher = null
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.component.js */
    (function($, DX, undefined) {
        var COMPONENT_NAMES_DATA_KEY = "dxComponents",
            ui = DX.ui,
            dataUtils = DX.data.utils;
        var Component = DX.Class.inherit({
                NAME: null,
                _defaultOptions: function() {
                    return {disabled: false}
                },
                ctor: function(element, options) {
                    if (!this.NAME)
                        throw Error("NAME is not specified");
                    this._$element = $(element);
                    this._element().data(this.NAME, this);
                    if (!this._element().data(COMPONENT_NAMES_DATA_KEY))
                        this._element().data(COMPONENT_NAMES_DATA_KEY, []);
                    this._element().data(COMPONENT_NAMES_DATA_KEY).push(this.NAME);
                    this._options = {};
                    this._updateLockCount = 0;
                    this._requireRefresh = false;
                    this.optionChanged = $.Callbacks();
                    this.disposing = $.Callbacks();
                    this.beginUpdate();
                    try {
                        var device = DX.devices.current(),
                            optionsByDevice = ui.optionsByDevice(device, this.NAME) || {},
                            defaultOptions = $.extend(this._defaultOptions(), optionsByDevice);
                        this.option(defaultOptions);
                        this._initOptions(options || {})
                    }
                    finally {
                        this.endUpdate()
                    }
                },
                _initOptions: function(options) {
                    this.option(options)
                },
                _optionValuesEqual: function(name, oldValue, newValue) {
                    oldValue = dataUtils.toComparable(oldValue, true);
                    newValue = dataUtils.toComparable(newValue, true);
                    if (oldValue === null || typeof oldValue !== "object")
                        return oldValue === newValue;
                    return false
                },
                _init: $.noop,
                _render: $.noop,
                _clean: $.noop,
                _modelByElement: $.noop,
                _invalidate: function() {
                    if (!this._updateLockCount)
                        throw Error("Invalidate called outside update transaction");
                    this._requireRefresh = true
                },
                _refresh: function() {
                    this._clean();
                    this._render()
                },
                _dispose: function() {
                    this._clean();
                    this.optionChanged.empty();
                    this.disposing.fireWith(this).empty()
                },
                _createAction: function(actionSource, config) {
                    var self = this;
                    config = $.extend({}, config);
                    var element = config.element || self._element(),
                        model = self._modelByElement(element);
                    config.context = model || self;
                    config.component = self;
                    var action = new DX.Action(actionSource, config);
                    return function(e) {
                            if (!arguments.length)
                                e = {};
                            if (e instanceof $.Event)
                                throw Error("Action must be executed with jQuery.Event like action({ jQueryEvent: event })");
                            if (!$.isPlainObject(e))
                                e = {actionValue: e};
                            return action.execute.call(action, $.extend(e, {
                                    component: self,
                                    element: element,
                                    model: model
                                }))
                        }
                },
                _createActionByOption: function(optionName, config) {
                    if (typeof optionName !== "string")
                        throw Error("Option name type is unexpected");
                    return this._createAction(this.option(optionName), config)
                },
                _optionChanged: function(name, value, prevValue) {
                    this._invalidate()
                },
                _element: function() {
                    return this._$element
                },
                instance: function() {
                    return this
                },
                beginUpdate: function() {
                    this._updateLockCount++
                },
                endUpdate: function() {
                    this._updateLockCount--;
                    if (!this._updateLockCount)
                        if (!this._initializing && !this._initialized) {
                            this._initializing = true;
                            try {
                                this._init()
                            }
                            finally {
                                this._initializing = false;
                                this._initialized = true
                            }
                            this._render()
                        }
                        else if (this._requireRefresh) {
                            this._requireRefresh = false;
                            this._refresh()
                        }
                },
                option: function(options) {
                    var self = this,
                        name = options,
                        value = arguments[1];
                    if (arguments.length < 2 && $.type(name) !== "object")
                        return dataUtils.compileGetter(name)(self._options, {functionsAsIs: true});
                    if (typeof name === "string") {
                        options = {};
                        options[name] = value
                    }
                    self.beginUpdate();
                    try {
                        $.each(options, function(name, value) {
                            var prevValue = dataUtils.compileGetter(name)(self._options, {functionsAsIs: true}),
                                topLevelName;
                            if (self._optionValuesEqual(name, prevValue, value))
                                return;
                            dataUtils.compileSetter(name)(self._options, value, {
                                functionsAsIs: true,
                                merge: true
                            });
                            topLevelName = name.split(/[.\[]/)[0];
                            if (self._initialized) {
                                self.optionChanged.fireWith(self, [topLevelName, value, prevValue]);
                                self._optionChanged(topLevelName, value, prevValue)
                            }
                        })
                    }
                    finally {
                        self.endUpdate()
                    }
                }
            });
        var registerComponent = function(name, componentClass) {
                ui[name] = componentClass;
                componentClass.prototype.NAME = name;
                $.fn[name] = function(options) {
                    var isMemberInvoke = typeof options === "string",
                        result = this;
                    if (isMemberInvoke) {
                        var memberName = options,
                            memberArgs = $.makeArray(arguments).slice(1);
                        this.each(function() {
                            var instance = $(this).data(name);
                            if (!instance)
                                throw Error(DX.utils.stringFormat("Component {0} has not been initialized on this element", name));
                            var member = instance[memberName],
                                memberValue = member.apply(instance, memberArgs);
                            if (memberValue !== undefined) {
                                result = memberValue;
                                return false
                            }
                        })
                    }
                    else
                        this.each(function() {
                            var instance = $(this).data(name);
                            if (instance)
                                instance.option(options);
                            else
                                new componentClass(this, options)
                        });
                    return result
                }
            };
        var getComponents = function(element) {
                element = $(element);
                var names = element.data(COMPONENT_NAMES_DATA_KEY);
                if (!names)
                    return [];
                return $.map(names, function(name) {
                        return element.data(name)
                    })
            };
        var disposeComponents = function() {
                $.each(getComponents(this), function() {
                    this._dispose()
                })
            };
        var originalCleanData = $.cleanData;
        $.cleanData = function(element) {
            $.each(element, disposeComponents);
            return originalCleanData.apply(this, arguments)
        };
        $.extend(ui, {
            Component: Component,
            registerComponent: registerComponent
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.knockoutIntegration.js */
    (function($, DX, undefined) {
        var ko = window.ko;
        if (!DX.support.hasKo)
            return;
        (function checkKnockoutVersion(version) {
            version = version.split(".");
            if (version[0] < 2 || version[0] == 2 && version[1] < 3)
                throw Error("Your version of KnockoutJS is too old. Please upgrade KnockoutJS to 2.3.0 or later.");
        })(ko.version);
        var ui = DX.ui,
            inflector = DX.inflector,
            DATA_BIND_ATTR = "data-bind",
            ANONYMOUS_BINDING_KEY = "unknown",
            ANONYMOUS_OPTION_NAME_FOR_OPTIONS_BAG = "_";
        var LOCKS_DATA_KEY = "dxKoLocks",
            CREATED_WITH_KO_DATA_KEY = "dxKoCreation";
        var defaultBindingProvider = ko.bindingProvider.instance,
            parseObjectLiteral = ko.jsonExpressionRewriting.parseObjectLiteral,
            bindingEvaluatorElement = $("<div></div>");
        var isComponentName = function(name) {
                return name in ui && ui[name].subclassOf && ui[name].subclassOf(ui.Component)
            };
        var stripQuotes = function(text) {
                return text.replace(/^['"]|['"]$/g, "")
            };
        var hideComponentBindings = function(element) {
                element = $(element);
                var bindingExpr = element.attr(DATA_BIND_ATTR);
                if (!bindingExpr)
                    return;
                var parsedBindingExpr = parseObjectLiteral(bindingExpr),
                    newBindingFragments = [],
                    found = false;
                $.each(parsedBindingExpr, function() {
                    var componentName = stripQuotes(this.key),
                        hiddenBindingsAttrName = "data-" + inflector.underscore(componentName);
                    if (isComponentName(componentName) && !element.attr(hiddenBindingsAttrName)) {
                        found = true;
                        element.attr(hiddenBindingsAttrName, this.value);
                        newBindingFragments.push({
                            key: componentName,
                            value: "true"
                        })
                    }
                    else
                        newBindingFragments.push(this)
                });
                if (found)
                    element.attr(DATA_BIND_ATTR, $.map(newBindingFragments, function(i) {
                        return i.key + ": " + i.value
                    }).join(", "))
            };
        var PatchedBindingProvider = {
                _original: defaultBindingProvider,
                nodeHasBindings: function(node) {
                    return defaultBindingProvider.nodeHasBindings(node)
                },
                getBindings: function(node, bindingContext) {
                    hideComponentBindings(node);
                    return defaultBindingProvider.getBindings(node, bindingContext)
                }
            };
        var Locks = function() {
                var info = {};
                var currentCount = function(lockName) {
                        return info[lockName] || 0
                    };
                return {
                        obtain: function(lockName) {
                            info[lockName] = currentCount(lockName) + 1
                        },
                        release: function(lockName) {
                            var count = currentCount(lockName);
                            if (count < 1)
                                throw Error("Not locked");
                            if (count === 1)
                                delete info[lockName];
                            else
                                info[lockName] = count - 1
                        },
                        locked: function(lockName) {
                            return currentCount(lockName) > 0
                        }
                    }
            };
        var registerComponentKoBinding = function(componentName) {
                var parseHiddenBindings = function(element) {
                        var bindingString = $.trim(element.attr("data-" + inflector.underscore(componentName))),
                            result,
                            firstItem;
                        if (bindingString.charAt(0) === "{") {
                            result = parseObjectLiteral(bindingString);
                            firstItem = result[0];
                            if (firstItem && ANONYMOUS_BINDING_KEY in firstItem)
                                result = $.trim(firstItem[ANONYMOUS_BINDING_KEY])
                        }
                        else
                            result = bindingString;
                        if (result === "")
                            result = [];
                        return result
                    };
                ko.bindingHandlers[componentName] = {init: function(domNode) {
                        var element = $(domNode),
                            parsedBindings = parseHiddenBindings(element),
                            ctorOptions = {},
                            optionNameToModelMap = {};
                        var evalModelValue = function(optionName, modelValueExpr) {
                                bindingEvaluatorElement.attr(DATA_BIND_ATTR, optionName + ":" + modelValueExpr);
                                try {
                                    return defaultBindingProvider.getBindings(bindingEvaluatorElement[0], ko.contextFor(domNode))[optionName]
                                }
                                finally {
                                    bindingEvaluatorElement.removeAttr(DATA_BIND_ATTR)
                                }
                            };
                        var applyModelValueToOption = function(optionName, modelValue) {
                                var component = element.data(componentName),
                                    locks = element.data(LOCKS_DATA_KEY),
                                    optionValue = ko.utils.unwrapObservable(modelValue);
                                if (!component) {
                                    ctorOptions[optionName] = optionValue;
                                    if (ko.isWriteableObservable(modelValue))
                                        optionNameToModelMap[optionName] = modelValue
                                }
                                else {
                                    if (locks.locked(optionName))
                                        return;
                                    locks.obtain(optionName);
                                    try {
                                        component.option(optionName, optionValue)
                                    }
                                    finally {
                                        locks.release(optionName)
                                    }
                                }
                            };
                        var handleOptionChanged = function(optionName, optionValue) {
                                if (!(optionName in optionNameToModelMap))
                                    return;
                                var element = this._$element,
                                    locks = element.data(LOCKS_DATA_KEY);
                                if (locks.locked(optionName))
                                    return;
                                locks.obtain(optionName);
                                try {
                                    optionNameToModelMap[optionName](optionValue)
                                }
                                finally {
                                    locks.release(optionName)
                                }
                            };
                        if (typeof parsedBindings === "string")
                            ko.computed(function() {
                                var cmp = element.data(componentName);
                                if (cmp)
                                    cmp.beginUpdate();
                                $.each(ko.utils.unwrapObservable(evalModelValue(ANONYMOUS_OPTION_NAME_FOR_OPTIONS_BAG, parsedBindings)), applyModelValueToOption);
                                if (cmp)
                                    cmp.endUpdate()
                            }, null, {disposeWhenNodeIsRemoved: domNode});
                        else
                            $.each(parsedBindings, function() {
                                var optionName = stripQuotes($.trim(this.key)),
                                    modelValueExpr = $.trim(this.value);
                                ko.computed(function() {
                                    var modelValue = evalModelValue(optionName, modelValueExpr);
                                    applyModelValueToOption(optionName, modelValue)
                                }, null, {disposeWhenNodeIsRemoved: domNode})
                            });
                        if (ctorOptions) {
                            element.data(CREATED_WITH_KO_DATA_KEY, true);
                            element[componentName](ctorOptions);
                            ctorOptions = null;
                            element.data(LOCKS_DATA_KEY, new Locks);
                            element.data(componentName).optionChanged.add(handleOptionChanged)
                        }
                        return {controlsDescendantBindings: ui[componentName].subclassOf(ui.Widget)}
                    }}
            };
        ko.bindingProvider.instance = PatchedBindingProvider;
        var KoComponent = ui.Component.inherit({_modelByElement: function(element) {
                    if (element.length)
                        return ko.dataFor(element.get(0))
                }});
        var originalRegisterComponent = ui.registerComponent;
        var registerKoComponent = function(name, componentClass) {
                originalRegisterComponent(name, componentClass);
                registerComponentKoBinding(name)
            };
        var KoTemplate = ui.Template.inherit({
                ctor: function(element) {
                    this.callBase.apply(this, arguments);
                    this._template = $("<div />").append(element);
                    this._cleanTemplateElement();
                    this._registerKoTemplate()
                },
                _cleanTemplateElement: function() {
                    this._element.each(function() {
                        ko.cleanNode(this)
                    })
                },
                _registerKoTemplate: function() {
                    var template = this._template.get(0);
                    new ko.templateSources.anonymousTemplate(template)['nodes'](template)
                },
                render: function(container, data) {
                    if (!$(container).closest("body").length)
                        throw Error("Attempt to render into container detached from document");
                    data = data !== undefined ? data : ko.dataFor(container.get(0)) || {};
                    var containerBindingContext = ko.contextFor(container[0]);
                    var bindingContext = containerBindingContext ? containerBindingContext.createChildContext(data) : data;
                    var renderBag = $("<div />").appendTo(container);
                    ko.renderTemplate(this._template.get(0), bindingContext, null, renderBag.get(0));
                    var result = renderBag.contents();
                    container.append(result);
                    renderBag.remove();
                    return result
                },
                dispose: function() {
                    this._cleanTemplateElement();
                    this._element.remove();
                    this._template.remove()
                }
            });
        var KoTemplateProvider = ui.TemplateProvider.inherit({
                getTemplateClass: function() {
                    return KoTemplate
                },
                supportDefaultTemplate: function(widget) {
                    return this._createdWithKo(widget) ? true : this.callBase(widget)
                },
                getDefaultTemplate: function(widget) {
                    if (this._createdWithKo(widget))
                        return defaultKoTemplate(widget.NAME)
                },
                _createdWithKo: function(widget) {
                    return !!widget._element().data(CREATED_WITH_KO_DATA_KEY)
                }
            });
        ko.bindingHandlers.dxAction = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var $element = $(element);
                var actionSource = ko.utils.unwrapObservable(valueAccessor()),
                    action = new DX.Action(actionSource, {context: element});
                $element.off(".dxActionBinding").on("dxclick.dxActionBinding", function() {
                    action.execute({
                        element: $element,
                        model: viewModel,
                        evaluate: function(expression) {
                            var context = viewModel;
                            if (expression.length > 0 && expression[0] === "$")
                                context = ko.contextFor(element);
                            var getter = DX.data.utils.compileGetter(expression);
                            return getter(context)
                        }
                    })
                })
            }};
        var defaultKoTemplate = function() {
                var cache = {};
                return function(widgetName) {
                        if (!DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName])
                            widgetName = "base";
                        if (!cache[widgetName]) {
                            var html = DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName](),
                                markup = DX.utils.createMarkupFromString(html);
                            markup.each(function() {
                                hideComponentBindings($(this))
                            });
                            cache[widgetName] = new KoTemplate(markup)
                        }
                        return cache[widgetName]
                    }
            }();
        var createElementWithBindAttr = function(tagName, bindings, closeTag, additionalProperties) {
                closeTag = closeTag === undefined ? true : closeTag;
                var bindAttr = $.map(bindings, function(value, key) {
                        return key + ":" + value
                    }).join(",");
                return "<" + tagName + " data-bind=\"" + bindAttr + "\" " + additionalProperties + ">" + (closeTag ? "</" + tagName + ">" : "")
            };
        var defaultKoTemplateBasicBindings = {css: "{ 'dx-state-disabled': $data.disabled, 'dx-state-invisible': !$data.visible && $data.visible !== undefined }"};
        var DEFAULT_ITEM_TEMPLATE_GENERATORS = {base: function() {
                    var template = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false)],
                        htmlBinding = createElementWithBindAttr("div", {html: "html"}),
                        textBinding = createElementWithBindAttr("div", {text: "text"}),
                        primitiveBinding = createElementWithBindAttr("div", {html: "String($data)"});
                    template.push("<!-- ko if: $data.html -->", htmlBinding, "<!-- /ko -->", "<!-- ko if: !$data.html && $data.text -->", textBinding, "<!-- /ko -->", "<!-- ko ifnot: $.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>");
                    return template.join("")
                }};
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxRadioGroup = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                htmlBinding = createElementWithBindAttr("div", {html: "html"}),
                textBinding = createElementWithBindAttr("span", {text: "text"}),
                primitiveBinding = createElementWithBindAttr("span", {html: "String($data)"}),
                radioWithValueBinding = createElementWithBindAttr("input", {attr: "{ value: $data.value }"}, true, 'type="radio"'),
                radioWithTextBinding = createElementWithBindAttr("input", {attr: "{ value: $data.text }"}, true, 'type="radio"'),
                radioWithPrimitiveBinding = createElementWithBindAttr("input", {attr: "{ value: String($data) }"}, true, 'type="radio"');
            var divInnerStart = template.indexOf(">") + 1,
                divInnerFinish = template.length - 6;
            template = [template.substring(0, divInnerStart), "<!-- ko if: $data.html -->", htmlBinding, "<!-- /ko -->", "<!-- ko if: !$data.html -->", "<label>", "<!-- ko if: $data.value -->", radioWithValueBinding, "<!-- /ko -->", "<!-- ko if: !$data.value && $data.text -->", radioWithTextBinding, "<!-- /ko -->", "<!-- ko if: $data.text -->", textBinding, "<!-- /ko -->", "<!-- ko ifnot: $.isPlainObject($data) -->", radioWithPrimitiveBinding, primitiveBinding, "<!-- /ko -->", "</label>", "<!-- /ko -->", template.substring(divInnerFinish, template.length), ];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxPivotTabs = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                titleBinding = createElementWithBindAttr("span", {text: "title"});
            var divInnerStart = template.indexOf(">") + 1,
                divInnerFinish = template.length - 6;
            template = [template.substring(0, divInnerStart), titleBinding, template.substring(divInnerFinish, template.length)];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxPanorama = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                headerBinding = createElementWithBindAttr("div", {text: "header"}, true, 'class="dx-panorama-item-header"');
            var divInnerStart = template.indexOf(">") + 1;
            template = [template.substring(0, divInnerStart), "<!-- ko if: $data.header -->", headerBinding, "<!-- /ko -->", template.substring(divInnerStart, template.length)];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxList = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                keyBinding = createElementWithBindAttr("div", {html: "key"});
            template = [template.substring(0, template.length - 6), "<!-- ko if: $data.key -->" + keyBinding + "<!-- /ko -->", "</div>"];
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxToolbar = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base();
            template = [template.substring(0, template.length - 6), "<!-- ko if: $data.widget -->"];
            $.each(["button", "tabs", "dropDownMenu"], function() {
                var bindingName = DX.inflector.camelize(["dx", "-", this].join("")),
                    bindingObj = {};
                bindingObj[bindingName] = "$data.options";
                template.push("<!-- ko if: $data.widget === '", this, "' -->", createElementWithBindAttr("div", bindingObj), "<!-- /ko -->")
            });
            template.push("<!-- /ko -->");
            return template.join("")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxGallery = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                primitiveBinding = createElementWithBindAttr("div", {html: "String($data)"}),
                imgBinding = createElementWithBindAttr("img", {attr: "{ src: String($data) }"}, false);
            template = template.replace(primitiveBinding, imgBinding);
            return template
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base(),
                baseTextBinding = createElementWithBindAttr("div", {text: "text"}),
                iconBinding = createElementWithBindAttr("span", {
                    attr: "{ 'class': 'dx-icon-' + $data.icon }",
                    css: "{ 'dx-icon': true }"
                }),
                iconSrcBinding = createElementWithBindAttr("img", {
                    attr: "{ src: $data.iconSrc }",
                    css: "{ 'dx-icon': true }"
                }, false),
                textBinding = "<!-- ko if: $data.icon -->" + iconBinding + "<!-- /ko -->" + "<!-- ko if: !$data.icon && $data.iconSrc -->" + iconSrcBinding + "<!-- /ko -->" + "<span class=\"dx-tab-text\" data-bind=\"text: $data.text\"></span>";
            template = template.replace("<!-- ko if: !$data.html && $data.text -->", "<!-- ko if: !$data.html && ($data.text || $data.icon || $data.iconSrc) -->").replace(baseTextBinding, textBinding);
            return template
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxActionSheet = function() {
            return createElementWithBindAttr("div", {dxButton: "{ text: $data.text, clickAction: $data.clickAction, type: $data.type, disabled: !!$data.disabled }"})
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxNavBar = DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs;
        var cleanKoData = function(element, andSelf) {
                var cleanNode = function() {
                        ko.cleanNode(this)
                    };
                if (andSelf)
                    element.each(cleanNode);
                else
                    element.find("*").each(cleanNode)
            };
        var originalEmpty = $.fn.empty;
        $.fn.empty = function() {
            cleanKoData(this, false);
            return originalEmpty.apply(this, arguments)
        };
        var originalRemove = $.fn.remove;
        $.fn.remove = function(selector, keepData) {
            if (!keepData) {
                var subject = this;
                if (selector)
                    subject = subject.filter(selector);
                cleanKoData(subject, true)
            }
            return originalRemove.call(this, selector, keepData)
        };
        var originalHtml = $.fn.html;
        $.fn.html = function(value) {
            if (typeof value === "string")
                cleanKoData(this, false);
            return originalHtml.apply(this, arguments)
        };
        $.extend(ui, {
            Component: KoComponent,
            registerComponent: registerKoComponent,
            TemplateProvider: KoTemplateProvider,
            Template: KoTemplate,
            defaultTemplate: defaultKoTemplate
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.angularIntegration.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var angular = window.angular,
            ui = DevExpress.ui,
            compileSetter = DX.data.utils.compileSetter,
            compileGetter = DX.data.utils.compileGetter;
        var CREATED_WITH_NG_DATA_KEY = "dxNgCreation",
            TEMPLATES_DATA_KEY = "dxTemplates",
            COMPILER_DATA_KEY = "dxNgCompiler",
            DEFAULT_COMPILER_DATA_KEY = "dxDefaultCompilerGetter",
            ANONYMOUS_TEMPLATE_NAME = "template";
        var phoneJsModule = angular.module("dx", []);
        var ComponentBuilder = DX.Class.inherit({
                ctor: function(options) {
                    this._componentName = options.componentName;
                    this._compile = options.compile;
                    this._$element = options.$element;
                    this._componentDisposing = $.Callbacks();
                    this._$templates = this._extractTemplates()
                },
                init: function(options) {
                    this._scope = options.scope;
                    this._$element = options.$element;
                    this._ngOptions = options.ngOptions;
                    this._$element.data(CREATED_WITH_NG_DATA_KEY, true);
                    if (options.ngOptions.data)
                        this._initDataScope(options.ngOptions.data)
                },
                initDefaultCompilerGetter: function() {
                    var self = this;
                    self._$element.data(DEFAULT_COMPILER_DATA_KEY, function($template) {
                        return self._compilerByTemplate($template)
                    })
                },
                initTemplateCompilers: function() {
                    var self = this;
                    if (this._$templates)
                        this._$templates.each(function(i, template) {
                            $(template).data(COMPILER_DATA_KEY, self._compilerByTemplate(template))
                        })
                },
                initComponentWithBindings: function() {
                    this._initComponent(this._scope);
                    this._initComponentBindings()
                },
                _initDataScope: function(data) {
                    if (typeof data === "string") {
                        var dataStr = data,
                            rootScope = this._scope;
                        data = rootScope.$eval(data);
                        this._scope = rootScope.$new();
                        this._synchronizeDataScopes(rootScope, this._scope, data, dataStr)
                    }
                    $.extend(this._scope, data)
                },
                _synchronizeDataScopes: function(parentScope, childScope, data, parentPrefix) {
                    var self = this;
                    $.each(data, function(fieldPath) {
                        self._synchronizeScopeField({
                            parentScope: parentScope,
                            childScope: childScope,
                            fieldPath: fieldPath,
                            parentPrefix: parentPrefix
                        })
                    })
                },
                _initComponent: function(scope) {
                    this._component = this._$element[this._componentName](this._evalOptions(scope)).data(this._componentName)
                },
                _initComponentBindings: function() {
                    var self = this,
                        optionDependencies = {};
                    if (self._ngOptions.bindingOptions)
                        $.each(self._ngOptions.bindingOptions, function(optionPath, valuePath) {
                            var separatorIndex = optionPath.search(/\[|\./),
                                optionForSubscribe = separatorIndex > -1 ? optionPath.substring(0, separatorIndex) : optionPath;
                            if (!optionDependencies[optionForSubscribe])
                                optionDependencies[optionForSubscribe] = {};
                            optionDependencies[optionForSubscribe][optionPath] = valuePath;
                            var clearWatcher = self._scope.$watch(valuePath, function(newValue, oldValue) {
                                    if (newValue !== oldValue)
                                        self._component.option(optionPath, newValue)
                                }, true);
                            self._component.disposing.add(function() {
                                clearWatcher();
                                self._componentDisposing.fire()
                            })
                        });
                    self._component.optionChanged.add(function(optionName, optionValue) {
                        if (self._scope.$root.$$phase || !optionDependencies || !optionDependencies[optionName])
                            return;
                        self._scope.$apply(function() {
                            $.each(optionDependencies[optionName], function(optionPath, valuePath) {
                                var setter = compileSetter(valuePath),
                                    getter = compileGetter(optionPath);
                                var tmpData = {};
                                tmpData[optionName] = optionValue;
                                setter(self._scope, getter(tmpData))
                            })
                        })
                    })
                },
                _extractTemplates: function() {
                    var $templates;
                    if (ui[this._componentName].subclassOf(ui.Widget) && $.trim(this._$element.html())) {
                        var isAnonymousTemplate = !this._$element.children().first().attr("data-options");
                        if (isAnonymousTemplate)
                            $templates = $("<div/>").attr("data-options", "dxTemplate: { name: '" + ANONYMOUS_TEMPLATE_NAME + "' }").append(this._$element.contents());
                        else
                            $templates = this._$element.children().detach();
                        this._$element.data(TEMPLATES_DATA_KEY, $templates)
                    }
                    return $templates
                },
                _compilerByTemplate: function(template) {
                    var self = this,
                        scopeItemsPath = this._getScopeItemsPath();
                    return function(data, index) {
                            var $resultMarkup = $(template).clone(),
                                templateScope;
                            if (data !== undefined) {
                                var dataIsScope = data.$id,
                                    templateScope = dataIsScope ? data : self._createScopeWithData(data);
                                $resultMarkup.on("$destroy", function() {
                                    var destroyAlreadyCalled = !templateScope.$parent;
                                    if (destroyAlreadyCalled)
                                        return;
                                    templateScope.$destroy()
                                })
                            }
                            else
                                templateScope = self._scope;
                            if (scopeItemsPath)
                                self._synchronizeScopes(templateScope, scopeItemsPath, index);
                            safeApply(self._compile($resultMarkup), templateScope);
                            return $resultMarkup
                        }
                },
                _getScopeItemsPath: function() {
                    if (ui[this._componentName].subclassOf(ui.CollectionContainerWidget) && this._ngOptions.bindingOptions)
                        return this._ngOptions.bindingOptions.items
                },
                _createScopeWithData: function(data) {
                    var newScope = this._scope.$new();
                    if (typeof data === "object")
                        $.extend(newScope, data);
                    else
                        newScope.scopeValue = data;
                    return newScope
                },
                _synchronizeScopes: function(itemScope, parentPrefix, itemIndex) {
                    var self = this,
                        item = compileGetter(parentPrefix + "[" + itemIndex + "]")(this._scope);
                    if (!$.isPlainObject(item))
                        item = {scopeValue: item};
                    $.each(item, function(itemPath) {
                        self._synchronizeScopeField({
                            parentScope: self._scope,
                            childScope: itemScope,
                            fieldPath: itemPath,
                            parentPrefix: parentPrefix,
                            itemIndex: itemIndex
                        })
                    })
                },
                _synchronizeScopeField: function(args) {
                    var parentScope = args.parentScope,
                        childScope = args.childScope,
                        fieldPath = args.fieldPath,
                        parentPrefix = args.parentPrefix,
                        itemIndex = args.itemIndex;
                    var innerPathSuffix = fieldPath === "scopeValue" ? "" : "." + fieldPath,
                        collectionField = itemIndex !== undefined,
                        optionOuterBag = [parentPrefix],
                        optionOuterPath;
                    if (collectionField)
                        optionOuterBag.push("[", itemIndex, "]");
                    optionOuterBag.push(innerPathSuffix);
                    optionOuterPath = optionOuterBag.join("");
                    var clearParentWatcher = parentScope.$watch(optionOuterPath, function(newValue, oldValue) {
                            if (newValue !== oldValue)
                                compileSetter(fieldPath)(childScope, newValue)
                        });
                    var clearItemWatcher = childScope.$watch(fieldPath, function(newValue, oldValue) {
                            if (newValue !== oldValue) {
                                if (collectionField && !compileGetter(parentPrefix)(parentScope)[itemIndex]) {
                                    clearItemWatcher();
                                    return
                                }
                                compileSetter(optionOuterPath)(parentScope, newValue)
                            }
                        });
                    this._componentDisposing.add([clearParentWatcher, clearItemWatcher])
                },
                _evalOptions: function(scope) {
                    var result = $.extend({}, this._ngOptions);
                    delete result.data;
                    delete result.bindingOptions;
                    if (this._ngOptions.bindingOptions)
                        $.each(this._ngOptions.bindingOptions, function(key, value) {
                            result[key] = scope.$eval(value)
                        });
                    return result
                }
            });
        var safeApply = function(func, scope) {
                if (scope.$root.$$phase)
                    func(scope);
                else
                    scope.$apply(function() {
                        func(scope)
                    })
            };
        var NgComponent = ui.Component.inherit({
                _modelByElement: function(element) {
                    if (element.length)
                        return element.scope()
                },
                _createActionByOption: function() {
                    var action = this.callBase.apply(this, arguments);
                    var component = this,
                        wrappedAction = function() {
                            var self = this,
                                scope = component._modelByElement(component._element()),
                                args = arguments;
                            if (!scope || scope.$root.$$phase)
                                return action.apply(self, args);
                            return scope.$apply(function() {
                                    return action.apply(self, args)
                                })
                        };
                    return wrappedAction
                }
            });
        var originalRegisterComponent = ui.registerComponent;
        var registerNgComponent = function(componentName, componentClass) {
                originalRegisterComponent(componentName, componentClass);
                phoneJsModule.directive(componentName, ["$compile", function(compile) {
                        return {
                                restrict: "A",
                                compile: function($element) {
                                    var componentBuilder = new ComponentBuilder({
                                            componentName: componentName,
                                            compile: compile,
                                            $element: $element
                                        });
                                    return function(scope, $element, attrs) {
                                            componentBuilder.init({
                                                scope: scope,
                                                $element: $element,
                                                ngOptions: attrs[componentName] ? scope.$eval(attrs[componentName]) : {}
                                            });
                                            componentBuilder.initTemplateCompilers();
                                            componentBuilder.initDefaultCompilerGetter();
                                            componentBuilder.initComponentWithBindings()
                                        }
                                }
                            }
                    }])
            };
        var NgTemplate = ui.Template.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._compiler = this._template.data(COMPILER_DATA_KEY)
                },
                render: function(container, data, index) {
                    var compiler = this._compiler,
                        result = $.isFunction(compiler) ? compiler(data, index) : compiler;
                    container.append(result);
                    return result
                },
                setCompiler: function(compilerGetter) {
                    this._compiler = compilerGetter(this._element)
                }
            });
        var NgTemplateProvider = ui.TemplateProvider.inherit({
                getTemplateClass: function(widget) {
                    if (this._createdWithNg(widget))
                        return NgTemplate;
                    return this.callBase(widget)
                },
                supportDefaultTemplate: function(widget) {
                    return this._createdWithNg(widget) ? true : this.callBase(widget)
                },
                getDefaultTemplate: function(widget) {
                    if (this._createdWithNg(widget)) {
                        var compilerGetter = widget._element().data(DEFAULT_COMPILER_DATA_KEY),
                            template = defaultNgTemplate(widget.NAME);
                        template.setCompiler(compilerGetter);
                        return template
                    }
                },
                _createdWithNg: function(widget) {
                    return !!widget._element().data(CREATED_WITH_NG_DATA_KEY)
                }
            });
        var defaultNgTemplate = function() {
                var cache = {};
                return function(widgetName) {
                        if (!DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName])
                            widgetName = "base";
                        if (!cache[widgetName])
                            cache[widgetName] = DEFAULT_ITEM_TEMPLATE_GENERATORS[widgetName]();
                        return new NgTemplate(cache[widgetName])
                    }
            }();
        var baseElements = {
                container: function() {
                    return $("<div/>").attr("ng-class", "{ 'dx-state-invisible': !visible && visible != undefined, 'dx-state-disabled': !!disabled }").attr("ng-switch", "").attr("on", "html && 'html' || text && 'text' || scopeValue && 'scopeValue'")
                },
                html: function() {
                    return $("<div/>").attr("ng-switch-when", "html").attr("ng-bind-html-unsafe", "html")
                },
                text: function() {
                    return $("<div/>").attr("ng-switch-when", "text").attr("ng-bind", "text")
                },
                primitive: function() {
                    return $("<div/>").attr("ng-switch-when", "scopeValue").attr("ng-bind-html-unsafe", "'' + scopeValue")
                }
            };
        var DEFAULT_ITEM_TEMPLATE_GENERATORS = {base: function() {
                    return baseElements.container().append(baseElements.html()).append(baseElements.text()).append(baseElements.primitive())
                }};
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxList = function() {
            return DEFAULT_ITEM_TEMPLATE_GENERATORS.base().attr("on", "html && 'html' || text && 'text' || scopeValue && 'scopeValue' || key && 'key'").append($("<div/>").attr("ng-switch-when", "key").attr("ng-bind", "key"))
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxToolbar = function() {
            var template = DEFAULT_ITEM_TEMPLATE_GENERATORS.base().attr("on", "html && 'html' || text && 'text' || scopeValue && 'scopeValue' || widget");
            $.each(["button", "tabs", "dropDownMenu"], function(i, widgetName) {
                var bindingName = "dx-" + DX.inflector.dasherize(this);
                $("<div/>").attr("ng-switch-when", widgetName).attr(bindingName, "options").appendTo(template)
            });
            return template
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxGallery = function() {
            return baseElements.container().append(baseElements.html()).append(baseElements.text()).append($("<img/>").attr("ng-switch-when", "scopeValue").attr("ng-src", "{{'' + scopeValue}}"))
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs = function() {
            var container = baseElements.container().attr("on", "html && 'html' ||  icon && 'icon' ||  iconSrc && 'iconSrc' ||  text && 'text' || scopeValue && 'scopeValue'");
            var text = $("<span/>").addClass("dx-tab-text").attr("ng-bind", "text"),
                icon = $("<span/>").attr("ng-switch-when", "icon").addClass("dx-icon").attr("ng-class", "'dx-icon-' + icon").add(text.attr("ng-switch-when", "icon")),
                iconSrc = $("<img/>").attr("ng-switch-when", "iconSrc").addClass("dx-icon").attr("ng-src", "{{iconSrc}}").add(text.attr("ng-switch-when", "iconSrc"));
            return container.append(baseElements.html()).append(icon).append(iconSrc).append(text.attr("ng-switch-when", "text")).append(baseElements.primitive())
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxActionSheet = function() {
            return $("<div/>").attr("dx-button", "{ bindingOptions: { text: 'text', clickAction: 'clickAction', type: 'type', disabled: 'disabled' } }")
        };
        DEFAULT_ITEM_TEMPLATE_GENERATORS.dxNavBar = DEFAULT_ITEM_TEMPLATE_GENERATORS.dxTabs;
        $.extend(ui, {
            Component: NgComponent,
            registerComponent: registerNgComponent,
            Template: NgTemplate,
            TemplateProvider: NgTemplateProvider
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.widget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            UI_FEEDBACK = "UIFeedback",
            UI_FEEDBACK_CLASS = "dx-feedback",
            ACTIVE_STATE_CLASS = "dx-state-active",
            DISABLED_STATE_CLASS = "dx-state-disabled",
            INVISIBLE_STATE_CLASS = "dx-state-invisible",
            FEEDBACK_SHOW_TIMEOUT = 30,
            FEEDBACK_HIDE_TIMEOUT = 400;
        var activeElement,
            events = ui.events;
        ui.feedback = {reset: function() {
                handleEnd(true)
            }};
        ui.Widget = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        visible: true,
                        activeStateEnabled: true,
                        width: undefined,
                        height: undefined,
                        clickAction: null
                    })
            },
            _init: function() {
                this.callBase();
                this._feedbackShowTimeout = FEEDBACK_SHOW_TIMEOUT;
                this._feedbackHideTimeout = FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-widget");
                this._renderDisabledState();
                this._toggleVisibility(this.option("visible"));
                this._refreshFeedback();
                this._renderDimensions();
                this._renderClick()
            },
            _dispose: function() {
                this._clearTimers();
                if (activeElement && activeElement.closest(this._element()).length)
                    activeElement = null;
                this._clickAction = null;
                this.callBase()
            },
            _clean: function() {
                this.callBase();
                this._element().empty()
            },
            _clearTimers: function() {
                clearTimeout(this._feedbackHideTimer);
                clearTimeout(this._feedbackShowTimer)
            },
            _toggleVisibility: function(visible) {
                this._element().toggleClass(INVISIBLE_STATE_CLASS, !visible)
            },
            _renderDimensions: function() {
                var width = this.option("width"),
                    height = this.option("height");
                this._element().width(width);
                this._element().height(height)
            },
            _refreshFeedback: function() {
                if (this._feedbackDisabled()) {
                    this._feedbackOff();
                    this._element().removeClass(UI_FEEDBACK_CLASS)
                }
                else
                    this._element().addClass(UI_FEEDBACK_CLASS)
            },
            _renderClick: function() {
                var self = this,
                    eventName = events.addNamespace("dxclick", this.NAME);
                this._clickAction = this._createActionByOption("clickAction");
                this._clickEventContainer().off(eventName).on(eventName, function(e) {
                    self._clickAction({jQueryEvent: e})
                })
            },
            _clickEventContainer: function() {
                return this._element()
            },
            _feedbackDisabled: function() {
                return !this.option("activeStateEnabled") || this.option("disabled")
            },
            _feedbackOn: function(element, immediate) {
                if (this._feedbackDisabled())
                    return;
                this._clearTimers();
                if (immediate)
                    this._feedbackShow(element);
                else
                    this._feedbackShowTimer = window.setTimeout($.proxy(this._feedbackShow, this, element), this._feedbackShowTimeout);
                this._saveActiveElement()
            },
            _feedbackShow: function(element) {
                var activeStateElement = this._element();
                if (this._activeStateUnit)
                    activeStateElement = $(element).closest(this._activeStateUnit);
                if (!activeStateElement.hasClass(DISABLED_STATE_CLASS))
                    activeStateElement.addClass(ACTIVE_STATE_CLASS)
            },
            _saveActiveElement: function() {
                activeElement = this._element()
            },
            _feedbackOff: function(immediate) {
                this._clearTimers();
                if (immediate)
                    this._feedbackHide();
                else
                    this._feedbackHideTimer = window.setTimeout($.proxy(this._feedbackHide, this), this._feedbackHideTimeout)
            },
            _feedbackHide: function() {
                var activeStateElement = this._element();
                if (this._activeStateUnit)
                    activeStateElement = activeStateElement.find(this._activeStateUnit);
                activeStateElement.removeClass(ACTIVE_STATE_CLASS);
                this._clearActiveElement()
            },
            _clearActiveElement: function() {
                var rootDomElement = this._element().get(0),
                    activeDomElement = activeElement && activeElement.get(0);
                if (activeDomElement && (activeDomElement === rootDomElement || $.contains(rootDomElement, activeDomElement)))
                    activeElement = null
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"disabled":
                        this._renderDisabledState();
                        this._refreshFeedback();
                        break;
                    case"activeStateEnabled":
                        this._refreshFeedback();
                        break;
                    case"visible":
                        this._toggleVisibility(value);
                        break;
                    case"width":
                    case"height":
                        this._renderDimensions();
                        break;
                    case"clickAction":
                        this._renderClick();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _renderDisabledState: function() {
                this._element().toggleClass(DISABLED_STATE_CLASS, this.option("disabled"))
            },
            repaint: function() {
                this._refresh()
            }
        });
        var handleStart = function(args, immediate) {
                var e = args.jQueryEvent,
                    $target = args.element;
                if (events.needSkipEvent(e))
                    return;
                if (activeElement)
                    getWidget(activeElement)._feedbackOff(true);
                var closestFeedbackElement = $target.closest("." + UI_FEEDBACK_CLASS),
                    widget;
                if (closestFeedbackElement.length) {
                    widget = getWidget(closestFeedbackElement);
                    widget._feedbackOn($target, immediate);
                    if (immediate)
                        widget._feedbackOff()
                }
            };
        var handleEnd = function(immediate) {
                if (!activeElement)
                    return;
                getWidget(activeElement)._feedbackOff(immediate)
            };
        var getWidget = function(widgetElement) {
                var result;
                $.each(widgetElement.data("dxComponents"), function(index, componentName) {
                    if (ui[componentName].subclassOf(ui.Widget)) {
                        result = widgetElement.data(componentName);
                        return false
                    }
                });
                return result
            };
        $(function() {
            var startAction = new DX.Action(handleStart);
            $(document).on(events.addNamespace("dxpointerdown", UI_FEEDBACK), function(e) {
                startAction.execute({
                    jQueryEvent: e,
                    element: $(e.target)
                })
            }).on(events.addNamespace("dxpointerup dxpointercancel", UI_FEEDBACK), function(e) {
                var activeElementClicked = activeElement && $(e.target).closest("." + UI_FEEDBACK_CLASS).get(0) === activeElement.get(0);
                if (activeElementClicked)
                    startAction.execute({
                        jQueryEvent: e,
                        element: $(e.target)
                    }, true);
                handleEnd()
            })
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.containerWidget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            ANONYMOUS_TEMPLATE_NAME = "template",
            TEMPLATE_SELECTOR = "[data-options]",
            TEMPLATES_DATA_KEY = "dxTemplates";
        var getTemplateOptions = function(element) {
                var options = $(element).data("options");
                if ($.trim(options).charAt(0) !== "{")
                    options = "{" + options + "}";
                return new Function("return " + options)().dxTemplate
            };
        var ContainerWidget = ui.Widget.inherit({
                _defaultOptions: function() {
                    return $.extend(this.callBase(), {contentReadyAction: $.noop})
                },
                _init: function() {
                    this.callBase();
                    this._templateProvider = new ui.TemplateProvider;
                    this._initTemplates();
                    this._initContentReadyAction()
                },
                _clean: $.noop,
                _createTemplate: function(element) {
                    return new(this._templateProvider.getTemplateClass(this))(element)
                },
                _initTemplates: function() {
                    var self = this,
                        templates = {},
                        dataTemplateElements = this._element().data(TEMPLATES_DATA_KEY),
                        templateElements = dataTemplateElements ? dataTemplateElements : this._element().contents().filter(TEMPLATE_SELECTOR);
                    if (templateElements.length)
                        templateElements.each(function() {
                            var templateOptions = getTemplateOptions(this);
                            if (!templateOptions.name)
                                throw Error("Template name was not specified");
                            templates[templateOptions.name] = self._createTemplate(this)
                        });
                    else
                        templates[ANONYMOUS_TEMPLATE_NAME] = self._createTemplate(self._element().contents());
                    this._templates = templates
                },
                _initContentReadyAction: function() {
                    this._contentReadyAction = this._createActionByOption("contentReadyAction")
                },
                _render: function() {
                    this.callBase();
                    this._renderContent()
                },
                _renderContent: function() {
                    this._renderContentImpl();
                    this._fireContentReadyAction()
                },
                _renderContentImpl: DX.abstract,
                _fireContentReadyAction: function() {
                    this._contentReadyAction({
                        isDisabledResistant: true,
                        isGesture: true
                    })
                },
                _getTemplate: function(templateName) {
                    var result = this._acquireTemplate.apply(this, arguments);
                    if (!result && this._templateProvider.supportDefaultTemplate(this)) {
                        result = this._templateProvider.getDefaultTemplate(this);
                        if (!result)
                            throw Error(DX.utils.stringFormat("Template \"{0}\" was not found and no default template specified!", templateName));
                    }
                    return result
                },
                _acquireTemplate: function(templateSource) {
                    if (!templateSource)
                        return templateSource;
                    if (templateSource.nodeType || templateSource.jquery) {
                        templateSource = $(templateSource);
                        if (templateSource.is("script"))
                            templateSource = templateSource.html();
                        return this._createTemplate(templateSource)
                    }
                    if ($.isFunction(templateSource)) {
                        var args = $.makeArray(arguments).slice(1);
                        return this._acquireTemplate(templateSource.apply(this, args))
                    }
                    if (typeof templateSource === "string")
                        return this._templates[templateSource]
                },
                _optionChanged: function(name) {
                    switch (name) {
                        case"contentReadyAction":
                            this._initContentReadyAction();
                            break;
                        default:
                            this.callBase.apply(this, arguments)
                    }
                },
                _cleanTemplates: function() {
                    $.each(this._templates, function(templateName, template) {
                        template.dispose()
                    })
                },
                _dispose: function() {
                    this._cleanTemplates();
                    this._contentReadyAction = null;
                    this.callBase()
                },
                addTemplate: function(template) {
                    $.extend(this._templates, template)
                }
            });
        ui.ContainerWidget = ContainerWidget
    })(jQuery, DevExpress);
    /*! Module core, file ui.template.js */
    (function($, DX, undefined) {
        var isString = DX.utils.isString;
        var currentTemplateEngine;
        var templateEngines = [];
        var BaseTemplate = DevExpress.Class.inherit({
                _compile: function(html, element) {
                    return element
                },
                _render: function(template, data) {
                    return template
                },
                ctor: function(element) {
                    this._element = $(element);
                    if (this._element.length === 1) {
                        if (this._element[0].nodeName.toLowerCase() !== "script")
                            this._element = $("<div />").append(this._element);
                        this._template = this._compile(this._element.html() || "", this._element)
                    }
                },
                render: function(container, data) {
                    var result;
                    if (this._template) {
                        result = this._render(this._template, data);
                        if (isString(result))
                            result = $.parseHTML(result);
                        result = $(result);
                        if (container)
                            container.append(result);
                        return result
                    }
                },
                dispose: $.noop
            });
        var createTemplateEngine = function(options) {
                if (options && options.compile && options.render)
                    return BaseTemplate.inherit({
                            allowRenderToDetachedContainer: options.allowRenderToDetachedContainer !== false,
                            _compile: options.compile,
                            _render: options.render
                        });
                else
                    throw Error("Template Engine must contains compile and render methods");
            };
        if (window.ko) {
            var koCustomTemplateEngine = function(){};
            koCustomTemplateEngine.prototype = ko.utils.extend(new ko.templateEngine, {
                renderTemplateSource: function(templateSource, bindingContext, options) {
                    var precompiledTemplate = templateSource["data"]("precompiledTemplate");
                    if (!precompiledTemplate) {
                        precompiledTemplate = new currentTemplateEngine(templateSource.domElement);
                        templateSource["data"]("precompiledTemplate", precompiledTemplate)
                    }
                    return precompiledTemplate.render(null, bindingContext.$data)
                },
                allowTemplateRewriting: false
            })
        }
        DevExpress.ui.setTemplateEngine = function(templateEngine) {
            if (isString(templateEngine)) {
                currentTemplateEngine = templateEngines && templateEngines[templateEngine];
                if (!currentTemplateEngine && templateEngine !== "default")
                    throw Error(DX.utils.stringFormat("Template Engine \"{0}\" is not supported", templateEngine));
            }
            else
                currentTemplateEngine = createTemplateEngine(templateEngine) || currentTemplateEngine;
            if (window.ko)
                ko.setTemplateEngine(currentTemplateEngine ? new koCustomTemplateEngine : new ko.nativeTemplateEngine)
        };
        DevExpress.ui.TemplateProvider = DevExpress.ui.TemplateProvider.inherit({getTemplateClass: function() {
                if (currentTemplateEngine)
                    return currentTemplateEngine;
                return this.callBase.apply(this, arguments)
            }});
        var registerTemplateEngine = function(name, templateOptions) {
                templateEngines[name] = createTemplateEngine(templateOptions)
            };
        registerTemplateEngine("jquery-tmpl", {
            compile: function(html, element) {
                return element
            },
            render: function(template, data) {
                return template.tmpl(data)
            }
        });
        registerTemplateEngine("jsrender", {
            compile: function(html) {
                return $.templates(html)
            },
            render: function(template, data) {
                return template.render(data)
            }
        });
        registerTemplateEngine("mustache", {
            compile: function(html) {
                return Mustache.compile(html)
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("hogan", {
            compile: function(html) {
                return Hogan.compile(html)
            },
            render: function(template, data) {
                return template.render(data)
            }
        });
        registerTemplateEngine("underscore", {
            compile: function(html) {
                return _.template(html)
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("handlebars", {
            compile: function(html) {
                return Handlebars.compile(html)
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("doT", {
            compile: function(html) {
                return doT.template(html)
            },
            render: function(template, data) {
                return template(data)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.collectionContainerWidget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var CollectionContainerWidget = ui.ContainerWidget.inherit({
                _defaultOptions: function() {
                    return $.extend(this.callBase(), {
                            items: [],
                            itemTemplate: "item",
                            itemRender: null,
                            itemClickAction: null,
                            itemRenderedAction: null,
                            noDataText: Globalize.localize("dxCollectionContainerWidget-noDataText"),
                            dataSource: null
                        })
                },
                _init: function() {
                    this.callBase();
                    this._cleanRenderedItems();
                    this._refreshDataSource()
                },
                _dataSourceOptions: function() {
                    var options = {
                            paginate: false,
                            _preferSync: false
                        };
                    if ($.isArray(this.option("dataSource")))
                        options._preferSync = true;
                    return options
                },
                _cleanRenderedItems: function() {
                    this._renderedItemsCount = 0
                },
                _optionChanged: function(name, value, prevValue) {
                    switch (name) {
                        case"items":
                            this._cleanRenderedItems();
                            this.callBase.apply(this, arguments);
                            return;
                        case"dataSource":
                            this._refreshDataSource();
                            if (!this._dataSource)
                                this.option("items", []);
                            return;
                        case"noDataText":
                            this._renderEmptyMessage();
                            return;
                        case"itemRenderedAction":
                            return;
                        default:
                            this.callBase(name, value, prevValue)
                    }
                },
                _expectNextPageLoading: function() {
                    this._isNextPageLoading = true
                },
                _forgetNextPageLoading: function() {
                    this._isNextPageLoading = false
                },
                _handleDataSourceChanged: function(newItems) {
                    var items = this.option("items");
                    if (this._initialized && items && this._shouldAppendItems()) {
                        this._renderedItemsCount = items.length;
                        this.option().items = items.concat(newItems);
                        this._renderContent()
                    }
                    else
                        this.option("items", newItems);
                    this._forgetNextPageLoading()
                },
                _handleDataSourceLoadError: function() {
                    this._forgetNextPageLoading()
                },
                _shouldAppendItems: function() {
                    return this._isNextPageLoading && this._allowDinamicItemsAppend()
                },
                _allowDinamicItemsAppend: function() {
                    return false
                },
                _clean: function() {
                    this._itemContainer().empty()
                },
                _refresh: function() {
                    this._cleanRenderedItems();
                    this.callBase.apply(this, arguments)
                },
                _itemContainer: function() {
                    return this._element()
                },
                _itemClass: DX.abstract,
                _itemSelector: function() {
                    return "." + this._itemClass()
                },
                _itemDataKey: DX.abstract,
                _itemElements: function() {
                    return this._itemContainer().find(this._itemSelector())
                },
                _render: function() {
                    this.callBase();
                    this._attachClickEvent()
                },
                _attachClickEvent: function() {
                    var itemSelector = this._itemSelector(),
                        eventName = events.addNamespace("dxclick", this.NAME);
                    this._itemContainer().off(eventName, itemSelector).on(eventName, itemSelector, $.proxy(this._handleItemClick, this))
                },
                _handleItemClick: function(e) {
                    this._handleItemJQueryEvent(e, "itemClickAction")
                },
                _renderContentImpl: function() {
                    var items = this.option("items") || [];
                    if (this._renderedItemsCount)
                        this._renderItems(items.slice(this._renderedItemsCount));
                    else
                        this._renderItems(items)
                },
                _renderItems: function(items) {
                    if (items.length)
                        $.each(items, $.proxy(this._renderItem, this));
                    this._renderEmptyMessage()
                },
                _renderItem: function(index, item, container) {
                    container = container || this._itemContainer();
                    var itemRenderer = this._getItemRenderer(),
                        itemTemplateName = this._getItemTemplateName(),
                        itemTemplate = this._getTemplate(item.template || itemTemplateName, index, item),
                        itemElement;
                    var renderArgs = {
                            index: index,
                            item: item,
                            container: container
                        };
                    if (itemRenderer)
                        itemElement = this._createItemByRenderer(itemRenderer, renderArgs);
                    else if (itemTemplate)
                        itemElement = this._createItemByTemplate(itemTemplate, renderArgs);
                    else
                        itemElement = this._createItemByRenderer(this._itemRenderDefault, renderArgs);
                    itemElement.addClass(this._itemClass()).data(this._itemDataKey(), item);
                    var postprocessRenderArgs = {
                            itemElement: itemElement,
                            itemData: item,
                            itemIndex: index
                        };
                    this._postprocessRenderItem(postprocessRenderArgs);
                    this._createActionByOption("itemRenderedAction", {element: this._element()})({
                        itemElement: itemElement,
                        itemData: item
                    });
                    return itemElement
                },
                _getItemRenderer: function() {
                    return this.option("itemRender")
                },
                _createItemByRenderer: function(itemRenderer, renderArgs) {
                    var itemElement = $("<div />").appendTo(renderArgs.container);
                    var rendererResult = itemRenderer.call(this, renderArgs.item, renderArgs.index, itemElement);
                    if (rendererResult && itemElement[0] !== rendererResult[0])
                        itemElement.append(rendererResult);
                    return itemElement
                },
                _getItemTemplateName: function() {
                    return this.option("itemTemplate")
                },
                _createItemByTemplate: function(itemTemplate, renderArgs) {
                    return itemTemplate.render(renderArgs.container, renderArgs.item, renderArgs.index)
                },
                _itemRenderDefault: function(item, index, itemElement) {
                    if ($.isPlainObject(item)) {
                        if (item.visible !== undefined && !item.visible)
                            itemElement.hide();
                        if (item.disabled)
                            itemElement.addClass("dx-state-disabled");
                        if (item.text)
                            itemElement.text(item.text);
                        if (item.html)
                            itemElement.html(item.html)
                    }
                    else
                        itemElement.html(String(item))
                },
                _postprocessRenderItem: $.noop,
                _renderEmptyMessage: function() {
                    var noDataText = this.option("noDataText"),
                        noDataTextElement = this._element().find(".dx-empty-message"),
                        items = this.option("items"),
                        itemExists = items && items.length;
                    if (!noDataText || itemExists || this._dataSource && this._dataSource.isLoading())
                        noDataTextElement.remove();
                    else {
                        if (!noDataTextElement.length)
                            noDataTextElement = $("<div />").addClass("dx-empty-message").appendTo(this._itemContainer());
                        noDataTextElement.text(noDataText)
                    }
                },
                _handleItemJQueryEvent: function(jQueryEvent, handlerOptionName, args) {
                    this._handleItemEvent(jQueryEvent.target, handlerOptionName, $.extend({jQueryEvent: jQueryEvent}, args))
                },
                _closestItemElement: function($element) {
                    return $($element).closest(this._itemSelector())
                },
                _handleItemEvent: function(initiator, handlerOptionName, eventArgs, actionArgs) {
                    var action = this._createActionByOption(handlerOptionName, $.extend({element: this._element()}, actionArgs)),
                        $itemElement = this._closestItemElement($(initiator));
                    actionArgs = $.extend({
                        itemElement: $itemElement,
                        itemData: this._getItemData($itemElement)
                    }, eventArgs);
                    return action(actionArgs)
                },
                _getItemData: function($itemElement) {
                    return $itemElement.data(this._itemDataKey())
                }
            }).include(ui.DataHelperMixin);
        ui.CollectionContainerWidget = CollectionContainerWidget
    })(jQuery, DevExpress);
    /*! Module core, file ui.selectableCollectionWidget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SelectableCollectionWidget = ui.CollectionContainerWidget.inherit({
                _defaultOptions: function() {
                    return $.extend(this.callBase(), {
                            selectedIndex: -1,
                            itemSelectAction: null
                        })
                },
                _render: function() {
                    this.callBase();
                    this._renderSelectedIndex(this.option("selectedIndex"));
                    this._attachSelectedEvent()
                },
                _attachSelectedEvent: $.noop,
                _handleItemSelect: function(args) {
                    var e = args.jQueryEvent,
                        instance = args.component;
                    if (events.needSkipEvent(e))
                        return;
                    var itemElements = instance._itemElements(),
                        selectedItemElement = $(e.target).closest(instance._itemSelector()),
                        selectedItemIndex = itemElements.index(selectedItemElement);
                    if (instance.option("selectedIndex") !== selectedItemIndex)
                        instance._onItemSelectAction(selectedItemIndex)
                },
                _onItemSelectAction: function(newIndex) {
                    this.option("selectedIndex", newIndex)
                },
                _renderSelectedIndex: DX.abstract,
                _renderEmptyMessage: $.noop,
                _optionChanged: function(name, value, prevValue) {
                    if (name === "selectedIndex") {
                        this._renderSelectedIndex(value, prevValue);
                        this._handleItemEvent(this._selectedItemElement(value), "itemSelectAction", null)
                    }
                    else
                        this.callBase.apply(this, arguments)
                },
                _selectedItemElement: function(index) {
                    return this._itemElements().eq(index)
                }
            });
        ui.SelectableCollectionWidget = SelectableCollectionWidget
    })(jQuery, DevExpress);
    /*! Module core, file ui.optionsByDevice.js */
    (function($, DX, undefined) {
        var isEmulationMode = function(device) {
                return DX.devices.real.platform !== device.platform || device.platform === "generic" || DX.devices.isRippleEmulator()
            };
        var optionConfigurator = {};
        optionConfigurator.dxActionSheet = function(device) {
            if (device.platform === "ios" && device.tablet)
                return {usePopover: true}
        };
        optionConfigurator.dxScrollable = function(device) {
            var realDevice = DX.devices.real;
            var isOldAndroid = realDevice.platform === "android" && realDevice.version.length && realDevice.version[0] < 4;
            if (device.platform === "tizen" || isOldAndroid || isEmulationMode(device) && device.platform !== "desktop")
                return {
                        useNative: false,
                        useSimulatedScrollBar: true
                    };
            else if (device.platform === "android")
                return {useSimulatedScrollBar: true}
        };
        optionConfigurator.dxScrollView = function(device) {
            var result = optionConfigurator.dxScrollable(device) || {};
            if (device.platform === "ios" || device.platform === "desktop" || device.platform === "generic")
                $.extend(result, {refreshStrategy: "pullDown"});
            if (device.platform === "android")
                $.extend(result, {refreshStrategy: "swipeDown"});
            if (device.platform === "win8")
                $.extend(result, {refreshStrategy: "slideDown"});
            return result
        };
        optionConfigurator.dxList = function(device) {
            var result = optionConfigurator.dxScrollable(device) || {};
            if (device.platform === "desktop")
                $.extend(result, {
                    showScrollbar: false,
                    showNextButton: true,
                    autoPagingEnabled: false,
                    editConfig: {selectionMode: "control"}
                });
            if (device.platform === "ios")
                $.extend(result, {editConfig: {deleteMode: device.version == 7 ? "slideItem" : "slideButton"}});
            if (device.platform === "android")
                $.extend(result, {editConfig: {deleteMode: "swipe"}});
            if (device.platform === "win8")
                $.extend(result, {editConfig: {deleteMode: "hold"}});
            if (device.platform === "generic")
                $.extend(result, {editConfig: {deleteMode: "slideItem"}});
            return result
        };
        optionConfigurator.dxPopup = function(device) {
            if (device.platform === "win8" && !device.phone)
                return {
                        width: "60%",
                        height: "auto"
                    };
            if (device.platform === "win8" && device.phone)
                return {position: {
                            my: "top center",
                            at: "top center",
                            of: window,
                            offset: "0 20"
                        }};
            if (device.platform === "ios")
                return {animation: {
                            show: {
                                type: "slide",
                                duration: 400,
                                from: {top: $("body").height()},
                                to: {top: 0}
                            },
                            hide: {
                                type: "slide",
                                duration: 400,
                                from: {top: 0},
                                to: {top: $("body").height()}
                            }
                        }}
        };
        optionConfigurator.dxDialog = function(device) {
            if (device.platform === "ios")
                return {width: 276};
            if (device.platform === "win8" && !device.phone)
                return {width: "60%"};
            if (device.platform === "android")
                return {
                        lWidth: "60%",
                        pWidth: "80%"
                    }
        };
        optionConfigurator.dxLookup = function(device) {
            if (device.platform === "android")
                return {hideCancelButton: false};
            if (device.platform === "win8" && device.phone)
                return {
                        showCancelButton: false,
                        fullScreen: true
                    };
            if (device.platform === "ios" && device.phone)
                return {fullScreen: true};
            if (device.platform === "ios" && device.tablet)
                return {usePopover: true}
        };
        optionConfigurator.dxLoadIndicator = function(device) {
            if (navigator.appName === "Microsoft Internet Explorer" || navigator.appName === "MSAppHost/1.0")
                return {viaImage: true}
        };
        optionConfigurator.dxDatePicker = function(device) {
            if (device.platform !== "win8")
                return {
                        width: 333,
                        height: 280
                    };
            else
                return {showNames: true}
        };
        optionConfigurator.dxDateBox = function(device) {
            if (device.android || device.win8)
                return {useNativePicker: false}
        };
        optionConfigurator.dxDropDownMenu = function(device) {
            if (device.platform === "ios")
                return {usePopover: true}
        };
        optionConfigurator.dxToast = function(device) {
            if (device.platform === "win8")
                return {
                        position: {
                            my: "top center",
                            at: "top center",
                            of: window,
                            offset: "0 0"
                        },
                        width: function() {
                            return $(window).width()
                        },
                        heigth: "35px"
                    }
        };
        optionConfigurator.dxToolbar = function(device) {
            if (device.platform === "ios")
                return {submenuType: "dxActionSheet"};
            if (device.platform === "win8")
                return {submenuType: "dxList"};
            if (device.platform === "android")
                return {submenuType: "dxDropDownMenu"}
        };
        DX.ui.optionsByDevice = function(device, componentName) {
            var configurator = optionConfigurator[componentName];
            return configurator && configurator(device)
        }
    })(jQuery, DevExpress)
}
if (!DevExpress.MOD_WIDGETS) {
    if (!window.DevExpress)
        throw Error('Required module is not referenced: core');
    /*! Module widgets, file ui.scrollable.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var SCROLLABLE = "dxScrollable",
            SCROLLABLE_CLASS = "dx-scrollable",
            SCROLLABLE_DISABLED_CLASS = "dx-scrollable-disabled",
            SCROLLABLE_CONTAINER_CLASS = "dx-scrollable-container",
            SCROLLABLE_CONTENT_CLASS = "dx-scrollable-content",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            BOTH = "both";
        ui.registerComponent(SCROLLABLE, ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        scrollAction: null,
                        direction: VERTICAL,
                        showScrollbar: true,
                        useNative: true,
                        updateAction: null,
                        useSimulatedScrollBar: false,
                        inertiaEnabled: true,
                        bounceEnabled: true,
                        startAction: null,
                        endAction: null,
                        bounceAction: null,
                        stopAction: null
                    })
            },
            _init: function() {
                this.callBase();
                this._initMarkup();
                this._attachWindowResizeCallback();
                this._attachNativeScrollbarsCustomizationCss()
            },
            _initMarkup: function() {
                var $element = this._element().addClass(SCROLLABLE_CLASS),
                    $container = this._$container = $("<div>").addClass(SCROLLABLE_CONTAINER_CLASS),
                    $content = this._$content = $("<div>").addClass(SCROLLABLE_CONTENT_CLASS);
                $content.append($element.contents()).appendTo($container);
                $container.appendTo($element)
            },
            _attachWindowResizeCallback: function() {
                var self = this;
                self._windowResizeCallback = function() {
                    self.update()
                };
                DX.utils.windowResizeCallbacks.add(self._windowResizeCallback)
            },
            _attachNativeScrollbarsCustomizationCss: function() {
                if (!(navigator.platform.indexOf('Mac') > -1 && DevExpress.browser['webkit']))
                    this._element().addClass("dx-scrollable-customizable-scrollbars")
            },
            _render: function() {
                this.callBase();
                this._renderDisabledState();
                this._renderDirection();
                this._createStrategy();
                this._createActions();
                this.update()
            },
            _renderDisabledState: function() {
                this._$element.toggleClass(SCROLLABLE_DISABLED_CLASS, this.option("disabled"))
            },
            _renderDirection: function() {
                this._element().removeClass("dx-scrollable-" + HORIZONTAL).removeClass("dx-scrollable-" + VERTICAL).removeClass("dx-scrollable-" + BOTH).addClass("dx-scrollable-" + this.option("direction"))
            },
            _createStrategy: function() {
                this._strategy = this.option("useNative") ? new ui.NativeScrollableStrategy(this) : new ui.SimulatedScrollableStrategy(this);
                this._strategy.render()
            },
            _createActions: function() {
                this._strategy.createActions()
            },
            _clean: function() {
                this._strategy.clean()
            },
            _dispose: function() {
                this._strategy.dispose();
                this._detachWindowResizeCallback();
                this.callBase()
            },
            _detachWindowResizeCallback: function() {
                DX.utils.windowResizeCallbacks.remove(this._windowResizeCallback)
            },
            _optionChanged: function(optionName) {
                switch (optionName) {
                    case"disabled":
                        this._renderDisabledState();
                        break;
                    case"startAction":
                    case"endAction":
                    case"stopAction":
                    case"updateAction":
                    case"scrollAction":
                    case"bounceAction":
                        this._createActions();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _location: function() {
                return this._strategy.location()
            },
            _normalizeLocation: function(location) {
                var direction = this.option("direction");
                return {
                        x: $.isPlainObject(location) ? -location.x || 0 : direction !== VERTICAL ? -location : 0,
                        y: $.isPlainObject(location) ? -location.y || 0 : direction !== HORIZONTAL ? -location : 0
                    }
            },
            content: function() {
                return this._$content
            },
            scrollOffset: function() {
                var location = this._location();
                return {
                        top: -location.top,
                        left: -location.left
                    }
            },
            clientHeight: function() {
                return this._$container.height()
            },
            scrollHeight: function() {
                return this.content().height()
            },
            clientWidth: function() {
                return this._$container.width()
            },
            scrollWidth: function() {
                return this.content().width()
            },
            update: function() {
                this._strategy.update();
                return $.Deferred().resolve().promise()
            },
            scrollBy: function(distance) {
                distance = this._normalizeLocation(distance);
                this._strategy.scrollBy(distance)
            },
            scrollTo: function(targetLocation) {
                targetLocation = this._normalizeLocation(targetLocation);
                var location = this._location();
                this.scrollBy({
                    x: location.left - targetLocation.x,
                    y: location.top - targetLocation.y
                })
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollbar.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var SCROLLBAR = "dxScrollbar",
            SCROLLABLE_SCROLLBAR_CLASS = "dx-scrollable-scrollbar",
            SCROLLABLE_SCROLL_CLASS = "dx-scrollable-scroll",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal";
        ui.registerComponent(SCROLLBAR, ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        direction: null,
                        visible: false,
                        activeStateEnabled: false
                    })
            },
            _init: function() {
                this._$thumb = $("<div>").addClass(SCROLLABLE_SCROLL_CLASS);
                this._element().addClass(SCROLLABLE_SCROLLBAR_CLASS).append(this._$thumb)
            },
            _render: function() {
                this.callBase();
                var direction = this.option("direction");
                this._element().addClass("dx-scrollbar-" + direction);
                this._dimension = direction === HORIZONTAL ? "width" : "height";
                this._prop = direction === HORIZONTAL ? "left" : "top"
            },
            _renderDimensions: function() {
                this._$thumb.height(this.option("height"));
                this._$thumb.width(this.option("width"))
            },
            _toggleVisibility: function(visible) {
                visible = visible && this._containerToContentRatio < 1;
                this._$thumb.toggleClass("dx-state-invisible", !visible)
            },
            moveTo: function(location) {
                if ($.isPlainObject(location))
                    location = location[this._prop] || 0;
                var scrollBarLocation = {};
                scrollBarLocation[this._prop] = this._calculateScrollBarPosition(location);
                DX.translator.move(this._$thumb, scrollBarLocation)
            },
            _calculateScrollBarPosition: function(location) {
                return -location * this._containerToContentRatio
            },
            update: function(containerSize, contentSize) {
                containerSize = this._normalizeSize(containerSize);
                contentSize = this._normalizeSize(contentSize);
                this._containerToContentRatio = containerSize / contentSize;
                var scrollSize = containerSize * this._containerToContentRatio;
                this.option(this._dimension, scrollSize)
            },
            _normalizeSize: function(size) {
                return $.isPlainObject(size) ? size[this._dimension] || 0 : size
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollable.native.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            abs = Math.abs;
        var SCROLLABLE_NATIVE = "dxNativeScrollable",
            SCROLLABLE_NATIVE_CLASS = "dx-scrollable-native",
            SCROLLABLE_SCROLLBAR_SIMULATED = "dx-scrollable-scrollbar-simulated",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            HIDE_SCROLLBAR_TIMOUT = 500,
            GESTURE_LOCK_KEY = "dxGesture";
        ui.NativeScrollableStrategy = DX.Class.inherit({
            ctor: function(scrollable) {
                this._init(scrollable);
                this._attachScrollHandler()
            },
            _init: function(scrollable) {
                this._component = scrollable;
                this._$element = scrollable._element();
                this._$container = scrollable._$container;
                this._$content = scrollable._$content;
                this.option = $.proxy(scrollable.option, scrollable);
                this._createActionByOption = $.proxy(scrollable._createActionByOption, scrollable);
                this._useSimulatedScrollBar = scrollable.option("useSimulatedScrollBar");
                this._direction = scrollable.option("direction")
            },
            _attachScrollHandler: function() {
                $(this._$container).on(events.addNamespace("scroll", SCROLLABLE_NATIVE), $.proxy(this._handleScroll, this))
            },
            render: function() {
                this._$element.addClass(SCROLLABLE_NATIVE_CLASS);
                this._$element.addClass(SCROLLABLE_NATIVE_CLASS + "-" + DX.devices.real.platform);
                this._renderScrollbar()
            },
            _renderScrollbar: function() {
                this._scrollbars = {};
                if (!this._useSimulatedScrollBar)
                    return;
                if (this._direction !== HORIZONTAL) {
                    var $scrollbarVertical = $("<div>").dxScrollbar({
                            direction: VERTICAL,
                            disable: this._useSimulatedScrollBar
                        }).appendTo(this._$element);
                    this._scrollbars[VERTICAL] = $scrollbarVertical.dxScrollbar("instance")
                }
                if (this._direction !== VERTICAL) {
                    var $scrollbarHorizontal = $("<div>").dxScrollbar({
                            direction: HORIZONTAL,
                            disable: this._useSimulatedScrollBar
                        }).appendTo(this._$element);
                    this._scrollbars[VERTICAL] = $scrollbarHorizontal.dxScrollbar("instance")
                }
                this._hideScrollbarTimeout = 0;
                this._$element.addClass(SCROLLABLE_SCROLLBAR_SIMULATED)
            },
            createActions: function() {
                this._scrollAction = this._createActionByOption("scrollAction");
                this._updateAction = this._createActionByOption("updateAction")
            },
            _createActionArgs: function() {
                return {
                        isGesture: true,
                        jQueryEvent: eventForUserAction,
                        scrollOffset: {
                            top: this._$container.scrollTop(),
                            left: this._$container.scrollLeft()
                        },
                        reachedLeft: false,
                        reachedRight: false,
                        reachedTop: false,
                        reachedBottom: false
                    }
            },
            clean: function() {
                this._cleanScrollbars()
            },
            _cleanScrollbars: function() {
                $.each(this._scrollbars, function() {
                    this._element().remove()
                })
            },
            dispose: function() {
                if (this === activeScrollable)
                    activeScrollable = null;
                clearTimeout(this._gestureEndTimer)
            },
            _handleScroll: function(e) {
                eventForUserAction = e;
                this._scrollAction(this._createActionArgs());
                this._moveScrollbars();
                this._treatNativeGesture()
            },
            _moveScrollbars: function() {
                var self = this;
                $.each(self._scrollbars, function() {
                    this.moveTo(self.location());
                    this.option("visible", true)
                });
                this._hideScrollbars()
            },
            _hideScrollbars: function() {
                var self = this;
                clearTimeout(self._hideScrollbarTimeout);
                self._hideScrollbarTimeout = setTimeout(function() {
                    $.each(self._scrollbars, function() {
                        this.option("visible", false)
                    })
                }, HIDE_SCROLLBAR_TIMOUT)
            },
            _treatNativeGesture: function() {
                this._prepareGesture();
                this._forgetGesture()
            },
            _prepareGesture: function() {
                if (this._gestureEndTimer) {
                    clearTimeout(this._gestureEndTimer);
                    this._gestureEndTimer = null
                }
                else
                    this._$element.data(GESTURE_LOCK_KEY, true);
                ui.feedback.reset()
            },
            _forgetGesture: function() {
                this._gestureEndTimer = setTimeout($.proxy(function() {
                    this._$element.data(GESTURE_LOCK_KEY, false);
                    this._gestureEndTimer = null
                }, this), 400)
            },
            location: function() {
                return {
                        left: -this._$container.scrollLeft(),
                        top: -this._$container.scrollTop()
                    }
            },
            update: function() {
                this._updateAction(this._createActionArgs());
                this._updateScrollbars()
            },
            _updateScrollbars: function() {
                if (!this._useSimulatedScrollBar)
                    return;
                var self = this,
                    containerSize = this._containerSize(),
                    contentSize = this._contentSize();
                $.each(self._scrollbars, function() {
                    this.update(containerSize, contentSize)
                })
            },
            _containerSize: function() {
                return {
                        height: this._$container.height(),
                        width: this._$container.width()
                    }
            },
            _contentSize: function() {
                return {
                        height: this._$content.height(),
                        width: this._$content.width()
                    }
            },
            _handleStart: $.noop,
            _handleMove: $.noop,
            _handleEnd: $.noop,
            scrollBy: function(distance) {
                var location = this.location();
                this._$container.scrollTop(-location.top - distance.y);
                this._$container.scrollLeft(-location.left - distance.x)
            }
        });
        var activeScrollable,
            eventForUserAction,
            startEventData = null;
        var GESTURE_LOCK_DISTANCE = 10;
        var closestScrollable = function(element) {
                var $closestScrollable = $(element).closest("." + SCROLLABLE_NATIVE_CLASS);
                if (!$closestScrollable.length)
                    return;
                var components = $closestScrollable.data("dxComponents"),
                    scrollable;
                $.each(components, function(index, componentName) {
                    var componentClass = ui[componentName];
                    if (componentClass === ui.dxScrollable || componentClass.subclassOf(ui.dxScrollable)) {
                        scrollable = $closestScrollable.data(componentName);
                        return false
                    }
                });
                return scrollable && scrollable.option("disabled") ? closestScrollable($closestScrollable.parent()) : scrollable._strategy
            };
        var reset = function() {
                activeScrollable = null
            };
        var handleStart = function(e) {
                if (events.needSkipEvent(e))
                    return;
                activeScrollable = closestScrollable(e.target);
                if (activeScrollable) {
                    activeScrollable._handleStart(e);
                    startEventData = events.eventData(e)
                }
            };
        var handleMove = function(e) {
                if (activeScrollable) {
                    e.originalEvent.isScrollingEvent = true;
                    activeScrollable._handleMove(e);
                    if (startEventData) {
                        var delta = events.eventDelta(startEventData, events.eventData(e));
                        if (abs(delta.x) > GESTURE_LOCK_DISTANCE || abs(delta.y) > GESTURE_LOCK_DISTANCE) {
                            activeScrollable._prepareGesture();
                            startEventData = null
                        }
                    }
                }
            };
        var handleEnd = function(e) {
                if (activeScrollable) {
                    activeScrollable._handleEnd(e);
                    activeScrollable._forgetGesture();
                    reset()
                }
            };
        $(function() {
            var startAction = new DX.Action(handleStart, {context: ui.dxScrollable}),
                scrollAction = new DX.Action(handleMove, {context: ui.dxScrollable}),
                endAction = new DX.Action(handleEnd, {context: ui.dxScrollable});
            $(document).on(events.addNamespace("dxpointerdown", SCROLLABLE_NATIVE), function(e) {
                startAction.execute($.extend(e, {isGesture: true}))
            }).on(events.addNamespace("dxpointermove", SCROLLABLE_NATIVE), function(e) {
                scrollAction.execute($.extend(e, {isGesture: true}))
            }).on(events.addNamespace("dxpointerup dxpointercancel", SCROLLABLE_NATIVE), function(e) {
                endAction.execute($.extend(e, {isGesture: true}))
            })
        })
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollable.simulated.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            math = Math;
        var SCROLLABLE_SIMULATED = "dxSimulatedScrollable",
            SCROLLABLE_SIMULATED_CLASS = "dx-scrollable-simulated",
            SCROLLBAR = "dxScrollbar",
            SCROLLABLE_SCROLLBAR_CLASS = "dx-scrollable-scrollbar",
            SCROLLABLE_SCROLL_CLASS = "dx-scrollable-scroll",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            ACCELERATION = 0.92,
            OUT_BOUNDS_ACCELERATION = 0.5,
            BOUNCE_DURATION = 400,
            MIN_VELOCITY_LIMIT = 1,
            MIN_BOUNCE_VELOCITY_LIMIT = MIN_VELOCITY_LIMIT / 5,
            FRAME_DURATION = math.round(1000 / 60),
            BOUNCE_FRAMES = BOUNCE_DURATION / FRAME_DURATION,
            BOUNCE_ACCELERATION_SUM = (1 - math.pow(ACCELERATION, BOUNCE_FRAMES)) / (1 - ACCELERATION),
            ELASTIC = OUT_BOUNDS_ACCELERATION,
            GESTURE_LOCK_KEY = "dxGesture";
        var InertiaAnimator = DX.Animator.inherit({
                ctor: function(scroller) {
                    this.callBase();
                    this.scroller = scroller
                },
                VELOCITY_LIMIT: MIN_VELOCITY_LIMIT,
                _isFinished: function() {
                    return math.abs(this.scroller._velocity) <= this.VELOCITY_LIMIT
                },
                _step: function() {
                    this.scroller._scrollStep(this.scroller._velocity);
                    this.scroller._velocity *= this._acceleration()
                },
                _acceleration: function() {
                    return this.scroller._inBounds() ? ACCELERATION : OUT_BOUNDS_ACCELERATION
                },
                _complete: function() {
                    this.scroller._scrollComplete()
                },
                _stop: function() {
                    this.scroller._handleStop()
                }
            });
        var BounceAnimator = InertiaAnimator.inherit({
                VELOCITY_LIMIT: MIN_BOUNCE_VELOCITY_LIMIT,
                _isFinished: function() {
                    return this.scroller._crossBoundOnNextStep() || this.callBase()
                },
                _acceleration: function() {
                    return ACCELERATION
                },
                _complete: function() {
                    this.scroller._move(this.scroller._bounceLocation);
                    this.callBase()
                }
            });
        var Scroller = ui.Scroller = DX.Class.inherit({
                ctor: function(options) {
                    this._initOptions(options);
                    this._initAnimators();
                    this._initScrollbar();
                    this._initCallbacks();
                    this._topReached = false;
                    this._bottomReached = false
                },
                _initOptions: function(options) {
                    var self = this;
                    this._location = 0;
                    this._axis = options.direction === HORIZONTAL ? "x" : "y";
                    this._prop = options.direction === HORIZONTAL ? "left" : "top";
                    this._dimension = options.direction === HORIZONTAL ? "width" : "height";
                    this._scrollProp = options.direction === HORIZONTAL ? "scrollLeft" : "scrollTop";
                    $.each(options, function(optionName, optionValue) {
                        self["_" + optionName] = optionValue
                    })
                },
                _initAnimators: function() {
                    this._inertiaAnimator = new InertiaAnimator(this);
                    this._bounceAnimator = new BounceAnimator(this)
                },
                _initScrollbar: function() {
                    this._$scrollbar = $("<div>").dxScrollbar({direction: this._direction}).appendTo(this._$container);
                    this._scrollbar = this._$scrollbar.dxScrollbar("instance")
                },
                _initCallbacks: function() {
                    this.topBouncedCallbacks = $.Callbacks();
                    this.bottomBouncedCallbacks = $.Callbacks()
                },
                _scrollStep: function(delta) {
                    this._location = this._location + delta;
                    this._suppressBounce();
                    this._move();
                    this._scrollAction()
                },
                _move: function(location) {
                    this._location = location !== undefined ? location : this._location;
                    this._moveContent();
                    this._moveScrollbar()
                },
                _moveContent: function() {
                    var targetLocation = {};
                    targetLocation[this._prop] = this._location;
                    DX.translator.move(this._$content, targetLocation);
                    this._fireCrossBound()
                },
                _fireCrossBound: function() {
                    var topReached = this._location >= this._maxOffset,
                        bottomReached = this._location <= this._minOffset;
                    if (this._topReached !== topReached) {
                        this.topBouncedCallbacks.fire(this._location >= this._maxOffset);
                        this._topReached = topReached
                    }
                    if (this._bottomReached !== bottomReached) {
                        this.bottomBouncedCallbacks.fire(this._location <= this._minOffset);
                        this._bottomReached = bottomReached
                    }
                },
                _moveScrollbar: function() {
                    this._scrollbar.moveTo(this._calculateScrollBarPosition())
                },
                _calculateScrollBarPosition: function() {
                    return this._location
                },
                _suppressBounce: function() {
                    if (this._bounceEnabled || this._inBounds(this._location))
                        return;
                    this._velocity = 0;
                    this._location = this._boundLocation()
                },
                _boundLocation: function() {
                    var location = this._location;
                    if (location > this._maxOffset)
                        location = this._maxOffset;
                    else if (location < this._minOffset)
                        location = this._minOffset;
                    return location
                },
                _scrollComplete: function() {
                    if (this._inBounds()) {
                        this._hideScrollbar();
                        if (this._completeDeferred)
                            this._completeDeferred.resolve()
                    }
                    this._scrollToBounds()
                },
                _scrollToBounds: function() {
                    if (this._inBounds())
                        return;
                    this._bounceAction();
                    this._setupBounce();
                    this._bounceAnimator.start()
                },
                _setupBounce: function() {
                    var boundLocation = this._bounceLocation = this._boundLocation(),
                        bounceDistance = boundLocation - this._location;
                    this._velocity = bounceDistance / BOUNCE_ACCELERATION_SUM
                },
                _inBounds: function(location) {
                    location = location !== undefined ? location : this._location;
                    return location >= this._minOffset && location <= this._maxOffset
                },
                _crossBoundOnNextStep: function() {
                    var location = this._location,
                        nextLocation = location + this._velocity;
                    return location < this._minOffset && nextLocation >= this._minOffset || location > this._maxOffset && nextLocation <= this._maxOffset
                },
                _handleStart: function($target) {
                    this._stopDeferred = $.Deferred();
                    this._stopScrolling();
                    this._update();
                    return this._stopDeferred.promise()
                },
                _stopScrolling: function() {
                    this._hideScrollbar();
                    this._inertiaAnimator.stop();
                    this._bounceAnimator.stop()
                },
                _handleStop: function() {
                    this._stopDeferred.resolve()
                },
                _handleFirstMove: function() {
                    this._showScrollbar()
                },
                _handleMove: function(delta) {
                    delta = delta[this._axis];
                    if (!this._inBounds())
                        delta *= ELASTIC;
                    this._scrollStep(delta)
                },
                _handleMoveEnd: function(velocity) {
                    this._completeDeferred = $.Deferred();
                    this._velocity = velocity[this._axis];
                    this._suppressVelocity();
                    this._handleInertia();
                    return this._completeDeferred.promise()
                },
                _suppressVelocity: function() {
                    if (!this._inertiaEnabled)
                        this._velocity = 0
                },
                _handleTapEnd: function() {
                    this._scrollToBounds()
                },
                _handleInertia: function() {
                    this._inertiaAnimator.start()
                },
                _handleDispose: function() {
                    this._$scrollbar.remove()
                },
                _handleUpdate: function() {
                    this._update();
                    this._moveToBounds()
                },
                _update: function() {
                    this._updateLocation();
                    this._updateBounds();
                    this._updateScrollbar();
                    this._moveScrollbar()
                },
                _updateLocation: function() {
                    this._location = DX.translator.locate(this._$content)[this._prop]
                },
                _updateBounds: function() {
                    this._maxOffset = 0;
                    this._minOffset = math.min(this._containerSize() - this._contentSize(), 0)
                },
                _updateScrollbar: function() {
                    this._scrollbar.update(this._containerSize(), this._contentSize())
                },
                _moveToBounds: function() {
                    this._location = this._boundLocation();
                    this._move()
                },
                _handleCreateActions: function(actions) {
                    this._scrollAction = actions.scrollAction;
                    this._bounceAction = actions.bounceAction
                },
                _showScrollbar: function() {
                    this._scrollbar.option("visible", this._scrollbarVisible)
                },
                _hideScrollbar: function() {
                    this._scrollbar.option("visible", false)
                },
                _containerSize: function() {
                    return this._$container[this._dimension]()
                },
                _contentSize: function() {
                    return this._$content[this._dimension]()
                },
                _validateTarget: function($target) {
                    return $target.closest(this._$container)
                },
                _validateDirection: function(deltaEventData) {
                    return math.abs(deltaEventData[this._axis]) >= math.abs(deltaEventData[this._axis === "x" ? "y" : "x"])
                },
                _reachedMin: function() {
                    return this._location <= this._minOffset
                },
                _reachedMax: function() {
                    return this._location >= this._maxOffset
                }
            });
        ui.SimulatedScrollableStrategy = DX.Class.inherit({
            ctor: function(scrollable) {
                this._init(scrollable);
                this._attachScrollHandler()
            },
            _init: function(scrollable) {
                this._component = scrollable;
                this._$element = scrollable._element();
                this._$container = scrollable._$container;
                this._$content = scrollable._$content;
                this.option = $.proxy(scrollable.option, scrollable);
                this._createActionByOption = $.proxy(scrollable._createActionByOption, scrollable)
            },
            _attachScrollHandler: function() {
                $(this._$container).on(events.addNamespace("scroll", SCROLLABLE_SIMULATED), $.proxy(this._handleScroll, this))
            },
            _handleScroll: function(e) {
                var distance = {
                        x: this._$container.scrollLeft(),
                        y: this._$container.scrollTop()
                    };
                this._$container.scrollLeft(-distance.x);
                this._$container.scrollTop(-distance.y);
                this.scrollBy(distance)
            },
            render: function() {
                this._$element.addClass(SCROLLABLE_SIMULATED_CLASS);
                this._createScrollers()
            },
            _createScrollers: function() {
                var direction = this.option("direction");
                this._scrollers = {};
                if (direction !== VERTICAL)
                    this._createScroller(HORIZONTAL);
                if (direction !== HORIZONTAL)
                    this._createScroller(VERTICAL);
                this._$element.toggleClass(SCROLLABLE_SCROLLBARS_HIDDEN, !this.option("showScrollbar"))
            },
            _createScroller: function(direction) {
                this._scrollers[direction] = new Scroller(this._scrollerOptions(direction))
            },
            _scrollerOptions: function(direction) {
                return {
                        direction: direction,
                        $content: this._$content,
                        $container: this._$container,
                        scrollbarVisible: this.option("showScrollbar"),
                        bounceEnabled: this.option("bounceEnabled"),
                        inertiaEnabled: this.option("inertiaEnabled")
                    }
            },
            createActions: function() {
                this._startAction = this._createActionHandler("startAction");
                this._stopAction = this._createActionHandler("stopAction");
                this._endAction = this._createActionHandler("endAction");
                this._updateAction = this._createActionHandler("updateAction");
                this._createScrollerActions()
            },
            _createScrollerActions: function() {
                this._handleEvent("CreateActions", {
                    scrollAction: this._createActionHandler("scrollAction"),
                    bounceAction: this._createActionHandler("bounceAction")
                })
            },
            _createActionHandler: function(optionName) {
                var self = this,
                    actionHandler = self._createActionByOption(optionName);
                return function() {
                        actionHandler($.extend(self._createActionArgs(), arguments))
                    }
            },
            _createActionArgs: function() {
                var scrollerX = this._scrollers[HORIZONTAL],
                    scrollerY = this._scrollers[VERTICAL];
                return {
                        isGesture: true,
                        jQueryEvent: eventForUserAction,
                        scrollOffset: {
                            top: scrollerY && -scrollerY._location,
                            left: scrollerX && -scrollerX._location
                        },
                        reachedLeft: scrollerX && scrollerX._reachedMax(),
                        reachedRight: scrollerX && scrollerX._reachedMin(),
                        reachedTop: scrollerY && scrollerY._reachedMax(),
                        reachedBottom: scrollerY && scrollerY._reachedMin()
                    }
            },
            clean: function() {
                this._handleEvent("Dispose")
            },
            dispose: function() {
                if (this === activeScrollable)
                    activeScrollable = null;
                this._detachScrollHandler();
                this._startAction = null;
                this._stopAction = null;
                this._endAction = null;
                this._updateAction = null;
                clearTimeout(this._gestureEndTimer)
            },
            _detachScrollHandler: function() {
                $(this._$container).off(events.addNamespace("scroll", SCROLLABLE_SIMULATED), this._handleScroll)
            },
            _handleEvent: function(eventName) {
                var args = $.makeArray(arguments).slice(1),
                    deferreds = $.map(this._scrollers, function(scroller) {
                        return scroller["_handle" + eventName].apply(scroller, args)
                    });
                return $.when.apply($, deferreds).promise()
            },
            _handleStart: function($target) {
                this._handleEvent("Start", $target).done($.proxy(this._forgetGesture, this)).done(this._stopAction)
            },
            _handleFirstMove: function() {
                return this._handleEvent("FirstMove").done(this._startAction)
            },
            _prepareGesture: function() {
                clearTimeout(this._gestureEndTimer);
                this._$element.data(GESTURE_LOCK_KEY, true);
                ui.feedback.reset()
            },
            _handleMove: function(delta) {
                this._handleEvent("Move", delta)
            },
            _handleMoveEnd: function(velocity) {
                return this._handleEvent("MoveEnd", velocity).done(this._endAction)
            },
            _forgetGesture: function() {
                this._gestureEndTimer = setTimeout($.proxy(function() {
                    this._$element.data(GESTURE_LOCK_KEY, false)
                }, this), 400)
            },
            _handleTapEnd: function() {
                this._handleEvent("TapEnd")
            },
            location: function() {
                return DX.translator.locate(this._$content)
            },
            _validateTarget: function($target) {
                if (this.option("disabled"))
                    return false;
                var result = false;
                $.each(this._scrollers, function() {
                    result = result || this._validateTarget($target)
                });
                return result
            },
            _validateDirection: function(deltaEventData) {
                var result = false;
                $.each(this._scrollers, function() {
                    result = result || this._validateDirection(deltaEventData)
                });
                return result
            },
            update: function() {
                return this._handleEvent("Update")
            },
            scrollBy: function(distance) {
                this._handleFirstMove();
                this._handleMove(distance);
                this._handleMoveEnd({
                    x: 0,
                    y: 0
                })
            }
        });
        var STAGE_SLEEP = 0,
            STAGE_TOUCHED = 1,
            STAGE_SCROLLING = 2;
        var INTERTIA_TIMEOUT = 100,
            VELOCITY_CALC_TIMEOUT = 200;
        var activeScrollable,
            scrollStage = STAGE_SLEEP,
            prevEventData,
            savedEventData,
            eventForUserAction,
            startEventData = null;
        var GESTURE_LOCK_DISTANCE = 10;
        var closestScrollable = function(element) {
                var $closestScrollable = $(element).closest("." + SCROLLABLE_SIMULATED_CLASS);
                if (!$closestScrollable.length)
                    return;
                var components = $closestScrollable.data("dxComponents"),
                    scrollable;
                $.each(components, function(index, componentName) {
                    var componentClass = ui[componentName];
                    if (componentClass === ui.dxScrollable || componentClass.subclassOf(ui.dxScrollable)) {
                        scrollable = $closestScrollable.data(componentName);
                        return false
                    }
                });
                return scrollable && scrollable.option("disabled") ? closestScrollable($closestScrollable.parent()) : scrollable._strategy
            };
        var resetStage = function() {
                scrollStage = STAGE_SLEEP
            };
        var preventHangingCursorAndHideKeyboard = function() {
                DX.utils.resetActiveElement()
            };
        var preventSelectStartEvent = function(e) {
                e.preventDefault()
            };
        var handleStart = function(e) {
                if (events.needSkipEvent(e))
                    return;
                activeScrollable = closestScrollable(e.target);
                if (activeScrollable && activeScrollable._validateTarget($(e.target))) {
                    if (events.isMouseEvent(e)) {
                        preventHangingCursorAndHideKeyboard();
                        preventSelectStartEvent(e)
                    }
                    eventForUserAction = e;
                    startEventData = prevEventData = savedEventData = events.eventData(e);
                    scrollStage = STAGE_TOUCHED;
                    activeScrollable._handleStart($(e.target))
                }
            };
        var handleScroll = function(e) {
                if (!activeScrollable)
                    return;
                eventForUserAction = e;
                if (scrollStage === STAGE_SLEEP)
                    return;
                var currentEventData = events.eventData(e),
                    deltaEventData = events.eventDelta(prevEventData, currentEventData);
                if (scrollStage === STAGE_TOUCHED)
                    handleFirstMove(deltaEventData);
                if (scrollStage === STAGE_SCROLLING)
                    handleMove(currentEventData, deltaEventData)
            };
        var handleFirstMove = function(deltaEventData) {
                if (!activeScrollable._validateDirection(deltaEventData)) {
                    resetStage();
                    return
                }
                activeScrollable._handleFirstMove();
                scrollStage = STAGE_SCROLLING
            };
        var handleMove = function(currentEventData, deltaEventData) {
                if (events.eventDelta(savedEventData, prevEventData).time > VELOCITY_CALC_TIMEOUT)
                    savedEventData = prevEventData;
                prevEventData = currentEventData;
                if (startEventData) {
                    var delta = events.eventDelta(startEventData, currentEventData);
                    if (math.abs(delta.x) > GESTURE_LOCK_DISTANCE || math.abs(delta.y) > GESTURE_LOCK_DISTANCE) {
                        activeScrollable._prepareGesture();
                        startEventData = null
                    }
                }
                activeScrollable._handleMove(deltaEventData)
            };
        var handleEnd = function(e) {
                if (!activeScrollable)
                    return;
                eventForUserAction = e;
                if (scrollStage === STAGE_SCROLLING) {
                    var endEventData = events.eventData(e),
                        deltaEndEventData = events.eventDelta(prevEventData, endEventData),
                        velocity = {
                            x: 0,
                            y: 0
                        };
                    if (deltaEndEventData.time < INTERTIA_TIMEOUT) {
                        var deltaSavedEventData = events.eventDelta(savedEventData, prevEventData);
                        velocity = {
                            x: deltaSavedEventData.x * FRAME_DURATION / deltaSavedEventData.time,
                            y: deltaSavedEventData.y * FRAME_DURATION / deltaSavedEventData.time
                        }
                    }
                    activeScrollable._handleMoveEnd(velocity).done($.proxy(activeScrollable._forgetGesture, activeScrollable))
                }
                else if (scrollStage === STAGE_TOUCHED)
                    activeScrollable._handleTapEnd();
                resetStage()
            };
        var handleWheel = function(e, delta) {
                handleStart(e);
                e.pageY += delta;
                handleScroll(e);
                handleEnd(e)
            };
        $(function() {
            var startAction = new DX.Action(handleStart, {context: ui.dxScrollable}),
                scrollAction = new DX.Action(handleScroll, {context: ui.dxScrollable}),
                endAction = new DX.Action(handleEnd, {context: ui.dxScrollable});
            $(document).on(events.addNamespace("dxpointerdown", SCROLLABLE_SIMULATED), function(e) {
                startAction.execute($.extend(e, {isGesture: true}))
            }).on(events.addNamespace("dxpointermove", SCROLLABLE_SIMULATED), function(e) {
                scrollAction.execute($.extend(e, {isGesture: true}))
            }).on(events.addNamespace("dxpointerup dxpointercancel", SCROLLABLE_SIMULATED), function(e) {
                endAction.execute($.extend(e, {isGesture: true}))
            });
            if ("mousewheel" in $.event.special) {
                var wheelAction = new DX.Action(handleWheel, {context: ui.dxScrollable});
                $(document).on(events.addNamespace("mousewheel", SCROLLABLE_SIMULATED), function(e, delta) {
                    wheelAction.execute($.extend(e, {isGesture: true}), delta)
                })
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollView.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var SCROLLVIEW_CLASS = "dx-scrollview",
            SCROLLVIEW_CONTENT_CLASS = "dx-scrollview-content",
            SCROLLVIEW_TOP_POCKET_CLASS = "dx-scrollview-top-pocket",
            SCROLLVIEW_BOTTOM_POCKET_CLASS = "dx-scrollview-bottom-pocket",
            SCROLLVIEW_PULLDOWN_CLASS = SCROLLVIEW_CLASS + "-pull-down",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-text",
            SCROLLVIEW_REACHBOTTOM_CLASS = SCROLLVIEW_CLASS + "-scrollbottom",
            SCROLLVIEW_REACHBOTTOM_INDICATOR_CLASS = SCROLLVIEW_REACHBOTTOM_CLASS + "-indicator",
            SCROLLVIEW_REACHBOTTOM_TEXT_CLASS = SCROLLVIEW_REACHBOTTOM_CLASS + "-text";
        ui.registerComponent("dxScrollView", ui.dxScrollable.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        pullingDownText: Globalize.localize("dxScrollView-pullingDownText"),
                        pulledDownText: Globalize.localize("dxScrollView-pulledDownText"),
                        refreshingText: Globalize.localize("dxScrollView-refreshingText"),
                        reachBottomText: Globalize.localize("dxScrollView-reachBottomText"),
                        pullDownAction: null,
                        reachBottomAction: null,
                        refreshStrategy: null
                    })
            },
            _initMarkup: function() {
                this.callBase();
                this._element().addClass(SCROLLVIEW_CLASS);
                this._initContent();
                this._initTopPocket();
                this._initBottomPocket()
            },
            _initContent: function() {
                var $content = $("<div>").addClass(SCROLLVIEW_CONTENT_CLASS);
                this._$content.wrapInner($content)
            },
            _initTopPocket: function() {
                var $topPocket = this._$topPocket = $("<div>").addClass(SCROLLVIEW_TOP_POCKET_CLASS),
                    $pullDown = this._$pullDown = $("<div>").addClass(SCROLLVIEW_PULLDOWN_CLASS);
                $topPocket.append($pullDown);
                this._$content.prepend($topPocket)
            },
            _initBottomPocket: function() {
                var $bottomPocket = this._$bottomPocket = $("<div>").addClass(SCROLLVIEW_BOTTOM_POCKET_CLASS),
                    $reachBottom = this._$reachBottom = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_CLASS),
                    $loadContainer = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_INDICATOR_CLASS),
                    $loadIndicator = $("<div>").dxLoadIndicator(),
                    $text = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_TEXT_CLASS).text(this.option("reachBottomText"));
                $reachBottom.append($loadContainer.append($loadIndicator)).append($text);
                $bottomPocket.append($reachBottom);
                this._$content.append($bottomPocket)
            },
            _createStrategy: function() {
                var strategyName = this.option("useNative") ? this.option("refreshStrategy") : "simulated";
                var strategyClass = ui.scrollViewRefreshStrategies[strategyName];
                if (!strategyClass)
                    throw Error("Unknown dxScrollView refresh strategy " + this.option("refreshStrategy"));
                this._strategy = new strategyClass(this);
                this._strategy.pullDownCallbacks.add($.proxy(this._handlePullDown, this));
                this._strategy.releaseCallbacks.add($.proxy(this._handleRelease, this));
                this._strategy.reachBottomCallbacks.add($.proxy(this._handleReachBottom, this));
                this._strategy.render()
            },
            _createActions: function() {
                this.callBase();
                this._pullDownAction = this._createActionByOption("pullDownAction");
                this._reachBottomAction = this._createActionByOption("reachBottomAction");
                this._pullDownEnable(!!this.option("pullDownAction"));
                this._reachBottomEnable(!!this.option("reachBottomAction"))
            },
            _pullDownEnable: function(enabled) {
                this._$pullDown.toggle(enabled);
                this._strategy.pullDownEnable(enabled)
            },
            _reachBottomEnable: function(enabled) {
                this._$reachBottom.toggle(enabled);
                this._strategy.reachBottomEnable(enabled)
            },
            _handlePullDown: function() {
                this._pullDownAction({isGesture: true});
                this.option("disabled", true)
            },
            _handleRelease: function() {
                this.option("disabled", false)
            },
            _handleReachBottom: function() {
                this._reachBottomAction({isGesture: true});
                this.option("disabled", true)
            },
            _optionChanged: function(optionName, optionValue) {
                switch (optionName) {
                    case"pullDownAction":
                    case"reachBottomAction":
                        this._createActions();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            content: function() {
                return this._$content.children().eq(1)
            },
            release: function(preventReachBottom) {
                this.toggleLoading(!preventReachBottom);
                return this._strategy.release()
            },
            toggleLoading: function(showOrHide) {
                this._reachBottomEnable(showOrHide)
            },
            isFull: function() {
                return this.content().height() >= this._$container.height()
            }
        }));
        ui.scrollViewRefreshStrategies = {}
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollView.native.pullDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3;
        var PullDownNativeScrollViewStrategy = ui.NativeScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$refreshingText = scrollView._$refreshingText;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._releaseState()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator(),
                        $text = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($text);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($text);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($text);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($text)
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._refreshPullDownText()
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                update: function() {
                    this.callBase();
                    this._updateDimensions();
                    this._setTopPocketOffset()
                },
                _updateDimensions: function() {
                    this._topPocketSize = this._$topPocket.height();
                    this._bottomPocketSize = this._$bottomPocket.height();
                    this._scrollOffset = this._$container.height() - this._$content.height()
                },
                _setTopPocketOffset: function() {
                    this._$topPocket.css({
                        height: this._topPocketSize,
                        top: -this._topPocketSize
                    })
                },
                _handleEnd: function() {
                    var self = this;
                    if (self._state === STATE_READY) {
                        self._setPullDownOffset(self._topPocketSize);
                        setTimeout(function() {
                            self._pullDownRefreshing()
                        }, 400)
                    }
                },
                _setPullDownOffset: function(offset) {
                    DX.translator.move(this._$topPocket, {top: offset});
                    DX.translator.move(this._$scrollViewContent, {top: offset})
                },
                _handleScroll: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._location = this.location().top;
                    if (this._isPullDown())
                        this._pullDownReady();
                    else if (this._isReachBottom())
                        this._reachBottom();
                    else
                        this._stateReleased()
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._location >= this._topPocketSize
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._scrollOffset + this._bottomPocketSize
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this.reachBottomCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY)
                        return;
                    this._state = STATE_READY;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._releaseState()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText();
                    this.pullDownCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._updateDimensions();
                    setTimeout($.proxy(function() {
                        this._setPullDownOffset(0);
                        this._stateReleased();
                        this.releaseCallbacks.fire();
                        deferred.resolve()
                    }, this), 400);
                    return deferred.promise()
                }
            });
        ui.scrollViewRefreshStrategies.pullDown = PullDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollView.native.swipeDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            PULLDOWN_HEIGHT = 160,
            STATE_RELEASED = 0,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3,
            STATE_TOUCHED = 4,
            STATE_PULLED = 5;
        var SwipeDownNativeScrollViewStrategy = ui.NativeScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks();
                    this._releaseState();
                    this._location = 0
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown()
                },
                _renderPullDown: function() {
                    this._$pullDown.empty().append($("<div class='dx-scrollview-pulldown-pointer1'>")).append($("<div class='dx-scrollview-pulldown-pointer2'>")).append($("<div class='dx-scrollview-pulldown-pointer3'>")).append($("<div class='dx-scrollview-pulldown-pointer4'>"))
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._$pullDown.css({
                        transform: "scaleX(0)",
                        opacity: 0
                    });
                    this._updateDimensions()
                },
                update: function() {
                    this.callBase();
                    this._updateDimensions()
                },
                _updateDimensions: function() {
                    this._topPocketSize = this._$topPocket.height();
                    this._bottomPocketSize = this._$bottomPocket.height();
                    this._scrollOffset = this._$container.height() - this._$content.height()
                },
                _handleStart: function(e) {
                    if (this._state === STATE_RELEASED && this._location === 0) {
                        this._startClientY = events.eventData(e).y;
                        this._state = STATE_TOUCHED
                    }
                },
                _handleMove: function(e) {
                    this._deltaY = events.eventData(e).y - this._startClientY;
                    if (this._state === STATE_TOUCHED)
                        if (this._deltaY > 0) {
                            e.preventDefault();
                            this._state = STATE_PULLED
                        }
                        else
                            this._handleEnd();
                    if (this._state === STATE_PULLED) {
                        if (this._deltaY < 0) {
                            this._handleEnd();
                            return
                        }
                        this._$pullDown.css({
                            opacity: 1,
                            transform: "scaleX(" + this._deltaY / PULLDOWN_HEIGHT + ")"
                        });
                        if (this._isPullDown())
                            this._pullDownRefreshing()
                    }
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._deltaY >= PULLDOWN_HEIGHT
                },
                _handleEnd: function() {
                    if (this._state === STATE_TOUCHED || this._state === STATE_PULLED)
                        this._releaseState()
                },
                _handleScroll: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._location = this.location().top;
                    if (this._isReachBottom())
                        this._reachBottom();
                    else
                        this._stateReleased()
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._scrollOffset + this._bottomPocketSize
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this.reachBottomCallbacks.fire()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                    this._releaseState()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                    this.pullDownCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled
                },
                release: function() {
                    var self = this,
                        deferred = $.Deferred();
                    setTimeout(function() {
                        self._updateDimensions();
                        self._stateReleased();
                        self.releaseCallbacks.fire();
                        deferred.resolve()
                    }, 800);
                    return deferred.promise()
                }
            });
        ui.scrollViewRefreshStrategies.swipeDown = SwipeDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollView.native.slideDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math,
            events = ui.events;
        var DX_SLIDE_DOWN_NATIVE_SCROLLVIEW_STRATEGY = "dxSlideDownNativeScrollViewStrategy",
            SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-refreshing",
            SCROLLVIEW_PULLDOWN_LOADING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3,
            STATE_AFTER_REFRESHING = 4,
            LOADING_HEIGHT = 80,
            SCROLLING_STEP = 4;
        var SlideUpAnimator = DX.Animator.inherit({
                ctor: function(refreshStrategy) {
                    this.callBase();
                    this.refreshStrategy = refreshStrategy;
                    this._$content = refreshStrategy._$content
                },
                _isFinished: function() {
                    return this._$content.scrollTop() === 0
                },
                _step: function() {
                    var scrollTop = this._$content.scrollTop();
                    scrollTop -= Math.min(scrollTop, 2 * SCROLLING_STEP);
                    this._$content.scrollTop(scrollTop)
                }
            });
        var SlideDownAnimator = SlideUpAnimator.inherit({
                _isFinished: function() {
                    this._currentPosition = this._$content.scrollTop();
                    return this._currentPosition === this.refreshStrategy._topPocketSize
                },
                _step: function() {
                    var scrollTop = this._$content.scrollTop();
                    scrollTop += Math.min(this.refreshStrategy._topPocketSize - scrollTop, SCROLLING_STEP);
                    this._$content.scrollTop(scrollTop)
                },
                _complete: function() {
                    this.refreshStrategy._releaseState()
                }
            });
        var SlideDownNativeScrollViewStrategy = ui.NativeScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$refreshingText = scrollView._$refreshingText;
                    this._$content = scrollView._$content;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks();
                    this._initAnimators()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                _initAnimators: function() {
                    this._slideDown = new SlideDownAnimator(this);
                    this._slideUp = new SlideUpAnimator(this)
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._renderBottom();
                    this._releaseState();
                    this._updateDimensions();
                    this._hidePullDown()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<progress>");
                    var $pullDownText = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($pullDownText);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($pullDownText);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($pullDownText);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($pullDownText)
                },
                _renderBottom: function() {
                    this._$bottomPocket.empty().append("<progress>").appendTo(this._$container)
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._$container.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_LOADING_CLASS);
                    this._refreshPullDownText()
                },
                _hidePullDown: function() {
                    this._$content.scrollTop(this._topPocketSize)
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                update: function() {
                    this.callBase();
                    this._updateDimensions()
                },
                _updateDimensions: function() {
                    this._topPocketSize = this._$topPocket.height();
                    this._scrollOffset = this._$scrollViewContent.prop("scrollHeight") - this._$scrollViewContent.prop("clientHeight")
                },
                _attachScrollHandler: function() {
                    this.callBase();
                    $(this._$content).on(events.addNamespace("scroll", DX_SLIDE_DOWN_NATIVE_SCROLLVIEW_STRATEGY), $.proxy(this._handleContentScroll, this));
                    $(this._$scrollViewContent).on(events.addNamespace("scroll", DX_SLIDE_DOWN_NATIVE_SCROLLVIEW_STRATEGY), $.proxy(this._handleScrollViewContentScroll, this))
                },
                _handleContentScroll: function(e) {
                    var contentLocation = this._$content.scrollTop();
                    if (this._isPullDown(contentLocation))
                        this._pullDownRefreshing();
                    else
                        this._pullDownReady()
                },
                _isPullDown: function(location) {
                    return this._pullDownEnabled && location === 0
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._stopAnimators();
                    this._refreshPullDownText();
                    this._$container.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                    this.pullDownCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY || this._state === STATE_AFTER_REFRESHING)
                        return;
                    if (this._state === STATE_REFRESHING) {
                        if (!this._slideUp.inProgress())
                            this._startUpAnimation();
                        return
                    }
                    this._state = STATE_READY;
                    this._startDownAnimation()
                },
                _startUpAnimation: function() {
                    this._slideDown.stop();
                    this._slideUp.start()
                },
                _startDownAnimation: function() {
                    this._slideUp.stop();
                    this._slideDown.start()
                },
                _stopAnimators: function() {
                    this._slideDown.stop();
                    this._slideUp.stop()
                },
                _handleScrollViewContentScroll: function(e) {
                    var scrollViewContentLocation = this._$scrollViewContent.scrollTop();
                    this._handleScroll(e);
                    if (this._isReachBottom(scrollViewContentLocation))
                        this._reachBottom()
                },
                _isReachBottom: function(location) {
                    return this._reachBottomEnabled && location >= this._scrollOffset - LOADING_HEIGHT
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this._$container.addClass(SCROLLVIEW_PULLDOWN_LOADING_CLASS);
                    this.reachBottomCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled;
                    this._$bottomPocket.toggle(enabled)
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._updateDimensions();
                    setTimeout($.proxy(function() {
                        this._state = STATE_AFTER_REFRESHING;
                        this._startDownAnimation();
                        this.releaseCallbacks.fire();
                        deferred.resolve()
                    }, this), 400);
                    return deferred.promise()
                }
            });
        ui.scrollViewRefreshStrategies.slideDown = SlideDownNativeScrollViewStrategy;
        ui.scrollViewRefreshStrategies.slideDown.__internals = {
            slideDownAnimator: function(cls) {
                if (cls === undefined)
                    return SlideDownAnimator;
                SlideDownAnimator = cls
            },
            slideUpAnimator: function(cls) {
                if (cls === undefined)
                    return SlideUpAnimator;
                SlideUpAnimator = cls
            },
            LOADING_HEIGHT: LOADING_HEIGHT
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.scrollView.simulated.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3;
        var ScrollViewScroller = ui.ScrollViewScroller = ui.Scroller.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._releaseState()
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._refreshPullDownText()
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                _initCallbacks: function() {
                    this.callBase();
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                _updateBounds: function() {
                    this._topPocketSize = this._$topPocket[this._dimension]();
                    this._bottomPocketSize = this._$bottomPocket[this._dimension]();
                    this._updateOffsets()
                },
                _updateOffsets: function() {
                    this._minOffset = math.min(this._containerSize() - this._contentSize() + this._bottomPocketSize, -this._topPocketSize);
                    this._maxOffset = -this._topPocketSize;
                    this._bottomBound = this._minOffset - this._bottomPocketSize
                },
                _updateScrollbar: function() {
                    this._scrollbar.update(this._containerSize(), this._contentSize() - this._topPocketSize - this._bottomPocketSize)
                },
                _calculateScrollBarPosition: function() {
                    return this._topPocketSize + this._location
                },
                _moveContent: function() {
                    this.callBase();
                    if (this._isPullDown())
                        this._pullDownReady();
                    else if (this._isReachBottom())
                        this._reachBottomReady();
                    else if (this._state !== STATE_RELEASED)
                        this._stateReleased()
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._location >= 0
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._bottomBound
                },
                _scrollComplete: function() {
                    if (this._inBounds() && this._state === STATE_READY)
                        this._pullDownRefreshing();
                    else if (this._inBounds() && this._state === STATE_LOADING)
                        this._reachBottomLoading();
                    else
                        this.callBase()
                },
                _reachBottomReady: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this._minOffset = math.min(this._containerSize() - this._contentSize(), 0)
                },
                _reachBottomLoading: function() {
                    this.reachBottomCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY)
                        return;
                    this._state = STATE_READY;
                    this._maxOffset = 0;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._releaseState();
                    this._updateOffsets();
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this.releaseCallbacks.fire()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText();
                    this.pullDownCallbacks.fire()
                },
                _handleRelease: function() {
                    this._update();
                    if (this._state === STATE_REFRESHING || this._state === STATE_LOADING)
                        return DX.utils.executeAsync($.proxy(this._release, this));
                    else
                        return $.Deferred().reject().promise()
                },
                _release: function() {
                    this._stateReleased();
                    this._scrollComplete()
                },
                _handleReachBottomEnabling: function(enabled) {
                    if (this._reachBottomEnabled === enabled)
                        return;
                    this._reachBottomEnabled = enabled;
                    this._updateBounds()
                },
                _handlePullDownEnabling: function(enabled) {
                    if (this._pullDownEnabled === enabled)
                        return;
                    this._pullDownEnabled = enabled;
                    this._considerTopPocketChange();
                    this._handleUpdate()
                },
                _considerTopPocketChange: function() {
                    this._location -= this._$topPocket.height();
                    this._move()
                }
            });
        var SimulatedScrollViewStrategy = ui.SimulatedScrollableStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$pullDown = scrollView._$pullDown;
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this._renderPullDown();
                    this.callBase()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator(),
                        $text = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($text);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($text);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($text);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($text)
                },
                pullDownEnable: function(enabled) {
                    this._handleEvent("PullDownEnabling", enabled)
                },
                reachBottomEnable: function(enabled) {
                    this._handleEvent("ReachBottomEnabling", enabled)
                },
                _createScroller: function(direction) {
                    var self = this;
                    var scroller = self._scrollers[direction] = new ScrollViewScroller(self._scrollerOptions(direction));
                    scroller.pullDownCallbacks.add(function() {
                        self.pullDownCallbacks.fire()
                    });
                    scroller.releaseCallbacks.add(function() {
                        self.releaseCallbacks.fire()
                    });
                    scroller.reachBottomCallbacks.add(function() {
                        self.reachBottomCallbacks.fire()
                    })
                },
                _scrollerOptions: function(direction) {
                    return $.extend(this.callBase(direction), {
                            $topPocket: this._$topPocket,
                            $bottomPocket: this._$bottomPocket,
                            $pullDown: this._$pullDown,
                            $pullDownText: this._$pullDownText,
                            $pullingDownText: this._$pullingDownText,
                            $pulledDownText: this._$pulledDownText,
                            $refreshingText: this._$refreshingText
                        })
                },
                release: function() {
                    return this._handleEvent("Release")
                }
            });
        ui.scrollViewRefreshStrategies.simulated = SimulatedScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.swipeable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            DX_SWIPEABLE = "dxSwipeable",
            SWIPEABLE_CLASS = "dx-swipeable",
            ACTION_TO_EVENT_MAP = {
                startAction: "dxswipestart",
                updateAction: "dxswipe",
                endAction: "dxswipeend",
                cancelAction: "dxswipecancel"
            };
        ui.registerComponent(DX_SWIPEABLE, ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        elastic: true,
                        direction: "horizontal",
                        itemSizeFunc: null,
                        startAction: null,
                        updateAction: null,
                        endAction: null,
                        cancelAction: null,
                        forceBlur: true
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(SWIPEABLE_CLASS);
                this._attachEventHandlers()
            },
            _attachEventHandlers: function() {
                if (this.option("disabled"))
                    return;
                var NAME = this.NAME;
                this._createEventData();
                $.each(ACTION_TO_EVENT_MAP, $.proxy(function(actionName, eventName) {
                    var action = this._createActionByOption(actionName, {context: this});
                    this._element().on(events.addNamespace(eventName, NAME), this._eventData, function(e) {
                        return action({
                                jQueryEvent: e,
                                isGesture: true
                            })
                    })
                }, this))
            },
            _createEventData: function() {
                this._eventData = {
                    elastic: this.option("elastic"),
                    itemSizeFunc: this.option("itemSizeFunc"),
                    direction: this.option("direction"),
                    forceBlur: this.option("forceBlur")
                }
            },
            _detachEventHanlers: function() {
                this._element().off("." + DX_SWIPEABLE)
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"disabled":
                    case"startAction":
                    case"updateAction":
                    case"endAction":
                    case"cancelAction":
                    case"elastic":
                    case"itemSizeFunc":
                    case"direction":
                        this._detachEventHanlers();
                        this._attachEventHandlers();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.button.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var BUTTON_CLASS = "dx-button",
            BUTTON_CONTENT_CLASS = "dx-button-content",
            BUTTON_CONTENT_SELECTOR = ".dx-button-content",
            BUTTON_TEXT_CLASS = "dx-button-text",
            BUTTON_TEXT_SELECTOR = ".dx-button-text",
            BUTTON_BACK_ARROW_CLASS = "dx-button-back-arrow",
            ICON_CLASS = "dx-icon",
            ICON_SELECTOR = ".dx-icon",
            BUTTON_FEEDBACK_HIDE_TIMEOUT = 100;
        ui.registerComponent("dxButton", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        type: "normal",
                        text: "",
                        icon: "",
                        iconSrc: ""
                    })
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = BUTTON_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this._element().addClass(BUTTON_CLASS).append($("<div />").addClass(BUTTON_CONTENT_CLASS));
                this._renderIcon();
                this._renderType();
                this._renderText()
            },
            _clean: function() {
                this.callBase();
                this._element().removeClass()
            },
            _renderIcon: function() {
                var contentElement = this._element().find(BUTTON_CONTENT_SELECTOR),
                    iconElement = contentElement.find(ICON_SELECTOR),
                    icon = this.option("icon"),
                    iconSrc = this.option("iconSrc");
                iconElement.remove();
                if (this.option("type") === "back" && !icon)
                    icon = "back";
                if (!icon && !iconSrc)
                    return;
                if (icon)
                    iconElement = $("<span />").addClass("dx-icon-" + icon);
                else if (iconSrc)
                    iconElement = $("<img />").attr("src", iconSrc);
                contentElement.prepend(iconElement.addClass(ICON_CLASS))
            },
            _renderType: function() {
                var type = this.option("type");
                if (type)
                    this._element().addClass("dx-button-" + type);
                if (type === "back")
                    this._element().prepend($("<span />").addClass(BUTTON_BACK_ARROW_CLASS))
            },
            _renderText: function() {
                var text = this.option("text"),
                    contentElement = this._element().find(BUTTON_CONTENT_SELECTOR),
                    back = this.option("type") === "back";
                var textElement = contentElement.find(BUTTON_TEXT_SELECTOR);
                if (!text && !back) {
                    textElement.remove();
                    return
                }
                if (!textElement.length)
                    textElement = $('<span />').addClass(BUTTON_TEXT_CLASS).appendTo(contentElement);
                textElement.text(text || DX.localization.localizeString("@Back"))
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"icon":
                    case"iconSrc":
                        this._renderIcon();
                        break;
                    case"text":
                        this._renderText();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.checkBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var CHECKBOX_CLASS = "dx-checkbox",
            CHECKBOX_ICON_CLASS = "dx-checkbox-icon",
            CHECKBOX_CHECKED_CLASS = "dx-checkbox-checked",
            CHECKBOX_FEEDBACK_HIDE_TIMEOUT = 100;
        ui.registerComponent("dxCheckBox", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {checked: false})
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = CHECKBOX_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this._element().addClass(CHECKBOX_CLASS);
                $("<span />").addClass(CHECKBOX_ICON_CLASS).appendTo(this._element());
                this._renderValue()
            },
            _renderClick: function() {
                var self = this,
                    eventName = events.addNamespace("dxclick", this.NAME),
                    action = this._createActionByOption("clickAction", {beforeExecute: function() {
                            self.option("checked", !self.option("checked"))
                        }});
                this._element().off(eventName).on(eventName, function(e) {
                    action({jQueryEvent: e})
                })
            },
            _renderValue: function() {
                this._element().toggleClass(CHECKBOX_CHECKED_CLASS, Boolean(this.option("checked")))
            },
            _refresh: function() {
                this._renderValue()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.switch.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx;
        var SWITCH_CLASS = "dx-switch",
            SWITCH_WRAPPER_CLASS = SWITCH_CLASS + "-wrapper",
            SWITCH_INNER_CLASS = SWITCH_CLASS + "-inner",
            SWITCH_HANDLE_CLASS = SWITCH_CLASS + "-handle",
            SWITCH_ON_VALUE_CLASS = SWITCH_CLASS + "-on-value",
            SWITCH_ON_CLASS = SWITCH_CLASS + "-on",
            SWITCH_OFF_CLASS = SWITCH_CLASS + "-off",
            SWITCH_ANIMATION_DURATION = 100;
        ui.registerComponent("dxSwitch", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        onText: Globalize.localize("dxSwitch-onText"),
                        offText: Globalize.localize("dxSwitch-offText"),
                        value: false,
                        valueChangeAction: null
                    })
            },
            _init: function() {
                this.callBase();
                this._animating = false;
                this._animationDuration = SWITCH_ANIMATION_DURATION
            },
            _render: function() {
                var element = this._element();
                this._$switchInner = $("<div />").addClass(SWITCH_INNER_CLASS);
                this._$handle = $("<div />").addClass(SWITCH_HANDLE_CLASS).appendTo(this._$switchInner);
                this._$labelOn = $("<div />").addClass(SWITCH_ON_CLASS).prependTo(this._$switchInner);
                this._$labelOff = $("<div />").addClass(SWITCH_OFF_CLASS).appendTo(this._$switchInner);
                this._$switchWrapper = $("<div />").addClass(SWITCH_WRAPPER_CLASS).append(this._$switchInner);
                element.addClass(SWITCH_CLASS).append(this._$switchWrapper);
                element.dxSwipeable({
                    elastic: false,
                    startAction: $.proxy(this._handleSwipeStart, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    endAction: $.proxy(this._handleSwipeEnd, this)
                });
                this._renderLabels();
                this.callBase();
                this._updateMarginBound();
                this._renderValue();
                this._renderValueChangeAction()
            },
            _renderValueChangeAction: function() {
                this._changeAction = this._createActionByOption("valueChangeAction")
            },
            _updateMarginBound: function() {
                this._marginBound = this._$switchWrapper.outerWidth(true) - this._$handle.width()
            },
            _renderPosition: function(state, swipeOffset) {
                var stateInt = state ? 1 : 0;
                this._$switchInner.css("marginLeft", this._marginBound * (stateInt + swipeOffset - 1))
            },
            _validateValue: function() {
                var check = this.option("value");
                if (typeof check !== "boolean")
                    this._options["value"] = !!check
            },
            _renderClick: function() {
                this.callBase();
                var eventName = events.addNamespace("dxclick", this.NAME),
                    clickAction = this._createAction($.proxy(this._handleClick, this));
                this._element().on(eventName, function(e) {
                    clickAction({jQueryEvent: e})
                })
            },
            _handleClick: function(args) {
                var self = args.component;
                if (self._animating || self._swiping)
                    return;
                self._animating = true;
                var startValue = self.option("value"),
                    endValue = !startValue;
                fx.animate(this._$switchInner, {
                    from: {marginLeft: (Number(startValue) - 1) * this._marginBound},
                    to: {marginLeft: (Number(endValue) - 1) * this._marginBound},
                    duration: self._animationDuration,
                    complete: function() {
                        self._animating = false;
                        self.option("value", endValue)
                    }
                })
            },
            _handleSwipeStart: function(e) {
                var state = this.option("value");
                e.jQueryEvent.maxLeftOffset = state ? 1 : 0;
                e.jQueryEvent.maxRightOffset = state ? 0 : 1;
                this._swiping = true
            },
            _handleSwipeUpdate: function(e) {
                this._renderPosition(this.option("value"), e.jQueryEvent.offset)
            },
            _handleSwipeEnd: function(e) {
                var self = this;
                fx.animate(this._$switchInner, {
                    to: {marginLeft: this._marginBound * (self.option("value") + e.jQueryEvent.targetOffset - 1)},
                    duration: self._animationDuration,
                    complete: function() {
                        self._swiping = false;
                        var pos = self.option("value") + e.jQueryEvent.targetOffset;
                        self.option("value", Boolean(pos))
                    }
                })
            },
            _renderValue: function() {
                this._validateValue();
                var val = this.option("value");
                this._renderPosition(val, 0);
                this._element().toggleClass(SWITCH_ON_VALUE_CLASS, val)
            },
            _renderLabels: function() {
                this._$labelOn.text(this.option("onText"));
                this._$labelOff.text(this.option("offText"))
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"visible":
                    case"width":
                        this._refresh();
                        break;
                    case"value":
                        this._renderValue();
                        this._changeAction(value);
                        break;
                    case"onText":
                    case"offText":
                        this._renderLabels();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            },
            _feedbackOff: function(isGestureStart) {
                if (isGestureStart)
                    return;
                this.callBase.apply(this, arguments)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.editBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var EDITBOX_CLASS = "dx-editbox",
            EDITBOX_INPUT_CLASS = "dx-editbox-input",
            EDITBOX_INPUT_SELECTOR = "." + EDITBOX_INPUT_CLASS,
            EDITBOX_BORDER_CLASS = "dx-editbox-border",
            EDITBOX_PLACEHOLDER_CLASS = "dx-placeholder",
            EVENTS_LIST = ["focusIn", "focusOut", "keyDown", "keyPress", "keyUp", "change"];
        var nativePlaceholderSupport = function() {
                var check = document.createElement("input");
                return "placeholder" in check
            }();
        ui.registerComponent("dxEditBox", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        value: "",
                        valueUpdateEvent: "change",
                        valueUpdateAction: null,
                        placeholder: "",
                        readOnly: false,
                        focusInAction: null,
                        focusOutAction: null,
                        keyDownAction: null,
                        keyPressAction: null,
                        keyUpAction: null,
                        changeAction: null,
                        enterKeyAction: null,
                        mode: "text"
                    })
            },
            _input: function() {
                return this._element().find(EDITBOX_INPUT_SELECTOR)
            },
            _render: function() {
                this._element().addClass(EDITBOX_CLASS);
                this._renderInput();
                this._renderInputType();
                this._renderValue();
                this._renderProps();
                this._renderPlaceholder();
                this._renderEvents();
                this._renderEnterKeyAction();
                this.callBase()
            },
            _renderInput: function() {
                this._element().append($("<input />").addClass(EDITBOX_INPUT_CLASS)).append($("<div />").addClass(EDITBOX_BORDER_CLASS))
            },
            _renderValue: function() {
                if (this._input().val() !== this.option("value"))
                    this._input().val(this.option("value"))
            },
            _renderProps: function() {
                this._input().prop({
                    placeholder: this.option("placeholder"),
                    readOnly: this.option("readOnly"),
                    disabled: this.option("disabled")
                })
            },
            _renderPlaceholder: function() {
                if (nativePlaceholderSupport)
                    return;
                var self = this,
                    placeholderText = self.option("placeholder"),
                    $input = self._input(),
                    $placeholder = $('<div />').addClass(EDITBOX_PLACEHOLDER_CLASS).addClass("dx-hide").attr("data-dx_placeholder", placeholderText),
                    startEvent = events.addNamespace("dxpointerdown", this.NAME);
                $placeholder.on(startEvent, function() {
                    $input.focus()
                });
                $input.wrap($placeholder).on("focus.dxEditBox focusin.dxEditBox", function() {
                    self._setStatePlaceholder.call(self, true)
                }).on("blur.dxEditBox focusout.dxEditBox", function() {
                    self._setStatePlaceholder.call(self, false)
                });
                self._setStatePlaceholder()
            },
            _renderEvents: function() {
                var self = this,
                    $input = self._input();
                $.each(EVENTS_LIST, function(_, event) {
                    var eventName = events.addNamespace(event.toLowerCase(), self.NAME),
                        action = self._createActionByOption(event + "Action");
                    $input.off(eventName).on(eventName, function(e) {
                        action({jQueryEvent: e})
                    })
                });
                self._renderValueUpdateEvent()
            },
            _renderValueUpdateEvent: function() {
                var valueUpdateEventName = events.addNamespace(this.option("valueUpdateEvent"), this.NAME);
                this._input().off("." + this.NAME, this._handleValueChange).on(valueUpdateEventName, $.proxy(this._handleValueChange, this));
                this._changeAction = this._createActionByOption("valueUpdateAction")
            },
            _setStatePlaceholder: function(state) {
                if (nativePlaceholderSupport)
                    return;
                var $input = this._input(),
                    $placeholder = $input.parent("." + EDITBOX_PLACEHOLDER_CLASS);
                if (state === undefined)
                    if (!$input.val() && !$input.prop("disabled") && $input.prop("placeholder"))
                        state = false;
                if ($input.val())
                    state = true;
                $placeholder.toggleClass("dx-hide", state)
            },
            _handleValueChange: function(e) {
                this._currentValueUpdateEvent = e;
                this.option("value", this._input().val());
                if (this._currentValueUpdateEvent)
                    this._dispatchChangeAction()
            },
            _renderEnterKeyAction: function() {
                if (this.option("enterKeyAction")) {
                    this._enterKeyAction = this._createActionByOption("enterKeyAction");
                    this._input().on("keyup.enterKey.dxEditBox", $.proxy(this._onKeyDownHandler, this))
                }
                else {
                    this._input().off("keyup.enterKey.dxEditBox");
                    this._enterKeyAction = undefined
                }
            },
            _onKeyDownHandler: function(e) {
                if (e.which === 13)
                    this._enterKeyAction({jQueryEvent: e})
            },
            _renderDisabledState: function() {
                this.callBase();
                this._renderProps()
            },
            _dispatchChangeAction: function() {
                this._changeAction({
                    actionValue: this.option("value"),
                    jQueryEvent: this._currentValueUpdateEvent
                });
                this._currentValueUpdateEvent = undefined
            },
            _updateValue: function() {
                this._renderValue();
                this._setStatePlaceholder();
                this._dispatchChangeAction()
            },
            _optionChanged: function(optionName) {
                if ($.inArray(optionName.replace("Action", ""), EVENTS_LIST) > -1) {
                    this._renderEvents();
                    return
                }
                switch (optionName) {
                    case"value":
                        this._updateValue();
                        break;
                    case"valueUpdateEvent":
                    case"valueUpdateAction":
                        this._renderValueUpdateEvent();
                        break;
                    case"readOnly":
                        this._renderProps();
                        break;
                    case"mode":
                        this._renderInputType();
                        break;
                    case"enterKeyAction":
                        this._renderEnterKeyAction();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _renderInputType: function() {
                var input = this._input();
                try {
                    input.prop("type", this.option("mode"))
                }
                catch(e) {
                    input.prop("type", "text")
                }
            },
            focus: function() {
                this._input().trigger("focus")
            }
        }));
        ui.dxEditBox.__internals = {nativePlaceholderSupport: function(newState) {
                if (arguments.length)
                    nativePlaceholderSupport = !!newState;
                return nativePlaceholderSupport
            }}
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.textBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var TEXTBOX_CLASS = "dx-textbox";
        var ignoreCode = [8, 9, 13, 33, 34, 35, 36, 37, 38, 39, 40, 46];
        ui.registerComponent("dxTextBox", ui.dxEditBox.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        mode: "text",
                        maxLength: null
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TEXTBOX_CLASS);
                if (this._isAndroid())
                    this._input().on(events.addNamespace("keydown", this.NAME), $.proxy(this._onKeyDownAndroidHandler, this)).on(events.addNamespace("change", this.NAME), $.proxy(this._onChangeAndroidHandler, this))
            },
            _renderProps: function() {
                this.callBase();
                if (this._isAndroid())
                    return;
                var maxLength = this.option("maxLength");
                if (maxLength > 0)
                    this._input().prop("maxLength", maxLength)
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"maxLength":
                        this._renderProps();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _onKeyDownAndroidHandler: function(e) {
                var maxLength = this.option("maxLength");
                if (maxLength) {
                    var $input = $(e.target),
                        code = e.keyCode;
                    this._cutOffExtraChar($input);
                    return $input.val().length < maxLength || $.inArray(code, ignoreCode) !== -1 || window.getSelection().toString() !== ""
                }
                else
                    return true
            },
            _onChangeAndroidHandler: function(e) {
                var $input = $(e.target);
                if (this.option("maxLength"))
                    this._cutOffExtraChar($input)
            },
            _cutOffExtraChar: function($input) {
                var maxLength = this.option("maxLength"),
                    textInput = $input.val();
                if (textInput.length > maxLength)
                    $input.val(textInput.substr(0, maxLength))
            },
            _isAndroid: function() {
                var ua = window.navigator.userAgent,
                    version = DX.devices.real.version.join(".");
                return DX.devices.real.platform === "android" && version && /^(2\.|4\.0|4\.1)/.test(version) && ua.indexOf("Chrome") === -1
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.textArea.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var TEXTAREA_CLASS = "dx-textarea",
            EDITBOX_INPUT_CLASS = "dx-editbox-input",
            EDITBOX_BORDER_CLASS = "dx-editbox-border";
        ui.registerComponent("dxTextArea", ui.dxTextBox.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {})
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TEXTAREA_CLASS)
            },
            _renderInput: function() {
                this._element().append($("<textarea>").addClass(EDITBOX_INPUT_CLASS)).append($("<div />").addClass(EDITBOX_BORDER_CLASS));
                this._renderScrollHandler()
            },
            _renderScrollHandler: function() {
                var $input = this._input(),
                    eventY = 0;
                $input.on(events.addNamespace("dxpointerdown", this.NAME), function(e) {
                    eventY = events.eventData(e).y
                });
                $input.on(events.addNamespace("dxpointermove", this.NAME), function(e) {
                    var scrollTopPos = $input.scrollTop(),
                        scrollBottomPos = $input.get(0).scrollHeight - $input.outerHeight() - scrollTopPos;
                    if (scrollTopPos === 0 && scrollBottomPos === 0)
                        return;
                    var currentEventY = events.eventData(e).y;
                    var isScrollFromTop = scrollTopPos === 0 && eventY >= currentEventY;
                    var isScrollFromBottom = scrollBottomPos === 0 && eventY <= currentEventY;
                    var isScrollFromMiddle = scrollTopPos > 0 && scrollBottomPos > 0;
                    if (isScrollFromTop || isScrollFromBottom || isScrollFromMiddle)
                        e.originalEvent.isScrollingEvent = true;
                    eventY = currentEventY
                })
            },
            _renderInputType: $.noop,
            _renderDimensions: function() {
                this.callBase();
                var width = this.option("width"),
                    height = this.option("height");
                this._input().width(width);
                this._input().height(height)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.numberBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math,
            events = ui.events;
        ui.registerComponent("dxNumberBox", ui.dxEditBox.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        value: 0,
                        min: -Number.MAX_VALUE,
                        max: Number.MAX_VALUE,
                        mode: "number"
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-numberbox");
                this._setInputInvalidHandler()
            },
            _renderProps: function() {
                this.callBase();
                this._input().prop({
                    min: this.option("min"),
                    max: this.option("max")
                })
            },
            _setInputInvalidHandler: function() {
                var self = this,
                    valueUpdateEvent = events.addNamespace(this.option("valueUpdateEvent"), this.NAME);
                this._input().on(valueUpdateEvent, function() {
                    var validatingInput = self._input()[0];
                    if (typeof validatingInput.checkValidity === "function")
                        validatingInput.checkValidity()
                }).focusout($.proxy(this._trimInputValue, this)).on("invalid", $.proxy(this._inputInvalidHandler, this))
            },
            _renderValue: function() {
                var value = this.option("value") ? this.option("value").toString() : this.option("value");
                if (this._input().val() !== value)
                    this._input().val(this.option("value"))
            },
            _trimInputValue: function() {
                var $input = this._input(),
                    value = $.trim($input.val());
                if (value[value.length - 1] === ".")
                    value = value.slice(0, -1);
                this._forceRefreshInputValue(value)
            },
            _inputInvalidHandler: function() {
                var $input = this._input(),
                    value = $input.val();
                if (this._oldValue) {
                    this.option("value", this._oldValue);
                    $input.val(this._oldValue);
                    this._oldValue = null;
                    return
                }
                if (value && !/,/.test(value))
                    return;
                this.option("value", "");
                $input.val("")
            },
            _handleValueChange: function() {
                var $input = this._input(),
                    value = $.trim($input.val());
                if (!this._validateValue(value))
                    return;
                value = this._parseValue(value);
                if (!value && value !== 0)
                    return;
                this.option("value", value);
                if ($input.val() != value)
                    $input.val(value)
            },
            _forceRefreshInputValue: function(value) {
                var $input = this._input();
                $input.val("").val(value)
            },
            _validateValue: function(value) {
                var valueUpdateEvent = events.addNamespace(this.option("valueUpdateEvent"), this.NAME),
                    $input = this._input();
                this._oldValue = null;
                this._hasCommaChar = null;
                if (/,/.test(value) || this._calcPointsCount(value) > 1) {
                    value = "";
                    this._hasCommaChar = true;
                    $input.one(valueUpdateEvent, function() {
                        $input.trigger("invalid")
                    })
                }
                if (!value) {
                    this._oldValue = this.option("value");
                    this.option("value", "");
                    if (this._hasCommaChar)
                        $input.trigger("invalid");
                    return false
                }
                if (value[value.length - 1] === ".")
                    return false;
                return true
            },
            _calcPointsCount: function(string) {
                var count = 0,
                    position = -1;
                while ((position = $.inArray(".", string.split(""), position + 1)) > -1)
                    count++;
                return count
            },
            _parseValue: function(value) {
                var number = Globalize.parseFloat(value, 10, Globalize.cultures["default"].language);
                if (isNaN(number)) {
                    this._input().val(this.option("value"));
                    return undefined
                }
                number = math.max(number, this.option("min"));
                number = math.min(number, this.option("max"));
                return number
            },
            _optionChanged: function(name) {
                if (name === "min" || name === "max")
                    this._renderProps(arguments);
                else
                    this.callBase.apply(this, arguments)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.slider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator,
            utils = DX.utils;
        var SLIDER_CLASS = "dx-slider",
            SLIDER_WRAPPER_CLASS = SLIDER_CLASS + "-wrapper",
            SLIDER_HANDLE_CLASS = SLIDER_CLASS + "-handle",
            SLIDER_HANDLE_SELECTOR = "." + SLIDER_HANDLE_CLASS,
            SLIDER_BAR_CLASS = SLIDER_CLASS + "-bar",
            SLIDER_RANGE_CLASS = SLIDER_CLASS + "-range";
        ui.registerComponent("dxSlider", ui.Widget.inherit({
            _activeStateUnit: SLIDER_HANDLE_SELECTOR,
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        min: 0,
                        max: 100,
                        step: 1,
                        value: 50
                    })
            },
            _init: function() {
                this.callBase();
                utils.windowResizeCallbacks.add(this._refreshHandler = $.proxy(this._refresh, this))
            },
            _dispose: function() {
                this.callBase();
                utils.windowResizeCallbacks.remove(this._refreshHandler)
            },
            _render: function() {
                this.callBase();
                this._$wrapper = $("<div />").addClass(SLIDER_WRAPPER_CLASS);
                this._$bar = $("<div />").addClass(SLIDER_BAR_CLASS).appendTo(this._$wrapper);
                this._$selectedRange = $("<div />").addClass(SLIDER_RANGE_CLASS).appendTo(this._$bar);
                this._$handle = $("<div />").addClass(SLIDER_HANDLE_CLASS).appendTo(this._$bar);
                this._element().addClass(SLIDER_CLASS).append(this._$wrapper);
                this._$wrapper.dxSwipeable({
                    elastic: false,
                    startAction: $.proxy(this._handleSwipeStart, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    itemWidthFunc: $.proxy(this._itemWidthFunc, this)
                });
                this._renderValue();
                this._renderStartHandler()
            },
            _renderStartHandler: function() {
                var eventName = events.addNamespace("dxpointerdown", this.NAME),
                    startAction = this._createAction($.proxy(this._handleStart, this));
                this._element().on(eventName, function(e) {
                    startAction({jQueryEvent: e})
                })
            },
            _itemWidthFunc: function() {
                return this._element().width()
            },
            _handleSwipeStart: function(e) {
                this._startOffset = this._currentRatio;
                e.jQueryEvent.maxLeftOffset = this._startOffset;
                e.jQueryEvent.maxRightOffset = 1 - this._startOffset
            },
            _handleSwipeUpdate: function(e) {
                this._handleValueChange(this._startOffset + e.jQueryEvent.offset)
            },
            _handleValueChange: function(ratio) {
                var min = this.option("min"),
                    max = this.option("max"),
                    step = this.option("step"),
                    newChange = ratio * (max - min),
                    newValue = min + newChange;
                if (!step || isNaN(step))
                    step = 1;
                step = parseFloat(step.toFixed(5));
                if (step === 0)
                    step = 0.00001;
                if (step < 0)
                    return;
                if (newValue === max || newValue === min)
                    this.option("value", newValue);
                else {
                    var stepChunks = (step + "").split('.'),
                        exponent = stepChunks.length > 1 ? stepChunks[1].length : exponent;
                    newValue = Number((Math.round(newChange / step) * step + min).toFixed(exponent));
                    this.option("value", this._fitValue(newValue))
                }
            },
            _fitValue: function(value) {
                value = Math.min(value, this.option("max"));
                value = Math.max(value, this.option("min"));
                return value
            },
            _handleStart: function(args) {
                var e = args.jQueryEvent;
                if (events.needSkipEvent(e))
                    return;
                this._currentRatio = (ui.events.eventData(e).x - this._$bar.offset().left) / this._$bar.width();
                this._handleValueChange(this._currentRatio)
            },
            _renderValue: function() {
                var val = this.option("value"),
                    min = this.option("min"),
                    max = this.option("max");
                if (min > max)
                    return;
                if (val < min) {
                    this.option("value", min);
                    this._currentRatio = 0;
                    return
                }
                if (val > max) {
                    this.option("value", max);
                    this._currentRatio = 1;
                    return
                }
                var handleWidth = this._$handle.outerWidth(),
                    barWidth = this._$bar.width(),
                    ratio = min === max ? 0 : (val - min) / (max - min);
                this._$selectedRange.width(ratio * barWidth);
                translator.move(this._$handle, {left: ratio * barWidth - handleWidth / 2});
                this._currentRatio = ratio
            },
            _refresh: function() {
                this._renderValue()
            },
            _feedbackOff: function(isGestureStart) {
                if (isGestureStart)
                    return;
                this.callBase.apply(this, arguments)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.rangeSlider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator;
        var SLIDER_HANDLE_CLASS = "dx-slider-handle";
        ui.registerComponent("dxRangeSlider", ui.dxSlider.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        start: 40,
                        end: 60,
                        value: 50
                    })
            },
            _render: function() {
                this._$handleRight = $("<div />").addClass(SLIDER_HANDLE_CLASS);
                this.callBase();
                this._$handleRight.appendTo(this._$bar)
            },
            _handleStart: function(args) {
                var e = args.jQueryEvent;
                var eventOffsetX = events.eventData(e).x - this._$bar.offset().left,
                    leftHandleX = this._$handle.position().left,
                    rightHandleX = this._$handleRight.position().left;
                this._$handlersDistance = Math.abs(leftHandleX - rightHandleX);
                this._capturedHandle = (leftHandleX + rightHandleX) / 2 > eventOffsetX ? this._$handle : this._$handleRight;
                this.callBase(args)
            },
            _handleSwipeUpdate: function(e) {
                if (Math.abs(this.option("start") - this.option("end")) === 0 && this._$handlersDistance < this._$handle.outerWidth()) {
                    this._feedbackOff(true);
                    this._capturedHandle = e.jQueryEvent.offset <= 0 ? this._$handle : this._$handleRight;
                    this._feedbackOn(this._capturedHandle, true)
                }
                this.callBase(e)
            },
            _handleValueChange: function(ratio) {
                this.callBase(ratio);
                var option = this._capturedHandle === this._$handle ? "start" : "end",
                    start = this.option("start"),
                    end = this.option("end"),
                    newValue = this.option("value"),
                    max = this.option("max"),
                    min = this.option("min");
                if (start > max) {
                    start = max;
                    this.option("start", max)
                }
                if (start < min) {
                    start = min;
                    this.option("start", min)
                }
                if (end > max) {
                    end = max;
                    this.option("end", max)
                }
                if (newValue > end && option === "start")
                    newValue = end;
                if (newValue < start && option === "end")
                    newValue = start;
                this.option(option, newValue)
            },
            _renderValue: function() {
                var valStart = this.option("start"),
                    valEnd = this.option("end"),
                    min = this.option("min"),
                    max = this.option("max");
                if (valStart < min)
                    valStart = min;
                if (valStart > max)
                    valStart = max;
                if (valEnd > max)
                    valEnd = max;
                if (valEnd < valStart)
                    valEnd = valStart;
                var handleWidth = this._$handle.outerWidth(),
                    barWidth = this._$bar.width(),
                    ratio1 = max === min ? 0 : (valStart - min) / (max - min),
                    ratio2 = max === min ? 0 : (valEnd - min) / (max - min);
                this._$selectedRange.width((ratio2 - ratio1) * barWidth);
                translator.move(this._$selectedRange, {left: ratio1 * barWidth});
                translator.move(this._$handle, {left: ratio1 * barWidth - handleWidth / 2});
                translator.move(this._$handleRight, {left: ratio2 * barWidth - handleWidth / 2})
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.radioGroup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var RADIO_GROUP_CLASS = "dx-radio-group",
            RADIO_GROUP_VERTICAL_CLASS = "dx-radio-group-vertical",
            RADIO_GROUP_HORIZONTAL_CLASS = "dx-radio-group-horizontal",
            RADIO_BUTTON_CLASS = "dx-radio-button",
            RADIO_BUTTON_INPUT_CLASS = "dx-radio-button-input",
            RADIO_BUTTON_VALUE_CLASS = "dx-radio-button-value",
            RADIO_BUTTON_ACTIVE_STATE = "dx-state-active",
            RADIO_BUTTON_DATA_KEY = "dxRadioButtonData",
            RADIO_BUTTON_SELECTOR = "input[type='radio']",
            RADIO_BUTTON_TAG = "<input type='radio' />";
        ui.registerComponent("dxRadioGroup", ui.SelectableCollectionWidget.inherit({
            _activeStateUnit: "label",
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        layout: "vertical",
                        name: "radioGroup",
                        value: undefined,
                        valueExpr: null,
                        displayExpr: "this"
                    })
            },
            _itemClass: function() {
                return RADIO_BUTTON_CLASS
            },
            _itemDataKey: function() {
                return RADIO_BUTTON_DATA_KEY
            },
            _itemContainer: function() {
                return this._element()
            },
            _init: function() {
                this.callBase();
                if (!this._dataSource)
                    this._itemsToDataSource()
            },
            _render: function() {
                this._compileValueGetter();
                this._compileDisplayGetter();
                this.callBase();
                this._renderLayout();
                this._addClasses();
                this._renderValue()
            },
            _renderValue: function() {
                var index = this.option("selectedIndex"),
                    value = this.option("value");
                if (value)
                    this._changeValue(value);
                else
                    this.option("value", this._getValueByIndex(index))
            },
            _renderLayout: function() {
                var layout = this.option("layout");
                this._element().toggleClass(RADIO_GROUP_VERTICAL_CLASS, layout === "vertical");
                this._element().toggleClass(RADIO_GROUP_HORIZONTAL_CLASS, layout === "horizontal")
            },
            _addClasses: function() {
                var $element = this._element();
                $element.addClass(RADIO_GROUP_CLASS);
                $element.find("span").addClass(RADIO_BUTTON_VALUE_CLASS);
                $element.find(RADIO_BUTTON_SELECTOR).addClass(RADIO_BUTTON_INPUT_CLASS)
            },
            _attachSelectedEvent: function() {
                var itemSelectAction = this._createAction(this._handleItemSelect);
                this._element().off("." + this.NAME, RADIO_BUTTON_SELECTOR).on(events.addNamespace("dxclick", this.NAME), "label", function(e) {
                    itemSelectAction({jQueryEvent: e})
                })
            },
            _renderSelectedIndex: function(index) {
                var $inputs = this._itemContainer().find(RADIO_BUTTON_SELECTOR);
                if (index >= 0 && index < $inputs.length) {
                    var $currentInput = $inputs.eq(index),
                        $currentRadioGroup = $currentInput.closest("." + RADIO_GROUP_CLASS);
                    $currentInput.prop("checked", true);
                    $currentRadioGroup.find("." + RADIO_BUTTON_CLASS).removeClass("checked");
                    $currentInput.closest("." + RADIO_BUTTON_CLASS).addClass("checked")
                }
            },
            _itemRenderDefault: function(item, index, $itemElement) {
                this.callBase(item, index, $itemElement);
                if (item.html)
                    return;
                var $itemText = $("<span>").text(this._displayGetter(item)),
                    $inputRadio = $(RADIO_BUTTON_TAG),
                    $label = $("<label>");
                $inputRadio.prop("value", this._getItemValue(item));
                $label.append($inputRadio).append($itemText);
                $itemElement.html($label)
            },
            _postprocessRenderItem: function(args) {
                $(args.itemElement).find(RADIO_BUTTON_SELECTOR).prop("name", this.option("name"))
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"))
            },
            _compileValueGetter: function() {
                this._valueGetter = DX.data.utils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || this._dataSource && this._dataSource._store._key || "this"
            },
            _compileDisplayGetter: function() {
                this._displayGetter = DX.data.utils.compileGetter(this.option("displayExpr"))
            },
            _getItemValue: function(item) {
                return this._valueGetter(item) || item.text
            },
            _getValueByIndex: function(index) {
                var $inputs = this._itemContainer().find(RADIO_BUTTON_SELECTOR);
                if (index < 0 || index >= $inputs.length)
                    return undefined;
                var itemElement = this._selectedItemElement(index),
                    itemData = this._getItemData(itemElement);
                return this._getItemValue(itemData)
            },
            _searchValue: function(value) {
                var self = this,
                    store = this._dataSource.store(),
                    valueExpr = this._valueGetterExpr();
                var deffered = $.Deferred();
                if (valueExpr === store.key() || store instanceof DX.data.CustomStore)
                    store.byKey(value).done(function(result) {
                        deffered.resolveWith(self, [result])
                    });
                else
                    store.load({filter: [valueExpr, value]}).done(function(result) {
                        deffered.resolveWith(self, result)
                    });
                return deffered.promise()
            },
            _changeValue: function(value) {
                var self = this,
                    ds = this._dataSource;
                this._searchValue(value).done(function(result) {
                    if (ds.isLoaded())
                        self.option("selectedIndex", $.inArray(result, ds.items()));
                    else
                        ds.load().done(function() {
                            self.option("selectedIndex", $.inArray(result, ds.items()))
                        })
                })
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"value":
                        this._changeValue(value);
                        break;
                    case"selectedIndex":
                        this.callBase.apply(this, arguments);
                        this.option("value", this._getValueByIndex(value));
                        break;
                    case"layout":
                        this._renderLayout();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.tabs.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            TABS_CLASS = "dx-tabs",
            TABS_WRAPPER_CLASS = "dx-indent-wrapper",
            TABS_ITEM_CLASS = "dx-tab",
            TABS_ITEM_SELECTOR = ".dx-tab",
            TABS_ITEM_SELECTED_CLASS = "dx-tab-selected",
            TABS_ITEM_TEXT_CLASS = "dx-tab-text",
            ICON_CLASS = "dx-icon",
            TABS_ITEM_DATA_KEY = "dxTabData";
        ui.registerComponent("dxTabs", ui.SelectableCollectionWidget.inherit({
            _activeStateUnit: TABS_ITEM_SELECTOR,
            _defaultOptions: function() {
                return $.extend(this.callBase(), {})
            },
            _itemClass: function() {
                return TABS_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TABS_ITEM_DATA_KEY
            },
            _itemRenderDefault: function(item, index, itemElement) {
                this.callBase(item, index, itemElement);
                if (item.html)
                    return;
                var text = item.text,
                    icon = item.icon,
                    iconSrc = item.iconSrc,
                    iconElement;
                if (text)
                    itemElement.wrapInner($("<span />").addClass(TABS_ITEM_TEXT_CLASS));
                if (icon)
                    iconElement = $("<span />").addClass(ICON_CLASS + "-" + icon);
                else if (iconSrc)
                    iconElement = $("<img />").attr("src", iconSrc);
                if (iconElement)
                    iconElement.addClass(ICON_CLASS).prependTo(itemElement)
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TABS_CLASS);
                this._renderWrapper()
            },
            _renderWrapper: function() {
                this._element().wrapInner($("<div />").addClass(TABS_WRAPPER_CLASS))
            },
            _renderSelectedIndex: function(current, previous) {
                var $tabs = this._itemElements();
                if (previous >= 0)
                    $tabs.eq(previous).removeClass(TABS_ITEM_SELECTED_CLASS);
                if (current >= 0)
                    $tabs.eq(current).addClass(TABS_ITEM_SELECTED_CLASS)
            },
            _attachSelectedEvent: function() {
                var itemSelector = this._itemSelector(),
                    itemSelectAction = this._createAction(this._handleItemSelect),
                    eventName = events.addNamespace("dxpointerup", this.NAME);
                this._element().off(eventName, itemSelector).on(eventName, itemSelector, function(e) {
                    var $itemElement = $(e.target).closest(itemSelector);
                    itemSelectAction({
                        itemElement: $itemElement,
                        jQueryEvent: e
                    })
                })
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.navBar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            NAVBAR_CLASS = "dx-navbar",
            NABAR_ITEM_CLASS = "dx-nav-item",
            NAVBAR_ITEM_CONTENT_CLASS = "dx-nav-item-content";
        ui.registerComponent("dxNavBar", ui.dxTabs.inherit({
            _render: function() {
                this.callBase();
                this._element().addClass(NAVBAR_CLASS)
            },
            _renderItem: function(index, item) {
                var itemElement = this.callBase(index, item);
                return itemElement.addClass(NABAR_ITEM_CLASS).wrapInner($("<div />").addClass(NAVBAR_ITEM_CONTENT_CLASS))
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.pivotTabs.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            translator = DX.translator,
            events = ui.events;
        var PIVOT_TABS_CLASS = "dx-pivottabs",
            PIVOT_TAB_CLASS = "dx-pivottabs-tab",
            PIVOT_TAB_SELECTED_CLASS = "dx-pivottabs-tab-selected",
            PIVOT_GHOST_TAB_CLASS = "dx-pivottabs-ghosttab",
            PIVOT_TAB_DATA_KEY = "dxPivotTabData",
            PIVOT_TAB_MOVE_DURATION = 200,
            PIVOT_TAB_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)";
        var animation = {
                moveTo: function($tab, position, completeAction) {
                    return fx.animate($tab, {
                            type: "slide",
                            to: {left: position},
                            duration: PIVOT_TAB_MOVE_DURATION,
                            easing: PIVOT_TAB_MOVE_EASING,
                            complete: completeAction
                        })
                },
                slideAppear: function($tab, position) {
                    return fx.animate($tab, {
                            type: "slide",
                            to: {
                                left: position,
                                opacity: 1
                            },
                            duration: PIVOT_TAB_MOVE_DURATION,
                            easing: PIVOT_TAB_MOVE_EASING
                        })
                },
                slideDisappear: function($tab, position) {
                    return fx.animate($tab, {
                            type: "slide",
                            to: {
                                left: position,
                                opacity: 0
                            },
                            duration: PIVOT_TAB_MOVE_DURATION,
                            easing: PIVOT_TAB_MOVE_EASING
                        })
                }
            };
        var completeAnimation = function(elements) {
                if (!elements)
                    return;
                $.each(elements, function(_, element) {
                    fx.stop(element, true)
                })
            };
        ui.registerComponent("dxPivotTabs", ui.SelectableCollectionWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        selectedIndex: 0,
                        updatePositionAction: null,
                        rollbackAction: null,
                        completeAction: null,
                        stopAction: null
                    })
            },
            _itemClass: function() {
                return PIVOT_TAB_CLASS
            },
            _itemDataKey: function() {
                return PIVOT_TAB_DATA_KEY
            },
            _itemContainer: function() {
                return this._element()
            },
            _init: function() {
                this.callBase();
                this._initGhostTab();
                this._initSwipeHandlers();
                this._initActions()
            },
            _initGhostTab: function() {
                this._$ghostTab = $("<div>").addClass(PIVOT_GHOST_TAB_CLASS)
            },
            _initActions: function() {
                this._updatePositionAction = this._createActionByOption("updatePositionAction");
                this._rollbackAction = this._createActionByOption("rollbackAction");
                this._completeAction = this._createActionByOption("completeAction");
                this._stopAction = this._createActionByOption("stopAction")
            },
            _render: function() {
                this._element().addClass(PIVOT_TABS_CLASS);
                this.callBase();
                this._renderGhostTab()
            },
            _renderGhostTab: function() {
                this._itemContainer().append(this._$ghostTab);
                this._toggleGhostTab(false)
            },
            _toggleGhostTab: function(visible) {
                var $ghostTab = this._$ghostTab;
                if (visible) {
                    this._updateGhostTabContent();
                    $ghostTab.css("opacity", 1)
                }
                else
                    $ghostTab.css("opacity", 0)
            },
            _isGhostTabVisible: function() {
                return this._$ghostTab.css("opacity") == 1
            },
            _updateGhostTabContent: function(prevIndex) {
                prevIndex = prevIndex === undefined ? this._previousIndex() : prevIndex;
                var $ghostTab = this._$ghostTab,
                    $items = this._itemElements();
                $ghostTab.html($items.eq(prevIndex).html())
            },
            _updateTabsPositions: function(offset) {
                var $tabs = this._allTabElements(),
                    offset = this._applyOffsetBoundaries(offset),
                    isRightSwipeHandled = offset > 0,
                    tabPositions = this._calculateTabPositions(isRightSwipeHandled ? "replace" : "append");
                this._moveTabs(tabPositions, offset);
                this._toggleGhostTab(isRightSwipeHandled)
            },
            _moveTabs: function(positions, offset) {
                offset = offset || 0;
                var $tabs = this._allTabElements();
                $tabs.each(function(index) {
                    translator.move($(this), {left: positions[index] + offset})
                })
            },
            _applyOffsetBoundaries: function(offset) {
                offset = offset || 0;
                var maxOffset = offset > 0 ? this._maxRightOffset : this._maxLeftOffset;
                return offset * maxOffset
            },
            _animateRollback: function() {
                var self = this,
                    $tabs = this._itemElements(),
                    positions = this._calculateTabPositions("prepend");
                if (this._isGhostTabVisible()) {
                    this._swapGhostWithTab($tabs.eq(this._previousIndex()));
                    animation.moveTo(this._$ghostTab, positions[this._indexBoundary()], function() {
                        self._toggleGhostTab(false)
                    })
                }
                $tabs.each(function(index) {
                    animation.moveTo($(this), positions[index])
                })
            },
            _animateComplete: function(newIndex, currentIndex) {
                var self = this,
                    $tabs = this._itemElements(),
                    isRightSwipeHandled = this._isGhostTabVisible();
                $tabs.eq(currentIndex).removeClass(PIVOT_TAB_SELECTED_CLASS);
                var animations = isRightSwipeHandled ? this._animateIndexDecreasing(newIndex) : this._animateIndexIncreasing(newIndex);
                $tabs.eq(newIndex).addClass(PIVOT_TAB_SELECTED_CLASS);
                animations.done(function() {
                    self._indexChangeOnAnimation = true;
                    self.option("selectedIndex", newIndex);
                    self._indexChangeOnAnimation = false
                })
            },
            _animateIndexDecreasing: function(newIndex) {
                var $tabs = this._itemElements(),
                    positions = this._calculateTabPositions("append", newIndex),
                    animations = [];
                $tabs.each(function(index) {
                    animations.push(animation.moveTo($(this), positions[index]))
                });
                animations.push(animation.slideDisappear(this._$ghostTab, positions[this._indexBoundary()]));
                return $.when.apply($, animations)
            },
            _animateIndexIncreasing: function(newIndex) {
                var self = this,
                    $tabs = this._itemElements(),
                    positions = this._calculateTabPositions("prepend", newIndex),
                    previousIndex = this._previousIndex(newIndex),
                    isLeftSwipeHandled = translator.locate($tabs.eq(previousIndex)).left < 0,
                    animations = [];
                if (!isLeftSwipeHandled)
                    this._moveTabs(this._calculateTabPositions("append", previousIndex));
                this._updateGhostTabContent(previousIndex);
                this._swapGhostWithTab($tabs.eq(previousIndex));
                $tabs.each(function(index) {
                    var $tab = $(this),
                        newPosition = positions[index];
                    animations.push(index === previousIndex ? animation.slideAppear($tab, newPosition) : animation.moveTo($tab, newPosition))
                });
                animations.push(animation.moveTo(this._$ghostTab, positions[this._indexBoundary()], function() {
                    self._toggleGhostTab(false)
                }));
                return $.when.apply($, animations)
            },
            _swapGhostWithTab: function($tab) {
                var $ghostTab = this._$ghostTab,
                    lastTabPosition = translator.locate($tab).left,
                    lastTabOpacity = $tab.css("opacity");
                translator.move($tab, {left: translator.locate($ghostTab).left});
                $tab.css("opacity", $ghostTab.css("opacity"));
                translator.move($ghostTab, {left: lastTabPosition});
                $ghostTab.css("opacity", lastTabOpacity)
            },
            _calculateTabPositions: function(ghostPosition, index) {
                index = index === undefined ? this.option("selectedIndex") : index;
                var mark = index + ghostPosition;
                if (this._calculetedPositionsMark !== mark) {
                    this._calculetedPositions = this._calculateTabPositionsImpl(index, ghostPosition);
                    this._calculetedPositionsMark = mark
                }
                return this._calculetedPositions
            },
            _calculateTabPositionsImpl: function(currentIndex, ghostPosition) {
                var prevIndex = this._normalizeIndex(currentIndex - 1),
                    $tabs = this._itemElements(),
                    widths = [],
                    nextPosition = 0,
                    positions = [];
                $tabs.each(function() {
                    widths.push($(this).outerWidth())
                });
                var calculateTabPosition = function(currentIndex, width) {
                        positions.splice(currentIndex, 0, nextPosition);
                        nextPosition += width
                    };
                $.each(widths.slice(currentIndex), calculateTabPosition);
                $.each(widths.slice(0, currentIndex), calculateTabPosition);
                switch (ghostPosition) {
                    case"replace":
                        var lastTabPosition = positions[prevIndex];
                        positions.splice(prevIndex, 1, -widths[prevIndex]);
                        positions.push(lastTabPosition);
                        break;
                    case"prepend":
                        positions.push(-widths[prevIndex]);
                        break;
                    case"append":
                        positions.push(nextPosition);
                        break
                }
                return positions
            },
            _allTabElements: function() {
                return this._itemContainer().find("." + PIVOT_TAB_CLASS + ", ." + PIVOT_GHOST_TAB_CLASS)
            },
            _initSwipeHandlers: function() {
                this._element().on(events.addNamespace("dxswipestart", this.NAME), $.proxy(this._swipeStartHandler, this)).on(events.addNamespace("dxswipe", this.NAME), $.proxy(this._swipeUpdateHandler, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._swipeEndHandler, this))
            },
            _swipeStartHandler: function(e) {
                this._stopAnimation();
                this._stopAction({isGesture: true});
                if (this.option("disabled") || this._indexBoundary() <= 1)
                    e.cancel = true
            },
            _stopAnimation: function() {
                completeAnimation(this._allTabElements())
            },
            _swipeUpdateHandler: function(e) {
                var offset = e.offset;
                this._updatePositionAction({
                    offset: offset,
                    isGesture: true
                });
                this._updateTabsPositions(offset)
            },
            _swipeEndHandler: function(e) {
                var selectedIndex = this.option("selectedIndex"),
                    targetOffset = e.targetOffset;
                if (targetOffset === 0) {
                    this._animateRollback();
                    this._rollbackAction({isGesture: true})
                }
                else {
                    var newIndex = this._normalizeIndex(selectedIndex - targetOffset);
                    this._animateComplete(newIndex, selectedIndex);
                    this._completeAction({
                        newIndex: newIndex,
                        isGesture: true
                    })
                }
            },
            _previousIndex: function(atIndex) {
                atIndex = atIndex === undefined ? this.option("selectedIndex") : atIndex;
                return this._normalizeIndex(atIndex - 1)
            },
            _normalizeIndex: function(index) {
                var boundary = this._indexBoundary();
                if (index < 0)
                    index = boundary + index;
                if (index >= boundary)
                    index = index - boundary;
                return index
            },
            _indexBoundary: function() {
                return this.option("items").length
            },
            _attachSelectedEvent: function() {
                var itemSelector = this._itemSelector(),
                    itemSelectAction = this._createAction(this._handleItemSelect),
                    eventName = events.addNamespace("dxpointerup", this.NAME);
                this._element().off(eventName, itemSelector).on(eventName, itemSelector, function(e) {
                    itemSelectAction({jQueryEvent: e})
                })
            },
            _onItemSelectAction: function(newIndex) {
                this._stopAnimation();
                this._stopAction();
                this._animateComplete(newIndex, this.option("selectedIndex"));
                this._completeAction({newIndex: newIndex})
            },
            _renderSelectedIndex: function(current, previous) {
                var $tabs = this._itemElements();
                this._calculateMaxOffsets(current);
                if (!this._indexChangeOnAnimation) {
                    $tabs.eq(previous).removeClass(PIVOT_TAB_SELECTED_CLASS);
                    this._updateTabsPositions();
                    $tabs.eq(current).addClass(PIVOT_TAB_SELECTED_CLASS)
                }
            },
            _calculateMaxOffsets: function(index) {
                var $tabs = this._itemElements();
                this._maxLeftOffset = $tabs.eq(index).outerWidth();
                this._maxRightOffset = $tabs.eq(this._previousIndex(index)).outerWidth()
            },
            _itemRenderDefault: function(item, index, $itemElement) {
                var $itemText = $("<span>").text(item.title);
                $itemElement.html($itemText)
            },
            _optionChanged: function(name) {
                if (name === "items")
                    delete this._calculetedPositionsMark;
                this.callBase.apply(this, arguments)
            },
            updatePosition: function(offset) {
                this._updateTabsPositions(offset)
            },
            rollback: function() {
                this._animateRollback()
            },
            complete: function(newIndex) {
                this._animateComplete(newIndex, this.option("selectedIndex"))
            },
            stop: function() {
                this._stopAnimation()
            }
        }));
        ui.dxPivotTabs.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.pivot.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator;
        var PIVOT_CLASS = "dx-pivot",
            PIVOT_TABS_CONTAINER_CLASS = "dx-pivottabs-container",
            PIVOT_ITEM_CONTAINER_CLASS = "dx-pivot-itemcontainer",
            PIVOT_ITEM_WRAPPER_CLASS = "dx-pivot-itemwrapper",
            PIVOT_ITEM_CLASS = "dx-pivot-item",
            PIVOT_ITEM_HIDDEN_CLASS = "dx-pivot-item-hidden",
            PIVOT_ITEM_DATA_KEY = "dxPivotItemData",
            PIVOT_RETURN_BACK_DURATION = 200,
            PIVOT_SLIDE_AWAY_DURATION = 50,
            PIVOT_SLIDE_BACK_DURATION = 250,
            PIVOT_SLIDE_BACK_EASING = "cubic-bezier(.10, 1, 0, 1)";
        var animation = {
                returnBack: function($element) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: 0},
                        duration: PIVOT_RETURN_BACK_DURATION
                    })
                },
                slideAway: function($element, position, completeAction) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: position},
                        duration: PIVOT_SLIDE_AWAY_DURATION,
                        complete: completeAction
                    })
                },
                slideBack: function($element) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: 0},
                        easing: PIVOT_SLIDE_BACK_EASING,
                        duration: PIVOT_SLIDE_BACK_DURATION
                    })
                }
            };
        var completeAnimation = function(element) {
                fx.stop(element, true)
            };
        ui.registerComponent("dxPivot", ui.SelectableCollectionWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {selectedIndex: 0})
            },
            _itemClass: function() {
                return PIVOT_ITEM_CLASS
            },
            _itemDataKey: function() {
                return PIVOT_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$itemWrapper
            },
            _init: function() {
                this.callBase();
                this._initTabs();
                this._initItemContainer();
                this._clearItemsCache();
                this._initSwipeHandlers()
            },
            _initItemContainer: function() {
                var $itemContainer = $("<div>").addClass(PIVOT_ITEM_CONTAINER_CLASS);
                this._element().append($itemContainer);
                this._$itemWrapper = $("<div>").addClass(PIVOT_ITEM_WRAPPER_CLASS);
                $itemContainer.append(this._$itemWrapper)
            },
            _clearItemsCache: function() {
                this._itemsCache = []
            },
            _initTabs: function() {
                var self = this,
                    $tabsContainer = $("<div>").addClass(PIVOT_TABS_CONTAINER_CLASS);
                this._element().append($tabsContainer);
                $tabsContainer.dxPivotTabs({
                    items: this.option("items"),
                    selectedIndex: this.option("selectedIndex"),
                    updatePositionAction: function(args) {
                        self._updateContentPosition(args.offset)
                    },
                    rollbackAction: function() {
                        self._animateRollback()
                    },
                    completeAction: function(args) {
                        self._animateComplete(args.newIndex)
                    },
                    stopAction: function() {
                        self._stopAnimation()
                    }
                });
                this._tabs = $tabsContainer.dxPivotTabs("instance")
            },
            _render: function() {
                this._element().addClass(PIVOT_CLASS);
                this.callBase()
            },
            _renderCurrentContent: function(currentIndex, previousIndex) {
                var itemsCache = this._itemsCache;
                itemsCache[previousIndex] = this._selectedItemElement();
                itemsCache[previousIndex].addClass(PIVOT_ITEM_HIDDEN_CLASS);
                if (itemsCache[currentIndex])
                    itemsCache[currentIndex].removeClass(PIVOT_ITEM_HIDDEN_CLASS);
                else
                    this._renderContent()
            },
            _updateContentPosition: function(offset) {
                translator.move(this._$itemWrapper, {left: this._calculatePixelOffset(offset)})
            },
            _animateRollback: function() {
                animation.returnBack(this._$itemWrapper)
            },
            _animateComplete: function(newIndex) {
                var self = this,
                    $itemWrapper = this._$itemWrapper,
                    isRightSwipeHandled = this._isRightSwipeHandled(),
                    itemWrapperWidth = $itemWrapper.outerWidth(),
                    intermediatePosition = isRightSwipeHandled ? itemWrapperWidth : -itemWrapperWidth;
                animation.slideAway($itemWrapper, intermediatePosition, function() {
                    translator.move($itemWrapper, {left: -intermediatePosition});
                    self._indexChangeOnAnimation = true;
                    self.option("selectedIndex", newIndex);
                    self._indexChangeOnAnimation = false;
                    animation.slideBack($itemWrapper)
                })
            },
            _calculatePixelOffset: function(offset) {
                offset = offset || 0;
                var maxOffset = this._$itemWrapper.outerWidth();
                return offset * maxOffset
            },
            _isRightSwipeHandled: function() {
                return translator.locate(this._$itemWrapper).left > 0
            },
            _initSwipeHandlers: function() {
                this._element().on(events.addNamespace("dxswipestart", this.NAME), $.proxy(this._swipeStartHandler, this)).on(events.addNamespace("dxswipe", this.NAME), $.proxy(this._swipeUpdateHandler, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._swipeEndHandler, this))
            },
            _swipeStartHandler: function(e) {
                this._stopAnimation();
                this._tabs.stop();
                if (this.option("disabled") || this._indexBoundary() <= 1)
                    e.cancel = true
            },
            _stopAnimation: function() {
                completeAnimation(this._$itemWrapper);
                completeAnimation(this._$itemWrapper)
            },
            _swipeUpdateHandler: function(e) {
                var offset = e.offset;
                this._updateContentPosition(offset);
                this._tabs.updatePosition(offset)
            },
            _swipeEndHandler: function(e) {
                var selectedIndex = this.option("selectedIndex"),
                    targetOffset = e.targetOffset;
                if (targetOffset === 0) {
                    this._animateRollback();
                    this._tabs.rollback()
                }
                else {
                    var newIndex = this._normalizeIndex(selectedIndex - targetOffset);
                    this._animateComplete(newIndex, selectedIndex);
                    this._tabs.complete(newIndex)
                }
            },
            _renderSelectedIndex: function(current, previous) {
                if (previous !== undefined)
                    this._renderCurrentContent(current, previous)
            },
            _normalizeIndex: function(index) {
                var boundary = this._indexBoundary();
                if (index < 0)
                    index = boundary + index;
                if (index >= boundary)
                    index = index - boundary;
                return index
            },
            _indexBoundary: function() {
                return this.option("items").length
            },
            _renderContentImpl: function() {
                var items = this.option("items"),
                    selectedIndex = this.option("selectedIndex");
                if (items.length)
                    this._renderItems([items[selectedIndex]])
            },
            _selectedItemElement: function() {
                return this._$itemWrapper.children(":not(." + PIVOT_ITEM_HIDDEN_CLASS + ")")
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"selectedIndex":
                        if (!this._indexChangeOnAnimation)
                            this._tabs.option("selectedIndex", value);
                        this.callBase.apply(this, arguments);
                        break;
                    case"items":
                        this._tabs.option("items", value);
                        this._clearItemsCache();
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxPivot.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.toolbar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator;
        var TOOLBAR_CLASS = "dx-toolbar",
            TOOLBAR_MINI_CLASS = "dx-toolbar-mini",
            TOOLBAR_ITEM_CLASS = "dx-toolbar-item",
            TOOLBAR_LABEL_CLASS = "dx-toolbar-label",
            TOOLBAR_BUTTON_CLASS = "dx-toolbar-button",
            TOOLBAR_MENU_CONTAINER_CLASS = "dx-toolbar-menu-container",
            TOOLBAR_ITEMS_CONTAINER_CLASS = "dx-toolbar-items-container",
            TOOLBAR_ITEM_DATA_KEY = "dxToolbarItemDataKey",
            SUBMENU_SWIPE_EASING = "easeOutCubic",
            SUBMENU_HIDE_DURATION = 200,
            SUBMENU_SHOW_DURATION = 400;
        var slideSubmenu = function($element, position, isShowAnimation) {
                var duration = isShowAnimation ? SUBMENU_SHOW_DURATION : SUBMENU_HIDE_DURATION;
                fx.animate($element, {
                    type: "slide",
                    to: {top: position},
                    easing: SUBMENU_SWIPE_EASING,
                    duration: duration
                })
            };
        ui.registerComponent("dxToolbar", ui.CollectionContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        menuItemRender: null,
                        menuItemTemplate: "item",
                        submenuType: "dxDropDownMenu"
                    })
            },
            _itemContainer: function() {
                return this._$toolbarItemsContainer.find([".dx-toolbar-left", ".dx-toolbar-center", ".dx-toolbar-right"].join(","))
            },
            _itemClass: function() {
                return TOOLBAR_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TOOLBAR_ITEM_DATA_KEY
            },
            _itemRenderDefault: function(item, index, itemElement) {
                this.callBase(item, index, itemElement);
                var widget = item.widget;
                if (widget) {
                    var widgetElement = $("<div />").appendTo(itemElement),
                        widgetName = DX.inflector.camelize("dx-" + widget),
                        options = item.options || {};
                    widgetElement[widgetName](options)
                }
            },
            _render: function() {
                this._renderToolbar();
                this._renderContainers();
                this.callBase();
                this._renderMenu()
            },
            _renderToolbar: function() {
                this._element().addClass(TOOLBAR_CLASS);
                this._$toolbarItemsContainer = $("<div />").appendTo(this._element());
                this._$toolbarItemsContainer.addClass(TOOLBAR_ITEMS_CONTAINER_CLASS)
            },
            _renderContainers: function() {
                var element = this._$toolbarItemsContainer;
                $.each(["left", "center", "right"], function() {
                    var containerClass = "dx-toolbar-" + this,
                        container = element.find("." + containerClass);
                    if (!container.length)
                        container = $('<div />').addClass(containerClass).appendTo(element)
                })
            },
            _renderItem: function(index, item) {
                var align = item.align || "center",
                    container = this._$toolbarItemsContainer.find(".dx-toolbar-" + align);
                var itemElement = this.callBase(index, item, container);
                itemElement.addClass(TOOLBAR_BUTTON_CLASS);
                if (item.text)
                    itemElement.addClass(TOOLBAR_LABEL_CLASS).removeClass(TOOLBAR_BUTTON_CLASS);
                return itemElement
            },
            _hasMenuItems: function() {
                return this._getMenuItems().length > 0
            },
            _getToolbarItems: function() {
                return $.grep(this.option("items") || [], function(item) {
                        return !item.isMenu
                    })
            },
            _getMenuItems: function() {
                return $.grep(this.option("items") || [], function(item) {
                        return item.isMenu
                    })
            },
            _renderContentImpl: function() {
                var items = this._getToolbarItems();
                this._$toolbarItemsContainer.toggleClass(TOOLBAR_MINI_CLASS, items.length === 0);
                if (this._renderedItemsCount)
                    this._renderItems(items.slice(this._renderedItemsCount));
                else
                    this._renderItems(items)
            },
            _renderMenu: function() {
                if (!this._hasMenuItems())
                    return;
                var options = {
                        itemRender: this.option("menuItemRender"),
                        itemTemplate: this.option("menuItemTemplate"),
                        itemClickAction: this.option("itemClickAction")
                    };
                switch (this.option("submenuType")) {
                    case"dxActionSheet":
                        this._renderActionSheet(options);
                        break;
                    case"dxDropDownMenu":
                        this._renderDropDown(options);
                        break;
                    case"dxList":
                        this._renderList(options);
                        break
                }
            },
            _renderMenuButton: function(options) {
                var buttonOptions = $.extend({clickAction: $.proxy(this._handleMenuButtonClick, this)}, options);
                this._renderMenuButtonContainer();
                this._$button = $("<div />").appendTo(this._$menuButtonContainer).addClass("dx-toolbar-menu-button").dxButton(buttonOptions)
            },
            _renderMenuButtonContainer: function() {
                var $container = this._$toolbarItemsContainer.find(".dx-toolbar-right");
                this._$menuButtonContainer = $("<div />").appendTo($container).addClass(TOOLBAR_BUTTON_CLASS).addClass(TOOLBAR_MENU_CONTAINER_CLASS)
            },
            _renderDropDown: function(options) {
                this._renderMenuButtonContainer();
                this._menu = $("<div />").appendTo(this._$menuButtonContainer).dxDropDownMenu(options).dxDropDownMenu("instance");
                this._renderMenuItems()
            },
            _renderActionSheet: function(options) {
                this._renderMenuButton({icon: "overflow"});
                var actionSheetOptions = $.extend({
                        target: this._$button,
                        showTitle: false
                    }, options);
                this._menu = $("<div />").appendTo(this._element()).dxActionSheet(actionSheetOptions).dxActionSheet("instance");
                this._renderMenuItems()
            },
            _renderList: function(options) {
                this._renderMenuButton({
                    activeStateEnabled: false,
                    text: "..."
                });
                var listOptions = $.extend({width: "100%"}, options);
                this._renderListOverlay();
                this._renderContainerSwipe();
                this._menu = $("<div />").appendTo(this._listOverlay.content()).dxList(listOptions).dxList("instance");
                this._renderMenuItems();
                this._changeListVisible(this.option("visible"));
                this._windowResizeCallback = $.proxy(this._toggleMenuVisibility, this);
                utils.windowResizeCallbacks.add(this._windowResizeCallback)
            },
            _renderMenuItems: function() {
                this._menu.addTemplate(this._templates);
                this._menu.option("items", this._getMenuItems())
            },
            _getListHeight: function() {
                return this._listOverlay.content().find(".dx-list").height()
            },
            _renderListOverlay: function() {
                var element = this._element();
                this._listOverlay = $("<div />").appendTo(element).dxOverlay({
                    targetContainer: false,
                    deferRendering: false,
                    shading: false,
                    height: "auto",
                    width: "100%",
                    showTitle: false,
                    closeOnOutsideClick: $.proxy(this._handleListOutsideClick, this),
                    position: {
                        my: "bottom",
                        at: "bottom",
                        of: window
                    },
                    animation: null
                }).dxOverlay("instance");
                this._element().css("z-index", this._listOverlay._$wrapper.css("z-index"))
            },
            _renderContainerSwipe: function() {
                this._$toolbarItemsContainer.appendTo(this._listOverlay.content()).dxSwipeable({
                    elastic: false,
                    startAction: $.proxy(this._handleSwipeStart, this),
                    updateAction: $.proxy(this._handleSwipeUpdate, this),
                    endAction: $.proxy(this._handleSwipeEnd, this),
                    itemSizeFunc: $.proxy(this._getListHeight, this),
                    direction: "vertical"
                })
            },
            _handleListOutsideClick: function(e) {
                if (!$(e.target).closest(this._listOverlay.content()).length)
                    this._toggleMenuVisibility(false, true)
            },
            _calculatePixelOffset: function(offset) {
                offset = offset || 0;
                var maxOffset = this._getListHeight();
                return offset * maxOffset
            },
            _handleSwipeStart: function(e) {
                e.jQueryEvent.maxTopOffset = this._menuShown ? 0 : 1;
                e.jQueryEvent.maxBottomOffset = this._menuShown ? 1 : 0
            },
            _handleSwipeUpdate: function(e) {
                var offset = this._menuShown ? e.jQueryEvent.offset : 1 + e.jQueryEvent.offset;
                this._renderMenuPosition(offset, false)
            },
            _handleSwipeEnd: function(e) {
                var targetOffset = e.jQueryEvent.targetOffset;
                targetOffset -= this._menuShown - 1;
                this._toggleMenuVisibility(targetOffset === 0, true)
            },
            _renderMenuPosition: function(offset, animate) {
                var pos = this._calculatePixelOffset(offset),
                    element = this._listOverlay.content();
                if (animate)
                    slideSubmenu(element, pos, this._menuShown);
                else
                    translator.move(element, {top: pos})
            },
            _handleMenuButtonClick: function() {
                this._toggleMenuVisibility(!this._menuShown, true)
            },
            _toggleMenuVisibility: function(visible, animate) {
                this._menuShown = visible;
                switch (this.option("submenuType")) {
                    case"dxList":
                        this._renderMenuPosition(this._menuShown ? 0 : 1, animate);
                        break;
                    case"dxActionSheet":
                        this._menu.show();
                        break
                }
            },
            _renderEmptyMessage: $.noop,
            _clean: function() {
                this._$toolbarItemsContainer.children().empty();
                this._element().empty()
            },
            _changeMenuOption: function(name, value) {
                if (this._menu)
                    this._menu.option(name, value)
            },
            _changeListVisible: function(value) {
                if (this._listOverlay) {
                    this._listOverlay.option("visible", value);
                    this._toggleMenuVisibility(false, false)
                }
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"submenuType":
                        this._clean();
                        this._render();
                        break;
                    case"visible":
                        this._changeListVisible(value);
                        this.callBase.apply(this, arguments);
                        break;
                    case"menuItemRender":
                        this._changeMenuOption("itemRender", value);
                        break;
                    case"menuItemTemplate":
                        this._changeMenuOption("itemTemplate", value);
                        break;
                    case"itemClickAction":
                        this._changeMenuOption(name, value);
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _dispose: function() {
                if (this._windowResizeCallback)
                    utils.windowResizeCallbacks.remove(this._windowResizeCallback);
                this.callBase()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.listEdit.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator,
            fx = DX.fx;
        var editOptionsRegistry = [];
        var registerOption = function(option) {
                editOptionsRegistry.push(option)
            };
        registerOption("delete");
        registerOption("selection");
        var LIST_ITEM_BAG_CONTAINER_CLASS = "dx-list-item-bag-container",
            LIST_ITEM_CONTENT_CLASS = "dx-list-item-content",
            LIST_ITEM_LEFT_BAG_CLASS = "dx-list-item-left-bag",
            LIST_ITEM_RIGHT_BAG_CLASS = "dx-list-item-right-bag",
            DECORATOR_LEFT_BAG_CREATE_METHOD = "leftBag",
            DECORATOR_RIGHT_BAG_CREATE_METHOD = "rightBag",
            DECORATOR_MODIFY_ELEMENT_METHOD = "modifyElement";
        var ListEditProvider = DX.Class.inherit({
                ctor: function(list, config) {
                    this._list = list;
                    this._config = config;
                    if (this.isModifyingByDecorators())
                        this._fetchRequiredDecorators()
                },
                dispose: function() {
                    if (this._decorators && this._decorators.length)
                        $.each(this._decorators, function(_, decorator) {
                            decorator.dispose()
                        })
                },
                isModifyingByDecorators: function() {
                    return !(this.isRenderingByRenderer() || this.isRenderingByTemplate())
                },
                isRenderingByRenderer: function() {
                    return !!this.getItemRenderer()
                },
                getItemRenderer: function() {
                    return this._config.itemRender
                },
                isRenderingByTemplate: function() {
                    return !!this.getItemTemplateName()
                },
                getItemTemplateName: function() {
                    return this._config.itemTemplate
                },
                _fetchRequiredDecorators: function() {
                    var self = this;
                    this._decorators = [];
                    $.each(editOptionsRegistry, function(_, option) {
                        var enabledOptionName = option + "Enabled",
                            modeOptionName = option + "Mode";
                        if (self._config[enabledOptionName]) {
                            var decorator = self._createDecorator(option, self._config[modeOptionName]);
                            self._decorators.push(decorator)
                        }
                    })
                },
                _createDecorator: function(option, type) {
                    var decoratorClass = this._findDecorator(option, type);
                    return new decoratorClass(this._list)
                },
                _findDecorator: function(option, type) {
                    var foundDecorator = decoratorsRegistry[option][type];
                    if (!foundDecorator)
                        throw new Error("Decorator with editing option: \"" + option + "\" and type: \"" + type + "\" not found");
                    return foundDecorator
                },
                modifyItemElement: function(args) {
                    var $itemElement = $(args.itemElement);
                    $itemElement.addClass(LIST_ITEM_BAG_CONTAINER_CLASS);
                    this._wrapContent($itemElement);
                    var config = {$itemElement: $itemElement};
                    this._prependLeftBags($itemElement, config);
                    this._appendRightBags($itemElement, config);
                    this._applyDecorators(DECORATOR_MODIFY_ELEMENT_METHOD, config)
                },
                _wrapContent: function($itemElement) {
                    var $contentContainer = $("<div />").addClass(LIST_ITEM_CONTENT_CLASS);
                    $itemElement.wrapInner($contentContainer)
                },
                _prependLeftBags: function($itemElement, config) {
                    var $leftParts = this._collectDecoratorsMarkup(DECORATOR_LEFT_BAG_CREATE_METHOD, config);
                    if ($leftParts.length) {
                        var $leftBagContainer = $("<div />").addClass(LIST_ITEM_LEFT_BAG_CLASS),
                            $leftBags = $leftParts.wrap($leftBagContainer).parent();
                        $itemElement.prepend($leftBags)
                    }
                },
                _appendRightBags: function($itemElement, config) {
                    var $rightParts = this._collectDecoratorsMarkup(DECORATOR_RIGHT_BAG_CREATE_METHOD, config);
                    if ($rightParts.length) {
                        var $rightBagContainer = $("<div />").addClass(LIST_ITEM_RIGHT_BAG_CLASS),
                            $rightBags = $rightParts.wrap($rightBagContainer).parent();
                        $itemElement.append($rightBags)
                    }
                },
                _collectDecoratorsMarkup: function(method, config) {
                    var $collector = $("<div />");
                    $.each(this._decorators, function() {
                        var markup = this[method](config);
                        $collector.append(markup)
                    });
                    return $collector.children()
                },
                _applyDecorators: function(method, config) {
                    $.each(this._decorators, function() {
                        this[method](config)
                    })
                },
                handleClick: function($itemElement) {
                    if (!this._decorators)
                        return false;
                    var response = false,
                        decorators = this._decorators,
                        length = decorators.length;
                    for (var i = 0; i < length; i++) {
                        response = decorators[i].handleClick($itemElement);
                        if (response)
                            break
                    }
                    return response
                },
                handleHold: function($itemElement) {
                    if (!this._decorators)
                        return false;
                    var response = false,
                        decorators = this._decorators,
                        length = decorators.length;
                    for (var i = 0; i < length; i++) {
                        response = decorators[i].handleHold($itemElement);
                        if (response)
                            break
                    }
                    return response
                }
            });
        var decoratorsRegistry = {};
        var registerDecorator = function(option, type, decoratorClass) {
                var decoratorConfig = {};
                decoratorConfig[option] = decoratorsRegistry[option] ? decoratorsRegistry[option] : {};
                decoratorConfig[option][type] = decoratorClass;
                decoratorsRegistry = $.extend(decoratorsRegistry, decoratorConfig)
            };
        var DX_LIST_EDIT_DECORATOR = "dxListEditDecorator";
        var ListEditDecorator = DX.Class.inherit({
                ctor: function(list) {
                    this._list = list;
                    this._init()
                },
                _init: $.noop,
                dispose: $.noop,
                modifyElement: $.noop,
                leftBag: $.noop,
                rightBag: $.noop,
                handleClick: $.noop,
                handleHold: $.noop
            });
        var SWITCHABLE_DELETE_READY_CLASS = "dx-switchable-delete-ready",
            SWITCHABLE_DELETE_BUTTON_CONTAINER_CLASS = "dx-switchable-delete-button-container",
            SWITCHABLE_DELETE_BUTTON_CLASS = "dx-switchable-delete-button";
        var SwitchableDeleteDecorator = ListEditDecorator.inherit({
                handleClick: function() {
                    var self = this,
                        $readyToDelete = this._list._element().find("." + SWITCHABLE_DELETE_READY_CLASS);
                    $.each($readyToDelete, function(_, itemElement) {
                        self._cancelDelete($(itemElement))
                    });
                    return $readyToDelete.length !== 0
                },
                _cancelDelete: DX.abstract
            });
        var SwitchableButtonDeleteDecorator = SwitchableDeleteDecorator.inherit({
                modifyElement: function(config) {
                    var self = this,
                        $itemElement = config.$itemElement;
                    var $buttonContainer = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_CONTAINER_CLASS),
                        $button = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_CLASS);
                    $button.dxButton({
                        text: Globalize.localize("dxListEditDecorator-delete"),
                        type: "danger",
                        clickAction: function(e) {
                            self._list.deleteItem($itemElement);
                            e.jQueryEvent.stopPropagation()
                        }
                    });
                    $buttonContainer.append($button);
                    $itemElement.append($buttonContainer)
                },
                _cancelDelete: function($itemElement) {
                    $itemElement.removeClass(SWITCHABLE_DELETE_READY_CLASS)
                }
            });
        var TOGGLE_DELETE_SWITCH_CLASS = "dx-toggle-delete-switch",
            TOGGLE_DELETE_SWITCH_ICON_CLASS = "dx-toggle-delete-switch-icon";
        registerDecorator("delete", "toggle", SwitchableButtonDeleteDecorator.inherit({leftBag: function(config) {
                var $itemElement = config.$itemElement;
                var $toggle = $("<div />").addClass(TOGGLE_DELETE_SWITCH_CLASS),
                    $toggleIcon = $("<div />").addClass(TOGGLE_DELETE_SWITCH_ICON_CLASS);
                $toggle.append($toggleIcon);
                $toggle.on(events.addNamespace("dxpointerup dxpointercancel", DX_LIST_EDIT_DECORATOR), function(e) {
                    $itemElement.toggleClass(SWITCHABLE_DELETE_READY_CLASS);
                    e.stopPropagation()
                }).on(events.addNamespace("dxpointerdown", DX_LIST_EDIT_DECORATOR), function(e) {
                    e.stopPropagation()
                });
                return $toggle
            }}));
        registerDecorator("delete", "slideButton", SwitchableButtonDeleteDecorator.inherit({modifyElement: function(config) {
                this.callBase.apply(this, arguments);
                var $itemElement = config.$itemElement;
                $itemElement.on(events.addNamespace("dxswipeend", DX_LIST_EDIT_DECORATOR), function(e) {
                    if (e.targetOffset !== 0)
                        $itemElement.addClass(SWITCHABLE_DELETE_READY_CLASS)
                })
            }}));
        var SLIDE_ITEM_CONTENT_CLASS = "dx-slide-item-content",
            SLIDE_ITEM_DELETE_BUTTON_CONTAINER_CLASS = "dx-slide-item-delete-button-container",
            SLIDE_ITEM_DELETE_BUTTON_CLASS = "dx-slide-item-delete-button",
            SLIDE_ITEM_DELETE_BUTTON_CONTENT_CLASS = "dx-slide-item-delete-button-content";
        registerDecorator("delete", "slideItem", SwitchableDeleteDecorator.inherit({
            modifyElement: function(config) {
                var self = this,
                    $itemElement = config.$itemElement;
                var $buttonContent = $("<div/>").addClass(SLIDE_ITEM_DELETE_BUTTON_CONTENT_CLASS).text(Globalize.localize("dxListEditDecorator-delete")),
                    $button = $("<div/>").addClass(SLIDE_ITEM_DELETE_BUTTON_CLASS).append($buttonContent),
                    $buttonContainer = $("<div/>").addClass(SLIDE_ITEM_DELETE_BUTTON_CONTAINER_CLASS).append($button);
                $itemElement.wrapInner($("<div/>").addClass(SLIDE_ITEM_CONTENT_CLASS));
                $itemElement.append($buttonContainer);
                $button.on(events.addNamespace("dxclick", DX_LIST_EDIT_DECORATOR), function() {
                    self._list.deleteItem($itemElement)
                });
                $itemElement.on(events.addNamespace("dxswipe", DX_LIST_EDIT_DECORATOR), $.proxy(this._handleSwipe, this)).on(events.addNamespace("dxswipeend", DX_LIST_EDIT_DECORATOR), $.proxy(this._handleSwipeEnd, this))
            },
            _handleSwipe: function(e) {
                var $itemElement = $(e.currentTarget),
                    offset = $itemElement.width() * e.offset,
                    readyToDelete = $itemElement.hasClass(SWITCHABLE_DELETE_READY_CLASS),
                    startOffset = readyToDelete ? -$itemElement.find("." + SLIDE_ITEM_DELETE_BUTTON_CLASS).outerWidth() : 0,
                    position = offset + startOffset < 0 ? offset + startOffset : 0;
                translator.move($itemElement.find("." + SLIDE_ITEM_CONTENT_CLASS), {left: position})
            },
            _handleSwipeEnd: function(e) {
                var $itemElement = $(e.currentTarget),
                    readyToDelete = e.targetOffset === -1;
                if (readyToDelete)
                    this._prepareToDelete($itemElement);
                else
                    this._cancelDelete($itemElement)
            },
            _prepareToDelete: function($itemElement) {
                fx.animate($itemElement.find("." + SLIDE_ITEM_CONTENT_CLASS), {
                    to: {left: -$itemElement.find("." + SLIDE_ITEM_DELETE_BUTTON_CLASS).outerWidth()},
                    type: "slide",
                    duration: 200,
                    complete: function() {
                        $itemElement.addClass(SWITCHABLE_DELETE_READY_CLASS)
                    }
                })
            },
            _cancelDelete: function($itemElement) {
                fx.animate($itemElement.find("." + SLIDE_ITEM_CONTENT_CLASS), {
                    to: {left: 0},
                    type: "slide",
                    duration: 200,
                    complete: function() {
                        $itemElement.removeClass(SWITCHABLE_DELETE_READY_CLASS)
                    }
                })
            }
        }));
        registerDecorator("delete", "swipe", ListEditDecorator.inherit({
            modifyElement: function(config) {
                var $itemElement = config.$itemElement;
                $itemElement.on(events.addNamespace("dxswipe", DX_LIST_EDIT_DECORATOR), $.proxy(this._handleSwipe, this)).on(events.addNamespace("dxswipeend", DX_LIST_EDIT_DECORATOR), $.proxy(this._handleSwipeEnd, this))
            },
            _renderItemPosition: function($item, offset, animate) {
                var deferred = $.Deferred(),
                    itemWidth = $item.width(),
                    itemOffset = offset * itemWidth;
                if (animate)
                    fx.animate($item, {
                        to: {left: itemOffset},
                        type: "slide",
                        complete: function() {
                            deferred.resolve($item, offset)
                        }
                    });
                else {
                    translator.move($item, {left: itemOffset});
                    deferred.resolve()
                }
                return deferred.promise()
            },
            _handleSwipe: function(e) {
                this._renderItemPosition($(e.currentTarget), e.offset)
            },
            _handleSwipeEnd: function(e) {
                var self = this,
                    $item = $(e.currentTarget),
                    offset = e.targetOffset;
                this._renderItemPosition($item, offset, true).done(function($item, offset) {
                    if (Math.abs(offset))
                        self._list.deleteItem($item)
                })
            }
        }));
        var HOLDDELETE_MENU = "dx-holddelete-menu",
            HOLDDELETE_MENUCONTENT = "dx-holddelete-menucontent",
            HOLDDELETE_MENUITEM = "dx-holddelete-menuitem";
        registerDecorator("delete", "hold", ListEditDecorator.inherit({
            _init: function() {
                var $menu = $("<div/>").addClass(HOLDDELETE_MENU);
                this._list._element().append($menu);
                this._overlay = this._renderOverlay($menu)
            },
            _renderOverlay: function($element) {
                var self = this;
                return $element.dxOverlay({
                        shading: false,
                        closeOnOutsideClick: function(e) {
                            return !$(e.target).closest("." + HOLDDELETE_MENU).length
                        },
                        animation: {
                            show: {
                                type: "custom",
                                duration: 300,
                                from: {
                                    height: 0,
                                    opacity: 1
                                },
                                to: {
                                    height: function() {
                                        return self._$menu.height()
                                    },
                                    opacity: 1
                                }
                            },
                            hide: {
                                type: "custom",
                                duration: 0,
                                from: {opacity: 1},
                                to: {opacity: 0}
                            },
                            position: {
                                my: "top",
                                at: "bottom",
                                of: function() {
                                    return self._$itemWithMenu
                                },
                                collision: "flip"
                            },
                            height: "auto"
                        },
                        contentReadyAction: $.proxy(this._renderMenu, this)
                    }).dxOverlay("instance")
            },
            _renderMenu: function(e) {
                var $menuContent = $("<div/>").addClass(HOLDDELETE_MENUCONTENT),
                    $deleteMenuItem = $("<div/>").addClass(HOLDDELETE_MENUITEM).text(Globalize.localize("dxListEditDecorator-delete"));
                $deleteMenuItem.on(events.addNamespace("dxclick", DX_LIST_EDIT_DECORATOR), $.proxy(this._deleteItem, this));
                this._$menu = $menuContent.append($deleteMenuItem);
                e.component.content().append(this._$menu)
            },
            _deleteItem: function() {
                this._overlay.hide();
                this._list.deleteItem(this._$itemWithMenu)
            },
            dispose: function() {
                this._overlay._element().remove()
            },
            handleHold: function($itemElement) {
                var overlay = this._overlay;
                overlay.beginUpdate();
                overlay.option("position", {
                    my: "top",
                    at: "bottom",
                    of: $itemElement,
                    collision: "flip"
                });
                overlay.option("width", $itemElement.width());
                overlay.endUpdate();
                overlay.show();
                this._$itemWithMenu = $itemElement;
                return true
            }
        }));
        var LIST_ITEM_SELECTED_CLASS = "dx-list-item-selected",
            SELECT_CHECKBOX_CLASS = "dx-select-checkbox";
        registerDecorator("selection", "control", ListEditDecorator.inherit({
            leftBag: function(config) {
                var self = this,
                    $itemElement = config.$itemElement;
                var $checkBox = $("<div />").addClass(SELECT_CHECKBOX_CLASS);
                $checkBox.dxCheckBox({
                    checked: this._isSelected($itemElement),
                    activeStateEnabled: false,
                    clickAction: function(e) {
                        self._processCheckedState($itemElement, e.component.option("checked"));
                        e.jQueryEvent.stopPropagation()
                    }
                });
                return $checkBox
            },
            modifyElement: function(config) {
                var self = this,
                    $itemElement = config.$itemElement;
                $itemElement.on("stateChanged", function() {
                    $itemElement.find("." + SELECT_CHECKBOX_CLASS).dxCheckBox("instance").option("checked", self._isSelected($itemElement))
                })
            },
            _isSelected: function($itemElement) {
                return $itemElement.hasClass(LIST_ITEM_SELECTED_CLASS)
            },
            _processCheckedState: function(element, checked) {
                if (!$(element).hasClass("dx-list-item"))
                    throw new Error("SelectingControlDecorator._processCheckedState called with wrong parametrs");
                if (checked)
                    this._list.selectItem(element);
                else
                    this._list.unselectItem(element)
            }
        }));
        registerDecorator("selection", "item", decoratorsRegistry.selection.control.inherit({handleClick: function($itemElement) {
                var checkBox = $itemElement.find("." + SELECT_CHECKBOX_CLASS).dxCheckBox("instance"),
                    newCheckBoxState = !checkBox.option("checked");
                checkBox.option("checked", newCheckBoxState);
                this._processCheckedState($itemElement, newCheckBoxState);
                return true
            }}));
        ui.ListEditProvider = ListEditProvider
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.list.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var ListEditStrategy = DX.Class.inherit({
                ctor: function(list) {
                    this._list = list
                },
                isItemIndex: DX.abstract,
                getItemElementIndex: DX.abstract,
                normalizeItemIndex: DX.abstract,
                deleteItemAtIndex: DX.abstract,
                updateSelectionAfterDelete: DX.abstract,
                fetchSelectedItems: DX.abstract,
                selectedItemIndecies: DX.abstract,
                getItemByIndex: DX.abstract
            });
        var PlainListEditStrategy = ListEditStrategy.inherit({
                isItemIndex: function(index) {
                    return $.isNumeric(index)
                },
                getItemElementIndex: function(itemElement) {
                    return this._list._itemElements().index(itemElement)
                },
                normalizeItemIndex: function(index) {
                    return index
                },
                deleteItemAtIndex: function(index) {
                    this._list.option("items").splice(index, 1)
                },
                updateSelectionAfterDelete: function(fromIndex) {
                    var selectedItemIndices = this._list._selectedItemIndices;
                    $.each(selectedItemIndices, function(i, index) {
                        if (index > fromIndex)
                            selectedItemIndices[i] -= 1
                    })
                },
                fetchSelectedItems: function() {
                    var items = this._list.option("items"),
                        selectedItems = [];
                    $.each(this._list._selectedItemIndices, function(_, index) {
                        selectedItems.push(items[index])
                    });
                    return selectedItems
                },
                selectedItemIndecies: function() {
                    var selectedIndices = [],
                        items = this._list.option("items"),
                        selected = this._list.option("selectedItems");
                    $.each(selected, function(_, selectedItem) {
                        var index = $.inArray(selectedItem, items);
                        if (index !== -1)
                            selectedIndices.push(index);
                        else
                            throw new Error("Item '" + selectedItem + "' you are trying to select does not exist");
                    });
                    return selectedIndices
                },
                getItemByIndex: function(index) {
                    return this._list._itemElements().eq(index)
                }
            });
        var SELECTION_SHIFT = 20,
            SELECTION_MASK = 0x8FF;
        var combineIndex = function(indices) {
                return (indices.group << SELECTION_SHIFT) + indices.item
            };
        var splitIndex = function(combinedIndex) {
                return {
                        group: combinedIndex >> SELECTION_SHIFT,
                        item: combinedIndex & SELECTION_MASK
                    }
            };
        var createGroupSelection = function(group, selectedItems) {
                var groupItems = group.items,
                    groupSelection = {
                        key: group.key,
                        items: []
                    };
                $.each(selectedItems, function(_, itemIndex) {
                    groupSelection.items.push(groupItems[itemIndex])
                });
                return groupSelection
            };
        var groupByKey = function(groups, key) {
                var length = groups.length;
                for (var i = 0; i < length; i++)
                    if (groups[i].key === key)
                        return groups[i]
            };
        var GroupedListEditStrategy = ListEditStrategy.inherit({
                _groupElements: function() {
                    return this._list._itemContainer().find("." + LIST_GROUP_CLASS)
                },
                _groupItemElements: function($group) {
                    return $group.find("." + LIST_ITEM_CLASS)
                },
                isItemIndex: function(index) {
                    return $.isNumeric(index.group) && $.isNumeric(index.item)
                },
                getItemElementIndex: function(itemElement) {
                    var $item = $(itemElement),
                        $group = $item.closest("." + LIST_GROUP_CLASS);
                    return combineIndex({
                            group: this._groupElements().index($group),
                            item: this._groupItemElements($group).index($item)
                        })
                },
                normalizeItemIndex: function(index) {
                    return combineIndex(index)
                },
                deleteItemAtIndex: function(index) {
                    var indices = splitIndex(index),
                        itemGroup = this._list.option("items")[indices.group].items;
                    itemGroup.splice(indices.item, 1)
                },
                updateSelectionAfterDelete: function(fromIndex) {
                    var deletedIndices = splitIndex(fromIndex),
                        selectedItemIndices = this._list._selectedItemIndices;
                    $.each(selectedItemIndices, function(i, index) {
                        var indices = splitIndex(index);
                        if (indices.group === deletedIndices.group && indices.item > deletedIndices.item)
                            selectedItemIndices[i] -= 1
                    })
                },
                fetchSelectedItems: function() {
                    var items = this._list.option("items"),
                        selectedItemIndices = this._list._selectedItemIndices,
                        selectedItems = [];
                    selectedItemIndices.sort(function(a, b) {
                        return a - b
                    });
                    var currentGroupIndex = 0,
                        groupSelectedIndices = [];
                    $.each(selectedItemIndices, function(_, combinedIndex) {
                        var index = splitIndex(combinedIndex);
                        if (index.group !== currentGroupIndex && groupSelectedIndices.length) {
                            selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                            groupSelectedIndices.length = 0
                        }
                        currentGroupIndex = index.group;
                        groupSelectedIndices.push(index.item)
                    });
                    if (groupSelectedIndices.length)
                        selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                    return selectedItems
                },
                selectedItemIndecies: function() {
                    var selectedIndices = [],
                        items = this._list.option("items"),
                        selected = this._list.option("selectedItems");
                    $.each(selected, function(_, selectionInGroup) {
                        var group = groupByKey(items, selectionInGroup.key),
                            groupIndex = $.inArray(group, items);
                        if (!group)
                            throw new Error("Group with key '" + selectionInGroup.key + "' in which you are trying to select items does not exist.");
                        $.each(selectionInGroup.items, function(_, selectedGroupItem) {
                            var itemIndex = $.inArray(selectedGroupItem, group.items);
                            if (itemIndex !== -1)
                                selectedIndices.push(combineIndex({
                                    group: groupIndex,
                                    item: itemIndex
                                }));
                            else
                                throw new Error("Item '" + selectedGroupItem + "' you are trying to select in group '" + selectionInGroup.key + "' does not exist");
                        })
                    });
                    return selectedIndices
                },
                getItemByIndex: function(index) {
                    var indices = splitIndex(index),
                        $group = this._groupElements().eq(indices.group);
                    return this._groupItemElements($group).eq(indices.item)
                }
            });
        var removeDublicates = function(a, b) {
                var c = [];
                $.each(a, function(_, value) {
                    var bIndex = $.inArray(value, b);
                    if (bIndex === -1)
                        c.push(value)
                });
                return c
            };
        var LIST_CLASS = "dx-list",
            LIST_ITEM_CLASS = "dx-list-item",
            LIST_ITEM_SELECTOR = "." + LIST_ITEM_CLASS,
            LIST_GROUP_CLASS = "dx-list-group",
            LIST_GROUP_HEADER_CLASS = "dx-list-group-header",
            LIST_HAS_NEXT_CLASS = "dx-has-next",
            LIST_NEXT_BUTTON_CLASS = "dx-list-next-button",
            LIST_EDITING_CLASS = "dx-list-editing",
            LIST_ITEM_SELECTED_CLASS = "dx-list-item-selected",
            LIST_ITEM_RESPONSE_WAIT_CLASS = "dx-list-item-response-wait",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            LIST_FEEDBACK_SHOW_TIMEOUT = 70;
        ui.registerComponent("dxList", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: LIST_ITEM_SELECTOR,
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        pullRefreshEnabled: false,
                        autoPagingEnabled: true,
                        scrollingEnabled: true,
                        showScrollbar: true,
                        useNative: true,
                        pullingDownText: Globalize.localize("dxList-pullingDownText"),
                        pulledDownText: Globalize.localize("dxList-pulledDownText"),
                        refreshingText: Globalize.localize("dxList-refreshingText"),
                        pageLoadingText: Globalize.localize("dxList-pageLoadingText"),
                        scrollAction: null,
                        pullRefreshAction: null,
                        pageLoadingAction: null,
                        showNextButton: false,
                        itemHoldAction: null,
                        itemHoldTimeout: 750,
                        itemSwipeAction: null,
                        grouped: false,
                        groupTemplate: "group",
                        groupRender: null,
                        editEnabled: false,
                        editConfig: {
                            itemTemplate: null,
                            itemRender: null,
                            deleteEnabled: false,
                            deleteMode: "toggle",
                            selectionEnabled: false,
                            selectionMode: "item"
                        },
                        itemDeleteAction: null,
                        selectedItems: [],
                        itemSelectAction: null,
                        itemUnselectAction: null
                    })
            },
            _itemClass: function() {
                return LIST_ITEM_CLASS
            },
            _itemDataKey: function() {
                return LIST_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$container
            },
            _allowDinamicItemsAppend: function() {
                return true
            },
            _init: function() {
                this.callBase();
                this._$container = this._element();
                this._initScrollView();
                this._initEditProvider();
                this._initEditStrategy(this.option("grouped"));
                this._initSelectedItems();
                this._feedbackShowTimeout = LIST_FEEDBACK_SHOW_TIMEOUT
            },
            _initSelectedItems: function() {
                this._selectedItemIndices = this._editStrategy.selectedItemIndecies()
            },
            _clearSelectedItems: function() {
                this._selectedItemIndices = [];
                this._updateSelectedItems()
            },
            _dataSourceOptions: function() {
                return $.extend(this.callBase(), {paginate: true})
            },
            _initScrollView: function() {
                var pagingEnabled = this.option("autoPagingEnabled") && !!this._dataSource;
                var $scrollView = this._element().dxScrollView({
                        disabled: this.option("disabled") || !this.option("scrollingEnabled"),
                        scrollAction: $.proxy(this._handleScroll, this),
                        pullDownAction: this.option("scrollingEnabled") && this.option("pullRefreshEnabled") ? $.proxy(this._handlePullDown, this) : null,
                        reachBottomAction: this.option("scrollingEnabled") && pagingEnabled ? $.proxy(this._handleScrollBottom, this) : null,
                        showScrollbar: this.option("showScrollbar"),
                        useNative: this.option("useNative"),
                        pullingDownText: this.option("pullingDownText"),
                        pulledDownText: this.option("pulledDownText"),
                        refreshingText: this.option("refreshingText"),
                        reachBottomText: this.option("pageLoadingText")
                    });
                this._scrollView = $scrollView.dxScrollView("instance");
                this._scrollView.toggleLoading(pagingEnabled);
                this._$container = this._scrollView.content();
                this._createScrollViewActions()
            },
            _createScrollViewActions: function() {
                this._scrollAction = this._createActionByOption("scrollAction", {isGesture: true});
                this._pullRefreshAction = this._createActionByOption("pullRefreshAction", {isGesture: true});
                this._pageLoadingAction = this._createActionByOption("pageLoadingAction", {isGesture: true})
            },
            _handleScroll: function(e) {
                this._scrollAction(e)
            },
            _afterItemsRendered: function(tryLoadMore) {
                var allDataLoaded = !tryLoadMore || !this._dataSource || this._dataSource.isLastPage(),
                    canLoadNext = this.option("autoPagingEnabled") && !allDataLoaded;
                this._scrollView.release(!canLoadNext);
                if (this._shouldRenderNextButton())
                    this._toggleNextButton(!allDataLoaded)
            },
            _handlePullDown: function(e) {
                this._pullRefreshAction(e);
                if (this._dataSource && !this._dataSource.isLoading()) {
                    this._dataSource.pageIndex(0);
                    this._dataSource.load()
                }
                else
                    this._afterItemsRendered()
            },
            _handleScrollBottom: function(e) {
                this._pageLoadingAction(e);
                var dataSource = this._dataSource;
                if (dataSource && !dataSource.isLoading()) {
                    this._expectNextPageLoading();
                    dataSource.pageIndex(1 + dataSource.pageIndex());
                    dataSource.load()
                }
                else
                    this._afterItemsRendered()
            },
            _handleDataSourceLoadError: function() {
                this.callBase.apply(this, arguments);
                if (this._initialized)
                    this._afterItemsRendered()
            },
            _initEditProvider: function() {
                if (this._editProvider)
                    this._editProvider.dispose();
                this._editProvider = new ui.ListEditProvider(this, this.option("editConfig"))
            },
            _initEditStrategy: function(grouped) {
                var strategy = grouped ? GroupedListEditStrategy : PlainListEditStrategy;
                this._editStrategy = new strategy(this)
            },
            _render: function() {
                this._element().addClass(LIST_CLASS);
                this._renderEditing();
                this.callBase();
                this._renderItemHold();
                this._attachSwipeEvent();
                if (this._shouldRenderNextButton())
                    this._getNextButton()
            },
            _renderItemHold: function() {
                var eventName = events.addNamespace("dxhold", this.NAME);
                this._element().off(eventName).on(eventName, this._itemSelector(), {timeout: this.option("itemHoldTimeout")}, $.proxy(this._handleItemHold, this))
            },
            _attachSwipeEvent: function() {
                var $element = this._element();
                $element.off(events.addNamespace("dxswipeend", this.NAME), this._itemSelector());
                if (this.option("itemSwipeAction"))
                    $element.on(events.addNamespace("dxswipeend", this.NAME), this._itemSelector(), $.proxy(this._handleItemSwipe, this))
            },
            _renderEditing: function() {
                this._element().toggleClass(LIST_EDITING_CLASS, this.option("editEnabled"))
            },
            _shouldRenderNextButton: function() {
                return this.option("showNextButton") && this._dataSource
            },
            _getNextButton: function() {
                if (!this._nextButton)
                    this._nextButton = this._createNextButton();
                return this._nextButton
            },
            _createNextButton: function() {
                var showButton = this._dataSource && !this._dataSource.isLastPage();
                this._element().toggleClass(LIST_HAS_NEXT_CLASS, showButton);
                return $("<div/>").addClass(LIST_NEXT_BUTTON_CLASS).toggle(showButton).append($("<div/>").dxButton({
                        text: "More",
                        clickAction: $.proxy(this._handleNextButton, this)
                    })).appendTo(this._element())
            },
            _renderItems: function(items) {
                if (this.option("grouped"))
                    $.each(items, $.proxy(this._renderGroup, this));
                else
                    this.callBase.apply(this, arguments);
                this._afterItemsRendered(true)
            },
            _handleItemClick: function(e) {
                if (this.option("editEnabled") && this._editProvider.handleClick(this._closestItemElement(e.target)))
                    e.stopPropagation();
                else
                    this.callBase.apply(this, arguments)
            },
            _handleItemHold: function(e) {
                if (this.option("editEnabled") && this._editProvider.handleHold(this._closestItemElement(e.target)))
                    e.stopPropagation();
                else
                    this._handleItemJQueryEvent(e, "itemHoldAction")
            },
            _handleItemSwipe: function(e) {
                this._handleItemJQueryEvent(e, "itemSwipeAction", {
                    direction: e.offset < 0 ? "left" : "right",
                    isGesture: true
                })
            },
            _getItemRenderer: function() {
                if (this.option("editEnabled") && this._editProvider.isRenderingByRenderer())
                    return this._editProvider.getItemRenderer();
                return this.callBase()
            },
            _getItemTemplateName: function() {
                if (this.option("editEnabled") && this._editProvider.isRenderingByTemplate())
                    return this._editProvider.getItemTemplateName();
                return this.callBase()
            },
            _postprocessRenderItem: function(args) {
                var $itemElement = $(args.itemElement);
                if (this.option("editEnabled")) {
                    if (this._isItemSelected(this._getItemIndex($itemElement)))
                        $itemElement.addClass(LIST_ITEM_SELECTED_CLASS);
                    if (this._editProvider.isModifyingByDecorators())
                        this._editProvider.modifyItemElement(args)
                }
            },
            _handleNextButton: function() {
                var source = this._dataSource;
                if (source && !source.isLoading()) {
                    this._scrollView.toggleLoading(true);
                    this._expectNextPageLoading();
                    source.pageIndex(1 + source.pageIndex());
                    source.load()
                }
            },
            _toggleNextButton: function(showButton) {
                var nextButton = this._getNextButton();
                nextButton.toggle(showButton);
                this._element().toggleClass(LIST_HAS_NEXT_CLASS, showButton)
            },
            _groupRenderDefault: function(group) {
                return String(group.key || group)
            },
            _renderGroup: function(index, group) {
                var self = this;
                var groupElement = $("<div />").addClass(LIST_GROUP_CLASS).appendTo(self._itemContainer());
                var groupRenderer = self.option("groupRender"),
                    groupTemplateName = self.option("groupTemplate"),
                    groupTemplate = self._getTemplate(group.template || groupTemplateName, index, group),
                    groupHeaderElement;
                var renderArgs = {
                        index: index,
                        group: group,
                        container: groupElement
                    };
                if (groupRenderer)
                    groupHeaderElement = self._createGroupByRenderer(groupRenderer, renderArgs);
                else if (groupTemplate)
                    groupHeaderElement = self._createGroupByTemplate(groupTemplate, renderArgs);
                else
                    groupHeaderElement = self._createGroupByRenderer(self._groupRenderDefault, renderArgs);
                groupHeaderElement.addClass(LIST_GROUP_HEADER_CLASS);
                this._renderingGroupIndex = index;
                $.each(group.items || [], function(index, item) {
                    self._renderItem(index, item, groupElement)
                })
            },
            _createGroupByRenderer: function(groupRenderer, renderArgs) {
                var groupElement = $("<div />").appendTo(renderArgs.container);
                var rendererResult = groupRenderer(renderArgs.group, renderArgs.index, groupElement);
                if (rendererResult && groupElement[0] !== rendererResult[0])
                    groupElement.append(rendererResult);
                return groupElement
            },
            _createGroupByTemplate: function(groupTemplate, renderArgs) {
                return groupTemplate.render(renderArgs.container, renderArgs.group)
            },
            _dispose: function() {
                clearTimeout(this._holdTimer);
                this.callBase()
            },
            _toggleNextButtonVisibility: function(value) {
                this._element().toggleClass(LIST_HAS_NEXT_CLASS, value);
                var nextButton = this._getNextButton();
                if (value)
                    nextButton.appendTo(this._element());
                else
                    nextButton.detach()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"showNextButton":
                        this._toggleNextButtonVisibility(value);
                        break;
                    case"itemHoldTimeout":
                        this._renderItemHold();
                        break;
                    case"dataSource":
                        this.callBase.apply(this, arguments);
                        this._initScrollView();
                        return;
                    case"showScrollbar":
                    case"scrollingEnabled":
                    case"pullRefreshEnabled":
                    case"autoPagingEnabled":
                        this._initScrollView();
                        return;
                    case"grouped":
                        this._clearSelectedItems();
                        delete this._renderingGroupIndex;
                        this._initEditStrategy(value);
                        this.callBase.apply(this, arguments);
                        return;
                    case"items":
                    case"editEnabled":
                        this._clearSelectedItems();
                        this.callBase.apply(this, arguments);
                        return;
                    case"editConfig":
                        this._initEditProvider();
                        this.callBase.apply(this, arguments);
                        return;
                    case"selectedItems":
                        if (!this._selectedItemsInternalChange)
                            this._refreshSelectedItems();
                        return;
                    case"itemSwipeAction":
                        this._attachSwipeEvent();
                        return;
                    case"scrollAction":
                    case"pullRefresAction":
                    case"pageLoadingAction":
                        this._createScrollViewActions();
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _getItemIndex: function(itemElement) {
                if (this._editStrategy.isItemIndex(itemElement))
                    return this._editStrategy.normalizeItemIndex(itemElement);
                return this._editStrategy.getItemElementIndex(itemElement)
            },
            _getItemElement: function(index) {
                if (this._editStrategy.isItemIndex(index))
                    return this._editStrategy.getItemByIndex(this._editStrategy.normalizeItemIndex(index));
                return $(index)
            },
            _isItemSelected: function(index) {
                return $.inArray(index, this._selectedItemIndices) > -1
            },
            _updateSelectedItems: function() {
                this._selectedItemsInternalChange = true;
                this.option("selectedItems", this._editStrategy.fetchSelectedItems());
                this._selectedItemsInternalChange = false
            },
            _updateSelectionAfterDelete: function(fromIndex) {
                var self = this,
                    itemIndex = $.inArray(fromIndex, this._selectedItemIndices);
                if (itemIndex > -1)
                    this._selectedItemIndices.splice(itemIndex, 1);
                this._editStrategy.updateSelectionAfterDelete(fromIndex);
                this._updateSelectedItems()
            },
            _selectItem: function($itemElement) {
                var index = this._getItemIndex($itemElement);
                if (this.option("editEnabled") && index > -1) {
                    $itemElement.addClass(LIST_ITEM_SELECTED_CLASS);
                    this._selectedItemIndices.push(index);
                    $itemElement.trigger("stateChanged");
                    this._updateSelectedItems();
                    this._handleItemEvent($itemElement, "itemSelectAction")
                }
            },
            _unselectItem: function($itemElement) {
                var itemSelectionIndex = $.inArray(this._getItemIndex($itemElement), this._selectedItemIndices);
                if (this.option("editEnabled") && itemSelectionIndex > -1) {
                    $itemElement.removeClass(LIST_ITEM_SELECTED_CLASS);
                    this._selectedItemIndices.splice(itemSelectionIndex, 1);
                    $itemElement.trigger("stateChanged");
                    this._updateSelectedItems();
                    this._handleItemEvent($itemElement, "itemUnselectAction")
                }
            },
            _refreshSelectedItems: function() {
                var self = this,
                    newSelection = this._editStrategy.selectedItemIndecies();
                var unselected = removeDublicates(this._selectedItemIndices, newSelection);
                $.each(unselected, function(_, index) {
                    var $itemElement = self._editStrategy.getItemByIndex(index);
                    self._unselectItem($itemElement)
                });
                var selected = removeDublicates(newSelection, this._selectedItemIndices);
                $.each(selected, function(_, index) {
                    var $itemElement = self._editStrategy.getItemByIndex(index);
                    self._selectItem($itemElement)
                })
            },
            deleteItem: function(itemElement) {
                var self = this,
                    deferred = $.Deferred(),
                    $item = this._getItemElement(itemElement),
                    index = this._getItemIndex(itemElement),
                    changingOption;
                if (this.option("editEnabled") && index > -1) {
                    $item.addClass(LIST_ITEM_RESPONSE_WAIT_CLASS);
                    if (this._dataSource) {
                        changingOption = "dataSource";
                        var disabledState = this.option("disabled"),
                            dataStore = this._dataSource.store();
                        this.option("disabled", true);
                        dataStore.remove(dataStore.keyOf(this._getItemData($item))).done(function(key) {
                            if (key !== undefined)
                                deferred.resolveWith(this);
                            else
                                deferred.rejectWith(this)
                        }).fail(function() {
                            deferred.rejectWith(this)
                        });
                        deferred.always(function() {
                            self.option("disabled", disabledState)
                        })
                    }
                    else {
                        changingOption = "items";
                        deferred.resolveWith(this)
                    }
                }
                else
                    deferred.rejectWith(this);
                return deferred.promise().done(function() {
                        $item.detach();
                        self._editStrategy.deleteItemAtIndex(index);
                        self.optionChanged.fireWith(self, [changingOption, self.option(changingOption)]);
                        self._updateSelectionAfterDelete(index);
                        self._handleItemEvent($item, "itemDeleteAction", {isGesture: true});
                        self._renderEmptyMessage()
                    }).fail(function() {
                        $item.removeClass(LIST_ITEM_RESPONSE_WAIT_CLASS)
                    })
            },
            isItemSelected: function(itemElement) {
                return this._isItemSelected(this._getItemIndex(itemElement))
            },
            selectItem: function(itemElement) {
                this._selectItem(this._getItemElement(itemElement))
            },
            unselectItem: function(itemElement) {
                this._unselectItem(this._getItemElement(itemElement))
            },
            update: function(doAnimate) {
                var self = this,
                    deferred = $.Deferred();
                if (self._scrollView)
                    self._scrollView.update(doAnimate).done(function() {
                        deferred.resolveWith(self)
                    });
                else
                    deferred.resolveWith(self);
                return deferred.promise()
            },
            scrollTop: function() {
                return this._scrollView.scrollOffset().top
            },
            clientHeight: function() {
                return this._scrollView.clientHeight()
            },
            scrollHeight: function() {
                return this._scrollView.scrollHeight()
            },
            scrollBy: function(distance) {
                this._scrollView.scrollBy(distance)
            },
            scrollTo: function(location) {
                this._scrollView.scrollTo(location)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.tileView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var TILEVIEW_CLASS = "dx-tileview",
            TILEVIEW_WRAPPER_CLASS = "dx-tiles-wrapper",
            TILEVIEW_ITEM_CLASS = "dx-tile",
            TILEVIEW_ITEM_SELECTOR = "." + TILEVIEW_ITEM_CLASS,
            TILEVIEW_ITEM_DATA_KEY = "dxTileData";
        ui.registerComponent("dxTileView", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: TILEVIEW_ITEM_SELECTOR,
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        items: null,
                        bounceEnabled: true,
                        showScrollbar: false,
                        listHeight: 500,
                        baseItemWidth: 100,
                        baseItemHeight: 100,
                        itemMargin: 20
                    })
            },
            _itemClass: function() {
                return TILEVIEW_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TILEVIEW_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$wrapper
            },
            _init: function() {
                var self = this;
                self.callBase();
                self._refreshHandler = function() {
                    self._renderGeometry()
                };
                utils.windowResizeCallbacks.add(self._refreshHandler)
            },
            _dispose: function() {
                this.callBase();
                utils.windowResizeCallbacks.remove(this._refreshHandler)
            },
            _render: function() {
                this.cellsPerColumn = 1;
                this._element().addClass(TILEVIEW_CLASS).height(this.option("listHeight"));
                if (!this._$wrapper)
                    this._renderWrapper();
                this._initScrollable();
                this.callBase();
                this._renderGeometry();
                this._fireContentReadyAction()
            },
            _renderContent: function() {
                this._renderContentImpl()
            },
            _renderWrapper: function() {
                this._$wrapper = $("<div />").addClass(TILEVIEW_WRAPPER_CLASS).appendTo(this._element())
            },
            _initScrollable: function() {
                this._scrollView = this._element().dxScrollable({
                    direction: "horizontal",
                    showScrollbar: this.option("showScrollbar"),
                    bounceEnabled: this.option("bounceEnabled"),
                    disabled: this.option("disabled")
                }).data("dxScrollable")
            },
            _renderGeometry: function() {
                var items = this.option("items") || [],
                    maxItemHeight = Math.max.apply(Math, $.map(items || [], function(item) {
                        return Math.round(item.heightRatio || 1)
                    }));
                this.cellsPerColumn = Math.floor(this._element().height() / (this.option("baseItemHeight") + this.option("itemMargin")));
                this.cellsPerColumn = Math.max(this.cellsPerColumn, maxItemHeight);
                this.cells = [];
                this.cells.push(new Array(this.cellsPerColumn));
                this._arrangeItems(items);
                this._$wrapper.width(this.cells.length * this.option("baseItemWidth") + (this.cells.length + 1) * this.option("itemMargin"))
            },
            _arrangeItems: function(items) {
                var self = this;
                $.each(items, function(index, item) {
                    var currentItem = {};
                    currentItem.widthRatio = item.widthRatio || 1;
                    currentItem.heightRatio = item.heightRatio || 1;
                    currentItem.text = item.text || "";
                    currentItem.widthRatio = currentItem.widthRatio <= 0 ? 0 : Math.round(currentItem.widthRatio);
                    currentItem.heightRatio = currentItem.heightRatio <= 0 ? 0 : Math.round(currentItem.heightRatio);
                    var $item = self._itemElements().eq(index),
                        itemPosition = self._getItemPosition(currentItem);
                    if (itemPosition.x === -1)
                        itemPosition.x = self.cells.push(new Array(this.cellsPerColumn)) - 1;
                    self._occupyCells(currentItem, itemPosition);
                    self._arrangeItem($item, currentItem, itemPosition)
                })
            },
            _getItemPosition: function(item) {
                var position = {
                        x: -1,
                        y: 0
                    };
                for (var col = 0; col < this.cells.length; col++) {
                    for (var row = 0; row < this.cellsPerColumn; row++)
                        if (this._itemFit(col, row, item)) {
                            position.x = col;
                            position.y = row;
                            break
                        }
                    if (position.x > -1)
                        break
                }
                return position
            },
            _itemFit: function(column, row, item) {
                var result = true;
                if (row + item.heightRatio > this.cellsPerColumn)
                    return false;
                for (var columnIndex = column; columnIndex < column + item.widthRatio; columnIndex++)
                    for (var rowIndex = row; rowIndex < row + item.heightRatio; rowIndex++)
                        if (this.cells.length - 1 < columnIndex)
                            this.cells.push(new Array(this.cellsPerColumn));
                        else if (this.cells[columnIndex][rowIndex]) {
                            result = false;
                            break
                        }
                return result
            },
            _occupyCells: function(item, itemPosition) {
                for (var i = itemPosition.x; i < itemPosition.x + item.widthRatio; i++)
                    for (var j = itemPosition.y; j < itemPosition.y + item.heightRatio; j++)
                        this.cells[i][j] = true
            },
            _arrangeItem: function($item, item, itemPosition) {
                var baseItemHeight = this.option("baseItemHeight"),
                    baseItemWidth = this.option("baseItemWidth"),
                    itemMargin = this.option("itemMargin");
                $item.css({
                    height: item.heightRatio * baseItemHeight + (item.heightRatio - 1) * itemMargin,
                    width: item.widthRatio * baseItemWidth + (item.widthRatio - 1) * itemMargin,
                    top: itemPosition.y * baseItemHeight + (itemPosition.y + 1) * itemMargin,
                    left: itemPosition.x * baseItemWidth + (itemPosition.x + 1) * itemMargin,
                    display: item.widthRatio <= 0 || item.heightRatio <= 0 ? "none" : ""
                })
            },
            _optionChanged: function(name, value) {
                if (name === "bounceEnabled" || name === "showScrollbar")
                    this._initScrollable();
                else if (name === "disabled")
                    this._scrollView.option("disabled", value);
                else
                    this.callBase.apply(this, arguments)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.gallery.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator,
            GALLERY_CLASS = "dx-gallery",
            GALLERY_ITEM_CONTAINER_CLASS = GALLERY_CLASS + "-wrapper",
            GALLERY_ITEM_CLASS = GALLERY_CLASS + "-item",
            GALLERY_ITEM_SELECTOR = "." + GALLERY_ITEM_CLASS,
            GALLERY_ITEM_SELECTED_CLASS = GALLERY_ITEM_CLASS + "-selected",
            GALLERY_INDICATOR_CLASS = GALLERY_CLASS + "-indicator",
            GALLERY_INDICATOR_ITEM_CLASS = GALLERY_INDICATOR_CLASS + "-item",
            GALLERY_INDICATOR_ITEM_SELECTOR = "." + GALLERY_INDICATOR_ITEM_CLASS,
            GALLERY_INDICATOR_ITEM_SELECTED_CLASS = GALLERY_INDICATOR_ITEM_CLASS + "-selected",
            GALLERY_ITEM_DATA_KEY = "dxGalleryItemData";
        ui.registerComponent("dxGalleryNavButton", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {direction: "next"})
            },
            _render: function() {
                this.callBase();
                this._element().addClass(GALLERY_CLASS + "-nav-button-" + this.option("direction"))
            }
        }));
        ui.registerComponent("dxGallery", ui.CollectionContainerWidget.inherit({
            _activeStateUnit: GALLERY_ITEM_SELECTOR,
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        animationDuration: 400,
                        loop: false,
                        swipeEnabled: true,
                        indicatorEnabled: true,
                        showIndicator: true,
                        selectedIndex: 0,
                        slideshowDelay: 0,
                        showNavButtons: false
                    })
            },
            _dataSourceOptions: function() {
                return {paginate: false}
            },
            _itemContainer: function() {
                return this._$container
            },
            _itemClass: function() {
                return GALLERY_ITEM_CLASS
            },
            _itemDataKey: function() {
                return GALLERY_ITEM_DATA_KEY
            },
            _itemWidth: function() {
                return this._itemElements().first().outerWidth()
            },
            _itemsCount: function() {
                return (this.option("items") || []).length
            },
            _itemRenderDefault: function(item, index, itemElement) {
                this.callBase(item, index, itemElement);
                if (!$.isPlainObject(item))
                    itemElement.append($("<img />").attr("src", String(item)))
            },
            _render: function() {
                this._element().addClass(GALLERY_CLASS).on(events.addNamespace("dragstart", this.NAME), "img", function() {
                    return false
                });
                this._renderItemContainer();
                this.callBase();
                this._renderItemPositions();
                this._renderIndicator();
                this._renderSelectedIndicatorItem();
                this._renderUserInteraction();
                this._renderNavButtons();
                this._setupSlideShow();
                this._reviseDimensions();
                this._windowResizeCallback = $.proxy(this._renderItemPositions, this);
                utils.windowResizeCallbacks.add(this._windowResizeCallback)
            },
            _renderItemContainer: function() {
                if (this._$container)
                    return;
                this._$container = $("<div />").addClass(GALLERY_ITEM_CONTAINER_CLASS).appendTo(this._element())
            },
            _renderItemPositions: function(offset, animate) {
                offset = offset || 0;
                var self = this,
                    itemWidth = this._itemWidth(),
                    selectedIndex = this.option("selectedIndex"),
                    animationDuration = this.option("animationDuration"),
                    targetIndex = offset - selectedIndex,
                    d = $.Deferred(),
                    animationPromises = [];
                this._itemElements().each(function(index) {
                    index = self._flipIndex(targetIndex + index);
                    var lastIndex = $(this).data("dxGalleryUIIndex"),
                        itemPosition = {left: index * itemWidth},
                        animConfig = {
                            type: "slide",
                            to: itemPosition,
                            duration: animationDuration
                        };
                    if (index - lastIndex > 1)
                        animConfig.from = {left: (index + 1) * itemWidth};
                    if (lastIndex - index > 1)
                        animConfig.from = {left: (index - 1) * itemWidth};
                    $(this).data("dxGalleryUIIndex", index);
                    if (animate)
                        animationPromises.push(fx.animate(this, animConfig));
                    else
                        translator.move($(this), itemPosition)
                });
                $.when.apply($, animationPromises).done(function() {
                    d.resolveWith(self)
                });
                return d.promise()
            },
            _reviseDimensions: function() {
                var self = this,
                    $firstItem = self._itemElements().first();
                if (!$firstItem)
                    return;
                if (!self.option("height"))
                    self.option("height", $firstItem.outerHeight());
                if (!self.option("width"))
                    self.option("width", $firstItem.outerWidth())
            },
            _renderIndicator: function() {
                if (!this.option("showIndicator")) {
                    this._cleanIndicators();
                    return
                }
                var indicator = this._$indicator = $("<div />").addClass(GALLERY_INDICATOR_CLASS).appendTo(this._element());
                $.each(this.option("items") || [], function() {
                    $("<div />").addClass(GALLERY_INDICATOR_ITEM_CLASS).appendTo(indicator)
                })
            },
            _cleanIndicators: function() {
                if (this._$indicator)
                    this._$indicator.remove()
            },
            _renderSelectedIndicatorItem: function() {
                var selectedIndex = this.option("selectedIndex");
                this._itemElements().removeClass(GALLERY_ITEM_SELECTED_CLASS).eq(selectedIndex).addClass(GALLERY_ITEM_SELECTED_CLASS);
                this._element().find(GALLERY_INDICATOR_ITEM_SELECTOR).removeClass(GALLERY_INDICATOR_ITEM_SELECTED_CLASS).eq(selectedIndex).addClass(GALLERY_INDICATOR_ITEM_SELECTED_CLASS)
            },
            _renderUserInteraction: function() {
                var self = this,
                    rootElement = self._element(),
                    swipeEnabled = self.option("swipeEnabled"),
                    cursor = swipeEnabled ? "pointer" : "default";
                rootElement.dxSwipeable({
                    startAction: swipeEnabled ? $.proxy(self._handleSwipeStart, self) : function(e) {
                        e.jQueryEvent.cancel = true
                    },
                    disabled: this.option("disabled"),
                    updateAction: $.proxy(self._handleSwipeUpdate, self),
                    endAction: $.proxy(self._handleSwipeEnd, self),
                    itemWidthFunc: $.proxy(self._itemWidth, self)
                });
                var indicatorSelectAction = this._createAction(this._handleIndicatorSelect);
                rootElement.find(GALLERY_INDICATOR_ITEM_SELECTOR).css({cursor: cursor}).off(events.addNamespace("dxclick", this.NAME)).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    indicatorSelectAction({jQueryEvent: e})
                })
            },
            _handleIndicatorSelect: function(args) {
                var e = args.jQueryEvent,
                    instance = args.component;
                if (events.needSkipEvent(e))
                    return;
                if (!instance.option("indicatorEnabled"))
                    return;
                var index = $(e.target).index();
                instance._renderItemPositions(instance.option("selectedIndex") - index, true).done(function() {
                    this._suppressRenderItemPositions = true;
                    instance.option("selectedIndex", index)
                })
            },
            _renderNavButtons: function() {
                var self = this;
                if (!self.option("showNavButtons")) {
                    self._cleanNavButtons();
                    return
                }
                self._prevNavButton = $("<div />").dxGalleryNavButton({
                    direction: "prev",
                    clickAction: function() {
                        self.prevItem(true)
                    }
                }).appendTo(this._element());
                self._nextNavButton = $("<div />").dxGalleryNavButton({
                    direction: "next",
                    clickAction: function() {
                        self.nextItem(true)
                    }
                }).appendTo(this._element());
                this._renderNavButtonsVisibility()
            },
            _cleanNavButtons: function() {
                if (this._prevNavButton)
                    this._prevNavButton.remove();
                if (this._prevNavButton)
                    this._nextNavButton.remove()
            },
            _renderNavButtonsVisibility: function() {
                if (!this.option("showNavButtons"))
                    return;
                var selectedIndex = this.option("selectedIndex"),
                    loop = this.option("loop"),
                    itemsCount = this._itemsCount();
                if (selectedIndex < itemsCount && selectedIndex > 0 || loop) {
                    this._prevNavButton.show();
                    this._nextNavButton.show()
                }
                if (!loop) {
                    if (selectedIndex < 1)
                        this._prevNavButton.hide();
                    if (selectedIndex === itemsCount - 1)
                        this._nextNavButton.hide()
                }
            },
            _setupSlideShow: function() {
                var self = this,
                    slideshowDelay = self.option("slideshowDelay");
                if (!slideshowDelay)
                    return;
                clearTimeout(self._slideshowTimer);
                self._slideshowTimer = setTimeout(function() {
                    if (self._userInteraction) {
                        self._setupSlideShow();
                        return
                    }
                    self.nextItem(true).done(self._setupSlideShow)
                }, slideshowDelay)
            },
            _handleSwipeStart: function(e) {
                var itemsCount = this._itemsCount();
                if (!itemsCount) {
                    e.jQueryEvent.cancel = true;
                    return
                }
                this._stopItemAnimations();
                this._userInteraction = true;
                if (!this.option("loop")) {
                    var selectedIndex = this.option("selectedIndex");
                    e.jQueryEvent.maxLeftOffset = itemsCount - selectedIndex - 1;
                    e.jQueryEvent.maxRightOffset = selectedIndex
                }
            },
            _stopItemAnimations: function() {
                if (fx.animating(this._itemElements().eq(0)))
                    this._itemElements().each(function() {
                        fx.stop(this, true)
                    })
            },
            _handleSwipeUpdate: function(e) {
                this._renderItemPositions(e.jQueryEvent.offset)
            },
            _handleSwipeEnd: function(e) {
                this._renderItemPositions(e.jQueryEvent.targetOffset, true).done(function() {
                    var selectedIndex = this.option("selectedIndex"),
                        newIndex = this._fitIndex(selectedIndex - e.jQueryEvent.targetOffset);
                    this._suppressRenderItemPositions = true;
                    this.option("selectedIndex", newIndex);
                    this._userInteraction = false;
                    this._setupSlideShow()
                })
            },
            _flipIndex: function(index) {
                if (!this.option("loop"))
                    return index;
                var itemsCount = this._itemsCount();
                index = index % itemsCount;
                if (index > (itemsCount + 1) / 2)
                    index -= itemsCount;
                if (index < -(itemsCount - 1) / 2)
                    index += itemsCount;
                return index
            },
            _fitIndex: function(index) {
                if (!this.option("loop"))
                    return index;
                var itemsCount = this._itemsCount();
                index = index % itemsCount;
                if (index < 0)
                    index += itemsCount;
                return index
            },
            _clean: function() {
                this.callBase();
                this._cleanIndicators();
                this._cleanNavButtons()
            },
            _dispose: function() {
                utils.windowResizeCallbacks.remove(this._windowResizeCallback);
                clearTimeout(this._slideshowTimer);
                this.callBase()
            },
            _handleSelectedIndexChanged: function() {
                if (!this._suppressRenderItemPositions)
                    this._renderItemPositions();
                this._suppressRenderItemPositions = false;
                this._renderSelectedIndicatorItem();
                this._renderNavButtonsVisibility()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"animationDuration":
                    case"loop":
                        this._renderNavButtonsVisibility();
                        return;
                    case"selectedIndex":
                        this._handleSelectedIndexChanged();
                        return;
                    case"showIndicator":
                        this._renderIndicator();
                        return;
                    case"showNavButtons":
                        this._renderNavButtons();
                        return;
                    case"slideshowDelay":
                        this._setupSlideShow();
                        return;
                    case"swipeEnabled":
                    case"indicatorEnabled":
                        this._renderUserInteraction();
                        return;
                    default:
                        this.callBase(name, value, prevValue)
                }
            },
            goToItem: function(itemIndex, animation) {
                var d = new $.Deferred,
                    selectedIndex = this.option("selectedIndex"),
                    itemsCount = this._itemsCount();
                itemIndex = this._fitIndex(itemIndex);
                if (itemIndex > itemsCount - 1 || itemIndex < 0)
                    return d.resolveWith(this).promise();
                this._renderItemPositions(selectedIndex - itemIndex, animation).done(function() {
                    this._suppressRenderItemPositions = true;
                    this.option("selectedIndex", itemIndex);
                    d.resolveWith(this)
                });
                return d.promise()
            },
            prevItem: function(animation) {
                return this.goToItem(this.option("selectedIndex") - 1, animation)
            },
            nextItem: function(animation) {
                return this.goToItem(this.option("selectedIndex") + 1, animation)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.overlay.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var OVERLAY_CLASS = "dx-overlay",
            OVERLAY_WRAPPER_CLASS = OVERLAY_CLASS + "-wrapper",
            OVERLAY_CONTENT_CLASS = OVERLAY_CLASS + "-content",
            OVERLAY_SHADER_CLASS = OVERLAY_CLASS + "-shader",
            OVERLAY_MODAL_CLASS = OVERLAY_CLASS + "-modal",
            OVERLAY_SHOW_EVENT_TOLERANCE = 500,
            ACTIONS = ["showingAction", "shownAction", "hidingAction", "hiddenAction"],
            LAST_Z_INDEX = 1000;
        ui.registerComponent("dxOverlay", ui.ContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        activeStateEnabled: false,
                        visible: false,
                        shading: true,
                        closeOnOutsideClick: false,
                        closeOnTargetScroll: false,
                        position: {
                            my: "center",
                            at: "center",
                            of: window
                        },
                        animation: {
                            show: {
                                type: "pop",
                                duration: 400
                            },
                            hide: {
                                type: "pop",
                                duration: 400,
                                to: {
                                    opacity: 0,
                                    scale: 0
                                },
                                from: {
                                    opacity: 1,
                                    scale: 1
                                }
                            }
                        },
                        showingAction: null,
                        shownAction: null,
                        hidingAction: null,
                        hiddenAction: null,
                        width: function() {
                            return $(window).width() * 0.8
                        },
                        height: function() {
                            return $(window).height() * 0.8
                        },
                        deferRendering: true,
                        disabled: false,
                        targetContainer: undefined,
                        reserveTargetContainer: undefined
                    })
            },
            _wrapper: function() {
                return this._$wrapper
            },
            _clickEventContainer: function() {
                return this._$wrapper
            },
            _init: function() {
                this.callBase();
                this._actions = {};
                this._deferredAnimate = undefined;
                this._attachCloseOnOutsideClickHandler();
                this._windowResizeCallback = $.proxy(this._refresh, this);
                utils.windowResizeCallbacks.add(this._windowResizeCallback);
                this._$wrapper = $("<div>").addClass(OVERLAY_WRAPPER_CLASS)
            },
            _initOptions: function(options) {
                this._setTargetContainer(options.targetContainer, options.reserveTargetContainer);
                this._setPositionOf(this._$targetContainer);
                this.callBase(options)
            },
            _setTargetContainer: function(targetContainer, reserveTargetContainer) {
                var $element = this._element();
                targetContainer = targetContainer === undefined ? DX.overlayTargetContainer() : targetContainer;
                var $reserveTargetContainer = reserveTargetContainer === undefined ? $element.parent() : $(reserveTargetContainer);
                var $targetContainer = $element.closest(targetContainer);
                if (!$targetContainer.length)
                    $targetContainer = $(targetContainer).first();
                this._$targetContainer = $targetContainer.length ? $targetContainer : $reserveTargetContainer
            },
            _setPositionOf: function(target) {
                this.option("position.of", target)
            },
            _closeOnOutsideClickHandler: function(e) {
                var closeOnOutsideClick = this.option("closeOnOutsideClick"),
                    visible = this.option("visible");
                if ($.isFunction(closeOnOutsideClick))
                    closeOnOutsideClick = closeOnOutsideClick(e);
                if (closeOnOutsideClick && visible) {
                    var $container = this._$container,
                        outsideClick = !$container.is(e.target) && !$.contains($container.get(0), e.target),
                        showingEvent = Math.abs(e.timeStamp - this._showTimestamp) < OVERLAY_SHOW_EVENT_TOLERANCE;
                    if (outsideClick && !showingEvent)
                        this.hide()
                }
            },
            _attachCloseOnOutsideClickHandler: function() {
                var self = this,
                    eventNames = events.addNamespace("dxpointerdown", self.NAME);
                this._myCloseOnOutsideClickHandler = function() {
                    return self._closeOnOutsideClickHandler.apply(self, arguments)
                };
                $(document).on(eventNames, this._myCloseOnOutsideClickHandler)
            },
            _detachCloseOnOutsideClickHandler: function() {
                var eventNames = events.addNamespace("dxpointerdown", this.NAME);
                $(document).off(eventNames, this._myCloseOnOutsideClickHandler)
            },
            _render: function() {
                var deferRendering = this.option("deferRendering");
                this._$container = $("<div>").addClass(OVERLAY_CONTENT_CLASS);
                this._needRenderOnShow = this.option("visible") || !deferRendering;
                this.callBase();
                this._renderStyles();
                this._needRenderOnShow = deferRendering;
                this._element().addClass(OVERLAY_CLASS);
                this._renderActions()
            },
            _renderStyles: function() {
                this._renderShader();
                this._renderModalState();
                this._renderDimensions();
                this._renderVisibility()
            },
            _renderShader: function() {
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, this.option("shading"))
            },
            _renderModalState: function() {
                this._$wrapper.toggleClass(OVERLAY_MODAL_CLASS, this.option("shading") && !this.option("targetContainer"))
            },
            _renderDimensions: function() {
                this._$container.width(this.option("width")).height(this.option("height"))
            },
            _renderVisibility: function() {
                var visible = this.option("visible");
                DX.fx.stop(this._$container, true);
                if (visible) {
                    this._renderContent();
                    this._renderPosition()
                }
                this._toggleVisibility(visible)
            },
            _renderActions: function() {
                var self = this;
                $.each(ACTIONS, function(_, itemAction) {
                    self._actions[itemAction] = self._createActionByOption(itemAction)
                })
            },
            _renderContent: function() {
                if (this._needRenderOnShow) {
                    this._moveFromTargetContainer();
                    this.callBase()
                }
            },
            _moveFromTargetContainer: function() {
                this._$container.appendTo(this._element())
            },
            _renderContentImpl: function(template) {
                this._renderInnerContent(template);
                this._moveToTargetContainer();
                this._needRenderOnShow = false
            },
            _renderInnerContent: function(template) {
                var $element = this._element();
                this._$container.append($element.contents()).appendTo($element);
                (template || this._templates.template).render(this.content())
            },
            _moveToTargetContainer: function() {
                var $element = this._element();
                if (this._$targetContainer && !(this._$targetContainer[0] === $element.parent()[0]))
                    this._$wrapper.appendTo(this._$targetContainer);
                else
                    this._$wrapper.appendTo($element);
                this._$container.appendTo(this._$wrapper)
            },
            _renderPosition: function() {
                var $wrapper = this._$wrapper.show();
                if (this.option("shading")) {
                    DX.position($wrapper, {
                        my: "top left",
                        at: "top left",
                        of: this._$targetContainer
                    });
                    $wrapper.css({
                        width: this._$targetContainer.outerWidth(),
                        height: this._$targetContainer.outerHeight()
                    })
                }
                this._$container.css("transform", "none");
                DX.position(this._$container, this.option("position"))
            },
            _subscribeParentScroll: function() {
                var self = this,
                    closeOnScroll = self.option("closeOnTargetScroll"),
                    $element = self.option("position").of;
                if (!closeOnScroll)
                    return;
                $element.parents().on(events.addNamespace("scroll", self.NAME), function(e) {
                    if (e.overlayProcessed)
                        return;
                    e.overlayProcessed = true;
                    self.hide()
                })
            },
            _unsubscribeParentScroll: function() {
                var self = this,
                    closeOnScroll = self.option("closeOnTargetScroll"),
                    $element = self.option("position").of;
                if (!closeOnScroll)
                    return;
                $element.parents().off(events.addNamespace("scroll", self.NAME))
            },
            _refresh: function() {
                this._renderStyles()
            },
            _dispose: function() {
                DX.fx.stop(this._$container);
                utils.windowResizeCallbacks.remove(this._windowResizeCallback);
                if (this.closeCallback)
                    DX.backButtonCallback.remove(this.closeCallback);
                this._detachCloseOnOutsideClickHandler();
                this._actions = null;
                this.callBase();
                this._$wrapper.remove()
            },
            _renderVisibilityAnimate: function() {
                var visible = this.option("visible");
                if (visible)
                    this._showTimestamp = $.now();
                DX.fx.stop(this._$container, true);
                if (visible)
                    this._makeVisible();
                else
                    this._makeHidden()
            },
            _makeVisible: function() {
                var self = this,
                    animation = self.option("animation") || {};
                this._$wrapper.css("z-index", ++LAST_Z_INDEX);
                this._actions.showingAction();
                this._toggleVisibility(true);
                this._renderContent();
                this._renderPosition();
                self._subscribeParentScroll();
                if (animation.show) {
                    var animationComplete = animation.show.complete || $.noop;
                    self._animate($.extend({}, animation.show, {complete: function() {
                            animationComplete();
                            self._notifyShowComplete()
                        }}))
                }
                else
                    self._notifyShowComplete()
            },
            _notifyShowComplete: function() {
                this._actions.shownAction();
                if (this._deferredAnimate)
                    this._deferredAnimate.resolveWith(this)
            },
            _makeHidden: function() {
                var self = this,
                    animation = this.option("animation") || {};
                self._actions.hidingAction();
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, false);
                self._unsubscribeParentScroll();
                if (animation.hide) {
                    var animationComplete = animation.hide.complete || $.noop;
                    self._animate($.extend({}, animation.hide, {complete: function() {
                            self._toggleVisibility(false);
                            animationComplete();
                            self._notifyHideComplete()
                        }}))
                }
                else {
                    self._toggleVisibility(false);
                    self._notifyHideComplete()
                }
            },
            _notifyHideComplete: function() {
                this._actions.hiddenAction();
                if (this._deferredAnimate)
                    this._deferredAnimate.resolveWith(this)
            },
            _animate: function(animation) {
                if ($.isPlainObject(animation))
                    DX.fx.animate(this._$container, animation)
            },
            _toggleVisibility: function(visible) {
                this._$wrapper.toggle(visible);
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, this.option("shading") && visible)
            },
            _optionChanged: function(name, value) {
                if ($.inArray(name, ACTIONS) > -1) {
                    this._renderActions();
                    return
                }
                switch (name) {
                    case"visible":
                        this._renderVisibilityAnimate();
                        break;
                    case"targetContainer":
                        this._setTargetContainer(value);
                        this._moveToTargetContainer();
                        this._refresh();
                        break;
                    case"closeOnOutsideClick":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            toggle: function(showing) {
                showing = showing === undefined ? !this.option("visible") : showing;
                if (showing) {
                    this.closeCallback = $.proxy(this.hide, this);
                    DX.backButtonCallback.add(this.closeCallback)
                }
                else if (this.closeCallback)
                    DX.backButtonCallback.remove(this.closeCallback);
                if (showing === this.option("visible"))
                    return $.Deferred().resolve().promise();
                this._deferredAnimate = $.Deferred();
                this.option("visible", showing);
                return this._deferredAnimate.promise()
            },
            show: function() {
                return this.toggle(true)
            },
            hide: function() {
                return this.toggle(false)
            },
            content: function() {
                return this._$container
            },
            repaint: function() {
                this._renderDimensions();
                this._renderPosition()
            }
        }));
        ui.dxOverlay.__internals = {
            OVERLAY_SHOW_EVENT_TOLERANCE: OVERLAY_SHOW_EVENT_TOLERANCE,
            OVERLAY_CLASS: OVERLAY_CLASS,
            OVERLAY_WRAPPER_CLASS: OVERLAY_WRAPPER_CLASS,
            OVERLAY_CONTENT_CLASS: OVERLAY_CONTENT_CLASS,
            OVERLAY_SHADER_CLASS: OVERLAY_SHADER_CLASS,
            OVERLAY_MODAL_CLASS: OVERLAY_MODAL_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.toast.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var TOAST_CLASS = "dx-toast",
            TOAST_CLASS_PREFIX = TOAST_CLASS + "-",
            TOAST_WRAPPER_CLASS = TOAST_CLASS_PREFIX + "wrapper",
            TOAST_CONTENT_CLASS = TOAST_CLASS_PREFIX + "content",
            TOAST_MESSAGE_CLASS = TOAST_CLASS_PREFIX + "message",
            TOAST_ICON_CLASS = TOAST_CLASS_PREFIX + "icon",
            WIDGET_NAME = "dxToast",
            toastTypes = ["info", "warning", "error", "success"];
        ui.registerComponent(WIDGET_NAME, ui.dxOverlay.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        message: "",
                        type: "info",
                        displayTime: 2000,
                        position: {
                            my: "bottom center",
                            at: "bottom center",
                            of: window,
                            offset: "0 -20"
                        },
                        animation: {
                            show: {
                                type: "fade",
                                duration: 400,
                                to: 1
                            },
                            hide: {
                                type: "fade",
                                duration: 400,
                                to: 0
                            }
                        },
                        shading: false,
                        disabled: false,
                        height: "auto"
                    })
            },
            _setPositionOf: $.noop,
            _renderContentImpl: function() {
                if (this.option("message"))
                    this._message = $("<div>").addClass(TOAST_MESSAGE_CLASS).text(this.option("message")).appendTo(this.content());
                if ($.inArray(this.option("type").toLowerCase(), toastTypes) > -1)
                    this.content().prepend($("<div>").addClass(TOAST_ICON_CLASS));
                this.callBase()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(TOAST_CLASS);
                this._wrapper().addClass(TOAST_WRAPPER_CLASS);
                this._$container.addClass(TOAST_CLASS_PREFIX + String(this.option("type")).toLowerCase());
                this.content().addClass(TOAST_CONTENT_CLASS).css("opacity", 0)
            },
            _notifyShowComplete: function() {
                this.callBase();
                clearTimeout(this._hideTimeout);
                this._hideTimeout = setTimeout($.proxy(function() {
                    this.hide()
                }, this), this.option("displayTime"))
            },
            _dispose: function() {
                clearTimeout(this._hideTimeout);
                this.callBase()
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"type":
                        this._$container.removeClass(TOAST_CLASS_PREFIX + prevValue);
                        this._$container.addClass(TOAST_CLASS_PREFIX + String(value).toLowerCase());
                        break;
                    case"message":
                        if (this._message)
                            this._message.text(value);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxToast.__internals = {
            TOAST_CLASS: TOAST_CLASS,
            TOAST_WRAPPER_CLASS: TOAST_WRAPPER_CLASS,
            TOAST_CONTENT_CLASS: TOAST_CONTENT_CLASS,
            TOAST_MESSAGE_CLASS: TOAST_MESSAGE_CLASS,
            TOAST_ICON_CLASS: TOAST_ICON_CLASS,
            TOAST_CLASS_PREFIX: TOAST_CLASS_PREFIX,
            WIDGET_NAME: WIDGET_NAME
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.popup.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var POPUP_CLASS = "dx-popup",
            POPUP_WRAPPER_CLASS = POPUP_CLASS + "-wrapper",
            POPUP_FULL_SCREEN_CLASS = POPUP_CLASS + "-fullscreen",
            POPUP_CONTENT_CLASS = POPUP_CLASS + "-content",
            POPUP_TITLE_CLASS = POPUP_CLASS + "-title",
            POPUP_TITLE_SELECTOR = "." + POPUP_TITLE_CLASS,
            POPUP_TITLE_CLOSEBUTTON_CLASS = "dx-closebutton",
            POPUP_BOTTOM_CLASS = "dx-popup-bottom",
            TOOLBAR_LEFT_CLASS = "dx-toolbar-left",
            TOOLBAR_RIGHT_CLASS = "dx-toolbar-right",
            OVERLAY_CONTENT_SELECTOR = ".dx-overlay-content";
        var getButtonContainer = function(force) {
                var device = DX.devices.current(force),
                    container = {
                        cancel: {subclass: "dx-popup-cancel"},
                        clear: {subclass: "dx-popup-clear"},
                        done: {subclass: "dx-popup-done"}
                    };
                if (device.ios) {
                    $.extend(container.cancel, {
                        parent: POPUP_TITLE_SELECTOR,
                        wraperClass: TOOLBAR_LEFT_CLASS
                    });
                    $.extend(container.clear, {
                        parent: POPUP_TITLE_SELECTOR,
                        wraperClass: TOOLBAR_RIGHT_CLASS
                    });
                    $.extend(container.done, {
                        parent: OVERLAY_CONTENT_SELECTOR,
                        wraperClass: POPUP_BOTTOM_CLASS
                    })
                }
                if (device.android || device.platform === "desktop" || device.win8 || device.tizen || device.generic) {
                    $.extend(container.cancel, {
                        parent: OVERLAY_CONTENT_SELECTOR,
                        wraperClass: POPUP_BOTTOM_CLASS
                    });
                    $.extend(container.clear, {
                        parent: OVERLAY_CONTENT_SELECTOR,
                        wraperClass: POPUP_BOTTOM_CLASS
                    });
                    $.extend(container.done, {
                        parent: OVERLAY_CONTENT_SELECTOR,
                        wraperClass: POPUP_BOTTOM_CLASS
                    })
                }
                return container
            };
        ui.registerComponent("dxPopup", ui.dxOverlay.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        title: "",
                        showTitle: true,
                        fullScreen: false,
                        cancelButton: null,
                        doneButton: null,
                        clearButton: null,
                        closeButton: null
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(POPUP_CLASS);
                this._wrapper().addClass(POPUP_WRAPPER_CLASS)
            },
            _renderDimensions: function() {
                if (this.option("fullScreen"))
                    this._$container.css({
                        width: "100%",
                        height: "100%"
                    });
                else
                    this.callBase()
            },
            _renderPosition: function() {
                if (this.option("fullScreen"))
                    this._$container.position(0, 0);
                else
                    this.callBase()
            },
            _renderContentImpl: function() {
                this._$container.toggleClass(POPUP_FULL_SCREEN_CLASS, this.option("fullScreen"));
                this._$content = this._$container.wrapInner($("<div />").addClass(POPUP_CONTENT_CLASS)).children().eq(0);
                this.callBase(this._templates.content);
                this._renderTitle();
                this._renderCloseButton();
                this._renderCancelButton();
                this._renderClearButton();
                this._renderDoneButton()
            },
            _renderTitle: function() {
                if (this.option("showTitle")) {
                    this._$title = $("<div />").addClass(POPUP_TITLE_CLASS);
                    this._element().append(this._$title);
                    var titleTemplate = this._templates.title;
                    if (titleTemplate)
                        titleTemplate.render(this._$title);
                    else
                        this._defaultTitleRender();
                    this._$title.prependTo(this._$container)
                }
                else if (this._$title)
                    this._$title.remove()
            },
            _defaultTitleRender: function() {
                this._$title.text(this.option("title"))
            },
            _renderCloseButton: function() {
                if (!this._templates.title && this.option("closeButton") && this.option("showTitle")) {
                    var clickAction = this._createButtonAction();
                    $("<div/>").addClass(POPUP_TITLE_CLOSEBUTTON_CLASS).on(ui.events.addNamespace("dxclick", this.NAME + "TitleCloseButton"), function(e) {
                        clickAction({jQueryEvent: e})
                    }).appendTo(this._$title)
                }
            },
            _renderCancelButton: function() {
                this._renderSpecificButton(this.option("cancelButton"), {
                    type: "cancel",
                    text: Globalize.localize("Cancel")
                })
            },
            _renderClearButton: function() {
                this._renderSpecificButton(this.option("clearButton"), {
                    type: "clear",
                    text: Globalize.localize("Clear")
                })
            },
            _renderDoneButton: function() {
                this._renderSpecificButton(this.option("doneButton"), {
                    type: "done",
                    text: Globalize.localize("Done")
                })
            },
            _renderSpecificButton: function(show, buttonConfig) {
                var renderParams = this._getRenderButtonParams(buttonConfig.type);
                this._removeButton(renderParams);
                this._wrapper().toggleClass(POPUP_CLASS + "-" + buttonConfig.type + "-visible", !!show);
                if (!show)
                    return;
                var userButtonOptions = this.option(buttonConfig.type + "Button");
                this._renderButton({
                    text: userButtonOptions.text || buttonConfig.text,
                    clickAction: this._createButtonAction(userButtonOptions.clickAction)
                }, renderParams)
            },
            _createButtonAction: function(clickAction) {
                return this._createAction(clickAction, {afterExecute: function(e) {
                            e.component.hide()
                        }})
            },
            _getRenderButtonParams: function(type) {
                return $.extend({parent: this.content()}, getButtonContainer()[type])
            },
            _renderButton: function(buttonParams, renderParams) {
                var $button = $("<div/>").addClass(renderParams.subclass).dxButton(buttonParams),
                    $parentContainer = this._wrapper().find(renderParams.parent),
                    $buttonContainer = this._wrapper().find("." + renderParams.wraperClass);
                if (!$buttonContainer.length)
                    $buttonContainer = $("<div/>").addClass(renderParams.wraperClass).appendTo($parentContainer);
                $button.appendTo($buttonContainer);
                this._wrapper().find("." + POPUP_BOTTOM_CLASS).addClass(renderParams.subclass)
            },
            _removeButton: function(params) {
                var removeSelector = "." + (params.subclass || params.wraperClass);
                if (this.content())
                    this.content().removeClass(params.subclass);
                this._wrapper().find(removeSelector).remove()
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"showTitle":
                    case"title":
                        this._renderTitle();
                        break;
                    case"fullScreen":
                        this._$container.toggleClass(POPUP_FULL_SCREEN_CLASS, value);
                        this.callBase.apply(this, arguments);
                        break;
                    case"cancelButton":
                        this._renderCancelButton();
                        break;
                    case"clearButton":
                        this._renderClearButton();
                        break;
                    case"doneButton":
                        this._renderDoneButton();
                        break;
                    case"closeButton":
                        this._renderCloseButton();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            content: function() {
                return this._$content
            }
        }));
        ui.dxPopup.__internals = {
            POPUP_CLASS: POPUP_CLASS,
            POPUP_WRAPPER_CLASS: POPUP_WRAPPER_CLASS,
            POPUP_CONTENT_CLASS: POPUP_CONTENT_CLASS,
            POPUP_FULL_SCREEN_CLASS: POPUP_FULL_SCREEN_CLASS,
            POPUP_TITLE_CLASS: POPUP_TITLE_CLASS,
            POPUP_TITLE_CLOSEBUTTON_CLASS: POPUP_TITLE_CLOSEBUTTON_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.popover.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var POPOVER_CLASS = "dx-popover",
            POPOVER_WRAPPER_CLASS = "dx-popover-wrapper",
            ARROW_CLASS = "dx-popover-arrow",
            ARROW_FLIPPED_CLASS = "dx-popover-arrow-flipped",
            POPOVER_WITHOUT_TITLE_CLASS = "dx-popover-without-title";
        ui.registerComponent("dxPopover", ui.dxPopup.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        target: window,
                        shading: false,
                        position: {
                            my: "top center",
                            at: "bottom center",
                            collision: "fit flip"
                        },
                        closeOnOutsideClick: $.proxy(this._isOutsideClick, this),
                        animation: {
                            show: {
                                type: "fade",
                                to: 1
                            },
                            hide: {
                                type: "fade",
                                to: 0
                            }
                        },
                        showTitle: false,
                        width: "auto",
                        height: "auto"
                    })
            },
            _render: function() {
                this._$arrow = $("<div>").addClass(ARROW_CLASS);
                this._element().addClass(POPOVER_CLASS);
                this._wrapper().addClass(POPOVER_WRAPPER_CLASS);
                this.callBase();
                this._renderTarget()
            },
            _renderContentImpl: function() {
                this.callBase();
                this._$arrow.appendTo(this._wrapper());
                this._updateContentSize()
            },
            _updateContentSize: function() {
                var height = this._$content.height(),
                    targetHeight = $(this.option("target")).outerHeight(),
                    maxHeight = $(window).height() * 0.5 - this._$arrow.outerHeight() - targetHeight;
                if (height > maxHeight)
                    this._$content.height(maxHeight)
            },
            _isOutsideClick: function(e) {
                return !$(e.target).closest(this.option("target")).length
            },
            _animate: function(animation) {
                this.callBase(animation);
                if ($.isPlainObject(animation))
                    DX.fx.animate(this._$arrow, animation)
            },
            _renderTitle: function() {
                this._wrapper().toggleClass(POPOVER_WITHOUT_TITLE_CLASS, !this.option("showTitle"));
                this.callBase()
            },
            _renderTarget: function() {
                this._setPositionOf(this.option("target"))
            },
            _renderPosition: function() {
                this._wrapper().show();
                var arrowPosition = $.extend({}, this.option("position"));
                var containerPosition = $.extend({}, arrowPosition, {offset: "0 " + this._$arrow.height()}),
                    containerLocation = DX.calculatePosition(this._$container, containerPosition),
                    isFlipped = containerLocation.v.flip;
                this._$arrow.toggleClass(ARROW_FLIPPED_CLASS, isFlipped);
                if (isFlipped)
                    $.extend(arrowPosition, {
                        my: arrowPosition.at,
                        at: arrowPosition.my
                    });
                DX.position(this._$arrow, arrowPosition);
                var contentPosition = {
                        my: arrowPosition.my,
                        at: arrowPosition.at,
                        offset: isFlipped ? "0 1" : "0 -1",
                        of: this._$arrow,
                        collision: "fit"
                    };
                DX.position(this._$container, contentPosition)
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"target":
                        this._renderTarget();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxPopover.__internals = {
            POPOVER_CLASS: POPOVER_CLASS,
            POPOVER_WRAPPER_CLASS: POPOVER_WRAPPER_CLASS,
            ARROW_CLASS: ARROW_CLASS,
            ARROW_FLIPPED_CLASS: ARROW_FLIPPED_CLASS,
            POPOVER_WITHOUT_TITLE_CLASS: POPOVER_WITHOUT_TITLE_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.dateBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            support = DX.support,
            globalize = Globalize;
        var DATEBOX_CLASS = "dx-datebox",
            DATEPICKER_CLASS = "dx-datepicker",
            DATEPICKER_WRAPPER_CLASS = "dx-datepicker-wrapper",
            DATEPICKER_ROLLER_CONTAINER_CLASS = "dx-datepicker-rollers",
            DATEPICKER_ROLLER_CLASS = "dx-datepicker-roller",
            DATEPICKER_ROLLER_ACTIVE_CLASS = "dx-state-active",
            DATEPICKER_ROLLER_CURRENT_CLASS = "dx-datepicker-roller-current",
            DATEPICKER_ROLLER_ITEM_CLASS = "dx-datepicker-item",
            DATEPICKER_ROLLER_ITEM_SELECTED_CLASS = "dx-datepicker-item-selected",
            DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS = "dx-datepicker-item-selected-frame",
            DATEPICKER_ROLLER_BUTTON_UP_CLASS = "dx-datepicker-button-up",
            DATEPICKER_ROLLER_BUTTON_DOWN_CLASS = "dx-datepicker-button-down",
            DATEPICKER_FORMATTER_CONTAINER = "datepicker-formatter-container",
            DATEPICKER_VALUE_FORMATTER = "datepicker-value-formatter",
            DATEPICKER_NAME_FORMATTER = "datepicker-name-formatter",
            SUPPORTED_FORMATS = ["date", "time", "datetime"],
            DEFAULT_FORMATTER = function(value) {
                return value
            },
            DATE_COMPONENT_TEXT_FORMATTER = function(value, name) {
                var $container = $("<div />").addClass(DATEPICKER_FORMATTER_CONTAINER);
                $("<span>").text(value).addClass(DATEPICKER_VALUE_FORMATTER).appendTo($container);
                $("<span>").text(name).addClass(DATEPICKER_NAME_FORMATTER).appendTo($container);
                return $container
            },
            YEAR = "year",
            MONTH = "month",
            DAY = "day",
            HOURS = "hours",
            MINUTES = "minutes",
            SECONDS = "seconds",
            MILLISECONDS = "milliseconds",
            TEN_YEARS = 86400 * 365 * 10;
        var DATE_COMPONENTS_INFO = {};
        DATE_COMPONENTS_INFO[YEAR] = {
            getter: "getFullYear",
            setter: "setFullYear",
            possibleFormats: ["yy", "yyyy"],
            formatter: DEFAULT_FORMATTER,
            startValue: undefined,
            endValue: undefined
        };
        DATE_COMPONENTS_INFO[DAY] = {
            getter: "getDate",
            setter: "setDate",
            possibleFormats: ["d", "dd"],
            formatter: function(value, showNames, date) {
                if (!showNames)
                    return value;
                var formatDate = new Date(date.getTime());
                formatDate.setDate(value);
                return DATE_COMPONENT_TEXT_FORMATTER(value, globalize.culture().calendar.days.names[formatDate.getDay()])
            },
            startValue: 1,
            endValue: undefined
        };
        DATE_COMPONENTS_INFO[MONTH] = {
            getter: "getMonth",
            setter: "setMonth",
            possibleFormats: ["M", "MM", "MMM", "MMMM"],
            formatter: function(value, showNames) {
                var monthName = globalize.culture().calendar.months.names[value];
                return showNames ? DATE_COMPONENT_TEXT_FORMATTER(value + 1, monthName) : monthName
            },
            startValue: 0,
            endValue: 11
        };
        DATE_COMPONENTS_INFO[HOURS] = {
            getter: "getHours",
            setter: "setHours",
            possibleFormats: ["h", "hh"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, value), "HH")
            },
            startValue: 0,
            endValue: 23
        };
        DATE_COMPONENTS_INFO[MINUTES] = {
            getter: "getMinutes",
            setter: "setMinutes",
            possibleFormats: ["m", "mm"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, 0, value), "mm")
            },
            startValue: 0,
            endValue: 59
        };
        DATE_COMPONENTS_INFO[SECONDS] = {
            getter: "getSeconds",
            setter: "setSeconds",
            possibleFormats: ["s", "ss"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, 0, 0, value), "ss")
            },
            startValue: 0,
            endValue: 59
        };
        DATE_COMPONENTS_INFO[MILLISECONDS] = {
            getter: "getMilliseconds",
            setter: "setMilliseconds",
            possibleFormats: ["f", "ff", "fff"],
            formatter: function(value) {
                return globalize.format(new Date(0, 0, 0, 0, 0, 0, value), "fff")
            },
            startValue: 0,
            endValue: 999
        };
        var FORMATS_INFO = {
                date: {
                    standardPattern: "yyyy-MM-dd",
                    components: [YEAR, DAY, MONTH]
                },
                datetime: {
                    standardPattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss'Z'",
                    components: [YEAR, DAY, MONTH, HOURS, MINUTES, SECONDS, MILLISECONDS]
                },
                datetimeAndroid: {
                    standardPattern: "yyyy'-'MM'-'dd'T'HH':'mm'Z'",
                    components: [YEAR, DAY, MONTH, HOURS, MINUTES, SECONDS, MILLISECONDS]
                },
                time: {
                    standardPattern: "HH:mm",
                    components: [HOURS, MINUTES]
                }
            };
        var toStandardDateFormat = function(date, mode) {
                return Globalize.format(date, FORMATS_INFO[mode].standardPattern)
            };
        var fromStandardDateFormat = function(date) {
                return Globalize.parseDate(date, FORMATS_INFO.datetime.standardPattern) || Globalize.parseDate(date, FORMATS_INFO.datetimeAndroid.standardPattern) || Globalize.parseDate(date, FORMATS_INFO.time.standardPattern) || Globalize.parseDate(date, FORMATS_INFO.date.standardPattern)
            };
        var getMaxMonthDay = function(year, month) {
                return new Date(year, month + 1, 0).getDate()
            };
        var mergeDates = function(target, source, format) {
                if (!source)
                    return undefined;
                var formatInfo = FORMATS_INFO[format];
                $.each(formatInfo.components, function() {
                    var componentInfo = DATE_COMPONENTS_INFO[this];
                    target[componentInfo.setter](source[componentInfo.getter]())
                });
                return target
            };
        ui.registerComponent("dxDatePickerRoller", ui.dxScrollable.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        showScrollbar: false,
                        useNative: false,
                        selectedIndex: 0,
                        items: []
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(DATEPICKER_ROLLER_CLASS);
                this._renderItems();
                this._renderSelectedItemFrame();
                this._renderControlButtons();
                this._renderSelectedValue()
            },
            _renderItems: function() {
                var items = this.option("items") || [],
                    $items = $();
                this._$content.empty();
                $.each(items, function() {
                    $items = $items.add($("<div>").addClass(DATEPICKER_ROLLER_ITEM_CLASS).append(this))
                });
                this._$content.append($items);
                this._$items = $items;
                this.update()
            },
            _renderSelectedItemFrame: function() {
                $("<div>").addClass(DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS).insertAfter(this._$container)
            },
            _renderControlButtons: function() {
                $("<div>").addClass(DATEPICKER_ROLLER_BUTTON_UP_CLASS).insertAfter(this._$container).dxButton({clickAction: $.proxy(this._handleUpButtonClick, this)});
                $("<div>").addClass(DATEPICKER_ROLLER_BUTTON_DOWN_CLASS).insertAfter(this._$container).dxButton({clickAction: $.proxy(this._handleDownButtonClick, this)})
            },
            _renderSelectedValue: function(selectedIndex) {
                if (selectedIndex === undefined)
                    selectedIndex = this.option("selectedIndex");
                selectedIndex = this._fitIndex(selectedIndex);
                var correctedPosition = this._getItemPosition(selectedIndex);
                this.option().selectedIndex = selectedIndex;
                this._moveTo({y: correctedPosition});
                this._renderActiveStateItem()
            },
            _fitIndex: function(index) {
                var items = this.option("items") || [],
                    itemCount = items.length;
                if (index >= itemCount)
                    return itemCount - 1;
                if (index < 0)
                    return 0;
                return index
            },
            _renderActiveStateItem: function() {
                var selectedIndex = this.option("selectedIndex");
                $.each(this._$items, function(index) {
                    $(this).toggleClass(DATEPICKER_ROLLER_ITEM_SELECTED_CLASS, selectedIndex === index)
                })
            },
            _handleUpButtonClick: function() {
                this._animation = true;
                this.option("selectedIndex", this.option("selectedIndex") - 1)
            },
            _handleDownButtonClick: function() {
                this._animation = true;
                this.option("selectedIndex", this.option("selectedIndex") + 1)
            },
            _getItemPosition: function(index) {
                return this._itemHeight() * index
            },
            _moveTo: function(targetLocation) {
                targetLocation = this._normalizeLocation(targetLocation);
                var location = this._location(),
                    moveComplete,
                    delta = {
                        x: -(location.left - targetLocation.x),
                        y: -(location.top - targetLocation.y)
                    };
                if (this._isVisible() && (delta.x || delta.y)) {
                    if (this._animation) {
                        moveComplete = DX.fx.animate(this._$content, {
                            duration: 300,
                            type: "slide",
                            to: {top: targetLocation.y}
                        });
                        delete this._animation
                    }
                    else {
                        moveComplete = $.Deferred().resolve().promise();
                        this._strategy._handleMove(delta)
                    }
                    moveComplete.done($.proxy(function() {
                        this._strategy._handleMoveEnd({
                            x: 0,
                            y: 0
                        })
                    }, this))
                }
            },
            _handleEndAction: function() {
                var ratio = -this._location().top / this._itemHeight(),
                    selectedIndex = Math.round(ratio);
                this._renderSelectedValue(selectedIndex)
            },
            _itemHeight: function() {
                var $item = this._$items.first(),
                    height = $item.outerHeight() + parseFloat($item.css("margin-top"));
                return height
            },
            _toggleActive: function(state) {
                this._element().toggleClass(DATEPICKER_ROLLER_ACTIVE_CLASS, state)
            },
            _isVisible: function() {
                return this._$container.is(":visible")
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"selectedIndex":
                        this._renderSelectedValue();
                        break;
                    case"items":
                        this._renderItems();
                        this._renderSelectedValue();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.registerComponent("dxDatePicker", ui.dxPopup.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        minDate: new Date(1990, 1, 1),
                        maxDate: new Date($.now() + TEN_YEARS),
                        format: "date",
                        value: new Date,
                        culture: Globalize.culture().name,
                        showNames: false,
                        cancelButton: {
                            text: "Cancel",
                            icon: "close",
                            clickAction: $.proxy(function() {
                                this._value = new Date(this.option("value"))
                            }, this)
                        },
                        doneButton: {
                            text: "Done",
                            icon: "save",
                            clickAction: $.proxy(function() {
                                this.option("value", new Date(this._value));
                                this.hide()
                            }, this)
                        }
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(DATEPICKER_CLASS);
                this._wrapper().addClass(DATEPICKER_WRAPPER_CLASS);
                this._value = new Date(this.option("value"))
            },
            _renderContentImpl: function() {
                this.callBase();
                this._value = new Date(this.option("value"));
                this._renderRollers()
            },
            _renderRollers: function() {
                var self = this;
                if (!self._$rollersContainer)
                    self._$rollersContainer = $("<div>").appendTo(self.content()).addClass(DATEPICKER_ROLLER_CONTAINER_CLASS);
                self._$rollersContainer.empty();
                self._createRollerConfigs();
                self._rollers = {};
                $.each(self._rollerConfigs, function() {
                    var rollerItem = this,
                        roller = $("<div>").appendTo(self._$rollersContainer).dxDatePickerRoller({
                            items: rollerItem.displayItems,
                            selectedIndex: rollerItem.selectedIndex,
                            startAction: function(e) {
                                var roller = e.component;
                                roller._toggleActive.call(roller, true);
                                self._setActiveRoller.call(self, rollerItem, roller.option("selectedIndex"))
                            },
                            endAction: function(e) {
                                var roller = e.component;
                                roller._animation = true;
                                roller._handleEndAction.apply(roller, arguments);
                                self._setRollerState.call(self, rollerItem, roller.option("selectedIndex"));
                                roller._toggleActive.call(roller, false)
                            }
                        });
                    self._rollers[rollerItem.type] = roller.dxDatePickerRoller("instance")
                })
            },
            _setActiveRoller: function(currentRoller) {
                var activeRoller = this._rollers[currentRoller.type];
                $.each(this._rollers, function() {
                    this._$element.toggleClass(DATEPICKER_ROLLER_CURRENT_CLASS, this === activeRoller)
                })
            },
            _refreshRollers: function() {
                var self = this;
                $.each(this._rollers, function(type) {
                    var correctIndex = self._rollerConfigs[type].getIndex(self._value);
                    this.update();
                    this._renderSelectedValue(correctIndex)
                })
            },
            _setRollerState: function(roller, selectedIndex) {
                if (selectedIndex !== roller.selectedIndex) {
                    var value = roller.valueItems[selectedIndex],
                        setValue = roller.setValue,
                        currentDate = this._value.getDate();
                    if (roller.type === MONTH) {
                        currentDate = Math.min(currentDate, getMaxMonthDay(this._value.getFullYear(), value));
                        this._value.setDate(currentDate)
                    }
                    else if (roller.type === YEAR) {
                        currentDate = Math.min(currentDate, getMaxMonthDay(value, this._value.getMonth()));
                        this._value.setDate(currentDate)
                    }
                    this._value[setValue](value);
                    roller.selectedIndex = selectedIndex
                }
                if ((roller.type === MONTH || roller.type === YEAR) && this._rollers[DAY]) {
                    this._createRollerConfig(DAY);
                    this._rollers[DAY].option("items", this._rollerConfigs[DAY].displayItems)
                }
            },
            _createRollerConfigs: function(format) {
                var self = this;
                format = format || self.option("format");
                self._rollerConfigs = {};
                $.each(self._getFormatPattern(format).split(/\W+/), function(_, formatPart) {
                    $.each(DATE_COMPONENTS_INFO, function(componentName, componentInfo) {
                        if ($.inArray(formatPart, componentInfo.possibleFormats) > -1)
                            self._createRollerConfig(componentName)
                    })
                })
            },
            _getFormatPattern: function(format) {
                var culture = Globalize.culture(this.option("culture")),
                    result = "";
                if (format === "date")
                    result = culture.calendar.patterns.d;
                else if (format === "time")
                    result = culture.calendar.patterns.t;
                else if (format === "datetime")
                    result = [culture.calendar.patterns.d, culture.calendar.patterns.t].join(" ");
                return result
            },
            _createRollerConfig: function(componentName) {
                var componentInfo = DATE_COMPONENTS_INFO[componentName],
                    startValue = componentInfo.startValue,
                    endValue = componentInfo.endValue,
                    formatter = componentInfo.formatter,
                    showNames = this.option("showNames");
                if (componentName === YEAR) {
                    startValue = this.option("minDate").getFullYear();
                    endValue = this.option("maxDate").getFullYear()
                }
                if (componentName === DAY)
                    endValue = getMaxMonthDay(this._value.getFullYear(), this._value.getMonth());
                var config = {
                        type: componentName,
                        setValue: componentInfo.setter,
                        valueItems: [],
                        displayItems: [],
                        getIndex: function(value) {
                            return value[componentInfo.getter]() - startValue
                        }
                    };
                for (var i = startValue; i <= endValue; i++) {
                    config.valueItems.push(i);
                    config.displayItems.push(formatter(i, showNames, this._value))
                }
                config.selectedIndex = config.getIndex(this._value);
                this._rollerConfigs[componentName] = config
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"minDate":
                    case"maxDate":
                    case"culture":
                    case"format":
                        this._renderRollers();
                        break;
                    case"visible":
                        this.callBase(name, value, prevValue);
                        if (value)
                            this._refreshRollers();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            }
        }));
        ui.registerComponent("dxDateBox", ui.dxEditBox.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        format: "date",
                        value: new Date,
                        useNativePicker: true
                    })
            },
            _init: function() {
                this.callBase();
                if ($.inArray(this.option("format"), SUPPORTED_FORMATS) === -1)
                    this.option("format", "date");
                this.option("mode", this.option("format"))
            },
            _render: function() {
                this.callBase();
                this._element().addClass(DATEBOX_CLASS);
                this._renderDatePicker()
            },
            _renderDatePicker: function() {
                if (support.inputType(this.option("format")) || this.option("useNativePicker"))
                    return;
                var datePickerOptions = {
                        value: this.option("value"),
                        format: this.option("format")
                    };
                if (this._datePicker)
                    this._datePicker.option(datePickerOptions);
                else {
                    this._datePicker = $("<div>").appendTo(this._element()).dxDatePicker($.extend(datePickerOptions, {hidingAction: $.proxy(function(e) {
                            this.option("value", e.component.option("value"))
                        }, this)})).dxDatePicker("instance");
                    var inputClickAction = this._createAction(function(e) {
                            e.component._datePicker.show()
                        });
                    this._input().on(events.addNamespace("dxclick", this.NAME), function(e) {
                        return inputClickAction({jQuery: e})
                    })
                }
            },
            _handleValueChange: function() {
                var value = fromStandardDateFormat(this._input().val()),
                    modelValue = new Date(this.option("value") && this.option("value").valueOf()),
                    newValue = mergeDates(modelValue, value, this.option("format"));
                this.option({value: newValue});
                if (newValue !== modelValue)
                    this._renderValue()
            },
            _renderValue: function() {
                this._input().val(toStandardDateFormat(this.option("value"), this.option("format")))
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"value":
                        this._renderValue();
                        this._changeAction(value);
                        this._renderDatePicker();
                        break;
                    case"format":
                        this.option("mode", value);
                        this._renderValue();
                        this._renderDatePicker();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            }
        }));
        ui.dxDatePicker.__internals = {
            DATEPICKER_CLASS: DATEPICKER_CLASS,
            DATEPICKER_WRAPPER_CLASS: DATEPICKER_WRAPPER_CLASS,
            DATEPICKER_ROLLER_CONTAINER_CLASS: DATEPICKER_ROLLER_CONTAINER_CLASS,
            DATEPICKER_ROLLER_CLASS: DATEPICKER_ROLLER_CLASS,
            DATEPICKER_ROLLER_ACTIVE_CLASS: DATEPICKER_ROLLER_ACTIVE_CLASS,
            DATEPICKER_ROLLER_ITEM_CLASS: DATEPICKER_ROLLER_ITEM_CLASS,
            DATEPICKER_ROLLER_ITEM_SELECTED_CLASS: DATEPICKER_ROLLER_ITEM_SELECTED_CLASS,
            DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS: DATEPICKER_ROLLER_ITEM_SELECTED_FRAME_CLASS,
            DATEPICKER_ROLLER_BUTTON_UP_CLASS: DATEPICKER_ROLLER_BUTTON_UP_CLASS,
            DATEPICKER_ROLLER_BUTTON_DOWN_CLASS: DATEPICKER_ROLLER_BUTTON_DOWN_CLASS,
            DATEPICKER_ROLLER_CURRENT_CLASS: DATEPICKER_ROLLER_CURRENT_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.loadIndicator.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LOADINDICATOR_CLASS = "dx-loadindicator",
            LOADINDICATOR_WRAPPER = LOADINDICATOR_CLASS + "-wrapper",
            LOADINDICATOR_ICON = LOADINDICATOR_CLASS + "-icon",
            LOADINDICATOR_SEGMENT = LOADINDICATOR_CLASS + "-segment",
            LOADINDICATOR_SEGMENT_N = LOADINDICATOR_CLASS + "-segment",
            LOADINDICATOR_SEGMENT_WIN8 = LOADINDICATOR_CLASS + "-win8-segment",
            LOADINDICATOR_SEGMENT_N_WIN8 = LOADINDICATOR_CLASS + "-win8-segment",
            LOADINDICATOR_INNER_SEGMENT_WIN8 = LOADINDICATOR_CLASS + "-win8-inner-segment",
            LOADINDICATOR_IMAGE = LOADINDICATOR_CLASS + "-image",
            LOADINDICATOR_SIZES = ["small", "medium", "large"];
        ui.registerComponent("dxLoadIndicator", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        disabled: false,
                        visible: true,
                        size: ""
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(LOADINDICATOR_CLASS);
                this._setSize();
                if (DX.support.animation && !this.option("viaImage"))
                    this._renderMarkupForAnimation();
                else
                    this._renderMarkupForImage()
            },
            _renderMarkupForAnimation: function() {
                var indicator = $("<div>").addClass(LOADINDICATOR_ICON);
                indicator.append($("<div>").addClass(LOADINDICATOR_SEGMENT).addClass(LOADINDICATOR_SEGMENT_N + "0"));
                for (var i = 15; i > 0; --i)
                    indicator.append($("<div>").addClass(LOADINDICATOR_SEGMENT).addClass(LOADINDICATOR_SEGMENT_N + i));
                for (var i = 1; i <= 5; ++i)
                    indicator.append($("<div>").addClass(LOADINDICATOR_SEGMENT_WIN8).addClass(LOADINDICATOR_SEGMENT_N_WIN8 + i).append($("<div>").addClass(LOADINDICATOR_INNER_SEGMENT_WIN8)));
                $("<div>").addClass(LOADINDICATOR_WRAPPER).append(indicator).appendTo(this._element())
            },
            _renderMarkupForImage: function() {
                var size = this.option("size");
                if (size === "small" || size === "large")
                    this._element().addClass(LOADINDICATOR_IMAGE + "-" + size);
                else
                    this._element().addClass(LOADINDICATOR_IMAGE)
            },
            _setSize: function() {
                var size = this.option("size");
                if (size && $.inArray(size, LOADINDICATOR_SIZES) !== -1)
                    this._element().addClass(LOADINDICATOR_CLASS + "-" + size)
            },
            _optionChanged: function(name) {
                switch (name) {
                    case"size":
                        this._setSize();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.loadPanel.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LOADPANEL_CLASS = "dx-loadpanel",
            LOADPANEL_WRAPPER_CLASS = LOADPANEL_CLASS + "-wrapper",
            LOADPANEL_MESSAGE_CLASS = LOADPANEL_CLASS + "-message",
            LOADPANEL_CONTENT_CLASS = LOADPANEL_CLASS + "-content",
            LOADPANEL_HAS_INDICATOR = LOADPANEL_CLASS + "-has-indicator";
        ui.registerComponent("dxLoadPanel", ui.dxOverlay.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        message: Globalize.localize("Loading"),
                        width: 200,
                        height: 70,
                        animation: null,
                        disabled: false,
                        showIndicator: true
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass(LOADPANEL_CLASS);
                this._wrapper().addClass(LOADPANEL_WRAPPER_CLASS)
            },
            _renderContentImpl: function() {
                this.callBase();
                this.content().addClass(LOADPANEL_CONTENT_CLASS);
                this._renderLoadIndicator();
                this._renderMessage()
            },
            _renderMessage: function() {
                $("<div>").addClass(LOADPANEL_MESSAGE_CLASS).toggleClass(LOADPANEL_HAS_INDICATOR, this.option("showIndicator")).text(this.option("message")).appendTo(this.content())
            },
            _renderLoadIndicator: function() {
                if (this.option("showIndicator"))
                    $("<div>").dxLoadIndicator().appendTo(this.content())
            },
            _clean: function() {
                this.content().empty()
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"message":
                    case"showIndicator":
                        this._clean();
                        this._render();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxLoadPanel.__internals = {
            LOADPANEL_CLASS: LOADPANEL_CLASS,
            LOADPANEL_WRAPPER_CLASS: LOADPANEL_WRAPPER_CLASS,
            LOADPANEL_MESSAGE_CLASS: LOADPANEL_MESSAGE_CLASS,
            LOADPANEL_CONTENT_CLASS: LOADPANEL_CONTENT_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.lookup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var LOOKUP_CLASS = "dx-lookup",
            LOOKUP_SELECTED_CLASS = LOOKUP_CLASS + "-selected",
            LOOKUP_SEARCH_CLASS = LOOKUP_CLASS + "-search",
            LOOKUP_FIELD_CLASS = LOOKUP_CLASS + "-field",
            LOOKUP_POPUP_CLASS = LOOKUP_CLASS + "-popup",
            LOOKUP_POPUP_WRAPPER_CLASS = LOOKUP_POPUP_CLASS + "-wrapper",
            LOOKUP_POPUP_SEARCH_CLASS = LOOKUP_POPUP_CLASS + "-search",
            LOOKUP_POPOVER_MODE = LOOKUP_CLASS + "-popover-mode",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            POPUP_HIDE_TIMEOUT = 200;
        ui.registerComponent("dxLookup", ui.ContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        dataSource: null,
                        value: undefined,
                        displayValue: undefined,
                        title: "",
                        valueExpr: null,
                        displayExpr: "this",
                        placeholder: Globalize.localize("Select"),
                        searchPlaceholder: Globalize.localize("Search"),
                        searchEnabled: true,
                        searchTimeout: 1000,
                        minFilterLength: 0,
                        fullScreen: false,
                        valueChangeAction: null,
                        itemTemplate: null,
                        itemRender: null,
                        showCancelButton: true,
                        showClearButton: false,
                        showDoneButton: false,
                        contentReadyAction: null,
                        usePopover: false
                    })
            },
            _init: function() {
                this.callBase();
                this._initDataSource();
                this._checkExceptions();
                this._searchTimer = null;
                this._compileValueGetter();
                this._compileDisplayGetter();
                this._createEventActions();
                if (!this._dataSource)
                    this._itemsToDataSource()
            },
            _checkExceptions: function() {
                if (this._dataSource && this._dataSource._mapFunc)
                    throw Error("Data source with enabled map is not allowed in the lookup");
            },
            _compileValueGetter: function() {
                this._valueGetter = DX.data.utils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || this._dataSource && this._dataSource._store._key || "this"
            },
            _compileDisplayGetter: function() {
                this._displayGetter = DX.data.utils.compileGetter(this.option("displayExpr"))
            },
            _createEventActions: function() {
                this._valueChangeAction = this._createActionByOption("valueChangeAction")
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"))
            },
            _render: function() {
                this.callBase();
                this._element().addClass(LOOKUP_CLASS).toggleClass(LOOKUP_POPOVER_MODE, this.option("usePopover"));
                this._renderField();
                this._needRenderContent = true;
                this._calcSelectedItem($.proxy(this._setFieldText, this))
            },
            _renderContent: $.noop,
            _renderField: function() {
                var fieldClickAction = this._createAction(this._handleFieldClick);
                this._$field = $("<div/>").addClass(LOOKUP_FIELD_CLASS).appendTo(this._element()).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    fieldClickAction({jQueryEvent: e})
                })
            },
            _handleFieldClick: function(args) {
                var self = args.component;
                self._renderContentIfNeed();
                self._setListDataSource();
                self._refreshSelected();
                self._popup.show()
            },
            _renderContentIfNeed: function() {
                if (this._needRenderContent) {
                    this._renderPopup();
                    this._needRenderContent = false
                }
            },
            _renderPopup: function() {
                var $popup = $("<div />").addClass(LOOKUP_POPUP_CLASS).appendTo(this._element());
                this._popup = this.option("usePopover") ? this._createPopover($popup) : this._createPopup($popup);
                this._popup._wrapper().addClass(LOOKUP_POPUP_WRAPPER_CLASS).toggleClass(LOOKUP_POPUP_SEARCH_CLASS, this.option("searchEnabled"))
            },
            _createPopover: function($element) {
                return $element.dxPopover({
                        title: this.option("title"),
                        showTitle: true,
                        width: 300,
                        height: 300,
                        target: this._element(),
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this),
                        cancelButton: this._getCancelButtonConfig(),
                        doneButton: this._getDoneButtonConfig(),
                        clearButton: this._getClearButtonConfig()
                    }).dxPopover("instance")
            },
            _createPopup: function($element) {
                return $element.dxPopup({
                        title: this.option("title"),
                        fullScreen: this.option("fullScreen"),
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this),
                        cancelButton: this._getCancelButtonConfig(),
                        doneButton: this._getDoneButtonConfig(),
                        clearButton: this._getClearButtonConfig()
                    }).dxPopup("instance")
            },
            _getCancelButtonConfig: function() {
                return this.option("showCancelButton") ? {} : null
            },
            _getDoneButtonConfig: function() {
                return this.option("showDoneButton") ? {clickAction: $.proxy(function() {
                            this.option("value", this._valueGetter(this._lastSelectedItem))
                        }, this)} : null
            },
            _getClearButtonConfig: function() {
                return this.option("showClearButton") ? {clickAction: $.proxy(function() {
                            this.option("value", "")
                        }, this)} : null
            },
            _renderCancelButton: function() {
                if (this._popup)
                    this._popup.option("cancelButton", this._getCancelButtonConfig())
            },
            _renderDoneButton: function() {
                if (!this._popup)
                    return;
                this._popup.option("doneButton", this._getDoneButtonConfig());
                this._popup.addClass(LOOKUP_)
            },
            _renderClearButton: function() {
                if (this._popup)
                    this._popup.option("clearButton", this._getClearButtonConfig())
            },
            _popupContentReadyAction: function() {
                this._renderSearch();
                this._renderList();
                this._setListDataSource()
            },
            _renderSearch: function() {
                this._$search = $("<div/>").addClass(LOOKUP_SEARCH_CLASS).dxTextBox({
                    mode: "search",
                    placeholder: this._getSearchPlaceholder(),
                    valueUpdateEvent: "change keypress paste focus textInput input",
                    valueUpdateAction: $.proxy(this._searchChangedHandler, this)
                }).toggle(this.option("searchEnabled")).appendTo(this._popup.content());
                this._search = this._$search.dxTextBox("instance")
            },
            _getSearchPlaceholder: function() {
                var minFilterLength = this.option("minFilterLength"),
                    placeholder = this.option("searchPlaceholder");
                if (minFilterLength && placeholder === Globalize.localize("Search"))
                    return utils.stringFormat(Globalize.localize("dxLookup-searchPlaceholder"), minFilterLength);
                return placeholder
            },
            _renderList: function() {
                this._list = $("<div/>").appendTo(this._popup.content()).dxList({
                    dataSource: null,
                    itemClickAction: $.proxy(function(e) {
                        this._toggleSelectedClass(e.jQueryEvent);
                        this._updateOptions(e)
                    }, this),
                    itemRenderedAction: $.proxy(function(e) {
                        this._setSelectedClass(e.itemElement, e.itemData)
                    }, this),
                    contentReadyAction: this.option("contentReadyAction"),
                    itemRender: this._getItemRender(),
                    itemTemplate: this.option("itemTemplate")
                }).data("dxList");
                this._list.addTemplate(this._templates);
                if (this._needSetItemRenderToList) {
                    this._updateListItemRender();
                    this._needSetItemRenderToList = false
                }
            },
            _setListDataSource: function(force) {
                if (!this._list)
                    return;
                var needsToLoad = this._search.option("value").length >= this.option("minFilterLength"),
                    dataSourceLoaded = !!this._list.option("dataSource"),
                    skip = needsToLoad === dataSourceLoaded;
                if (!force && skip)
                    return;
                this._list.option("dataSource", needsToLoad ? this._dataSource : null);
                if (!needsToLoad)
                    this._list.option("items", undefined)
            },
            _refreshSelected: function() {
                var self = this;
                if (!self._list)
                    return;
                $.each(this._list._element().find(LIST_ITEM_SELECTOR), function() {
                    var item = $(this);
                    self._setSelectedClass(item, item.data(LIST_ITEM_DATA_KEY))
                })
            },
            _calcSelectedItem: function(callback) {
                var ds = this._dataSource,
                    store,
                    valueExpr,
                    thisWidget = this,
                    value = this.option("value");
                function handleLoadSuccess(result) {
                    thisWidget._selectedItem = result;
                    callback()
                }
                if (!ds || value === undefined) {
                    this._selectedItem = undefined;
                    callback();
                    return
                }
                store = ds.store();
                valueExpr = this._valueGetterExpr();
                if (valueExpr === store.key() || store instanceof DX.data.CustomStore)
                    store.byKey(value).done(handleLoadSuccess);
                else
                    store.load({filter: [valueExpr, value]}).done(function(result) {
                        handleLoadSuccess(result[0])
                    })
            },
            _setFieldText: function(text) {
                if (!arguments.length)
                    text = this._getDisplayText();
                this._$field.text(text);
                this.option("displayValue", text)
            },
            _getDisplayText: function() {
                if (this.option("value") === undefined || !this._dataSource)
                    return this.option("placeholder");
                return this._displayGetter(this._selectedItem) || this.option("placeholder")
            },
            _searchChangedHandler: function() {
                if (!this._search)
                    return;
                var searchValue = this._search.option("value"),
                    needsToLoad = searchValue.length >= this.option("minFilterLength");
                clearTimeout(this._$searchTimer);
                this._search.option("placeholder", this._getSearchPlaceholder());
                this._setListDataSource();
                if (!needsToLoad)
                    return;
                if (this.option("searchTimeout"))
                    this._searchTimer = setTimeout($.proxy(this._doSearch, this, searchValue), this.option("searchTimeout"));
                else
                    this._doSearch(searchValue)
            },
            _doSearch: function(searchValue) {
                if (!this._dataSource)
                    return;
                if (!arguments.length)
                    searchValue = this.option("searchEnabled") ? this._search.option("value") : "";
                this._filterStore(searchValue);
                this._list.update(true)
            },
            _filterStore: function(searchValue) {
                this._dataSource.searchExpr(this.option("displayExpr"));
                this._dataSource.searchValue(searchValue);
                this._dataSource.pageIndex(0);
                this._dataSource.load()
            },
            _updateOptions: function(e) {
                if (this._lastSelectedItem === e.itemData)
                    this._updateAndHidePopup();
                this._lastSelectedItem = e.itemData;
                if (!this.option("showDoneButton"))
                    this._updateAndHidePopup()
            },
            _setSelectedClass: function(item, itemData) {
                var selected = this._valueGetter(itemData) === this.option("value");
                item.toggleClass(LOOKUP_SELECTED_CLASS, selected)
            },
            _getItemRender: function() {
                if (!this.option("itemTemplate"))
                    return this.option("itemRender") || $.proxy(this._displayGetter, this)
            },
            _toggleSelectedClass: function(e) {
                var $selectedItem = this._list._element().find("." + LOOKUP_SELECTED_CLASS);
                if ($selectedItem.length)
                    $selectedItem.removeClass(LOOKUP_SELECTED_CLASS);
                $(e.target).closest(LIST_ITEM_SELECTOR).addClass(LOOKUP_SELECTED_CLASS)
            },
            _hidePopup: function() {
                this._popup.hide()
            },
            _updateAndHidePopup: function() {
                this.option("value", this._valueGetter(this._lastSelectedItem));
                clearTimeout(this._hidePopupTimer);
                this._hidePopupTimer = setTimeout($.proxy(this._hidePopup, this), POPUP_HIDE_TIMEOUT);
                this._setFieldText(this._displayGetter(this._lastSelectedItem))
            },
            _updateListItemRender: function() {
                if (this._list)
                    this._list.option("itemRender", this._getItemRender());
                else
                    this._needSetItemRenderToList = true
            },
            _updateListItemTemplate: function() {
                if (this._list)
                    this._list.option("itemTemplate", this.option("itemTemplate"))
            },
            _handleDataSourceChanged: function(items) {
                this._calcSelectedItem($.proxy(this._setFieldText, this))
            },
            _clean: function() {
                if (this._popup)
                    this._popup._element().remove();
                this.callBase()
            },
            _dispose: function() {
                clearTimeout(this._searchTimer);
                clearTimeout(this._hidePopupTimer);
                $(window).off(events.addNamespace("popstate", this.NAME));
                this.callBase()
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"valueExpr":
                    case"value":
                        this._calcSelectedItem($.proxy(function() {
                            if (name === "value")
                                this._valueChangeAction({selectedItem: this._selectedItem});
                            this._compileValueGetter();
                            this._compileDisplayGetter();
                            this._refreshSelected();
                            this._setFieldText()
                        }, this));
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        this._updateListItemRender();
                        this._refreshSelected();
                        this._setFieldText();
                        break;
                    case"displayValue":
                        break;
                    case"itemRender":
                        this._updateListItemRender();
                    case"itemTemplate":
                        this._updateListItemTemplate();
                        break;
                    case"items":
                    case"dataSource":
                        if (name === "items")
                            this._itemsToDataSource();
                        else
                            this._initDataSource();
                        this._setListDataSource(true);
                        this._compileValueGetter();
                        this._calcSelectedItem($.proxy(this._setFieldText, this));
                        break;
                    case"searchEnabled":
                        this._$search.toggle(value);
                        if (this._popup)
                            this._popup._wrapper().toggleClass(LOOKUP_POPUP_SEARCH_CLASS, value);
                        break;
                    case"minFilterLength":
                        this._setListDataSource();
                        this._setFieldText();
                        this._searchChangedHandler();
                        break;
                    case"placeholder":
                        this._setFieldText();
                        break;
                    case"searchPlaceholder":
                        if (this._$search)
                            this._$search.dxTextBox("instance").option("placeholder", value);
                        break;
                    case"title":
                    case"fullScreen":
                        if (this._popup)
                            this._popup.option(name, value);
                        break;
                    case"valueChangeAction":
                        this._createEventActions();
                        break;
                    case"showClearButton":
                        this._renderClearButton();
                        break;
                    case"showCancelButton":
                        this._renderCancelButton();
                        break;
                    case"showDoneButton":
                        this._renderDoneButton();
                        break;
                    case"contentReadyAction":
                        this._list.option("contentReadyAction", value);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
                this._checkExceptions()
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.actionSheet.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var ACTION_SHEET_CLASS = "dx-action-sheet",
            ACTION_SHEET_CONTAINER_CLASS = "dx-action-sheet-container",
            ACTION_SHEET_POPUP_WRAPPER_CLASS = "dx-action-sheet-popup-wrapper",
            ACTION_SHEET_POPOVER_WRAPPER_CLASS = "dx-action-sheet-popover-wrapper",
            ACTION_SHEET_CANCEL_BUTTON_CLASS = "dx-action-sheet-cancel",
            ACTION_SHEET_ITEM_CLASS = "dx-action-sheet-item",
            ACTION_SHEET_ITEM_DATA_KEY = "dxActionSheetItemData",
            ACTION_SHEET_WITHOUT_TITLE_CLASS = "dx-action-sheet-without-title";
        ui.registerComponent("dxActionSheet", ui.CollectionContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        usePopover: false,
                        target: null,
                        title: "",
                        showTitle: true,
                        cancelText: Globalize.localize("Cancel"),
                        noDataText: "",
                        visible: false
                    })
            },
            _render: function() {
                this._element().addClass(ACTION_SHEET_CLASS);
                this._createItemContainer();
                this._renderPopup();
                this.callBase()
            },
            _createItemContainer: function() {
                this._$itemContainer = $("<div/>").addClass(ACTION_SHEET_CONTAINER_CLASS);
                this._toggleDisabled(this.option("disabled"))
            },
            _renderClick: function() {
                this._popup.option("clickAction", this.option("clickAction"))
            },
            _renderPopup: function() {
                var $popup = $("<div/>").appendTo(this._element());
                this._popup = this._isPopoverMode() ? this._createPopover($popup) : this._createPopup($popup);
                this._togglePopupTitle(this.option("showTitle"));
                this._popup.option("visible", this.option("visible"))
            },
            _togglePopupTitle: function(visible) {
                this._popup.option("showTitle", visible);
                this._popup._wrapper().toggleClass(ACTION_SHEET_WITHOUT_TITLE_CLASS, !visible)
            },
            _isPopoverMode: function() {
                return this.option("usePopover") && this.option("target")
            },
            _createPopover: function($element) {
                var popover = $element.dxPopover({
                        showTitle: true,
                        title: this.option("title"),
                        width: 200,
                        height: "auto",
                        target: this.option("target"),
                        hiddenAction: $.proxy(this.hide, this),
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this)
                    }).dxPopover("instance");
                popover._wrapper().addClass(ACTION_SHEET_POPOVER_WRAPPER_CLASS);
                return popover
            },
            _createPopup: function($element) {
                var popup = $element.dxPopup({
                        title: this.option("title"),
                        width: "100%",
                        height: "auto",
                        contentReadyAction: $.proxy(this._popupContentReadyAction, this),
                        position: {
                            my: "bottom",
                            at: "bottom",
                            of: window
                        },
                        animation: {
                            show: {
                                type: "slide",
                                duration: 400,
                                from: {top: $("body").height()},
                                to: {top: 0 - $element.find(".dx-overlay-content").height()},
                                complete: $.proxy(this._cleanupPopupAnimation, this)
                            },
                            hide: {
                                type: "slide",
                                duration: 400,
                                from: {top: 0 - $element.find(".dx-overlay-content").height()},
                                to: {top: $("body").height()},
                                complete: $.proxy(this._cleanupPopupAnimation, this)
                            }
                        }
                    }).dxPopup("instance");
                popup._wrapper().addClass(ACTION_SHEET_POPUP_WRAPPER_CLASS);
                return popup
            },
            _renderContent: function() {
                if (this._needRender)
                    this.callBase()
            },
            _popupContentReadyAction: function() {
                this._popup.content().append(this._$itemContainer);
                this._needRender = true;
                this._renderContent();
                this._renderCancel()
            },
            _cleanupPopupAnimation: function() {
                var animation = this._popup.option("animation"),
                    to;
                if (!animation)
                    return $.Deferred().resolve();
                to = animation.hide && animation.hide.from || animation.show && animation.show.to;
                if (to)
                    return DX.fx.animate(this._popup._$container, {
                            duration: 0,
                            type: animation.hide.type,
                            to: to
                        });
                return $.Deferred().resolve()
            },
            _renderCancel: function() {
                if (this._isPopoverMode())
                    return;
                this._cancelButton = $("<div/>").addClass(ACTION_SHEET_CANCEL_BUTTON_CLASS).appendTo(this._popup.content()).dxButton({
                    text: this.option("cancelText"),
                    clickAction: $.proxy(this.hide, this)
                }).dxButton("instance")
            },
            _handleItemClick: function(e) {
                var clickedButton = $(e.target).closest(this._itemSelector()).data("dxButton");
                if (!clickedButton.option("disabled") && !this.option("disabled"))
                    this.hide();
                this.callBase(e)
            },
            _itemRenderDefault: function(item, index, itemElement) {
                itemElement.dxButton(item)
            },
            _itemContainer: function() {
                return this._$itemContainer
            },
            _itemClass: function() {
                return ACTION_SHEET_ITEM_CLASS
            },
            _itemDataKey: function() {
                return ACTION_SHEET_ITEM_DATA_KEY
            },
            _toggleVisibility: $.noop,
            _toggleDisabled: function(disabled) {
                this._$itemContainer.toggleClass("dx-state-disabled", disabled)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"disabled":
                        this._toggleDisabled(value);
                        break;
                    case"visible":
                    case"title":
                        this._popup.option(name, value);
                        break;
                    case"showTitle":
                        this._togglePopupTitle(value);
                        break;
                    case"cancelText":
                        this._cancelButton.option("text", value);
                        break;
                    case"items":
                        this._attachClickEvent();
                        this._renderContent();
                        this._popup._refresh();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            toggle: function(showing) {
                var self = this,
                    d = $.Deferred();
                self._popup.toggle(showing).done(function() {
                    self.option("visible", showing);
                    d.resolveWith(self)
                });
                return d.promise()
            },
            show: function() {
                return this.toggle(true)
            },
            hide: function() {
                return this.toggle(false)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.map.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            winJS = DX.support.winJS;
        var ROUTE_WEIGHT_DEFAULT = 5,
            ROUTE_OPACITY_DEFAULT = .5,
            ROUTE_COLOR_DEFAULT = "#0000FF";
        var providers = {};
        var registerProvider = function(name, provider) {
                providers[name] = provider
            };
        var Provider = DX.Class.inherit({
                ctor: function(map, $container) {
                    this._mapInstance = map;
                    this._$container = $container
                },
                load: $.noop,
                render: DX.abstract,
                updateDimensions: DX.abstract,
                updateMapType: DX.abstract,
                updateLocation: DX.abstract,
                updateZoom: DX.abstract,
                updateControls: DX.abstract,
                updateMarkers: DX.abstract,
                updateRoutes: DX.abstract,
                clean: DX.abstract,
                cancelEvents: false,
                map: function() {
                    return this._map
                },
                mapRendered: function() {
                    return !!this._map
                },
                _option: function(name, value) {
                    if (value === undefined)
                        return this._mapInstance.option(name);
                    this._mapInstance.setOptionSilent(name, value)
                },
                _key: function(providerName) {
                    var key = this._option("key");
                    return key[providerName] === undefined ? key : key[providerName]
                },
                _createAction: function() {
                    return this._mapInstance._createAction.apply(this._mapInstance, $.makeArray(arguments))
                }
            });
        var BING_MAP_READY = "_bingScriptReady",
            BING_URL = "https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1&onScriptLoad=" + BING_MAP_READY,
            BING_LOCAL_FILES1 = "ms-appx:///Bing.Maps.JavaScript/js/veapicore.js",
            BING_LOCAL_FILES2 = "ms-appx:///Bing.Maps.JavaScript/js/veapiModules.js",
            BING_CREDENTIALS = "AhuxC0dQ1DBTNo8L-H9ToVMQStmizZzBJdraTSgCzDSWPsA1Qd8uIvFSflzxdaLH";
        var msMapsLoader;
        registerProvider("bing", Provider.inherit({
            _mapType: function(type) {
                var mapTypes = {
                        roadmap: Microsoft.Maps.MapTypeId.road,
                        hybrid: Microsoft.Maps.MapTypeId.aerial
                    };
                return mapTypes[type] || mapTypes.roadmap
            },
            _movementMode: function(type) {
                var movementTypes = {
                        driving: Microsoft.Maps.Directions.RouteMode.driving,
                        walking: Microsoft.Maps.Directions.RouteMode.walking
                    };
                return movementTypes[type] || movementTypes.driving
            },
            _resolveLocation: function(location) {
                var d = $.Deferred();
                if (typeof location === "string") {
                    var searchManager = new Microsoft.Maps.Search.SearchManager(this._map);
                    var searchRequest = {
                            where: location,
                            count: 1,
                            callback: function(searchResponse) {
                                var boundsBox = searchResponse.results[0].location;
                                d.resolve(new Microsoft.Maps.Location(boundsBox.latitude, boundsBox.longitude))
                            }
                        };
                    searchManager.geocode(searchRequest)
                }
                else if ($.isPlainObject(location) && $.isNumeric(location.lat) && $.isNumeric(location.lng))
                    d.resolve(new Microsoft.Maps.Location(location.lat, location.lng));
                else if ($.isArray(location))
                    d.resolve(new Microsoft.Maps.Location(location[0], location[1]));
                return d.promise()
            },
            _normalizeLocation: function(location) {
                return {
                        lat: location.latitude,
                        lng: location.longitude
                    }
            },
            load: function() {
                if (!msMapsLoader) {
                    msMapsLoader = $.Deferred();
                    window[BING_MAP_READY] = $.proxy(this._mapReady, this);
                    if (winJS)
                        $.when($.getScript(BING_LOCAL_FILES1), $.getScript(BING_LOCAL_FILES2)).done(function() {
                            Microsoft.Maps.loadModule("Microsoft.Maps.Map", {callback: window[BING_MAP_READY]})
                        });
                    else
                        $.getScript(BING_URL)
                }
                this._markers = [];
                this._routes = [];
                return msMapsLoader
            },
            _mapReady: function() {
                try {
                    delete window[BING_MAP_READY]
                }
                catch(e) {
                    window[BING_MAP_READY] = undefined
                }
                var searchModulePromise = $.Deferred();
                var directionsModulePromise = $.Deferred();
                Microsoft.Maps.loadModule('Microsoft.Maps.Search', {callback: $.proxy(searchModulePromise.resolve, searchModulePromise)});
                Microsoft.Maps.loadModule('Microsoft.Maps.Directions', {callback: $.proxy(directionsModulePromise.resolve, directionsModulePromise)});
                $.when(searchModulePromise, directionsModulePromise).done(function() {
                    msMapsLoader.resolve()
                })
            },
            render: function() {
                var initPromise = $.Deferred(),
                    controls = this._option("controls");
                var options = {
                        credentials: this._key("bing") || BING_CREDENTIALS,
                        mapTypeId: this._mapType(this._option("type")),
                        zoom: this._option("zoom"),
                        showDashboard: controls,
                        showMapTypeSelector: controls,
                        showScalebar: controls
                    };
                this._map = new Microsoft.Maps.Map(this._$container[0], options);
                var handler = Microsoft.Maps.Events.addHandler(this._map, 'tiledownloadcomplete', $.proxy(initPromise.resolve, initPromise));
                this._viewChangeHandler = Microsoft.Maps.Events.addHandler(this._map, 'viewchange', $.proxy(this._handleViewChange, this));
                var locationPromise = this._renderLocation();
                var markersPromise = this._renderMarkers();
                var routesPromise = this._renderRoutes();
                return $.when(initPromise, locationPromise, markersPromise, routesPromise).done(function() {
                        Microsoft.Maps.Events.removeHandler(handler)
                    })
            },
            _handleViewChange: function() {
                var center = this._map.getCenter();
                this._option("location", this._normalizeLocation(center));
                this._option("zoom", this._map.getZoom())
            },
            updateDimensions: function() {
                return $.Deferred().resolve().promise()
            },
            updateMapType: function() {
                this._map.setView({mapTypeId: this._mapType(this._option("type"))});
                return $.Deferred().resolve().promise()
            },
            updateLocation: function() {
                return this._renderLocation()
            },
            _renderLocation: function() {
                var self = this;
                return this._resolveLocation(this._option("location")).done(function(location) {
                        self._map.setView({
                            animate: false,
                            center: location
                        })
                    })
            },
            updateZoom: function() {
                this._map.setView({
                    animate: false,
                    zoom: this._option("zoom")
                });
                return $.Deferred().resolve().promise()
            },
            updateControls: function() {
                this.clean();
                return this.render()
            },
            updateMarkers: function() {
                return this._renderMarkers()
            },
            _renderMarkers: function() {
                var self = this;
                this._clearMarkers();
                var markerPromises = $.map(this._option("markers"), function(markerOptions) {
                        return self._renderMarker(markerOptions).done(function(marker) {
                                self._markers.push(marker)
                            })
                    });
                return $.when.apply($, markerPromises)
            },
            _clearMarkers: function() {
                var self = this;
                $.each(this._markers, function(_, marker) {
                    self._map.entities.remove(marker.pushpin);
                    if (marker.infobox)
                        self._map.entities.remove(marker.infobox);
                    if (marker.handler)
                        Microsoft.Maps.Events.removeHandler(marker.handler)
                });
                this._markers = []
            },
            _renderMarker: function(options) {
                var d = $.Deferred(),
                    self = this;
                this._resolveLocation(options.location).done(function(location) {
                    var pushpin = new Microsoft.Maps.Pushpin(location, null);
                    self._map.entities.push(pushpin, null);
                    var infobox;
                    if (options.tooltip) {
                        infobox = new Microsoft.Maps.Infobox(location, {
                            description: options.tooltip,
                            offset: new Microsoft.Maps.Point(0, 33)
                        });
                        self._map.entities.push(infobox, null)
                    }
                    var handler;
                    if (options.clickAction || options.tooltip) {
                        var markerClickAction = self._createAction(options.clickAction || $.noop);
                        handler = Microsoft.Maps.Events.addHandler(pushpin, "click", function() {
                            markerClickAction({location: self._normalizeLocation(location)});
                            if (infobox)
                                infobox.setOptions({visible: true})
                        })
                    }
                    d.resolve({
                        pushpin: pushpin,
                        infobox: infobox,
                        handler: handler
                    })
                });
                return d.promise()
            },
            updateRoutes: function() {
                return this._renderRoutes()
            },
            _renderRoutes: function() {
                var self = this;
                this._clearRoutes();
                var routePromises = $.map(this._option("routes"), function(routeOptions) {
                        return self._renderRoute(routeOptions).done(function(route) {
                                self._routes.push(route)
                            })
                    });
                return $.when.apply($, routePromises)
            },
            _clearRoutes: function() {
                var self = this;
                $.each(this._routes, function(_, route) {
                    route.dispose()
                });
                this._routes = []
            },
            _renderRoute: function(options) {
                var d = $.Deferred(),
                    self = this;
                var points = $.map(options.locations, function(point) {
                        return self._resolveLocation(point)
                    });
                $.when.apply($, points).done(function() {
                    var locations = $.makeArray(arguments),
                        direction = new Microsoft.Maps.Directions.DirectionsManager(self._map),
                        color = new DX.Color(options.color || ROUTE_COLOR_DEFAULT).toHex(),
                        routeColor = new Microsoft.Maps.Color.fromHex(color);
                    routeColor.a = (options.opacity || ROUTE_OPACITY_DEFAULT) * 255;
                    direction.setRenderOptions({
                        autoUpdateMapView: false,
                        displayRouteSelector: false,
                        waypointPushpinOptions: {visible: false},
                        drivingPolylineOptions: {
                            strokeColor: routeColor,
                            strokeThickness: options.weight || ROUTE_WEIGHT_DEFAULT
                        },
                        walkingPolylineOptions: {
                            strokeColor: routeColor,
                            strokeThickness: options.weight || ROUTE_WEIGHT_DEFAULT
                        }
                    });
                    direction.setRequestOptions({
                        routeMode: self._movementMode(options.mode),
                        routeDraggable: false
                    });
                    $.each(locations, function(_, location) {
                        var waypoint = new Microsoft.Maps.Directions.Waypoint({location: location});
                        direction.addWaypoint(waypoint)
                    });
                    var handler = Microsoft.Maps.Events.addHandler(direction, 'directionsUpdated', function() {
                            Microsoft.Maps.Events.removeHandler(handler);
                            d.resolve(direction)
                        });
                    direction.calculateDirections()
                });
                return d.promise()
            },
            clean: function() {
                if (this._map) {
                    Microsoft.Maps.Events.removeHandler(this._viewChangeHandler);
                    this._clearMarkers();
                    this._clearRoutes();
                    this._map.dispose()
                }
            },
            cancelEvents: true
        }));
        var GOOGLE_MAP_READY = "_googleScriptReady",
            GOOGLE_URL = "https://maps.google.com/maps/api/js?v=3.9&sensor=false&callback=" + GOOGLE_MAP_READY;
        var googleMapsLoader;
        registerProvider("google", Provider.inherit({
            _mapType: function(type) {
                var mapTypes = {
                        hybrid: google.maps.MapTypeId.HYBRID,
                        roadmap: google.maps.MapTypeId.ROADMAP
                    };
                return mapTypes[type] || mapTypes.hybrid
            },
            _movementMode: function(type) {
                var movementTypes = {
                        driving: google.maps.TravelMode.DRIVING,
                        walking: google.maps.TravelMode.WALKING
                    };
                return movementTypes[type] || movementTypes.driving
            },
            _resolveLocation: function(location) {
                var d = $.Deferred();
                if (typeof location === "string") {
                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode({address: location}, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK)
                            d.resolve(results[0].geometry.location)
                    })
                }
                else if ($.isArray(location))
                    d.resolve(new google.maps.LatLng(location[0], location[1]));
                else if ($.isPlainObject(location) && $.isNumeric(location.lat) && $.isNumeric(location.lng))
                    d.resolve(new google.maps.LatLng(location.lat, location.lng));
                return d.promise()
            },
            _normalizeLocation: function(location) {
                return {
                        lat: location.lat(),
                        lng: location.lng()
                    }
            },
            load: function() {
                if (!googleMapsLoader) {
                    googleMapsLoader = $.Deferred();
                    var key = this._key("google");
                    window[GOOGLE_MAP_READY] = $.proxy(this._mapReady, this);
                    $.getScript(GOOGLE_URL + (key ? "&key=" + key : ""))
                }
                this._markers = [];
                this._routes = [];
                return googleMapsLoader.promise()
            },
            _mapReady: function() {
                try {
                    delete window[GOOGLE_MAP_READY]
                }
                catch(e) {
                    window[GOOGLE_MAP_READY] = undefined
                }
                googleMapsLoader.resolve()
            },
            render: function() {
                var initPromise = $.Deferred(),
                    controls = this._option("controls");
                var options = {
                        zoom: this._option("zoom"),
                        center: new google.maps.LatLng(0, 0),
                        mapTypeId: this._mapType(this._option("type")),
                        panControl: controls,
                        zoomControl: controls,
                        mapTypeControl: controls,
                        streetViewControl: controls
                    };
                this._map = new google.maps.Map(this._$container[0], options);
                var listner = google.maps.event.addListener(this._map, 'idle', $.proxy(initPromise.resolve, initPromise));
                this._zoomChangeListener = google.maps.event.addListener(this._map, 'zoom_changed', $.proxy(this._handleZoomChange, this));
                this._centerChangeListener = google.maps.event.addListener(this._map, 'center_changed', $.proxy(this._handleCenterChange, this));
                var locationPromise = this._renderLocation();
                var markersPromise = this._renderMarkers();
                var routesPromise = this._renderRoutes();
                return $.when(initPromise, locationPromise, markersPromise, routesPromise).done(function() {
                        google.maps.event.removeListener(listner)
                    })
            },
            updateDimensions: function() {
                google.maps.event.trigger(this._map, 'resize');
                return $.Deferred().resolve().promise()
            },
            updateMapType: function() {
                this._map.setMapTypeId(this._mapType(this._option("type")));
                return $.Deferred().resolve().promise()
            },
            updateLocation: function() {
                return this._renderLocation()
            },
            _handleCenterChange: function() {
                var center = this._map.getCenter();
                this._option("location", this._normalizeLocation(center))
            },
            _renderLocation: function() {
                var self = this;
                return this._resolveLocation(this._option("location")).done(function(location) {
                        self._map.setCenter(location)
                    })
            },
            _handleZoomChange: function() {
                this._option("zoom", this._map.getZoom())
            },
            updateZoom: function() {
                this._map.setZoom(this._option("zoom"));
                return $.Deferred().resolve().promise()
            },
            updateControls: function() {
                var controls = this._option("controls");
                this._map.setOptions({
                    panControl: controls,
                    zoomControl: controls,
                    mapTypeControl: controls,
                    streetViewControl: controls
                });
                return this.render()
            },
            updateMarkers: function() {
                return this._renderMarkers()
            },
            _renderMarkers: function() {
                var self = this;
                this._clearMarkers();
                var markerPromises = $.map(this._option("markers"), function(markerOptions) {
                        return self._renderMarker(markerOptions).done(function(marker) {
                                self._markers.push(marker)
                            })
                    });
                return $.when.apply($, markerPromises)
            },
            _clearMarkers: function() {
                var self = this;
                $.each(this._markers, function(_, marker) {
                    marker.instance.setMap(null);
                    if (marker.listner)
                        google.maps.event.removeListener(marker.listner)
                });
                this._markers = []
            },
            _renderMarker: function(options) {
                var d = $.Deferred(),
                    self = this;
                this._resolveLocation(options.location).done(function(location) {
                    var marker = new google.maps.Marker({
                            position: location,
                            map: self._map
                        }),
                        listner;
                    var infoWindow;
                    if (options.tooltip) {
                        infoWindow = new google.maps.InfoWindow({content: options.tooltip});
                        infoWindow.open(self._map, marker)
                    }
                    if (options.clickAction || options.tooltip) {
                        var markerClickAction = self._createAction(options.clickAction || $.noop);
                        listner = google.maps.event.addListener(marker, "click", function() {
                            markerClickAction({location: self._normalizeLocation(location)});
                            if (infoWindow)
                                infoWindow.open(self._map, marker)
                        })
                    }
                    d.resolve({
                        instance: marker,
                        listner: listner
                    })
                });
                return d.promise()
            },
            updateRoutes: function() {
                return this._renderRoutes()
            },
            _renderRoutes: function() {
                var self = this;
                this._clearRoutes();
                var routePromises = $.map(this._option("routes"), function(routeOptions) {
                        return self._renderRoute(routeOptions).done(function(route) {
                                self._routes.push(route)
                            })
                    });
                return $.when.apply($, routePromises)
            },
            _clearRoutes: function() {
                var self = this;
                $.each(this._routes, function(_, route) {
                    route.setMap(null)
                });
                this._routes = []
            },
            _renderRoute: function(options) {
                var d = $.Deferred(),
                    self = this,
                    directionsService = new google.maps.DirectionsService;
                var points = $.map(options.locations, function(point) {
                        return self._resolveLocation(point)
                    });
                $.when.apply($, points).done(function() {
                    var locations = $.makeArray(arguments),
                        origin = locations.shift(),
                        destination = locations.pop(),
                        waypoints = $.map(locations, function(location) {
                            return {
                                    location: location,
                                    stopover: true
                                }
                        });
                    var request = {
                            origin: origin,
                            destination: destination,
                            waypoints: waypoints,
                            optimizeWaypoints: true,
                            travelMode: self._movementMode(options.mode)
                        };
                    directionsService.route(request, function(response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            var color = new DX.Color(options.color || ROUTE_COLOR_DEFAULT).toHex(),
                                directionOptions = {
                                    directions: response,
                                    map: self._map,
                                    suppressMarkers: true,
                                    preserveViewport: true,
                                    polylineOptions: {
                                        strokeWeight: options.weight || ROUTE_WEIGHT_DEFAULT,
                                        strokeOpacity: options.opacity || ROUTE_OPACITY_DEFAULT,
                                        strokeColor: color
                                    }
                                };
                            var route = new google.maps.DirectionsRenderer(directionOptions);
                            d.resolve(route)
                        }
                    })
                });
                return d.promise()
            },
            clean: function() {
                if (this._map) {
                    google.maps.event.removeListener(this._zoomChangeListener);
                    google.maps.event.removeListener(this._centerChangeListener);
                    this._clearMarkers();
                    this._clearRoutes();
                    delete this._map;
                    this._$container.empty()
                }
            },
            cancelEvents: true
        }));
        var GOOGLE_STATIC_URL = "https://maps.google.com/maps/api/staticmap?",
            GOOGLE_DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json?";
        registerProvider("googleStatic", Provider.inherit({
            _locationToString: function(location) {
                return !$.isPlainObject(location) ? location.toString().replace(/ /g, "+") : location.lat + "," + location.lng
            },
            render: function() {
                return this._updateMap()
            },
            updateDimensions: function() {
                return this._updateMap()
            },
            updateMapType: function() {
                return this._updateMap()
            },
            updateLocation: function() {
                return this._updateMap()
            },
            updateZoom: function() {
                return this._updateMap()
            },
            updateControls: function() {
                return $.Deferred().resolve().promise()
            },
            updateMarkers: function() {
                return this._updateMap()
            },
            updateRoutes: function() {
                return this._updateMap()
            },
            clean: function() {
                this._$container.css("background-image", "none")
            },
            mapRendered: function() {
                return true
            },
            _updateMap: function() {
                var deferred = $.Deferred(),
                    self = this,
                    routePromise = this._resolveRoutes();
                routePromise.done(function() {
                    var key = self._key("googleStatic");
                    var requestOptions = ["sensor=false", "size=" + self._option("width") + "x" + self._option("height"), "maptype=" + self._option("type"), "center=" + self._locationToString(self._option("location")), "zoom=" + self._option("zoom"), self._markersSubstring()];
                    requestOptions.push.apply(requestOptions, self._routeSubstrings.apply(self, arguments));
                    if (key)
                        requestOptions.push("key=" + self._key("googleStatic"));
                    var request = GOOGLE_STATIC_URL + requestOptions.join("&");
                    self._$container.css("background", "url(\"" + request + "\") no-repeat 0 0");
                    deferred.resolve()
                });
                return deferred.promise()
            },
            _markersSubstring: function() {
                var self = this,
                    markers = [];
                $.each(this._option("markers"), function(_, marker) {
                    markers.push(self._locationToString(marker.location))
                });
                return "markers=" + markers.join("|")
            },
            _resolveRoutes: function() {
                var self = this,
                    routesResponse = [];
                $.each(this._option("routes"), function(_, route) {
                    var locations = $.map(route.locations, function(location) {
                            return self._locationToString(location)
                        });
                    var requestOptions = ["sensor=false", "alternatives=false", "mode=" + (route.mode || "driving"), "origin=" + locations.shift(), "destination=" + locations.pop(), "waypoints=" + locations.join("|")];
                    var request = GOOGLE_DIRECTIONS_URL + requestOptions.join("&");
                    var response = $.Deferred();
                    $.getJSON(request).done(function(data) {
                        response.resolve(self._parseRoute(route, data))
                    });
                    routesResponse.push(response)
                });
                return $.when.apply($, routesResponse)
            },
            _parseRoute: function(routeOptions, directionsResponse) {
                var locations = [];
                var directionLegs = directionsResponse.routes[0].legs;
                locations.push(directionLegs[0].start_location);
                $.each(directionLegs, function(_, leg) {
                    $.each(leg.steps, function(_, step) {
                        locations.push(step.end_location)
                    })
                });
                return {
                        weight: routeOptions.weight,
                        color: routeOptions.color,
                        opacity: routeOptions.opacity,
                        locations: locations
                    }
            },
            _routeSubstrings: function() {
                var self = this,
                    routesString = [],
                    routes = $.makeArray(arguments);
                $.each(routes, function(_, route) {
                    var color = new DX.Color(route.color || ROUTE_COLOR_DEFAULT).toHex().replace('#', '0x'),
                        opacity = Math.round((route.opacity || ROUTE_OPACITY_DEFAULT) * 255).toString(16),
                        width = route.weight || ROUTE_WEIGHT_DEFAULT,
                        locations = [];
                    $.each(route.locations, function(_, routePoint) {
                        locations.push(self._locationToString(routePoint))
                    });
                    routesString.push("path=color:" + color + opacity + "|weight:" + width + "|" + locations.join("|"))
                });
                return routesString
            }
        }));
        var MAP_CLASS = "dx-map",
            MAP_CONTAINER_CLASS = "dx-map-container",
            MAP_SHIELD_CLASS = "dx-map-shield";
        var wrapToArray = function(entity) {
                return $.isArray(entity) ? entity : [entity]
            };
        ui.registerComponent("dxMap", ui.Widget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        location: {
                            lat: 0,
                            lng: 0
                        },
                        width: 300,
                        height: 300,
                        zoom: 1,
                        type: "roadmap",
                        provider: "google",
                        markers: [],
                        routes: [],
                        key: {
                            bing: "",
                            google: "",
                            googleStatic: ""
                        },
                        controls: false,
                        readyAction: null
                    })
            },
            _init: function() {
                this.callBase();
                this._initContainer();
                this._grabEvents();
                this._initProvider()
            },
            _initContainer: function() {
                this._$container = $("<div />").addClass(MAP_CONTAINER_CLASS);
                this._element().append(this._$container)
            },
            _grabEvents: function() {
                var eventName = events.addNamespace("dxpointerdown", this.NAME);
                this._element().on(eventName, $.proxy(this._cancelEvent, this))
            },
            _cancelEvent: function(e) {
                var cancelByProvider = this._provider.cancelEvents && !this.option("disabled");
                if (!DX.designMode && cancelByProvider)
                    e.stopPropagation()
            },
            _initProvider: function() {
                var provider = this.option("provider");
                if (winJS && this.option("provider") === "google")
                    throw new Error("Google provider cannot be used in winJS application");
                if (this._provider)
                    this._provider.clean();
                this._provider = new providers[provider](this, this._$container);
                this._mapLoader = this._provider.load()
            },
            _render: function() {
                this.callBase();
                this._element().addClass(MAP_CLASS);
                this._renderShield();
                this._execAsyncProviderAction("render")
            },
            _renderShield: function() {
                if (DX.designMode || this.option("disabled")) {
                    var $shield = $("<div/>").addClass(MAP_SHIELD_CLASS);
                    this._element().append($shield)
                }
                else {
                    var $shield = this._element().find("." + MAP_SHIELD_CLASS);
                    $shield.remove()
                }
            },
            _clean: function() {
                this._provider.clean()
            },
            _optionChanged: function(name, value, prevValue) {
                if (this._cancelOptionChange)
                    return;
                switch (name) {
                    case"disabled":
                        this._renderShield();
                        this.callBase.apply(this, arguments);
                        break;
                    case"width":
                    case"height":
                        this.callBase.apply(this, arguments);
                        this._execAsyncProviderAction("updateDimensions");
                        break;
                    case"type":
                        this._execAsyncProviderAction("updateMapType");
                        break;
                    case"location":
                        this._execAsyncProviderAction("updateLocation");
                        break;
                    case"zoom":
                        this._execAsyncProviderAction("updateZoom");
                        break;
                    case"controls":
                        this._execAsyncProviderAction("updateControls");
                        break;
                    case"markers":
                        this._execAsyncProviderAction("updateMarkers");
                        break;
                    case"routes":
                        this._execAsyncProviderAction("updateRoutes");
                        break;
                    case"key":
                        throw new Error("Key option can not be modified after initialisation");
                    case"provider":
                        this._initProvider();
                        this.callBase.apply(this, arguments);
                        break;
                    case"readyAction":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _execAsyncProviderAction: function(action) {
                if (!this._provider.mapRendered() && !(action === "render"))
                    return;
                var self = this;
                return $.when(this._mapLoader).done(function() {
                        var deferred = self._provider[action]();
                        deferred.done(function() {
                            self._triggerReadyAction()
                        })
                    })
            },
            _triggerReadyAction: function() {
                this._createActionByOption("readyAction")({originalMap: this._provider.map()})
            },
            setOptionSilent: function(name, value) {
                this._cancelOptionChange = true;
                this.option(name, value);
                this._cancelOptionChange = false
            },
            addMarker: function(markerOptions) {
                var d = $.Deferred(),
                    self = this,
                    markersOption = this._options.markers,
                    markers = wrapToArray(markerOptions);
                $.each(markers, function(_, marker) {
                    markersOption.push(marker)
                });
                this._execAsyncProviderAction("updateMarkers").done(function() {
                    d.resolveWith(self)
                });
                return d.promise()
            },
            removeMarker: function(marker) {
                var d = $.Deferred(),
                    self = this,
                    markersOption = this._options.markers,
                    markers = wrapToArray(marker);
                $.each(markers, function(_, marker) {
                    var index = $.isNumeric(marker) ? marker : $.inArray(marker, markersOption);
                    if (index !== -1)
                        markersOption.splice(index, 1);
                    else
                        throw new Error("Marker '" + marker + "' you are trying to remove does not exist");
                });
                this._execAsyncProviderAction("updateMarkers").done(function() {
                    d.resolveWith(self)
                });
                return d.promise()
            },
            addRoute: function(routeOptions) {
                var d = $.Deferred(),
                    self = this,
                    routesOption = this._options.routes,
                    routes = wrapToArray(routeOptions);
                $.each(routes, function(_, route) {
                    routesOption.push(route)
                });
                this._execAsyncProviderAction("updateRoutes").done(function() {
                    d.resolveWith(self)
                });
                return d.promise()
            },
            removeRoute: function(route) {
                var d = $.Deferred(),
                    self = this,
                    routesOption = this._options.routes,
                    routes = wrapToArray(route);
                $.each(routes, function(_, route) {
                    var index = $.isNumeric(route) ? route : $.inArray(route, routesOption);
                    if (index !== -1)
                        routesOption.splice(index, 1);
                    else
                        throw new Error("Route '" + route + "' you are trying to remove does not exist");
                });
                this._execAsyncProviderAction("updateRoutes").done(function() {
                    d.resolveWith(self)
                });
                return d.promise()
            }
        }));
        ui.dxMap.__internals = {remapConstant: function(variable, newValue) {
                switch (variable) {
                    case"GOOGLE_STATIC_URL":
                        GOOGLE_STATIC_URL = newValue;
                        break;
                    case"GOOGLE_DIRECTIONS_URL":
                        GOOGLE_DIRECTIONS_URL = newValue;
                        break;
                    case"GOOGLE_URL":
                        GOOGLE_URL = newValue;
                        break;
                    case"BING_URL":
                        BING_URL = newValue;
                        break
                }
            }}
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.autocomplete.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var KEY_DOWN = 40,
            KEY_UP = 38,
            KEY_ENTER = 13,
            KEY_ESC = 27,
            KEY_RIGHT = 39,
            KEY_TAB = 9,
            AUTOCOMPLETE_CLASS = "dx-autocomplete",
            AUTOCOMPLETE_POPUP_WRAPPER_CLASS = AUTOCOMPLETE_CLASS + "-popup-wrapper",
            SELECTED_ITEM_CLASS = "dx-autocomplete-selected",
            SELECTED_ITEM_SELECTOR = "." + SELECTED_ITEM_CLASS,
            LIST_SELECTOR = ".dx-list",
            EDITBOX_INPUT_SELECTOR = ".dx-editbox-input",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            SEARCH_OPERATORS = ["startswith", "contains", "endwith", "notcontains"];
        ui.registerComponent("dxAutocomplete", ui.ContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        value: "",
                        items: [],
                        dataSource: null,
                        itemTemplate: "item",
                        itemRender: null,
                        minSearchLength: 1,
                        searchTimeout: 0,
                        placeholder: "",
                        filterOperator: "contains",
                        displayExpr: "this",
                        valueUpdateAction: null,
                        valueUpdateEvent: "change"
                    })
            },
            _listElement: function() {
                return this._popup._wrapper().find(LIST_SELECTOR)
            },
            _listItemElement: function() {
                return this._popup._wrapper().find(LIST_ITEM_SELECTOR)
            },
            _listSelectedItemElement: function() {
                return this._popup._wrapper().find(SELECTED_ITEM_SELECTOR)
            },
            _inputElement: function() {
                return this._element().find(EDITBOX_INPUT_SELECTOR)
            },
            _textboxElement: function() {
                return this._textbox._element()
            },
            _init: function() {
                this.callBase();
                this._validateFilterOperator();
                this._compileDisplayGetter();
                this._initDataSource();
                this._fillDataSourceFromItemsIfNeeded()
            },
            _fillDataSourceFromItemsIfNeeded: function() {
                if (!this.option("dataSource") && this.option("items"))
                    this._itemsToDataSource()
            },
            _validateFilterOperator: function() {
                var filterOperator = this.option("filterOperator"),
                    normalizedFilterOperator = filterOperator.toLowerCase();
                if ($.inArray(normalizedFilterOperator, SEARCH_OPERATORS) > -1)
                    return;
                throw Error(DX.utils.stringFormat("Filter operator \"{0}\" is unavailable", filterOperator));
            },
            _compileDisplayGetter: function() {
                this._displayGetter = DX.data.utils.compileGetter(this.option("displayExpr"))
            },
            _render: function() {
                this.callBase();
                this._element().addClass(AUTOCOMPLETE_CLASS);
                this._checkExceptions()
            },
            _renderContentImpl: function() {
                this._renderTextbox();
                this._renderPopup();
                this._renderValueUpdateEvent()
            },
            _renderTextbox: function() {
                this._textbox = $("<div />").dxTextBox({
                    value: this.option("value"),
                    placeholder: this.option("placeholder"),
                    disabled: this.option("disabled"),
                    keyDownAction: $.proxy(this._handleTextboxKeyDown, this),
                    keyUpAction: $.proxy(this._handleTextboxKeyUp, this),
                    valueUpdateAction: $.proxy(this._updateValue, this),
                    focusOutAction: $.proxy(function() {
                        this._popup.hide()
                    }, this)
                }).appendTo(this._element()).data("dxTextBox")
            },
            _renderValueUpdateEvent: function() {
                this._changeAction = this._createActionByOption("valueUpdateAction");
                this._textboxOptionChange("valueUpdateEvent", this._getValueUpdateEvent())
            },
            _getValueUpdateEvent: function() {
                var result = this.option("valueUpdateEvent");
                if (!this._hasUpdateEvent("keyup"))
                    result += " keyup";
                if (!this._hasUpdateEvent("change"))
                    result += " change";
                return result
            },
            _hasUpdateEvent: function(eventName) {
                return eventName && this.option("valueUpdateEvent").indexOf(eventName) !== -1
            },
            _handleTextboxKeyDown: function(e) {
                var $list = this._listElement(),
                    preventedKeys = [KEY_TAB, KEY_UP, KEY_DOWN],
                    key = e.jQueryEvent.which;
                if ($list.is(":hidden"))
                    return;
                if ($.inArray(key, preventedKeys) > -1)
                    e.jQueryEvent.preventDefault()
            },
            _updateValue: function(e) {
                var inputElement = this._inputElement();
                this.option("value", this._textbox.option("value"));
                inputElement.prop("selectionStart", this._caretPosition);
                inputElement.prop("selectionEnd", this._caretPosition);
                var hasUpdateEvent = e.jQueryEvent && this._hasUpdateEvent(e.jQueryEvent.type);
                if (!e.jQueryEvent || hasUpdateEvent)
                    this._changeAction(this.option("value"))
            },
            _handleTextboxKeyUp: function(e) {
                var key = e.jQueryEvent.which;
                this._caretPosition = this._inputElement().prop("selectionStart");
                switch (key) {
                    case KEY_DOWN:
                        this._handleTextboxDownKey();
                        break;
                    case KEY_UP:
                        this._handleTextboxUpKey();
                        break;
                    case KEY_ENTER:
                        this._handleTextboxEnterKey();
                        break;
                    case KEY_RIGHT:
                    case KEY_TAB:
                        this._handleTextboxCompleteKeys();
                        break;
                    case KEY_ESC:
                        this._handleTextboxEscKey();
                        break;
                    default:
                        return
                }
            },
            _handleTextboxDownKey: function() {
                var $selectedItem = this._listSelectedItemElement(),
                    $nextItem;
                if ($selectedItem.length) {
                    $nextItem = $selectedItem.next();
                    $nextItem.addClass(SELECTED_ITEM_CLASS);
                    $selectedItem.removeClass(SELECTED_ITEM_CLASS)
                }
                else
                    this._listItemElement().first().addClass(SELECTED_ITEM_CLASS)
            },
            _handleTextboxUpKey: function() {
                var $selectedItem = this._listSelectedItemElement(),
                    $prevItem,
                    $list = this._listElement();
                if ($list.is(":hidden"))
                    return;
                if (!$selectedItem.length) {
                    this._listItemElement().last().addClass(SELECTED_ITEM_CLASS);
                    return
                }
                $selectedItem.removeClass(SELECTED_ITEM_CLASS);
                $prevItem = $selectedItem.prev();
                if ($prevItem.length)
                    $prevItem.addClass(SELECTED_ITEM_CLASS)
            },
            _handleTextboxEnterKey: function() {
                var $selectedItem = this._listSelectedItemElement(),
                    receivedValue;
                if (!$selectedItem.length) {
                    this._popup.hide();
                    return
                }
                receivedValue = this._selectedItemDataGetter();
                this._caretPosition = receivedValue.length;
                this.option("value", receivedValue);
                this._popup.hide();
                this._inputElement().blur()
            },
            _handleTextboxCompleteKeys: function() {
                var $list = this._listElement(),
                    newValue,
                    receivedValue;
                if ($list.is(":hidden"))
                    return;
                receivedValue = this._selectedItemDataGetter();
                newValue = receivedValue.length ? receivedValue : this._dataSource.items()[0];
                this._caretPosition = newValue.length;
                newValue = this._displayGetter(newValue);
                this.option("value", newValue);
                this._popup.hide()
            },
            _selectedItemDataGetter: function() {
                var $selectedItem = this._listSelectedItemElement();
                if (!$selectedItem.length)
                    return [];
                return this._displayGetter($selectedItem.data(LIST_ITEM_DATA_KEY))
            },
            _handleTextboxEscKey: function() {
                this._popup.hide()
            },
            _renderPopup: function() {
                var $textbox = this._textboxElement(),
                    textWidth = $textbox.width(),
                    $input = this._textbox._input(),
                    vOffset = 0;
                if (DX.devices.current().win8)
                    vOffset = -2;
                else if (DX.devices.current().platform === "desktop" || DX.devices.current().tizen)
                    vOffset = -1;
                this._popup = $("<div/>").appendTo(this._element()).dxPopup({
                    shading: false,
                    closeOnOutsideClick: true,
                    closeOnTargetScroll: true,
                    showTitle: false,
                    width: textWidth,
                    shownAction: $.proxy(this._handlePopupShown, this),
                    showingAction: $.proxy(this._handlePopupShowing, this),
                    height: "auto",
                    deferRendering: false,
                    position: {
                        my: "left top",
                        at: "left bottom",
                        of: $input,
                        offset: {
                            h: 0,
                            v: vOffset
                        },
                        collision: "flip"
                    },
                    animation: {
                        show: {
                            type: "fade",
                            duration: 400,
                            from: 0,
                            to: 1
                        },
                        hide: {
                            type: "fade",
                            duration: 400,
                            from: 1,
                            to: 0
                        }
                    }
                }).data("dxPopup");
                this._popup._wrapper().addClass(AUTOCOMPLETE_POPUP_WRAPPER_CLASS);
                this._renderList();
                this._autocompleteResizeCallback = $.proxy(this._calculatePopupWidth, this);
                utils.windowResizeCallbacks.add(this._autocompleteResizeCallback)
            },
            _handlePopupShown: function() {
                var maxHeight = $(window).height() * 0.5;
                if (this._popup.content().height() > maxHeight)
                    this._popup.option("height", maxHeight)
            },
            _handlePopupShowing: function() {
                this._calculatePopupWidth()
            },
            _calculatePopupWidth: function() {
                var $textbox = this._textboxElement(),
                    textWidth = $textbox.width();
                this._popup.option("width", textWidth)
            },
            _renderList: function() {
                this._list = $("<div />").appendTo(this._popup.content()).dxList({
                    itemClickAction: $.proxy(this._handleListItemClick, this),
                    itemTemplate: this.option("itemTemplate"),
                    itemRender: this.option("itemRender"),
                    noDataText: "",
                    showNextButton: false,
                    autoPagingEnabled: false,
                    dataSource: this._dataSource
                }).data("dxList");
                this._list._templates = this._templates
            },
            _handleListItemClick: function(e) {
                var value = this._displayGetter(e.itemData);
                this._caretPosition = value.length;
                this.option("value", value);
                this._popup.hide();
                this._inputElement().blur()
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"));
                return this._dataSource
            },
            _filterDataSource: function() {
                var searchValue = this._textbox.option("value");
                this._reloadDataSource(searchValue);
                this._clearSearchTimer()
            },
            _reloadDataSource: function(searchValue, searchMethod) {
                var self = this,
                    ds = self._dataSource;
                ds.searchExpr(self.option("displayExpr"));
                ds.searchOperation(searchMethod || self.option("filterOperator"));
                ds.searchValue(searchValue);
                self._dataSource.pageIndex(0);
                self._dataSource.load().done(function() {
                    self._refreshVisibility()
                })
            },
            _refreshVisibility: function() {
                var canFilter = this._textbox.option("value").length >= this.option("minSearchLength"),
                    dataSource = this._dataSource,
                    items = dataSource && dataSource.items(),
                    hasResults = items.length;
                if (canFilter && hasResults)
                    if (items.length === 1 && this._displayGetter(items[0]) === this.option("value"))
                        this._popup.hide();
                    else if (this._displayGetter(items[0]).length < this.option("value").length)
                        this._popup.hide();
                    else {
                        this._popup._refresh();
                        this._popup.show()
                    }
                else
                    this._popup.hide()
            },
            _dispose: function() {
                this._clearSearchTimer();
                utils.windowResizeCallbacks.remove(this._autocompleteResizeCallback);
                this.callBase()
            },
            _textboxOptionChange: function(name, value) {
                this._textbox.option(name, value)
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"disabled":
                        this._textboxOptionChange(name, value);
                        break;
                    case"value":
                        this._checkExceptions();
                        this._textboxOptionChange(name, value);
                        this._applyFilter();
                        break;
                    case"placeholder":
                        this._textboxOptionChange(name, value);
                        break;
                    case"items":
                    case"dataSource":
                        if (name === "items")
                            this._itemsToDataSource();
                        else
                            this._initDataSource();
                    case"itemTemplate":
                    case"itemRender":
                        this._list.option(name, value);
                        break;
                    case"filterOperator":
                        this._validateFilterOperator();
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        break;
                    case"minSearchLength":
                    case"searchTimeout":
                        break;
                    case"valueUpdateEvent":
                    case"valueUpdateAction":
                        this._renderValueUpdateEvent();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _applyFilter: function() {
                var searchValue = this._textbox.option("value"),
                    canFilter = searchValue.length >= this.option("minSearchLength");
                if (!canFilter) {
                    this._clearSearchTimer();
                    this._popup.hide();
                    return
                }
                if (this.option("searchTimeout") > 0) {
                    if (!this._searchTimer)
                        this._searchTimer = setTimeout($.proxy(this._filterDataSource, this), this.option("searchTimeout"))
                }
                else
                    this._filterDataSource()
            },
            _clearSearchTimer: function() {
                clearTimeout(this._searchTimer);
                delete this._searchTimer
            },
            _checkExceptions: function() {
                if (this.option("value") === undefined)
                    throw Error("Value option should not be undefined");
            },
            _clean: function() {
                this.callBase();
                this._element().empty()
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.dropDownMenu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var DROP_DOWN_MENU_CLASS = "dx-dropdownmenu",
            DROP_DOWN_MENU_POPUP_WRAPPER_CLASS = DROP_DOWN_MENU_CLASS + "-popup-wrapper",
            DROP_DOWN_MENU_LIST_CLASS = "dx-dropdownmenu-list",
            DROP_DOWN_MENU_BUTTON_CLASS = "dx-dropdownmenu-button",
            RESERVE_TERGET_CONTAINER = "body";
        ui.registerComponent("dxDropDownMenu", ui.ContainerWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        items: [],
                        itemClickAction: null,
                        dataSource: null,
                        itemTemplate: "item",
                        itemRender: null,
                        buttonText: "",
                        buttonIcon: null,
                        buttonIconSrc: null,
                        buttonClickAction: null,
                        usePopover: false
                    })
            },
            _init: function() {
                this.callBase();
                this._initDataSource()
            },
            _render: function() {
                this._element().addClass(DROP_DOWN_MENU_CLASS);
                this._renderButton();
                this.callBase()
            },
            _clean: function() {
                this.callBase();
                this._popup._element().remove()
            },
            _renderContentImpl: function() {
                this._renderPopup()
            },
            _renderButton: function() {
                var buttonIconSrc = this.option("buttonIconSrc"),
                    buttonIcon = this.option("buttonIcon");
                if (!buttonIconSrc && !buttonIcon)
                    buttonIcon = "overflow";
                this._button = this._element().addClass(DROP_DOWN_MENU_BUTTON_CLASS).dxButton({
                    text: this.option("buttonText"),
                    icon: buttonIcon,
                    iconSrc: buttonIconSrc,
                    clickAction: this.option("buttonClickAction")
                }).dxButton("instance")
            },
            _renderClick: function() {
                this.callBase();
                var action = this._createAction(this._handleButtonClick);
                this._element().on(events.addNamespace("dxclick", this.NAME), function(e) {
                    action({jQueryEvent: e})
                });
                if (this._popup)
                    this._popup.option("clickAction", this.option("clickAction"))
            },
            _handleButtonClick: function(e) {
                e.component._popup.toggle()
            },
            _renderList: function(instance) {
                var $content = instance.content();
                this._list = $content.addClass(DROP_DOWN_MENU_LIST_CLASS).dxList({
                    autoPagingEnabled: false,
                    noDataText: "",
                    itemRender: this.option("itemRender"),
                    itemTemplate: this.option("itemTemplate"),
                    itemClickAction: this.option("itemClickAction")
                }).data("dxList");
                this._list._templates = this._templates;
                this._setListDataSource();
                this._attachListClick();
                var listMaxHeight = $(window).height() * 0.5;
                if ($content.height() > listMaxHeight)
                    $content.height(listMaxHeight)
            },
            _toggleVisibility: function(visible) {
                this.callBase(visible);
                this._button.option("visible", visible)
            },
            _attachListClick: function() {
                var action = this._createAction(this._handleListClick);
                this._list._element().off("." + this.NAME).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    action({jQueryEvent: e})
                })
            },
            _handleListClick: function(e) {
                e.component._popup.hide()
            },
            _renderPopup: function() {
                var $popup = this._$popup = $("<div />").appendTo(this._element());
                var popupOptions = {
                        clickAction: this.option("clickAction"),
                        contentReadyAction: $.proxy(this._popupContentReadyHandler, this),
                        deferRendering: false,
                        reserveTargetContainer: RESERVE_TERGET_CONTAINER
                    };
                this._popup = this.option("usePopover") ? this._createPopover($popup, popupOptions) : this._createPopup($popup, popupOptions);
                this._popup._wrapper().addClass(DROP_DOWN_MENU_POPUP_WRAPPER_CLASS)
            },
            _popupContentReadyHandler: function() {
                var popup = this._$popup[this.option("usePopover") ? "dxPopover" : "dxPopup"]("instance");
                this._renderList(popup)
            },
            _createPopover: function($element, popupOptions) {
                return $element.dxPopover($.extend(popupOptions, {target: this._element()})).dxPopover("instance")
            },
            _createPopup: function($element, popupOptions) {
                return $element.dxPopup($.extend(popupOptions, {
                        showTitle: false,
                        width: "auto",
                        height: "auto",
                        shading: false,
                        closeOnOutsideClick: $.proxy(function(e) {
                            return !$(e.target).closest(this._button._element()).length
                        }, this),
                        closeOnTargetScroll: true,
                        position: {
                            my: "right top",
                            at: "right bottom",
                            of: this._element(),
                            collision: "fit flip"
                        },
                        animation: {
                            show: {
                                type: "fade",
                                to: 1
                            },
                            hide: {
                                type: "fade",
                                to: 0
                            }
                        }
                    })).dxPopup("instance")
            },
            _setListDataSource: function() {
                if (this._list)
                    this._list.option("dataSource", this._dataSource || this.option("items"))
            },
            _optionChanged: function(name, value) {
                if (/^button/.test(name)) {
                    this._renderButton();
                    return
                }
                switch (name) {
                    case"items":
                    case"dataSource":
                        this._refreshDataSource();
                        this._setListDataSource();
                        break;
                    case"itemRender":
                    case"itemTemplate":
                        if (this._list)
                            this._list.option(name, value);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.selectBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            WIDGET_CLASS = "dx-selectbox",
            POPUP_CLASS = "dx-selectbox-popup",
            SELECTBOX_ARROW_CONTAINER_CLASS = "dx-selectbox-arrow-container",
            SELECTBOX_ARROW_CLASS = "dx-selectbox-arrow";
        ui.registerComponent("dxSelectBox", ui.dxAutocomplete.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        items: [],
                        value: undefined,
                        valueChangeAction: null,
                        placeholder: Globalize.localize("Select"),
                        valueExpr: null
                    })
            },
            _init: function() {
                this.callBase();
                if (!this._dataSource)
                    this._itemsToDataSource()
            },
            _itemsToDataSource: function() {
                this._dataSource = new DevExpress.data.DataSource(this.option("items"))
            },
            _render: function() {
                this._compileValueGetter();
                this.callBase();
                this._setWidgetClasses();
                this._renderArrowDown()
            },
            _renderValueUpdateEvent: function() {
                this._changeAction = this._createActionByOption("valueChangeAction")
            },
            _setWidgetClasses: function() {
                var $selectbox = this._element(),
                    $popup = this._popup._element();
                $selectbox.addClass(WIDGET_CLASS);
                $popup.addClass(POPUP_CLASS)
            },
            _renderArrowDown: function() {
                var clickActionHandler = this._createAction(function(e) {
                        e.component._popup.toggle()
                    });
                $("<div />").addClass(SELECTBOX_ARROW_CONTAINER_CLASS).appendTo(this._element()).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    clickActionHandler({jQueryEvent: e})
                });
                $("<div />").addClass(SELECTBOX_ARROW_CLASS).appendTo(this._element().find("." + SELECTBOX_ARROW_CONTAINER_CLASS))
            },
            _applyFilter: $.noop,
            _updateValue: $.noop,
            _renderTextbox: function() {
                this.callBase();
                this._searchValue(this.option("value")).done($.proxy(this._updateTextBox, this))
            },
            _updateTextBox: function(result) {
                this._selectedItem = result;
                this._textbox.option({
                    readOnly: true,
                    value: this._displayGetter(this._selectedItem),
                    clickAction: $.proxy(function() {
                        this._popup.toggle()
                    }, this)
                })
            },
            _compileValueGetter: function() {
                this._valueGetter = DX.data.utils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || this._dataSource && this._dataSource._store._key || "this"
            },
            _handleListItemClick: function(e) {
                this.option("value", this._valueGetter(e.itemData));
                this._popup.hide()
            },
            _searchValue: function(value) {
                var self = this,
                    store = this._dataSource.store(),
                    valueExpr = this._valueGetterExpr();
                var deffered = $.Deferred();
                if (valueExpr === store.key() || store instanceof DX.data.CustomStore)
                    store.byKey(value).done(function(result) {
                        deffered.resolveWith(self, [result])
                    });
                else
                    store.load({filter: [valueExpr, value]}).done(function(result) {
                        deffered.resolveWith(self, result)
                    });
                return deffered.promise()
            },
            _changeValueExpr: function() {
                this._compileValueGetter();
                this.option("value", this._valueGetter(this._selectedItem))
            },
            _changeValue: function(value) {
                this._searchValue(value).done($.proxy(this._handleSearchComplete, this))
            },
            _handleSearchComplete: function(result) {
                this._selectedItem = result;
                this._textboxOptionChange("value", this._displayGetter(result));
                this._changeAction(this.option("value"))
            },
            _optionChanged: function(name, value) {
                switch (name) {
                    case"valueExpr":
                        this._changeValueExpr();
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        this._refresh();
                        break;
                    case"value":
                        this._changeValue(value);
                        break;
                    case"valueChangeAction":
                        this._renderValueUpdateEvent();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.panorama.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator,
            utils = DX.utils;
        var PANORAMA_CLASS = "dx-panorama",
            PANORAMA_TITLE_CLASS = "dx-panorama-title",
            PANORAMA_GHOST_TITLE_CLASS = "dx-panorama-ghosttitle",
            PANORAMA_ITEMS_CONTAINER_CLASS = "dx-panorama-itemscontainer",
            PANORAMA_ITEM_CLASS = "dx-panorama-item",
            PANORAMA_GHOST_ITEM_CLASS = "dx-panorama-ghostitem",
            PANORAMA_ITEM_HEADER_CLASS = "dx-panorama-item-header",
            PANORAMA_ITEM_DATA_KEY = "dxPanoramaItemData",
            PANORAMA_ITEM_MARGIN_SCALE = .02,
            PANORAMA_TITLE_MARGIN_SCALE = .02,
            PANORAMA_BACKGROUND_MOVE_DURATION = 300,
            PANORAMA_BACKGROUND_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)",
            PANORAMA_TITLE_MOVE_DURATION = 300,
            PANORAMA_TITLE_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)",
            PANORAMA_ITEM_MOVE_DURATION = 300,
            PANORAMA_ITEM_MOVE_EASING = "cubic-bezier(.40, .80, .60, 1)";
        var moveBackground = function($element, position) {
                $element.css("background-position", position + "px 0%")
            };
        var position = function($element) {
                return translator.locate($element).left
            };
        var move = function($element, position) {
                translator.move($element, {left: position})
            };
        var animation = {
                backgroundMove: function($element, position, completeAction) {
                    return fx.animate($element, {
                            to: {"background-position": position + "px 0%"},
                            duration: PANORAMA_BACKGROUND_MOVE_DURATION,
                            easing: PANORAMA_BACKGROUND_MOVE_EASING,
                            complete: completeAction
                        })
                },
                titleMove: function($title, position, completeAction) {
                    return fx.animate($title, {
                            type: "slide",
                            to: {left: position},
                            duration: PANORAMA_TITLE_MOVE_DURATION,
                            easing: PANORAMA_TITLE_MOVE_EASING,
                            complete: completeAction
                        })
                },
                itemMove: function($item, position, completeAction) {
                    return fx.animate($item, {
                            type: "slide",
                            to: {left: position},
                            duration: PANORAMA_ITEM_MOVE_DURATION,
                            easing: PANORAMA_ITEM_MOVE_EASING,
                            complete: completeAction
                        })
                }
            };
        var endAnimation = function(elements) {
                if (!elements)
                    return;
                $.each(elements, function(_, element) {
                    fx.stop(element, true)
                })
            };
        var PanoramaItemsRenderStrategy = DX.Class.inherit({
                ctor: function(panorama) {
                    this._panorama = panorama
                },
                init: $.noop,
                render: $.noop,
                allItemElements: function() {
                    return this._panorama._itemElements()
                },
                updatePositions: DX.abstract,
                animateRollback: DX.abstract,
                detectBoundsTransition: DX.abstract,
                animateComplete: DX.abstract,
                _itemMargin: function() {
                    return this._panorama._$itemsContainer.width() * PANORAMA_ITEM_MARGIN_SCALE
                },
                _indexBoundary: function() {
                    return this._panorama._indexBoundary()
                },
                _normalizeIndex: function(index) {
                    return this._panorama._normalizeIndex(index)
                }
            });
        var PanoramaOneAndLessItemsRenderStrategy = PanoramaItemsRenderStrategy.inherit({
                updatePositions: function() {
                    var $items = this._panorama._itemElements(),
                        itemMargin = this._itemMargin();
                    $items.each(function() {
                        move($(this), itemMargin)
                    })
                },
                animateRollback: $.noop,
                detectBoundsTransition: $.noop,
                animateComplete: $.noop
            });
        var PanoramaTwoItemsRenderStrategy = PanoramaItemsRenderStrategy.inherit({
                init: function() {
                    this._initGhostItem()
                },
                render: function() {
                    this._renderGhostItem()
                },
                _initGhostItem: function() {
                    this._$ghostItem = $("<div>").addClass(PANORAMA_GHOST_ITEM_CLASS)
                },
                _renderGhostItem: function() {
                    this._panorama._itemContainer().append(this._$ghostItem);
                    this._toggleGhostItem(false)
                },
                _toggleGhostItem: function(visible) {
                    var $ghostItem = this._$ghostItem;
                    if (visible)
                        $ghostItem.css("opacity", 1);
                    else
                        $ghostItem.css("opacity", 0)
                },
                _updateGhostItemContent: function(index) {
                    if (index !== false && index !== this._prevGhostIndex) {
                        this._$ghostItem.html(this._panorama._itemElements().eq(index).html());
                        this._prevGhostIndex = index
                    }
                },
                _isGhostItemVisible: function() {
                    return this._$ghostItem.css("opacity") == 1
                },
                _swapGhostWithItem: function($item) {
                    var $ghostItem = this._$ghostItem,
                        lastItemPosition = position($item);
                    move($item, position($ghostItem));
                    move($ghostItem, lastItemPosition)
                },
                allItemElements: function() {
                    return this._panorama._itemContainer().find("." + PANORAMA_ITEM_CLASS + ", ." + PANORAMA_GHOST_ITEM_CLASS)
                },
                updatePositions: function(offset) {
                    var $items = this.allItemElements(),
                        selectedIndex = this._panorama.option("selectedIndex"),
                        isGhostReplaceLast = offset > 0 && selectedIndex === 0 || offset < 0 && selectedIndex === 1,
                        isGhostReplaceFirst = offset < 0 && selectedIndex === 0 || offset > 0 && selectedIndex === 1,
                        ghostPosition = isGhostReplaceLast && "replaceLast" || isGhostReplaceFirst && "replaceFirst",
                        ghostContentIndex = isGhostReplaceLast && 1 || isGhostReplaceFirst && 0,
                        positions = this._calculateItemPositions(selectedIndex, ghostPosition);
                    this._updateGhostItemContent(ghostContentIndex);
                    this._toggleGhostItem(isGhostReplaceLast || isGhostReplaceFirst);
                    $items.each(function(index) {
                        move($(this), positions[index] + offset)
                    })
                },
                animateRollback: function(currentIndex) {
                    var self = this,
                        $items = this._panorama._itemElements(),
                        itemMargin = this._itemMargin(),
                        offset = position($items.eq(currentIndex)) - itemMargin,
                        ghostOffset = position(this._$ghostItem) - itemMargin,
                        positions = this._calculateItemPositions(currentIndex, ghostOffset > 0 ? "prepend" : "append"),
                        isLastReplasedByGhost = currentIndex === 0 && offset > 0 && ghostOffset > 0 || currentIndex === 1 && ghostOffset < 0;
                    if (isLastReplasedByGhost)
                        this._swapGhostWithItem($items.eq(1));
                    else
                        this._swapGhostWithItem($items.eq(0));
                    $items.each(function(index) {
                        animation.itemMove($(this), positions[index])
                    });
                    animation.itemMove(this._$ghostItem, positions[2], function() {
                        self._toggleGhostItem(false)
                    })
                },
                detectBoundsTransition: function(newIndex, currentIndex) {
                    var ghostLocation = position(this._$ghostItem),
                        itemMargin = this._itemMargin();
                    if (newIndex === 0 && ghostLocation < itemMargin)
                        return "left";
                    if (currentIndex === 0 && ghostLocation > itemMargin)
                        return "right"
                },
                animateComplete: function(boundCross, newIndex, currentIndex) {
                    var self = this,
                        ghostPosition = !boundCross ^ !(currentIndex === 0) ? "prepend" : "append",
                        $items = this._panorama._itemElements(),
                        positions = this._calculateItemPositions(newIndex, ghostPosition),
                        animations = [];
                    $items.each(function(index) {
                        animations.push(animation.itemMove($(this), positions[index]))
                    });
                    animations.push(animation.itemMove(this._$ghostItem, positions[2], function() {
                        self._toggleGhostItem(false)
                    }));
                    return $.when.apply($, animations)
                },
                _calculateItemPositions: function(atIndex, ghostPosition) {
                    var positions = [],
                        $items = this._panorama._itemElements(),
                        itemMargin = this._itemMargin(),
                        itemWidth = $items.eq(0).outerWidth(),
                        itemPositionOffset = itemWidth + itemMargin,
                        normalFlow = atIndex === 0,
                        nextNegativePosition = -itemWidth,
                        nextPositivePosition = itemMargin;
                    positions.push(nextPositivePosition);
                    nextPositivePosition += itemPositionOffset;
                    if (normalFlow)
                        positions.push(nextPositivePosition);
                    else
                        positions.splice(0, 0, nextPositivePosition);
                    nextPositivePosition += itemPositionOffset;
                    switch (ghostPosition) {
                        case"replaceFirst":
                            positions.push(positions[0]);
                            if (normalFlow)
                                positions[0] = nextPositivePosition;
                            else
                                positions[0] = nextNegativePosition;
                            break;
                        case"replaceLast":
                            if (normalFlow)
                                positions.splice(1, 0, nextNegativePosition);
                            else
                                positions.splice(1, 0, nextPositivePosition);
                            break;
                        case"prepend":
                            positions.push(nextNegativePosition);
                            break;
                        case"append":
                            positions.push(nextPositivePosition);
                            break
                    }
                    return positions
                }
            });
        var PanoramaThreeAndMoreItemsRenderStrategy = PanoramaItemsRenderStrategy.inherit({
                updatePositions: function(offset) {
                    var $items = this._panorama._itemElements(),
                        positions = this._calculateItemPositions(this._panorama.option("selectedIndex"), offset < 0);
                    $items.each(function(index) {
                        move($(this), positions[index] + offset)
                    })
                },
                animateRollback: function() {
                    var $items = this._panorama._itemElements(),
                        selectedIndex = this._panorama.option("selectedIndex"),
                        positions = this._calculateItemPositions(selectedIndex),
                        animatingItems = [selectedIndex, this._normalizeIndex(selectedIndex + 1)];
                    if (position($items.eq(selectedIndex)) > this._itemMargin())
                        animatingItems.push(this._normalizeIndex(selectedIndex - 1));
                    $items.each(function(index) {
                        var $item = $(this);
                        if ($.inArray(index, animatingItems) !== -1)
                            animation.itemMove($item, positions[index]);
                        else
                            move($item, positions[index])
                    })
                },
                detectBoundsTransition: function(newIndex, currentIndex) {
                    var lastIndex = this._indexBoundary() - 1;
                    if (currentIndex === lastIndex && newIndex === 0)
                        return "left";
                    if (currentIndex === 0 && newIndex === lastIndex)
                        return "right"
                },
                animateComplete: function(boundCross, newIndex, currentIndex) {
                    var animations = [],
                        $items = this._panorama._itemElements(),
                        positions = this._calculateItemPositions(newIndex);
                    var transitionToRight = this._normalizeIndex(currentIndex - 1) === newIndex,
                        cyclingItemIndex = $items.length === 3 && transitionToRight ? this._normalizeIndex(currentIndex + 1) : null,
                        cyclingItemPosition = positions[this._indexBoundary()];
                    var animatingItems = [newIndex, currentIndex],
                        rightAnimatedItemIndex = transitionToRight ? currentIndex : newIndex;
                    animatingItems.push(this._normalizeIndex(rightAnimatedItemIndex + 1));
                    $items.each(function(index) {
                        var $item = $(this);
                        if ($.inArray(index, animatingItems) === -1) {
                            move($item, positions[index]);
                            return
                        }
                        animations.push(index !== cyclingItemIndex ? animation.itemMove($item, positions[index]) : animation.itemMove($item, cyclingItemPosition, function() {
                            move($item, positions[index])
                        }))
                    });
                    return $.when.apply($, animations)
                },
                _calculateItemPositions: function(atIndex, preferRight) {
                    var previousIndex = this._normalizeIndex(atIndex - 1),
                        $items = this._panorama._itemElements(),
                        itemMargin = this._itemMargin(),
                        itemWidth = $items.eq(0).outerWidth(),
                        itemPositionOffset = itemWidth + itemMargin,
                        positions = [],
                        nextNegativePosition = -itemWidth,
                        nextPositivePosition = itemMargin;
                    for (var i = atIndex; i !== previousIndex; i = this._normalizeIndex(i + 1)) {
                        positions[i] = nextPositivePosition;
                        nextPositivePosition += itemPositionOffset
                    }
                    if (preferRight) {
                        positions[previousIndex] = nextPositivePosition;
                        nextPositivePosition += itemPositionOffset
                    }
                    else
                        positions[previousIndex] = nextNegativePosition;
                    positions.push(nextPositivePosition);
                    return positions
                }
            });
        ui.registerComponent("dxPanorama", ui.SelectableCollectionWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        selectedIndex: 0,
                        title: "panorama",
                        backgroundImage: {
                            url: null,
                            width: 0,
                            height: 0
                        }
                    })
            },
            _itemClass: function() {
                return PANORAMA_ITEM_CLASS
            },
            _itemDataKey: function() {
                return PANORAMA_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$itemsContainer
            },
            _init: function() {
                this.callBase();
                this._initItemsRenderStrategy();
                this._initBackgroundImage();
                this._initTitle();
                this._initItemsContainer();
                utils.windowResizeCallbacks.add(this._windowResizeCallBack = $.proxy(this._handleWindowResize, this));
                this._initSwipeHandlers()
            },
            _dispose: function() {
                this.callBase.apply(this, arguments);
                utils.windowResizeCallbacks.remove(this._windowResizeCallBack)
            },
            _initItemsRenderStrategy: function() {
                var itemsRenderStrategy;
                switch (this.option("items").length) {
                    case 0:
                    case 1:
                        itemsRenderStrategy = PanoramaOneAndLessItemsRenderStrategy;
                        break;
                    case 2:
                        itemsRenderStrategy = PanoramaTwoItemsRenderStrategy;
                        break;
                    default:
                        itemsRenderStrategy = PanoramaThreeAndMoreItemsRenderStrategy
                }
                this._itemsRenderStrategy = new itemsRenderStrategy(this);
                this._itemsRenderStrategy.init()
            },
            _initBackgroundImage: function() {
                var bgUrl = this.option("backgroundImage.url");
                if (bgUrl)
                    this._element().css("background-image", "url(" + bgUrl + ")")
            },
            _initTitle: function() {
                this._$title = $("<div>").addClass(PANORAMA_TITLE_CLASS);
                this._$ghostTitle = $("<div>").addClass(PANORAMA_GHOST_TITLE_CLASS);
                this._element().append(this._$title);
                this._element().append(this._$ghostTitle);
                this._updateTitle()
            },
            _updateTitle: function() {
                var title = this.option("title");
                this._$title.text(title);
                this._$ghostTitle.text(title);
                this._toggleGhostTitle(false)
            },
            _toggleGhostTitle: function(visible) {
                var $ghostTitle = this._$ghostTitle;
                if (visible)
                    $ghostTitle.css("opacity", 1);
                else
                    $ghostTitle.css("opacity", 0)
            },
            _initItemsContainer: function() {
                this._$itemsContainer = $("<div>").addClass(PANORAMA_ITEMS_CONTAINER_CLASS);
                this._element().append(this._$itemsContainer)
            },
            _handleWindowResize: function() {
                this._updatePositions()
            },
            _render: function() {
                this._element().addClass(PANORAMA_CLASS);
                this.callBase();
                this._itemsRenderStrategy.render()
            },
            _updatePositions: function(offset) {
                offset = offset || 0;
                this._updateBackgroundPosition(offset * this._calculateBackgroundStep());
                this._updateTitlePosition(offset * this._calculateTitleStep());
                this._itemsRenderStrategy.updatePositions(offset * this._$itemsContainer.width())
            },
            _updateBackgroundPosition: function(offset) {
                moveBackground(this._element(), this._calculateBackgroundPosition(this.option("selectedIndex")) + offset)
            },
            _updateTitlePosition: function(offset) {
                move(this._$title, this._calculateTitlePosition(this.option("selectedIndex")) + offset)
            },
            _animateRollback: function(currentIndex) {
                this._animateBackgroundMove(currentIndex);
                this._animateTitleMove(currentIndex);
                this._itemsRenderStrategy.animateRollback(currentIndex)
            },
            _animateBackgroundMove: function(toIndex) {
                return animation.backgroundMove(this._element(), this._calculateBackgroundPosition(toIndex))
            },
            _animateTitleMove: function(toIndex) {
                return animation.titleMove(this._$title, this._calculateTitlePosition(toIndex))
            },
            _animateComplete: function(newIndex, currentIndex) {
                var self = this,
                    boundCross = this._itemsRenderStrategy.detectBoundsTransition(newIndex, currentIndex);
                var backgroundAnimation = this._performBackgroundAnimation(boundCross, newIndex);
                var titleAnimation = this._performTitleAnimation(boundCross, newIndex);
                var itemsAnimation = this._itemsRenderStrategy.animateComplete(boundCross, newIndex, currentIndex);
                $.when(backgroundAnimation, titleAnimation, itemsAnimation).done(function() {
                    self._indexChangeOnAnimation = true;
                    self.option("selectedIndex", newIndex);
                    self._indexChangeOnAnimation = false
                })
            },
            _performBackgroundAnimation: function(boundCross, newIndex) {
                if (boundCross)
                    return this._animateBackgroundBoundsTransition(boundCross, newIndex);
                return this._animateBackgroundMove(newIndex)
            },
            _animateBackgroundBoundsTransition: function(bound, newIndex) {
                var self = this,
                    isLeft = bound === "left",
                    afterAnimationPosition = this._calculateBackgroundPosition(newIndex),
                    animationEndPositionShift = isLeft ? -this._calculateBackgroundScaledWidth() : this._calculateBackgroundScaledWidth(),
                    animationEndPosition = afterAnimationPosition + animationEndPositionShift;
                return animation.backgroundMove(this._element(), animationEndPosition, function() {
                        moveBackground(self._element(), afterAnimationPosition)
                    })
            },
            _performTitleAnimation: function(boundCross, newIndex) {
                if (boundCross)
                    return this._animateTitleBoundsTransition(boundCross, newIndex);
                return this._animateTitleMove(newIndex)
            },
            _animateTitleBoundsTransition: function(bound, newIndex) {
                var self = this,
                    $ghostTitle = this._$ghostTitle,
                    ghostWidth = $ghostTitle.outerWidth(),
                    panoramaWidth = this._element().width(),
                    isLeft = bound === "left",
                    ghostTitleStartPosition = isLeft ? panoramaWidth : -ghostWidth,
                    ghostTitleEndPosition = isLeft ? -(panoramaWidth + ghostWidth) : panoramaWidth;
                move($ghostTitle, ghostTitleStartPosition);
                this._toggleGhostTitle(true);
                this._swapGhostWithTitle();
                var ghostAnimation = animation.titleMove($ghostTitle, ghostTitleEndPosition, function() {
                        self._toggleGhostTitle(false)
                    });
                var titleAnimation = animation.titleMove(this._$title, this._calculateTitlePosition(newIndex));
                return $.when(ghostAnimation, titleAnimation)
            },
            _swapGhostWithTitle: function() {
                var $ghostTitle = this._$ghostTitle,
                    $title = this._$title,
                    lastTitlePosition = position($title);
                move($title, position($ghostTitle));
                move($ghostTitle, lastTitlePosition)
            },
            _calculateTitlePosition: function(atIndex) {
                var panoramaWidth = this._element().width(),
                    titleMargin = panoramaWidth * PANORAMA_TITLE_MARGIN_SCALE;
                return titleMargin - atIndex * this._calculateTitleStep()
            },
            _calculateTitleStep: function() {
                var panoramaWidth = this._element().width(),
                    titleWidth = this._$title.outerWidth(),
                    indexBoundary = this._indexBoundary() || 1;
                return Math.max((titleWidth - panoramaWidth) / indexBoundary, titleWidth / indexBoundary)
            },
            _calculateBackgroundPosition: function(atIndex) {
                return -(atIndex * this._calculateBackgroundStep())
            },
            _calculateBackgroundStep: function() {
                var itemWidth = this._itemElements().eq(0).outerWidth(),
                    backgroundScaledWidth = this._calculateBackgroundScaledWidth();
                return Math.max((backgroundScaledWidth - itemWidth) / (this._indexBoundary() || 1), 0)
            },
            _calculateBackgroundScaledWidth: function() {
                return this._element().height() * this.option("backgroundImage.width") / (this.option("backgroundImage.height") || 1)
            },
            _initSwipeHandlers: function() {
                this._element().on(events.addNamespace("dxswipestart", this.NAME), $.proxy(this._swipeStartHandler, this)).on(events.addNamespace("dxswipe", this.NAME), $.proxy(this._swipeUpdateHandler, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._swipeEndHandler, this))
            },
            _swipeStartHandler: function(e) {
                this._stopAnimations();
                if (this.option("disabled") || this._indexBoundary() <= 1)
                    e.cancel = true
            },
            _stopAnimations: function() {
                endAnimation([this._element(), this._$ghostTitle, this._$title]);
                endAnimation(this._itemsRenderStrategy.allItemElements())
            },
            _swipeUpdateHandler: function(e) {
                this._updatePositions(e.offset)
            },
            _swipeEndHandler: function(e) {
                var currentIndex = this.option("selectedIndex"),
                    targetOffset = e.targetOffset;
                if (targetOffset === 0)
                    this._animateRollback(currentIndex);
                else
                    this._animateComplete(this._normalizeIndex(currentIndex - targetOffset), currentIndex)
            },
            _renderSelectedIndex: function(current, previous) {
                if (!this._indexChangeOnAnimation)
                    this._updatePositions()
            },
            _normalizeIndex: function(index) {
                var boundary = this._indexBoundary();
                if (index < 0)
                    index = boundary + index;
                if (index >= boundary)
                    index = index - boundary;
                return index
            },
            _indexBoundary: function() {
                return this.option("items").length
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"title":
                        this._updateTitle();
                        break;
                    case"items":
                        this._initItemsRenderStrategy();
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _itemRenderDefault: function(item, index, $itemElement) {
                this.callBase(item, index, $itemElement);
                if (!item.header)
                    return;
                var $itemHeader = $("<div>").addClass(PANORAMA_ITEM_HEADER_CLASS).text(item.header);
                $itemElement.prepend($itemHeader)
            }
        }));
        ui.dxPanorama.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets, file ui.slideout.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator;
        var SLIDEOUT_CLASS = "dx-slideout",
            SLIDEOUT_ITEM_CONTAINER_CLASS = "dx-slideout-item-container",
            SLIDEOUT_MENU = "dx-slideout-menu",
            SLIDEOUT_ITEM_CLASS = "dx-slideout-item",
            SLIDEOUT_ITEM_DATA_KEY = "dxSlideoutItemData",
            CONTENT_OFFSET = 45,
            ANIMATION_DURATION = 400;
        ui.registerComponent("dxSlideOut", ui.SelectableCollectionWidget.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        menuItemRender: null,
                        menuItemTemplate: "item"
                    })
            },
            _itemClass: function() {
                return SLIDEOUT_ITEM_CLASS
            },
            _itemDataKey: function() {
                return SLIDEOUT_ITEM_DATA_KEY
            },
            _init: function() {
                this.callBase();
                this._deferredAnimate = undefined
            },
            _render: function() {
                this._renderItemsContainer();
                this._renderList();
                this._initSwipeHandlers();
                this._element().addClass(SLIDEOUT_CLASS);
                this.callBase()
            },
            _renderItemsContainer: function() {
                this._$container = $("<div />").addClass(SLIDEOUT_ITEM_CONTAINER_CLASS).appendTo(this._element())
            },
            _renderContentImpl: function(template) {
                var items = this.option("items"),
                    selectedIndex = this.option("selectedIndex");
                if (items.length && selectedIndex > -1)
                    this._renderItems([items[selectedIndex]])
            },
            _renderList: function() {
                this._$list = $("<div />").addClass(SLIDEOUT_MENU).prependTo(this._element());
                this._renderItemClickAction();
                var list = this._$list.dxList().dxList("instance");
                list.addTemplate(this._templates);
                this._$list.dxList({
                    height: "100%",
                    itemClickAction: $.proxy(this._handleListItemClick, this),
                    items: this.option("items"),
                    dataSource: this.option("dataSource"),
                    itemRender: this.option("menuItemRender"),
                    itemTemplate: this.option("menuItemTemplate")
                })
            },
            _handleListItemClick: function(e) {
                var selectedIndex = this._$list.find(".dx-list-item").index(e.itemElement);
                this.option("selectedIndex", selectedIndex);
                this._itemClickAction(e)
            },
            _renderItemClickAction: function() {
                this._itemClickAction = this._createActionByOption("itemClickAction")
            },
            _renderItem: function(index, item, container) {
                this._$container.find("." + SLIDEOUT_ITEM_CLASS).remove();
                this.callBase(index, item, this._$container)
            },
            _renderSelectedIndex: function() {
                this._renderContent()
            },
            _initSwipeHandlers: function() {
                var eventData = {
                        elastic: false,
                        itemSizeFunc: $.proxy(this._getListWidth, this)
                    };
                this._$container.on(events.addNamespace("dxswipestart", this.NAME), $.proxy(this._handleSwipeStart, this)).on(events.addNamespace("dxswipe", this.NAME), eventData, $.proxy(this._handleSwipeUpdate, this)).on(events.addNamespace("dxswipeend", this.NAME), $.proxy(this._handleSwipeEnd, this))
            },
            _handleSwipeStart: function(e) {
                e.maxLeftOffset = this._menuShown ? 1 : 0;
                e.maxRightOffset = this._menuShown ? 0 : 1
            },
            _handleSwipeUpdate: function(e) {
                var offset = this._menuShown ? e.offset + 1 : e.offset;
                this._renderPosition(offset, false)
            },
            _handleSwipeEnd: function(e) {
                var targetOffset = e.targetOffset + this._menuShown;
                this._toggleMenuVisibility(targetOffset !== 0, true)
            },
            _handleMenuButtonClick: function() {
                this._toggleMenuVisibility(!this._menuShown, true)
            },
            _toggleMenuVisibility: function(visible, animate) {
                this._menuShown = visible;
                this._renderPosition(this._menuShown ? 1 : 0, animate)
            },
            _renderPosition: function(offset, animate) {
                var pos = this._calculatePixelOffset(offset);
                if (animate)
                    fx.animate(this._$container, {
                        type: "slide",
                        to: {left: pos},
                        duration: ANIMATION_DURATION,
                        complete: $.proxy(this._handleAnimationComplete, this)
                    });
                else
                    translator.move(this._$container, {left: pos})
            },
            _calculatePixelOffset: function(offset) {
                var offset = offset || 0,
                    maxOffset = this._getListWidth();
                return offset * maxOffset
            },
            _getListWidth: function() {
                var listWidth = this._$list.width(),
                    elementWidth = this._element().width() - CONTENT_OFFSET;
                return Math.min(elementWidth, listWidth)
            },
            _changeMenuOption: function(name, value) {
                this._$list.dxList("instance").option(name, value)
            },
            _optionChanged: function(name, value, prevValue) {
                switch (name) {
                    case"menuItemRender":
                        this._changeMenuOption("itemRender", value);
                        break;
                    case"menuItemTemplate":
                        this._changeMenuOption("itemTemplate", value);
                        break;
                    case"itemClickAction":
                        this._renderItemClickAction();
                        break;
                    default:
                        this.callBase(name, value, prevValue)
                }
            },
            _handleAnimationComplete: function() {
                if (this._deferredAnimate)
                    this._deferredAnimate.resolveWith(this)
            },
            showMenu: function() {
                return this.toggleMenuVisibility(true)
            },
            hideMenu: function() {
                return this.toggleMenuVisibility(false)
            },
            toggleMenuVisibility: function(showing) {
                showing = showing === undefined ? !this._menuShown : showing;
                this._deferredAnimate = $.Deferred();
                this._toggleMenuVisibility(showing, true);
                return this._deferredAnimate.promise()
            }
        }))
    })(jQuery, DevExpress);
    DevExpress.MOD_WIDGETS = true
}
if (!DevExpress.MOD_FRAMEWORK) {
    if (!window.DevExpress)
        throw Error('Required module is not referenced: core');
    /*! Module framework, file framework.js */
    (function($, DX, undefined) {
        var mergeWithReplace = function(destination, source, needReplaceFn) {
                var result = [];
                for (var i = 0, destinationLength = destination.length; i < destinationLength; i++)
                    if (!needReplaceFn(destination[i], source))
                        result.push(destination[i]);
                result.push.apply(result, source);
                return result
            };
        var getMergeCommands = function() {
                return function(destination, source) {
                        return mergeWithReplace(destination, source, function(destObject, source) {
                                return $.grep(source, function(srcObject) {
                                        return destObject.option("id") === srcObject.option("id") && srcObject.option("id") || destObject.option("behavior") === srcObject.option("behavior") && destObject.option("behavior")
                                    }).length
                            })
                    }
            };
        DX.framework = {utils: {mergeCommands: getMergeCommands()}}
    })(jQuery, DevExpress);
    /*! Module framework, file framework.routing.js */
    (function($, DX) {
        var Class = DX.Class;
        DX.framework.Route = Class.inherit({
            _trimSeparators: function(str) {
                return str.replace(/^[\/.]+|\/+$/g, "")
            },
            _escapeRe: function(str) {
                return str.replace(/\W/g, "\\$1")
            },
            _checkConstraint: function(param, constraint) {
                param = String(param);
                if (typeof constraint === "string")
                    constraint = new RegExp(constraint);
                var match = constraint.exec(param);
                if (!match || match[0] !== param)
                    return false;
                return true
            },
            _ensureReady: function() {
                var self = this;
                if (this._patternRe)
                    return false;
                this._pattern = this._trimSeparators(this._pattern);
                this._patternRe = "";
                this._params = [];
                this._segments = [];
                this._separators = [];
                this._pattern.replace(/[^\/]+/g, function(segment, index) {
                    self._segments.push(segment);
                    if (index)
                        self._separators.push(self._pattern.substr(index - 1, 1))
                });
                $.each(this._segments, function(index) {
                    var isStatic = true,
                        segment = this,
                        separator = index ? self._separators[index - 1] : "";
                    if (segment.charAt(0) === ":") {
                        isStatic = false;
                        segment = segment.substr(1);
                        self._params.push(segment);
                        self._patternRe += "(?:" + separator + "([^/]+))";
                        if (segment in self._defaults)
                            self._patternRe += "?"
                    }
                    else
                        self._patternRe += separator + self._escapeRe(segment)
                });
                this._patternRe = new RegExp("^" + this._patternRe + "$")
            },
            ctor: function(pattern, defaults, constraints) {
                this._pattern = pattern || "";
                this._defaults = defaults || {};
                this._constraints = constraints || {}
            },
            parse: function(uri) {
                var self = this;
                this._ensureReady();
                var matches = this._patternRe.exec(uri);
                if (!matches)
                    return false;
                var result = $.extend({}, this._defaults);
                $.each(this._params, function(i) {
                    var index = i + 1;
                    if (matches.length >= index && matches[index])
                        result[this] = self.parseSegment(matches[index])
                });
                $.each(this._constraints, function(key) {
                    if (!self._checkConstraint(result[key], self._constraints[key])) {
                        result = false;
                        return false
                    }
                });
                return result
            },
            format: function(routeValues) {
                var self = this,
                    query = "";
                this._ensureReady();
                var mergeValues = $.extend({}, this._defaults),
                    useStatic = 0,
                    ret = [],
                    dels = [],
                    unusedRouteValues = {};
                $.each(routeValues, function(paramName, paramValue) {
                    routeValues[paramName] = self.formatSegment(paramValue);
                    if (!(paramName in mergeValues))
                        unusedRouteValues[paramName] = true
                });
                $.each(this._segments, function(index, segment) {
                    ret[index] = index ? self._separators[index - 1] : '';
                    if (segment.charAt(0) === ':') {
                        var paramName = segment.substr(1);
                        if (!(paramName in routeValues) && !(paramName in self._defaults)) {
                            ret = null;
                            return false
                        }
                        if (paramName in self._constraints && !self._checkConstraint(routeValues[paramName], self._constraints[paramName])) {
                            ret = null;
                            return false
                        }
                        if (paramName in routeValues) {
                            if (routeValues[paramName] !== undefined) {
                                mergeValues[paramName] = routeValues[paramName];
                                ret[index] += routeValues[paramName];
                                useStatic = index
                            }
                            delete unusedRouteValues[paramName]
                        }
                        else if (paramName in mergeValues) {
                            ret[index] += mergeValues[paramName];
                            dels.push(index)
                        }
                    }
                    else {
                        ret[index] += segment;
                        useStatic = index
                    }
                });
                $.each(mergeValues, function(key, value) {
                    if (!!value && $.inArray(":" + key, self._segments) === -1 && routeValues[key] !== value) {
                        ret = null;
                        return false
                    }
                });
                var unusedCount = 0;
                if (!$.isEmptyObject(unusedRouteValues)) {
                    query = "?";
                    $.each(unusedRouteValues, function(key) {
                        query += key + "=" + routeValues[key] + "&";
                        unusedCount++
                    });
                    query = query.substr(0, query.length - 1)
                }
                $.each(routeValues, function(i) {
                    if (!this in mergeValues) {
                        ret = null;
                        return false
                    }
                });
                if (ret === null)
                    return false;
                if (dels.length)
                    $.map(dels, function(i) {
                        if (i >= useStatic)
                            ret[i] = ''
                    });
                var path = ret.join('');
                path = path.replace(/\/+$/, "");
                return {
                        uri: path + query,
                        unusedCount: unusedCount
                    }
            },
            formatSegment: function(value) {
                if ($.isArray(value) || $.isPlainObject(value))
                    return "json:" + encodeURIComponent(JSON.stringify(value));
                return encodeURIComponent(value)
            },
            parseSegment: function(value) {
                if (value.substr(0, 5) === "json:")
                    try {
                        return $.parseJSON(decodeURIComponent(value.substr(5)))
                    }
                    catch(x) {}
                return decodeURIComponent(value)
            }
        });
        DX.framework.MvcRouter = DX.Class.inherit({
            ctor: function() {
                this._registry = []
            },
            _trimSeparators: function(str) {
                return str.replace(/^[\/.]+|\/+$/g, "")
            },
            _createRoute: function(pattern, defaults, constraints) {
                return new DX.framework.Route(pattern, defaults, constraints)
            },
            register: function(pattern, defaults, constraints) {
                this._registry.push(this._createRoute(pattern, defaults, constraints))
            },
            _parseQuery: function(query) {
                var result = {},
                    values = query.split("&");
                $.each(values, function(index, value) {
                    var keyValuePair = value.split("=");
                    result[keyValuePair[0]] = keyValuePair[1]
                });
                return result
            },
            parse: function(uri) {
                var self = this,
                    ret;
                uri = this._trimSeparators(uri);
                var parts = uri.split("?", 2),
                    path = parts[0],
                    query = parts[1];
                $.each(this._registry, function() {
                    var result = this.parse(path);
                    if (result !== false) {
                        ret = result;
                        if (query)
                            ret = $.extend(ret, self._parseQuery(query));
                        return false
                    }
                });
                return ret ? ret : false
            },
            format: function(obj) {
                var ret = false,
                    minUnusedCount = 99999;
                obj = obj || {};
                $.each(this._registry, function() {
                    var toFormat = $.extend(true, {}, obj);
                    var result = this.format(toFormat);
                    if (result !== false)
                        if (minUnusedCount > result.unusedCount) {
                            minUnusedCount = result.unusedCount;
                            ret = result.uri
                        }
                });
                return ret
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.command.js */
    (function($, DX) {
        var ui = DX.ui;
        DX.framework.dxCommand = ui.Component.inherit({
            ctor: function(element, options) {
                if ($.isPlainObject(element)) {
                    options = element;
                    element = $("<div />")
                }
                this.beforeExecute = $.Callbacks();
                this.afterExecute = $.Callbacks();
                this.callBase(element, options)
            },
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        action: null,
                        id: null,
                        title: "",
                        icon: "",
                        iconSrc: "",
                        visible: true,
                        disabled: false
                    })
            },
            execute: function() {
                var isDisabled = this._options.disabled;
                if ($.isFunction(isDisabled))
                    isDisabled = !!isDisabled.apply(this, arguments);
                if (isDisabled)
                    throw new Error(DX.utils.stringFormat("Cannot execute command: {0}", this._options.id));
                this.beforeExecute.fire(arguments);
                this._createActionByOption("action", {allowedForGesture: true}).apply(this, arguments);
                this.afterExecute.fire(arguments)
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-command")
            },
            _renderDisabledState: $.noop,
            _dispose: function() {
                this.callBase();
                this._element().removeData(this.NAME);
                this.beforeExecute.empty();
                this.afterExecute.empty()
            }
        });
        ui.registerComponent("dxCommand", DX.framework.dxCommand)
    })(jQuery, DevExpress);
    /*! Module framework, file framework.commandMapping.js */
    (function($, DX) {
        DX.framework.CommandMapping = DX.Class.inherit({
            ctor: function() {
                this._commandMappings = {};
                this._containerDefaults = {}
            },
            setDefaults: function(containerId, defaults) {
                this._containerDefaults[containerId] = defaults;
                return this
            },
            mapCommands: function(containerId, commandMappings) {
                var self = this;
                $.each(commandMappings, function(index, commandMapping) {
                    if (typeof commandMapping === "string")
                        commandMapping = {id: commandMapping};
                    var commandId = commandMapping.id;
                    var mappings = self._commandMappings[containerId] || {};
                    mappings[commandId] = $.extend({
                        showIcon: true,
                        showText: true
                    }, self._containerDefaults[containerId] || {}, commandMapping);
                    self._commandMappings[containerId] = mappings
                });
                this._initExistingCommands();
                return this
            },
            unmapCommands: function(containerId, commandIds) {
                var self = this;
                $.each(commandIds, function(index, commandId) {
                    var mappings = self._commandMappings[containerId] || {};
                    if (mappings)
                        delete mappings[commandId]
                });
                this._initExistingCommands()
            },
            getCommandMappingForContainer: function(commandId, containerId) {
                return (this._commandMappings[containerId] || {})[commandId]
            },
            checkCommandsExist: function(commands) {
                var self = this,
                    result = $.grep(commands, function(commandName, index) {
                        return $.inArray(commandName, self._existingCommands) < 0 && $.inArray(commandName, commands) === index
                    });
                if (result.length !== 0)
                    throw new Error("The '" + result.join("', '") + "' command" + (result.length === 1 ? " is" : "s are") + " not registred in the application's command mapping. See http://dxpr.es/1bTjfj1 for more details.");
            },
            load: function(config) {
                if (!config)
                    return;
                var self = this;
                $.each(config, function(name, container) {
                    self.setDefaults(name, container.defaults);
                    self.mapCommands(name, container.commands)
                });
                return this
            },
            _initExistingCommands: function() {
                var self = this;
                this._existingCommands = [];
                $.each(self._commandMappings, function(name, _commands) {
                    $.each(_commands, function(index, command) {
                        if ($.inArray(command.id, self._existingCommands) < 0)
                            self._existingCommands.push(command.id)
                    })
                })
            }
        });
        DX.framework.CommandMapping.defaultMapping = {
            "global-navigation": {
                defaults: {
                    showIcon: true,
                    showText: true
                },
                commands: []
            },
            "ios-header-toolbar": {
                defaults: {
                    showIcon: false,
                    showText: true,
                    align: "right"
                },
                commands: ["edit", "save", {
                        id: "back",
                        align: "left"
                    }, {
                        id: "cancel",
                        align: "left"
                    }, {
                        id: "create",
                        showIcon: true,
                        showText: false
                    }]
            },
            "ios-action-sheet": {
                defaults: {
                    showIcon: false,
                    showText: true
                },
                commands: []
            },
            "ios-view-footer": {
                defaults: {
                    showIcon: false,
                    showText: true
                },
                commands: [{
                        id: "delete",
                        type: "danger"
                    }]
            },
            "android-header-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    align: "right"
                },
                commands: ["create", "edit", "save", {
                        id: "delete",
                        showText: true,
                        menu: true
                    }]
            },
            "android-simple-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    align: "right"
                },
                commands: [{
                        id: "back",
                        align: "left",
                        showIcon: false
                    }, {id: "create"}, {
                        id: "save",
                        align: "left",
                        showText: true
                    }, {
                        id: "edit",
                        showText: true,
                        menu: true
                    }, {
                        id: "cancel",
                        showText: true,
                        menu: true
                    }, {
                        id: "delete",
                        showText: true,
                        menu: true
                    }]
            },
            "android-footer-toolbar": {
                defaults: {align: "right"},
                commands: [{
                        id: "create",
                        showText: false,
                        align: "center"
                    }, {
                        id: "edit",
                        showText: false,
                        align: "left"
                    }, {
                        id: "delete",
                        menu: true
                    }, {
                        id: "save",
                        showIcon: false,
                        align: "left"
                    }]
            },
            "tizen-header-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    align: "right"
                },
                commands: ["create", "edit", "save", {
                        id: "delete",
                        showText: true,
                        menu: true
                    }]
            },
            "tizen-footer-toolbar": {
                defaults: {align: "right"},
                commands: [{
                        id: "create",
                        showText: false
                    }, {
                        id: "edit",
                        showText: false,
                        align: "left"
                    }, {
                        id: "delete",
                        menu: true
                    }, {
                        id: "save",
                        showIcon: false,
                        align: "left"
                    }]
            },
            "generic-header-toolbar": {
                defaults: {
                    showIcon: false,
                    showText: true,
                    align: "right"
                },
                commands: ["edit", "save", {
                        id: "back",
                        align: "left"
                    }, {
                        id: "cancel",
                        align: "left"
                    }, {
                        id: "create",
                        showIcon: true,
                        showText: false
                    }]
            },
            "generic-view-footer": {
                defaults: {
                    showIcon: false,
                    showText: true
                },
                commands: [{
                        id: "delete",
                        type: "danger"
                    }]
            },
            "win8-appbar": {
                defaults: {align: "right"},
                commands: ["edit", "cancel", "save", "delete", {
                        id: "create",
                        align: "left"
                    }]
            },
            "win8-toolbar": {
                defaults: {
                    showText: false,
                    align: "left"
                },
                commands: [{id: "previousPage"}]
            },
            "win8-phone-appbar": {
                defaults: {align: "center"},
                commands: ["create", "edit", "save", "delete"]
            },
            "desktop-toolbar": {
                defaults: {
                    showIcon: false,
                    showText: true,
                    align: "right"
                },
                commands: ["cancel", "create", "edit", "save", {
                        id: "delete",
                        type: "danger"
                    }]
            }
        }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.viewCache.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        DX.framework.ViewCache = Class.inherit({
            ctor: function() {
                this._cache = {}
            },
            setView: function(key, viewInfo) {
                this._cache[key] = viewInfo
            },
            getView: function(key) {
                return this._cache[key]
            },
            removeView: function(key) {
                var result = this._cache[key];
                delete this._cache[key];
                return result
            },
            clear: function() {
                this._cache = {}
            },
            hasView: function(viewInfo) {
                for (var key in this._cache)
                    if (this._cache[key] === viewInfo)
                        return true;
                return false
            }
        });
        DX.framework.NullViewCache = Class.inherit({
            setView: $.noop,
            getView: $.noop,
            removeView: $.noop,
            clear: $.noop,
            hasView: $.noop
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.stateManager.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        DX.framework.MemoryKeyValueStorage = Class.inherit({
            ctor: function() {
                this.storage = {}
            },
            getItem: function(key) {
                return this.storage[key]
            },
            setItem: function(key, value) {
                this.storage[key] = value
            },
            removeItem: function(key) {
                delete this.storage[key]
            }
        });
        DX.framework.StateManager = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.storage = options.storage || new DX.framework.MemoryKeyValueStorage;
                this.stateSources = options.stateSources || []
            },
            addStateSource: function(stateSource) {
                this.stateSources.push(stateSource)
            },
            removeStateSource: function(stateSource) {
                var index = $.inArray(stateSource, this.stateSources);
                if (index > -1) {
                    this.stateSources.splice(index, 1);
                    stateSource.removeState(this.storage)
                }
            },
            saveState: function() {
                var self = this;
                $.each(this.stateSources, function(index, stateSource) {
                    stateSource.saveState(self.storage)
                })
            },
            restoreState: function() {
                var self = this;
                $.each(this.stateSources, function(index, stateSource) {
                    stateSource.restoreState(self.storage)
                })
            },
            clearState: function() {
                var self = this;
                $.each(this.stateSources, function(index, stateSource) {
                    stateSource.removeState(self.storage)
                })
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.browserAdapters.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var ROOT_PAGE_URL = "__root__";
        DX.framework.DefaultBrowserAdapter = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._window = options.window || window;
                this.popState = $.Callbacks();
                $(this._window).on("hashchange", $.proxy(this._onHashChange, this))
            },
            replaceState: function(uri) {
                uri = this._normalizeUri(uri);
                this._window.history.replaceState(null, null, "#" + uri)
            },
            pushState: function(uri) {
                uri = this._normalizeUri(uri);
                this._window.history.pushState(null, null, "#" + uri)
            },
            createRootPage: function() {
                this._window.history.replaceState(null, null, "#" + ROOT_PAGE_URL)
            },
            _onHashChange: function() {
                this.popState.fire()
            },
            back: function() {
                this._window.history.back()
            },
            getHash: function() {
                return this._normalizeUri(this._window.location.hash)
            },
            isRootPage: function() {
                return this.getHash() === ROOT_PAGE_URL
            },
            _normalizeUri: function(uri) {
                return (uri || "").replace(/^#+/, "")
            }
        });
        DX.framework.OldBrowserAdapter = DX.framework.DefaultBrowserAdapter.inherit({
            ctor: function() {
                this._innerEventCount = 0;
                this.callBase.apply(this, arguments)
            },
            replaceState: function(uri) {
                uri = this._normalizeUri(uri);
                if (this.getHash() !== uri) {
                    this._skipNextEvent();
                    this.back();
                    this._skipNextEvent();
                    this._window.location.hash = uri
                }
            },
            pushState: function(uri) {
                uri = this._normalizeUri(uri);
                if (this.getHash() !== uri) {
                    this._skipNextEvent();
                    this._window.location.hash = uri
                }
            },
            createRootPage: function() {
                this.pushState(ROOT_PAGE_URL)
            },
            _onHashChange: function() {
                if (this._innerEventCount)
                    this._innerEventCount--;
                else
                    this.popState.fire()
            },
            _skipNextEvent: function() {
                this._innerEventCount++
            }
        });
        DX.framework.HistorylessBrowserAdapter = DX.framework.DefaultBrowserAdapter.inherit({
            ctor: function(options) {
                options = options || {};
                this._window = options.window || window;
                this.popState = $.Callbacks();
                $(this._window).on("dxback", $.proxy(this._onHashChange, this));
                this._currentHash = this._window.location.hash
            },
            replaceState: function(uri) {
                this._currentHash = this._normalizeUri(uri)
            },
            pushState: function(uri) {
                this._currentHash = this._normalizeUri(uri)
            },
            createRootPage: function() {
                this.pushState(ROOT_PAGE_URL)
            },
            _onHashChange: function() {
                this.back();
                this.popState.fire()
            },
            getHash: function() {
                return this._normalizeUri(this._currentHash)
            },
            back: function() {
                this.replaceState(ROOT_PAGE_URL)
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.browserNavigationDevice.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var SESSION_KEY = "dxPhoneJSApplication";
        DX.framework.BrowserNavigationDevice = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._browserAdapter = this._createBrowserAdapter(options);
                this.uriChanged = $.Callbacks();
                this.backInitiated = $.Callbacks();
                this._deferredNavigate = null;
                this._browserAdapter.popState.add($.proxy(this._onPopState, this));
                if (window.sessionStorage && !sessionStorage.getItem(SESSION_KEY)) {
                    sessionStorage.removeItem(SESSION_KEY);
                    this._prepareBrowserHistory()
                }
                if (this._browserAdapter.isRootPage())
                    this._browserAdapter.pushState("");
                $(window).unload(this._saveBrowserState())
            },
            _isBuggyAndroid: function() {
                var version = DX.devices.real.version;
                return DX.devices.real.platform === "android" && version.length > 1 && (version[0] === 2 && version[1] < 4 || version[0] < 2)
            },
            _createBrowserAdapter: function(options) {
                var sourceWindow = options.window || window;
                if (sourceWindow === sourceWindow.top)
                    if (sourceWindow.history.replaceState && sourceWindow.history.pushState && !this._isBuggyAndroid())
                        return new DX.framework.DefaultBrowserAdapter(options);
                    else
                        return new DX.framework.OldBrowserAdapter(options);
                else
                    return new DX.framework.HistorylessBrowserAdapter(options)
            },
            _saveBrowserState: function() {
                if (window.sessionStorage)
                    sessionStorage.setItem(SESSION_KEY, true)
            },
            _prepareBrowserHistory: function() {
                var hash = this.getUri();
                this._browserAdapter.createRootPage();
                this._browserAdapter.pushState(hash)
            },
            getUri: function() {
                return this._browserAdapter.getHash()
            },
            setUri: function(uri) {
                if (this._browserAdapter.isRootPage())
                    this._browserAdapter.pushState(uri);
                else
                    this._browserAdapter.replaceState(uri)
            },
            _onPopState: function(uri) {
                var self = this,
                    currentHash = this.getUri();
                if (this._deferredNavigate && this._deferredNavigate.state() === "pending")
                    if (this._browserAdapter.isRootPage())
                        this._deferredNavigate.resolve();
                    else
                        this._browserAdapter.back();
                else if (this._browserAdapter.isRootPage())
                    this.backInitiated.fire();
                else {
                    this._deferredNavigate = $.Deferred().done(function() {
                        self.uriChanged.fire(currentHash)
                    });
                    this._browserAdapter.back()
                }
            },
            back: function() {
                this._browserAdapter.back()
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.navigationManager.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var NAVIGATION_TARGETS = {
                current: "current",
                blank: "blank",
                back: "back"
            },
            STORAGE_HISTORY_KEY = "__history";
        DX.framework.NavigationStack = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.itemsRemoved = $.Callbacks();
                this.clear()
            },
            currentItem: function() {
                return this.items[this.currentIndex]
            },
            back: function(uri) {
                this.currentIndex--;
                if (this.currentIndex < 0)
                    throw Error("Unable to go back");
                var currentItem = this.currentItem();
                if (currentItem.uri !== uri)
                    this._updateItem(this.currentIndex, uri)
            },
            forward: function() {
                this.currentIndex++;
                if (this.currentIndex >= this.items.length)
                    throw Error("Unable to go forward");
            },
            navigate: function(uri, replaceCurrent) {
                if (this.currentIndex < this.items.length && this.currentIndex > -1 && this.items[this.currentIndex].uri === uri)
                    return;
                if (replaceCurrent && this.currentIndex > -1)
                    this.currentIndex--;
                if (this.currentIndex + 1 < this.items.length && this.items[this.currentIndex + 1].uri === uri)
                    this.currentIndex++;
                else {
                    var toDelete = this.items.splice(this.currentIndex + 1, this.items.length - this.currentIndex - 1);
                    this.items.push({});
                    this.currentIndex++;
                    this._updateItem(this.currentIndex, uri);
                    this._deleteItems(toDelete)
                }
                return this.currentItem()
            },
            _updateItem: function(index, uri) {
                var item = this.items[index];
                item.uri = uri;
                item.key = this.items[0].uri + "_" + index + "_" + uri
            },
            _deleteItems: function(items) {
                if (items)
                    this.itemsRemoved.fire(items)
            },
            getPreviousItem: function() {
                return this.items.length > 1 ? this.items[this.currentIndex - 1] : undefined
            },
            canBack: function() {
                return this.currentIndex > 0
            },
            clear: function() {
                this._deleteItems(this.items);
                this.items = [];
                this.currentIndex = -1
            }
        });
        DX.framework.NavigationManager = Class.inherit({
            ctor: function(options) {
                options = options || {};
                var self = this;
                self.navigationStacks = {};
                self._keepPositionInStack = options.keepPositionInStack;
                self.currentStack = new DX.framework.NavigationStack;
                self.currentUri = undefined;
                self.navigating = $.Callbacks();
                self.navigated = $.Callbacks();
                self.navigatingBack = $.Callbacks();
                self.navigationCanceled = $.Callbacks();
                self.itemRemoved = $.Callbacks();
                self._navigationDevice = options.navigationDevice || new DX.framework.BrowserNavigationDevice;
                self._navigationDevice.uriChanged.add($.proxy(self.navigate, self));
                self._navigationDevice.backInitiated.add($.proxy(self.back, self));
                self._stateStorageKey = options.stateStorageKey || STORAGE_HISTORY_KEY
            },
            navigate: function(uri, options) {
                var self = this;
                options = $.extend({target: NAVIGATION_TARGETS.blank}, options || {});
                if (uri === undefined)
                    uri = self._navigationDevice.getUri();
                if (/^_back$/.test(uri)) {
                    self.back();
                    return
                }
                var args = {
                        currentUri: self.currentUri,
                        uri: uri,
                        options: options,
                        cancel: false,
                        navigateWhen: []
                    };
                self.navigating.fire(args);
                uri = args.uri;
                if (args.cancel || self.currentUri === uri) {
                    self._navigationDevice.setUri(self.currentUri);
                    self.navigationCanceled.fire(args)
                }
                else
                    $.when.apply($, args.navigateWhen).done(function() {
                        DX.utils.executeAsync(function() {
                            var previousUri = self.currentUri;
                            self.currentUri = uri;
                            self._updateHistory(uri, options);
                            self._navigationDevice.setUri(self.currentUri);
                            self.navigated.fire({
                                uri: uri,
                                previousUri: previousUri,
                                options: options,
                                item: self.currentItem()
                            })
                        })
                    })
            },
            _createNavigationStack: function() {
                var result = new DX.framework.NavigationStack;
                result.itemsRemoved.add($.proxy(this._removeItems, this));
                return result
            },
            _updateHistory: function(uri, options) {
                var isRoot = options.root,
                    forceIsRoot = isRoot,
                    forceToRoot = false;
                if (isRoot || !this.currentStack.items.length) {
                    this.navigationStacks[uri] = this.navigationStacks[uri] || this._createNavigationStack();
                    if (this.currentStack === this.navigationStacks[uri])
                        forceToRoot = true;
                    else
                        this.currentStack = this.navigationStacks[uri];
                    forceIsRoot = true
                }
                if (isRoot && this.currentStack.items.length)
                    if (this._keepPositionInStack && options.root && !forceToRoot)
                        this.currentUri = this.currentItem().uri;
                    else {
                        this.currentStack.currentIndex = 0;
                        if (this.currentItem().uri !== uri)
                            this.currentStack.navigate(uri, true)
                    }
                else {
                    var prevIndex = this.currentStack.currentIndex,
                        prevItem = this.currentItem() || {};
                    switch (options.target) {
                        case NAVIGATION_TARGETS.blank:
                            this.currentStack.navigate(uri);
                            break;
                        case NAVIGATION_TARGETS.current:
                            this.currentStack.navigate(uri, true);
                            break;
                        case NAVIGATION_TARGETS.back:
                            if (this.currentStack.currentIndex > 0)
                                this.currentStack.back(uri);
                            else
                                this.currentStack.navigate(uri, true);
                            break;
                        default:
                            throw Error(DX.utils.stringFormat("Unknown navigation target: \"{0}\". Use the DevExpress.framework.NavigationManager.NAVIGATION_TARGETS enumerable values", options.target));
                    }
                    if (options.direction === undefined) {
                        var indexDelta = this.currentStack.currentIndex - prevIndex;
                        if (indexDelta < 0)
                            options.direction = this.currentItem().backDirection || "backward";
                        else if (indexDelta > 0 && this.currentStack.currentIndex > 0)
                            options.direction = "forward";
                        else
                            options.direction = "none"
                    }
                    prevItem.backDirection = options.direction === "forward" ? "backward" : "none"
                }
                options.root = forceIsRoot
            },
            _removeItems: function(items) {
                var self = this;
                $.each(items, function(index, item) {
                    self.itemRemoved.fire(item)
                })
            },
            back: function(alternate) {
                var navigatingBackArgs = {cancel: DX.backButtonCallback.fire()};
                if (!navigatingBackArgs.cancel)
                    this.navigatingBack.fire(navigatingBackArgs);
                if (navigatingBackArgs.cancel) {
                    this._navigationDevice.setUri(this.currentUri);
                    return
                }
                var item = this.getPreviousItem();
                if (item)
                    this.navigate(item.uri, {
                        target: NAVIGATION_TARGETS.back,
                        item: item
                    });
                else if (alternate)
                    this.navigate(alternate);
                else
                    this._navigationDevice.back()
            },
            getPreviousItem: function() {
                return this.currentStack.getPreviousItem()
            },
            currentItem: function() {
                return this.currentStack.currentItem()
            },
            currentIndex: function() {
                return this.currentStack.currentIndex
            },
            rootUri: function() {
                return this.currentStack.items.length ? this.currentStack.items[0].uri : this.currentUri
            },
            canBack: function() {
                return this.currentStack.canBack()
            },
            getItemByIndex: function(index) {
                return this.currentStack.items[index]
            },
            saveState: function(storage) {
                if (this.currentStack.items.length) {
                    var state = {
                            items: this.currentStack.items,
                            currentIndex: this.currentStack.currentIndex,
                            currentStackKey: this.currentStack.items[0].uri
                        };
                    var json = JSON.stringify(state);
                    storage.setItem(this._stateStorageKey, json)
                }
                else
                    this.removeState(storage)
            },
            restoreState: function(storage) {
                if (this.disableRestoreState)
                    return;
                var json = storage.getItem(this._stateStorageKey);
                if (json)
                    try {
                        var state = JSON.parse(json),
                            stack = this._createNavigationStack();
                        if (!state.items[0].uri)
                            throw Error("Error while application state restoring. State has been cleared. Refresh the page");
                        stack.items = state.items;
                        stack.currentIndex = state.currentIndex;
                        this.navigationStacks[stack.items[0].uri] = stack;
                        this.currentStack = this.navigationStacks[state.currentStackKey];
                        this._navigationDevice.setUri(this.currentItem().uri)
                    }
                    catch(e) {
                        this.removeState(storage);
                        throw e;
                    }
            },
            removeState: function(storage) {
                storage.removeItem(this._stateStorageKey)
            },
            clearHistory: function() {
                this.currentStack.clear()
            }
        });
        DX.framework.NavigationManager.NAVIGATION_TARGETS = NAVIGATION_TARGETS
    })(jQuery, DevExpress);
    /*! Module framework, file framework.actionExecutors.js */
    (function($, DX, undefined) {
        DX.framework.createActionExecutors = function(app) {
            return {
                    routing: {execute: function(e) {
                            if ($.isPlainObject(e.action)) {
                                var toBack = e.action.backBehaviour;
                                if (e.action.backBehaviour)
                                    delete e.action.backBehaviour;
                                var routeValues = e.action,
                                    uri = app.router.format(routeValues);
                                if (toBack)
                                    app.back(uri);
                                else
                                    app.navigate(uri);
                                e.handled = true
                            }
                        }},
                    hash: {execute: function(e) {
                            if (typeof e.action !== "string" || e.action.charAt(0) !== "#")
                                return;
                            var uriTemplate = e.action.substr(1),
                                args = e.args[0],
                                uri = uriTemplate;
                            var defaultEvaluate = function(expr) {
                                    var getter = DX.data.utils.compileGetter(expr),
                                        model = e.args[0].model;
                                    return getter(model)
                                };
                            var evaluate = args.evaluate || defaultEvaluate;
                            uri = uriTemplate.replace(/\{([^}]+)\}/g, function(entry, expr) {
                                expr = $.trim(expr);
                                if (expr.indexOf(",") > -1)
                                    expr = $.map(expr.split(","), $.trim);
                                var value = evaluate(expr);
                                value = DX.framework.Route.prototype.formatSegment(value);
                                return value !== undefined ? value : entry
                            });
                            var navigateOptions = (e.component || {}).NAME === "dxCommand" ? e.component.option() : {};
                            app.navigate(uri, navigateOptions);
                            e.handled = true
                        }}
                }
        }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.application.js */
    (function($, DX) {
        var Class = DX.Class,
            BACK_COMMAND_TITLE = DX.localization.localizeString("@Back"),
            frameworkNS = DX.framework;
        DX.framework.Application = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._options = options;
                this.namespace = options.namespace || options.ns || window;
                this.components = [];
                this.router = options.router || new DX.framework.MvcRouter;
                this.navigationManager = options.navigationManager || new DX.framework.NavigationManager({keepPositionInStack: options.navigateToRootViewMode === "keepHistory"});
                this.navigationManager.navigating.add($.proxy(this._onNavigating, this));
                this.navigationManager.navigated.add($.proxy(this._onNavigated, this));
                this.navigationManager.navigationCanceled.add($.proxy(this._onNavigationCanceled, this));
                this.navigationManager.itemRemoved.add($.proxy(this._onNavigationItemRemoved, this));
                this.stateManager = options.stateManager || new DX.framework.StateManager({storage: options.stateStorage || sessionStorage});
                this.stateManager.addStateSource(this.navigationManager);
                this._viewCache = options.disableViewCache ? new DX.framework.NullViewCache : options.viewCache || new DX.framework.ViewCache;
                this.navigation = this._createNavigationCommands(options.navigation);
                this.commandMapping = this._createCommandMapping(options.commandMapping, this.navigation);
                this.beforeViewSetup = $.Callbacks();
                this.afterViewSetup = $.Callbacks();
                this.viewShowing = $.Callbacks();
                this.viewShown = $.Callbacks();
                this.viewHidden = $.Callbacks();
                this.viewDisposing = $.Callbacks();
                this.viewDisposed = $.Callbacks();
                this.navigating = $.Callbacks();
                this._isNavigating = false;
                DX.registerActionExecutor(DX.framework.createActionExecutors(this));
                DX.overlayTargetContainer(".dx-viewport .dx-layout");
                this.components.push(this.router);
                this.components.push(this.navigationManager)
            },
            _createCommandMapping: function(commandMapping, navigationCommands) {
                var result = commandMapping;
                if (!(commandMapping instanceof DX.framework.CommandMapping)) {
                    result = new DX.framework.CommandMapping;
                    result.load(DX.framework.CommandMapping.defaultMapping || {}).load(commandMapping || {})
                }
                var navigationCommandIds = $.map(navigationCommands, function(command) {
                        return command.option("id")
                    });
                result.mapCommands("global-navigation", navigationCommandIds);
                return result
            },
            _createNavigationCommands: function(commandConfig) {
                if (!commandConfig)
                    return [];
                var self = this,
                    generatedIdCount = 0;
                return $.map(commandConfig, function(item) {
                        var command;
                        if (item instanceof frameworkNS.dxCommand)
                            command = item;
                        else
                            command = new frameworkNS.dxCommand($.extend({root: true}, item));
                        if (!command.option("id"))
                            command.option("id", "navigation_" + generatedIdCount++);
                        return command
                    })
            },
            _callComponentMethod: function(methodName, args) {
                var tasks = [];
                $.each(this.components, function(index, component) {
                    if (component[methodName] && $.isFunction(component[methodName])) {
                        var result = component[methodName](args);
                        if (result && result.done)
                            tasks.push(result)
                    }
                });
                return $.when.apply($, tasks)
            },
            init: function() {
                this._inited = true;
                return this._callComponentMethod("init")
            },
            _onNavigating: function(args) {
                var self = this;
                if (self._isNavigating) {
                    self._pendingNavigationArgs = args;
                    args.cancel = true;
                    return
                }
                else {
                    self._isNavigating = true;
                    delete self._pendingNavigationArgs
                }
                var routeData = this.router.parse(args.uri);
                if (!routeData)
                    throw new Error(DX.utils.stringFormat("Routing rule is not found for the \"{0}\" url", args.uri));
                var uri = this.router.format(routeData);
                if (args.uri !== uri && uri) {
                    args.cancel = true;
                    DX.utils.executeAsync(function() {
                        self.navigate(uri, args.options)
                    })
                }
                else
                    self._processEvent("navigating", args)
            },
            _onNavigated: function(args) {
                var self = this,
                    direction = args.options.direction,
                    deferred = $.Deferred(),
                    viewInfo = self._acquireViewInfo(args.item);
                if (!self._isViewReadyToShow(viewInfo))
                    self._setViewLoadingState(viewInfo, direction).done(function() {
                        DX.utils.executeAsync(function() {
                            self._createViewModel(viewInfo);
                            self._createViewCommands(viewInfo);
                            deferred.resolve()
                        })
                    });
                else
                    deferred.resolve();
                deferred.done(function() {
                    self._highlightCurrentNavigationCommand(viewInfo);
                    self._showView(viewInfo, direction).done(function() {
                        self._isNavigating = false;
                        var pendingArgs = self._pendingNavigationArgs;
                        if (pendingArgs)
                            DX.utils.executeAsync(function() {
                                self.navigate(pendingArgs.uri, pendingArgs.options)
                            })
                    })
                })
            },
            _isViewReadyToShow: function(viewInfo) {
                return !!viewInfo.model
            },
            _onNavigationCanceled: function(args) {
                var self = this;
                if (!self._pendingNavigationArgs || self._pendingNavigationArgs.uri !== args.uri)
                    self._isNavigating = false
            },
            _onViewRemoved: function(viewInfo) {
                var args = {viewInfo: viewInfo};
                this._processEvent("viewDisposing", args, args.viewInfo.model);
                this._disposeView(args.viewInfo);
                this._processEvent("viewDisposed", args, args.viewInfo.model)
            },
            _onNavigationItemRemoved: function(item) {
                var viewInfo = this._viewCache.removeView(item.key);
                if (viewInfo)
                    this._onViewRemoved(viewInfo)
            },
            _onViewReleased: function(viewInfo) {
                var args = {viewInfo: viewInfo};
                this._processEvent("viewHidden", args, args.viewInfo.model);
                if (!this._viewCache.hasView(viewInfo))
                    this._onViewRemoved(viewInfo)
            },
            _disposeView: function(viewInfo) {
                if (!viewInfo.model)
                    return;
                var commands = viewInfo.model.commands || [];
                $.each(commands, function(index, command) {
                    command._dispose()
                })
            },
            _acquireViewInfo: function(navigationItem) {
                var viewInfo = this._viewCache.getView(navigationItem.key);
                if (!viewInfo) {
                    viewInfo = this._createViewInfo(navigationItem.uri);
                    this._viewCache.setView(navigationItem.key, viewInfo)
                }
                return viewInfo
            },
            _processEvent: function(eventName, args, model) {
                this._callComponentMethod(eventName, args);
                if (this[eventName] && this[eventName].fire)
                    this[eventName].fire(args);
                var modelMethod = (model || {})[eventName];
                if (modelMethod)
                    modelMethod.call(model, args)
            },
            _createViewInfo: function(uri) {
                var routeData = this.router.parse(uri);
                var viewInfo = {
                        viewName: routeData.view,
                        routeData: routeData,
                        uri: uri,
                        canBack: this.canBack()
                    };
                return viewInfo
            },
            _createViewModel: function(viewInfo) {
                this._processEvent("beforeViewSetup", {viewInfo: viewInfo});
                viewInfo.model = viewInfo.model || this._callViewCodeBehind(viewInfo.routeData);
                this._processEvent("afterViewSetup", {viewInfo: viewInfo})
            },
            _createViewCommands: function(viewInfo) {
                viewInfo.commands = viewInfo.model.commands || [];
                if (viewInfo.canBack)
                    this._appendBackCommand(viewInfo)
            },
            _callViewCodeBehind: function(routeData) {
                var setupFunc = $.noop;
                if (routeData.view in this.namespace)
                    setupFunc = this.namespace[routeData.view];
                return setupFunc.call(this.namespace, routeData) || {}
            },
            _appendBackCommand: function(viewInfo) {
                var commands = viewInfo.commands;
                var toMergeTo = [new DX.framework.dxCommand({
                            id: "back",
                            title: BACK_COMMAND_TITLE,
                            behavior: "back",
                            action: "#_back",
                            icon: "arrowleft",
                            type: "back"
                        })];
                var result = DX.framework.utils.mergeCommands(toMergeTo, commands);
                commands.length = 0;
                commands.push.apply(commands, result)
            },
            _showView: function(viewInfo, direction) {
                var self = this;
                var eventArgs = {
                        viewInfo: viewInfo,
                        direction: direction
                    };
                self._processEvent("viewShowing", eventArgs, viewInfo.model);
                return self._showViewImpl(eventArgs.viewInfo, direction).done(function() {
                        self._processEvent("viewShown", eventArgs, viewInfo.model)
                    })
            },
            _highlightCurrentNavigationCommand: function(viewInfo) {
                var self = this,
                    selectedCommand,
                    currentUri = viewInfo.uri,
                    parsedUri = viewInfo.routeData,
                    currentNavigationItemId = viewInfo.model.currentNavigationItemId;
                $.each(this.navigation, function(index, command) {
                    if (command.option("id") === currentNavigationItemId) {
                        selectedCommand = command;
                        return false
                    }
                });
                if (!selectedCommand)
                    $.each(this.navigation, function(index, command) {
                        var commandUri = command.option("action");
                        if (typeof commandUri === "string") {
                            commandUri = commandUri.replace(/^#+/, "");
                            if (commandUri === currentUri || commandUri === self.navigationManager.rootUri()) {
                                selectedCommand = command;
                                return false
                            }
                            else {
                                var view = self.router.parse(commandUri).view;
                                if (view === parsedUri.view)
                                    selectedCommand = command
                            }
                        }
                    });
                $.each(this.navigation, function(index, command) {
                    command.option("highlighted", command === selectedCommand)
                })
            },
            _initViewLoadingState: DX.abstract,
            _setCurrentViewAsyncImpl: DX.abstract,
            navigate: function(uri, options) {
                var self = this;
                if ($.isPlainObject(uri)) {
                    uri = self.router.format(uri);
                    if (uri === false)
                        throw new Error("The passed object cannot be formatted into a uri string by router. An appropriate route should be registered.");
                }
                if (!self._inited)
                    self.init().done(function() {
                        self.restoreState();
                        self.navigate(uri, options)
                    });
                else
                    self.navigationManager.navigate(uri, options)
            },
            canBack: function() {
                return this.navigationManager.canBack()
            },
            back: function() {
                this.navigationManager.back()
            },
            saveState: function() {
                this.stateManager.saveState()
            },
            restoreState: function() {
                this.stateManager.restoreState()
            },
            clearState: function() {
                this.stateManager.clearState()
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.html.js */
    (function($, DX, undefined) {
        DX.framework.html = {layoutControllers: []}
    })(jQuery, DevExpress);
    /*! Module framework, file framework.widgetCommandAdapters.js */
    (function($, DX) {
        var adapters = DX.framework.html.commandToDXWidgetAdapters = {
                _updateItems: [],
                addCommandBase: function(widget, command, containerOptions, initialItemOptions, customizeItem) {
                    var itemOptions = $.extend(initialItemOptions, containerOptions, command.option());
                    var items = widget.option("items");
                    items.push(itemOptions);
                    var updateItem = function(name, newValue, oldValue) {
                            $.extend(itemOptions, command.option());
                            customizeItem(itemOptions, name, newValue, oldValue);
                            if (name !== "highlighted")
                                widget.option("items", items)
                        };
                    this._updateItems.push(updateItem);
                    updateItem();
                    command.optionChanged.add(updateItem);
                    widget.disposing.add(function() {
                        command.optionChanged.remove(updateItem)
                    })
                }
            };
        adapters.dxToolbar = {addCommand: function($container, command, containerOptions) {
                var toolbar = $container.data("dxToolbar"),
                    initialItemData = {command: command},
                    isMenu = containerOptions.menu || containerOptions.id === "menu";
                toolbar.option("itemClickAction", function(e) {
                    if (e.itemData.command)
                        e.itemData.command.execute()
                });
                function customizeOption(itemOptions) {
                    itemOptions.isMenu = isMenu;
                    if (isMenu)
                        itemOptions.text = resolveTextValue(command, containerOptions);
                    else {
                        var options = {
                                text: resolveTextValue(command, containerOptions),
                                disabled: command.option("disabled"),
                                icon: resolveIconValue(command, containerOptions, "icon"),
                                iconSrc: resolveIconValue(command, containerOptions, "iconSrc"),
                                type: resolveTypeValue(command, containerOptions)
                            };
                        itemOptions.options = options;
                        itemOptions.align = containerOptions.align || undefined;
                        initialItemData.widget = "button"
                    }
                }
                adapters.addCommandBase(toolbar, command, containerOptions, initialItemData, customizeOption);
                toolbar.option("visible", true)
            }};
        adapters.dxActionSheet = {addCommand: function($container, command, containerOptions) {
                var actionSheet = $container.data("dxActionSheet"),
                    initialItemData = {command: command};
                adapters.addCommandBase(actionSheet, command, containerOptions, initialItemData, function(itemOptions) {
                    itemOptions.text = resolveTextValue(command, containerOptions);
                    itemOptions.icon = resolveIconValue(command, containerOptions, "icon");
                    itemOptions.iconSrc = resolveIconValue(command, containerOptions, "iconSrc")
                })
            }};
        adapters.dxList = {addCommand: function($container, command, containerOptions) {
                var list = $container.data("dxList");
                adapters.addCommandBase(list, command, containerOptions, {}, function(itemOptions) {
                    itemOptions.title = resolveTextValue(command, containerOptions);
                    itemOptions.clickAction = function() {
                        if (!itemOptions.disabled)
                            command.execute()
                    };
                    itemOptions.icon = resolveIconValue(command, containerOptions, "icon");
                    itemOptions.iconSrc = resolveIconValue(command, containerOptions, "iconSrc")
                })
            }};
        adapters.dxNavBar = {addCommand: function($container, command, containerOptions) {
                var navbar = $container.data("dxNavBar");
                var initialItemData = {command: command};
                navbar.option("itemClickAction", function(e) {
                    e.itemData.command.execute()
                });
                var updateSelectedIndex = function() {
                        var items = navbar.option("items");
                        for (var i = 0, itemsCount = items.length; i < itemsCount; i++)
                            if (items[i].highlighted) {
                                navbar.option("selectedIndex", i);
                                break
                            }
                    };
                adapters.addCommandBase(navbar, command, containerOptions, initialItemData, function(itemOptions, name, newValue, oldValue) {
                    if (name === "highlighted") {
                        if (newValue)
                            updateSelectedIndex()
                    }
                    else {
                        itemOptions.text = resolveTextValue(command, containerOptions);
                        itemOptions.icon = resolveIconValue(command, containerOptions, "icon");
                        itemOptions.iconSrc = resolveIconValue(command, containerOptions, "iconSrc");
                        updateSelectedIndex()
                    }
                })
            }};
        adapters.dxPivot = {addCommand: function($container, command, containerOptions) {
                var pivot = $container.data("dxPivot");
                var initialItemData = {command: command};
                pivot.option("itemSelectAction", function(e) {
                    e.itemData.command.execute()
                });
                var updateSelectedIndex = function() {
                        var items = pivot.option("items") || [];
                        for (var i = 0, itemsCount = items.length; i < itemsCount; i++)
                            if (items[i].highlighted) {
                                pivot.option("selectedIndex", i);
                                break
                            }
                    };
                adapters.addCommandBase(pivot, command, containerOptions, initialItemData, function(itemOptions, name, newValue, oldValue) {
                    if (name === "highlighted") {
                        if (newValue)
                            updateSelectedIndex()
                    }
                    else {
                        itemOptions.title = resolveTextValue(command, containerOptions);
                        updateSelectedIndex()
                    }
                })
            }};
        adapters.dxSlideOut = {addCommand: function($container, command, containerOptions) {
                var slideOut = $container.data("dxSlideOut");
                var initialItemData = {command: command};
                slideOut.option("itemClickAction", function(e) {
                    e.itemData.command.execute()
                });
                var updateSelectedIndex = function() {
                        var items = slideOut.option("items") || [];
                        for (var i = 0, itemsCount = items.length; i < itemsCount; i++)
                            if (items[i].highlighted) {
                                slideOut.option("selectedIndex", i);
                                break
                            }
                    };
                adapters.addCommandBase(slideOut, command, containerOptions, initialItemData, function(itemOptions, name, newValue, oldValue) {
                    if (name === "highlighted") {
                        if (newValue)
                            updateSelectedIndex()
                    }
                    else {
                        itemOptions.title = resolveTextValue(command, containerOptions);
                        itemOptions.icon = resolveIconValue(command, containerOptions, "icon");
                        itemOptions.iconSrc = resolveIconValue(command, containerOptions, "iconSrc");
                        updateSelectedIndex()
                    }
                })
            }};
        var resolvePropertyValue = function(command, containerOptions, propertyName) {
                var defaultOption = containerOptions ? containerOptions[propertyName] : undefined;
                return command.option(propertyName) || defaultOption
            };
        var resolveTextValue = function(command, containerOptions) {
                var hasIcon = !!command.option("icon") || command.option("iconSrc"),
                    titleValue = resolvePropertyValue(command, containerOptions, "title");
                return containerOptions.showText || !hasIcon ? titleValue : ""
            };
        var resolveIconValue = function(command, containerOptions, propertyName) {
                var hasText = !!command.option("title"),
                    iconValue = resolvePropertyValue(command, containerOptions, propertyName);
                return containerOptions.showIcon || !hasText ? iconValue : undefined
            };
        var resolveTypeValue = function(command, containerOptions) {
                return resolvePropertyValue(command, containerOptions, "type")
            }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.commandManager.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            ui = DevExpress.ui;
        DX.framework.dxCommandContainer = ui.Component.inherit({
            ctor: function(element, options) {
                if ($.isPlainObject(element)) {
                    options = element;
                    element = $("<div />")
                }
                this.callBase(element, options)
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-command-container")
            }
        });
        ui.registerComponent("dxCommandContainer", DX.framework.dxCommandContainer);
        DX.framework.html.CommandManager = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.globalCommands = options.globalCommands || [];
                this.commandsToWidgetRegistry = [this._commandsToDXWidget];
                this.commandMapping = options.commandMapping || new DX.framework.CommandMapping
            },
            _commandsToDXWidget: function($container, commandInfos) {
                var componentNames = $container.data("dxComponents");
                var adapters = DX.framework.html.commandToDXWidgetAdapters;
                if (componentNames)
                    for (var index in componentNames) {
                        var widgetName = componentNames[index];
                        if (widgetName in adapters) {
                            var widget = $container.data(widgetName);
                            widget.beginUpdate();
                            $.each(commandInfos, function(index, commandInfo) {
                                adapters[widgetName].addCommand($container, commandInfo.command, commandInfo.options)
                            });
                            widget.endUpdate();
                            return true
                        }
                    }
                return false
            },
            _findCommands: function($view) {
                var result = $.map($view.children(".dx-command"), function(element) {
                        return $(element).dxCommand("instance")
                    });
                return result
            },
            _findCommandContainers: function($markup) {
                var result = $.map($markup.find(".dx-command-container"), function(element) {
                        return $(element).dxCommandContainer("instance")
                    });
                return result
            },
            _arrangeCommandsToContainers: function(commands, containers) {
                var self = this,
                    commandHash = {},
                    commandIds = [];
                $.each(commands, function(i, command) {
                    var id = command.option("id");
                    commandIds.push(id);
                    commandHash[id] = command
                });
                self.commandMapping.checkCommandsExist(commandIds);
                $.each(containers, function(k, container) {
                    var commandInfos = [];
                    $.each(commandHash, function(id, command) {
                        var commandId = id;
                        var commandOptions = self.commandMapping.getCommandMappingForContainer(commandId, container.option("id"));
                        if (commandOptions)
                            commandInfos.push({
                                command: command,
                                options: commandOptions
                            })
                    });
                    self._attachCommandsToContainer(container._element(), commandInfos)
                })
            },
            _attachCommandsToContainer: function($container, commandInfos) {
                var handled = false;
                $.each(this.commandsToWidgetRegistry, function(index, commandsToWidget) {
                    handled = commandsToWidget($container, commandInfos);
                    return !handled
                });
                if (!handled)
                    this._defaultCommandsToContainer($container, commandInfos)
            },
            _defaultCommandsToContainer: function($container, commandInfos) {
                $.each(commandInfos, function(index, commandInfo) {
                    var command = commandInfo.command,
                        $source = command._element();
                    if ($source) {
                        $container.append($source);
                        $source.on("dxclick", function() {
                            command.execute()
                        })
                    }
                })
            },
            _collectCommands: function($markup, extraCommands) {
                var markupCommands = this._findCommands($markup);
                var viewRelatedCommands = DX.framework.utils.mergeCommands(extraCommands, markupCommands);
                var allCommands = DX.framework.utils.mergeCommands(this.globalCommands, viewRelatedCommands);
                return allCommands
            },
            layoutCommands: function($markup, extraCommands) {
                extraCommands = extraCommands || [];
                var allCommands = this._collectCommands($markup, extraCommands);
                var commandContainers = this._findCommandContainers($markup);
                this._arrangeCommandsToContainers(allCommands, commandContainers)
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.layoutController.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var HIDDEN_BAG_ID = "__hidden-bag";
        var TRANSITION_SELECTOR = ".dx-transition:not(.dx-transition .dx-transition)";
        var transitionSelector = function(transitionName) {
                return ".dx-transition-" + transitionName
            };
        DX.framework.html.DefaultLayoutController = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._layoutTemplateName = options.layoutTemplateName || "";
                this._disableViewLoadingState = options.disableViewLoadingState
            },
            init: function(options) {
                options = options || {};
                this._$viewPort = options.$viewPort || $("body");
                this._$hiddenBag = options.$hiddenBag || $(document.getElementById(HIDDEN_BAG_ID));
                this.viewReleased = $.Callbacks();
                this.viewRendered = $.Callbacks();
                this._navigationManager = options.navigationManager;
                this._commandManager = options.commandManager || new DX.framework.html.CommandManager({commandMapping: options.commandMapping || options.app.commandMapping});
                this._viewEngine = options.viewEngine || options.app.viewEngine;
                this._prepareTemplates(options.app.viewEngine, options.navigation || options.app.navigation)
            },
            activate: function() {
                this._justActivated = true;
                this._visibleViews = {};
                this._getRootElement().appendTo(this._$viewPort).show()
            },
            _hidePreviousView: function(currentViewInfo) {
                var self = this;
                $.each(this._visibleViews, function(index, viewInfo) {
                    var previousViewInfo = self._getPreviousViewInfo(currentViewInfo || viewInfo);
                    if (previousViewInfo)
                        self._hideView(previousViewInfo)
                })
            },
            deactivate: function() {
                var self = this;
                $.each(this._visibleViews, function(index, viewInfo) {
                    self._hideView(viewInfo)
                });
                this._moveToHiddenBag(this._getRootElement())
            },
            _getPreviousViewInfo: function(viewInfo) {
                return this._visibleViews[viewInfo.routeData.placeholder || "default"]
            },
            _prepareTemplates: function(viewEngine, navigationCommands) {
                var self = this;
                var $layoutTemplate = self._viewEngine.findLayoutTemplate(this._getLayoutTemplateName()).removeClass("dx-hidden");
                self._$layoutTemplate = $layoutTemplate;
                self._$mainLayout = self._createEmptyLayout().show();
                self._createNavigation(navigationCommands);
                self._blankViewInfo = self._createBlankViewInfo($layoutTemplate)
            },
            _createNavigation: function(navigationCommands) {
                this._renderCommands(this._$mainLayout, navigationCommands)
            },
            _getRootElement: function() {
                return this._$mainLayout
            },
            _getViewFrame: function(viewInfo) {
                return this._$mainLayout
            },
            _getLayoutTemplateName: function() {
                return this._layoutTemplateName
            },
            _createBlankViewInfo: function($layoutTemplate) {
                var self = this;
                var $blankView = $layoutTemplate.clone().addClass("blank-view").appendTo(self._$hiddenBag);
                self._viewEngine._createComponents($blankView);
                var model = {title: ko.observable()};
                self._viewEngine._applyTemplate($blankView, model);
                var result = {
                        model: model,
                        renderResult: {$markup: $blankView},
                        isBlankView: true
                    };
                self._appendViewToLayout(result);
                return result
            },
            _createViewLayoutTemplate: function() {
                var self = this;
                var $viewLayoutTemplate = self._$layoutTemplate.clone().appendTo(self._$hiddenBag);
                self._viewEngine._createComponents($viewLayoutTemplate);
                return $viewLayoutTemplate
            },
            _createEmptyLayout: function() {
                var self = this;
                var $result = self._$layoutTemplate.clone().appendTo(self._$hiddenBag);
                self._viewEngine._createComponents($result);
                self._removeTransitionContent($result);
                return $result
            },
            _removeTransitionContent: function($markup) {
                var $transitionElements = this._getTransitionElements($markup);
                $transitionElements.children().remove()
            },
            _getTransitionElements: function($markup) {
                return $markup.find(TRANSITION_SELECTOR)
            },
            setViewLoadingState: function(viewInfo, direction) {
                var self = this;
                if (self._disableViewLoadingState)
                    return $.Deferred().resolve().promise();
                var blankViewInfo = $.extend({}, viewInfo, self._blankViewInfo);
                self._blankViewInfo.model.title(viewInfo.viewTemplateInfo.title || "Loading...");
                return self._showViewImpl(blankViewInfo, direction)
            },
            showView: function(viewInfo, direction) {
                var self = this;
                var previousViewInfo = self._getPreviousViewInfo(viewInfo);
                if (previousViewInfo && previousViewInfo.isBlankView)
                    direction = "none";
                self._ensureViewRendered(viewInfo);
                return this._showViewImpl(viewInfo, direction).done(function() {
                        self._onViewShown(viewInfo)
                    })
            },
            _prepareViewTemplate: function($viewTemplate, viewInfo) {
                this._viewEngine._createComponents($viewTemplate)
            },
            _renderView: function($viewTemplate, viewInfo) {
                var self = this;
                var $layout = this._createViewLayoutTemplate();
                var viewItems = $viewTemplate.children();
                this._getTransitionElements($layout).each(function(i, item) {
                    self._viewEngine._applyTemplate($(item), viewInfo.model)
                });
                this._viewEngine._applyLayoutCore($viewTemplate, $layout);
                viewItems.each(function(i, item) {
                    self._viewEngine._applyTemplate($(item), viewInfo.model)
                });
                return $layout
            },
            _renderCommands: function($markup, commands) {
                var commandContainers = this._findCommandContainers($markup);
                this._commandManager._arrangeCommandsToContainers(commands, commandContainers)
            },
            _applyViewCommands: function($markup, viewInfo) {
                var viewCommands = this._commandManager._findCommands($markup);
                viewInfo.commands = DX.framework.utils.mergeCommands(viewInfo.commands, viewCommands);
                this._renderCommands($markup, viewInfo.commands)
            },
            _findCommandContainers: function($markup) {
                return this._viewEngine._createComponents($markup, ["dxCommandContainer"])
            },
            _ensureViewRendered: function(viewInfo) {
                var self = this;
                if (!viewInfo.renderResult) {
                    var $viewTemplate = viewInfo.$viewTemplate || this._viewEngine.findViewTemplate(viewInfo.viewName);
                    this._prepareViewTemplate($viewTemplate, viewInfo);
                    var $markup = this._renderView($viewTemplate, viewInfo);
                    this._applyViewCommands($markup, viewInfo);
                    viewInfo.renderResult = {$markup: $markup};
                    self._onRenderComplete(viewInfo);
                    self.viewRendered.fire(viewInfo);
                    self._appendViewToLayout(viewInfo)
                }
            },
            _appendViewToLayout: function(viewInfo) {
                var self = this,
                    $viewFrame = self._getViewFrame(viewInfo),
                    $markup = viewInfo.renderResult.$markup,
                    $transitionContentElements = $();
                $.each(self._getTransitionElements($viewFrame), function(index, transitionElement) {
                    var $transition = $(transitionElement),
                        $viewElement = $markup.find(transitionSelector($transition.data("dx-transition-name"))).children();
                    self._showViewElements($viewElement);
                    $transition.append($viewElement);
                    $transitionContentElements = $transitionContentElements.add($viewElement)
                });
                viewInfo.renderResult.$transitionContentElements = $transitionContentElements
            },
            _onRenderComplete: function(){},
            _onViewShown: function(viewInfo){},
            _doTransition: function(viewInfo, direction) {
                var self = this,
                    deferred = $.Deferred();
                var transitions = $.map(viewInfo.renderResult.$transitionContentElements, function(transitionContent) {
                        var $transitionContent = $(transitionContent),
                            $transition = $transitionContent.parent(),
                            transitionType = self._disableTransitions ? "none" : $transition.data("dx-transition-type");
                        return {
                                destination: $transition,
                                source: $transitionContent,
                                type: transitionType || "none",
                                direction: direction || "none"
                            }
                    });
                self._executeTransitions(transitions).done(function() {
                    deferred.resolve()
                });
                return deferred.promise()
            },
            _hideView: function(viewInfo) {
                this._hideViewElements(viewInfo.renderResult.$transitionContentElements)
            },
            _notifyViewRendered: function(viewInfo) {
                var self = this;
                this._$viewPort.trigger("dx-restore-view");
                this._$viewPort.one("dx-restore-view", function() {
                    self._hideView(viewInfo)
                })
            },
            _showViewImpl: function(viewInfo, direction) {
                var self = this,
                    deferred = $.Deferred();
                if (this._justActivated) {
                    this._justActivated = false;
                    direction = "none"
                }
                var previousViewInfo = self._getPreviousViewInfo(viewInfo) || {};
                var previousLayoutController = previousViewInfo.layoutController;
                if (viewInfo.layoutController === previousLayoutController || !previousLayoutController)
                    self._doTransition(viewInfo, direction).done(function() {
                        deferred.resolve()
                    });
                else
                    deferred.resolve();
                deferred.done(function() {
                    self._hidePreviousView(viewInfo);
                    self._changeView(viewInfo)
                });
                return deferred.promise()
            },
            _releaseView: function(viewInfo) {
                this.viewReleased.fireWith(this, [viewInfo])
            },
            _getViewPortElement: function() {
                return this._$viewPort
            },
            _getHiddenBagElement: function() {
                return this._$hiddenBag
            },
            _changeView: function(viewInfo) {
                var $markup = viewInfo.renderResult.$markup;
                this._visibleViews[viewInfo.routeData.placeholder || "default"] = viewInfo
            },
            _hideViewElements: function($elements) {
                this._patchIDs($elements);
                $elements.removeClass("dx-active-view").addClass("dx-inactive-view")
            },
            _showViewElements: function($elements) {
                this._unpatchIDs($elements);
                $elements.removeClass("dx-inactive-view").addClass("dx-active-view")
            },
            _executeTransitions: function(transitions) {
                var self = this;
                var animatedTransitions = $.map(transitions, function(transitionOptions) {
                        if (transitionOptions.source.children().length)
                            return DX.framework.html.TransitionExecutor.create(transitionOptions.destination, transitionOptions)
                    });
                var animatedDeferreds = $.map(animatedTransitions, function(transition) {
                        self._showViewElements(transition.options.source.addClass("dx-transition-source"));
                        return transition.exec()
                    });
                var result = $.when.apply($, animatedDeferreds).done(function() {
                        $.each(animatedTransitions, function(index, transition) {
                            transition.finalize();
                            self._hideViewElements(transition.options.source.parent().find(".dx-active-view:not(.dx-transition-source)"));
                            transition.options.source.removeClass("dx-transition-source")
                        })
                    });
                return result
            },
            _patchIDs: function($markup) {
                this._processIDs($markup, function(id) {
                    var result = id;
                    if (id.indexOf(HIDDEN_BAG_ID) === -1)
                        result = HIDDEN_BAG_ID + "-" + id;
                    return result
                })
            },
            _unpatchIDs: function($markup) {
                this._processIDs($markup, function(id) {
                    var result = id;
                    if (id.indexOf(HIDDEN_BAG_ID) === 0)
                        result = id.substr(HIDDEN_BAG_ID.length + 1);
                    return result
                })
            },
            _processIDs: function($markup, process) {
                var elementsWithIds = $markup.find("[id]");
                $.each(elementsWithIds, function(index, element) {
                    var $el = $(element),
                        id = $el.attr("id");
                    $el.attr("id", process(id))
                })
            },
            _moveToViewPort: function($items) {
                this._unpatchIDs($items);
                $items.appendTo(this._getViewPortElement())
            },
            _moveToHiddenBag: function($items) {
                this._patchIDs($items);
                $items.appendTo(this._getHiddenBagElement())
            }
        });
        DX.framework.html.layoutControllers.push({controller: new DX.framework.html.DefaultLayoutController});
        DX.framework.html.OneFrameLayoutController = DX.framework.html.DefaultLayoutController.inherit({})
    })(jQuery, DevExpress);
    /*! Module framework, file framework.templateEngine.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        DX.framework.html.KnockoutJSTemplateEngine = Class.inherit({applyTemplate: function(template, model) {
                ko.applyBindings(model, $(template).get(0))
            }})
    })(jQuery, DevExpress);
    /*! Module framework, file framework.viewEngine.js */
    (function($, DX, undefined) {
        var isEqual = function(a, b) {
                for (var p in a)
                    switch (typeof a[p]) {
                        case'object':
                            if (!isEqual(a[p], b[p]))
                                return false;
                            break;
                        default:
                            if (a[p] != b[p])
                                return false
                    }
                for (var p in b)
                    if (!a || typeof a[p] == 'undefined')
                        return false;
                return true
            };
        var Class = DX.Class;
        var ui = DX.ui;
        var _VIEW_ROLE = "dxView",
            _LAYOUT_ROLE = "dxLayout";
        DX.framework[_VIEW_ROLE] = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        name: null,
                        title: null,
                        layout: null
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-view")
            }
        });
        ui.registerComponent(_VIEW_ROLE, DX.framework.dxView);
        DX.framework[_LAYOUT_ROLE] = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        name: null,
                        controller: "default"
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-layout")
            }
        });
        ui.registerComponent(_LAYOUT_ROLE, DX.framework.dxLayout);
        DX.framework.dxViewPlaceholder = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {viewName: null})
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-view-placeholder")
            }
        });
        ui.registerComponent("dxViewPlaceholder", DX.framework.dxViewPlaceholder);
        var setupTransitionElement = function($element, transitionType, transitionName, contentCssPosition) {
                if (contentCssPosition === "absolute")
                    $element.addClass("dx-transition-absolute");
                else
                    $element.addClass("dx-transition-static");
                $element.addClass("dx-transition").addClass("dx-transition-" + transitionName);
                $element.data("dx-transition-type", transitionType);
                $element.data("dx-transition-name", transitionName)
            };
        var setupTransitionInnerElement = function($element) {
                $element.addClass("dx-transition-inner-wrapper")
            };
        DX.framework.dxTransition = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        name: null,
                        type: "slide"
                    })
            },
            _render: function() {
                this.callBase();
                var element = this._element();
                setupTransitionElement(element, this.option("type"), this.option("name"), "absolute");
                element.wrapInner("<div/>");
                setupTransitionInnerElement(element.children())
            }
        });
        ui.registerComponent("dxTransition", DX.framework.dxTransition);
        DX.framework.dxContentPlaceholder = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {
                        name: null,
                        transition: "none",
                        contentCssPosition: "absolute"
                    })
            },
            _render: function() {
                this.callBase();
                this._element().addClass("dx-content-placeholder").addClass("dx-content-placeholder-" + this.option("name"));
                setupTransitionElement(this._element(), this.option("transition"), this.option("name"), this.option("contentCssPosition"))
            }
        });
        ui.registerComponent("dxContentPlaceholder", DX.framework.dxContentPlaceholder);
        DX.framework.dxContent = ui.Component.inherit({
            _defaultOptions: function() {
                return $.extend(this.callBase(), {targetPlaceholder: null})
            },
            _optionChanged: function(name) {
                this._refresh()
            },
            _clean: function() {
                this.callBase();
                this._element().removeClass(this._currentClass)
            },
            _render: function() {
                this.callBase();
                var element = this._element();
                element.addClass("dx-content");
                this._currentClass = "dx-content-" + this.option("targetPlaceholder");
                element.addClass(this._currentClass);
                setupTransitionInnerElement(element)
            }
        });
        ui.registerComponent("dxContent", DX.framework.dxContent);
        DX.framework.html.ViewEngine = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.$root = options.$root;
                this.device = options.device || {};
                this.templateEngine = options.templateEngine;
                this.dataOptionsAttributeName = options.dataOptionsAttributeName || "data-options";
                this._templateMap = {};
                this._pendingViewContainer = null;
                this.viewSelecting = $.Callbacks();
                this.modelFromViewDataExtended = $.Callbacks();
                this.layoutSelecting = $.Callbacks();
                this.layoutApplying = $.Callbacks();
                this.layoutApplied = $.Callbacks()
            },
            init: function() {
                var self = this;
                this._initDefaultLayout();
                return this._loadTemplates().done(function() {
                        $.each(self._templateMap, function(name, templates) {
                            $.each(templates, function(role, template) {
                                self._applyPartialViews(template._element())
                            })
                        })
                    })
            },
            _fitsCurrentDevice: function(component) {
                var self = this,
                    options = component.option(),
                    device = self.device,
                    result = true;
                $.each(options, function(paramName) {
                    var value = options[paramName];
                    if (value !== device[paramName] && device[paramName] !== undefined) {
                        result = false;
                        return false
                    }
                });
                return result
            },
            _findComponent: function(name, role) {
                return (this._templateMap[name] || {})[role]
            },
            _findTemplate: function(name, role) {
                var self = this,
                    component = self._findComponent(name, role);
                if (!component)
                    throw new Error("Error 404: Template not found. role:  " + role + ", name: " + name);
                var $template = component._element(),
                    $result = $template.clone();
                this._createComponents($result, [role]);
                return $result
            },
            findViewTemplate: function(viewName) {
                var findViewEventArgs = {viewName: viewName};
                this.viewSelecting.fire(findViewEventArgs);
                return findViewEventArgs.view ? $(findViewEventArgs.view) : this._findTemplate(viewName, _VIEW_ROLE, true)
            },
            _extendModelFromViewData: function($view, model) {
                DX.utils.extendFromObject(model, $view.data(_VIEW_ROLE).option());
                this.modelFromViewDataExtended.fire({
                    view: $view,
                    model: model
                })
            },
            _createComponents: function($markup, types) {
                var self = this;
                var result = [];
                $markup.find("*").addBack().filter("[" + self.dataOptionsAttributeName + "]").each(function(index, element) {
                    var $element = $(element),
                        optionsString = $element.attr(self.dataOptionsAttributeName),
                        options;
                    try {
                        options = new Function("return {" + optionsString + "}")()
                    }
                    catch(ex) {
                        throw new Error(DX.utils.stringFormat("Unable to parse options.\nMessage: {0};\nOptions value: {1}", ex, optionsString));
                    }
                    for (var componentName in options)
                        if (!types || $.inArray(componentName, types) > -1)
                            if ($element[componentName]) {
                                $element[componentName](options[componentName]);
                                result.push($element[componentName]("instance"))
                            }
                });
                return result
            },
            _loadTemplatesFromMarkup: function($markup) {
                if ($markup.find("[data-dx-role]").length)
                    throw Error(Globalize.localize("View templates should be updated according to the 13.1 changes. Go to http://dxpr.es/15ikrJA for more details"));
                var self = this;
                DX.localization.localizeNode($markup);
                var components = self._createComponents($markup, [_VIEW_ROLE, _LAYOUT_ROLE]);
                $.each(components, function(index, component) {
                    component._element().addClass("dx-hidden");
                    if (self._fitsCurrentDevice(component))
                        self._registerTemplateComponent(component)
                });
                $markup.appendTo(this.$root)
            },
            _registerTemplateComponent: function(component) {
                var self = this,
                    $element = component._element(),
                    role = component.NAME,
                    options = component.option(),
                    templateName = options.name,
                    components = self._templateMap[templateName] || {};
                $.each(components, function(role, itemComponent) {
                    if (component && isEqual(options, itemComponent.option()))
                        throw new Error(DX.utils.stringFormat("Several markup templates with the same parameters are found.\r\nDetails: {0}", $element.attr("data-options")));
                });
                components[role] = component;
                self._templateMap[templateName] = components
            },
            getViewTemplateInfo: function(viewName) {
                return this._templateMap[viewName][_VIEW_ROLE].option()
            },
            _applyPartialViews: function($render) {
                var self = this;
                this._createComponents($render, ["dxViewPlaceholder"]);
                $.each($render.find(".dx-view-placeholder"), function() {
                    var $partialPlaceholder = $(this);
                    var viewName = $partialPlaceholder.data("dxViewPlaceholder").option("viewName");
                    var $view = self._findTemplate(viewName, _VIEW_ROLE);
                    self._applyPartialViews($view);
                    $partialPlaceholder.append($view);
                    $view.show()
                })
            },
            _ajaxImpl: function() {
                return $.ajax.apply($, arguments)
            },
            _loadTemplates: function() {
                var self = this;
                this._templateMap = {};
                this._loadTemplatesFromMarkup(this.$root.children());
                var tasks = [];
                var winPhonePrefix;
                if (location.protocol.indexOf("wmapp") >= 0)
                    winPhonePrefix = location.protocol + "www/";
                $("head").find("link[rel='dx-template']").each(function(index, link) {
                    var url = $(link).attr("href");
                    var task = self._ajaxImpl({
                            url: (winPhonePrefix || "") + url,
                            isLocal: winPhonePrefix ? true : undefined,
                            success: function(data) {
                                self._loadTemplatesFromMarkup(DX.utils.createMarkupFromString(data))
                            },
                            dataType: "html"
                        });
                    tasks.push(task)
                });
                return $.when.apply($, tasks)
            },
            _extendModelFormViewTemplate: function($viewTemplate, model) {
                this._extendModelFromViewData($viewTemplate, model)
            },
            _ensureTemplates: function(viewInfo) {
                this._ensureViewTemplate(viewInfo)
            },
            _ensureViewTemplate: function(viewInfo) {
                viewInfo.$viewTemplate = viewInfo.$viewTemplate || this.findViewTemplate(viewInfo.viewName);
                return viewInfo.$viewTemplate
            },
            _wrapViewDefaultContent: function($viewTemplate) {
                $viewTemplate.wrapInner("<div class=\"dx-full-height\"></div>");
                $viewTemplate.children().eq(0).dxContent({targetPlaceholder: 'content'})
            },
            _initDefaultLayout: function() {
                this._$defaultLayout = $("<div class=\"dx-full-height\" data-options=\"dxLayout : { name: 'default', controller: 'default' } \"> \
                <div class=\"dx-full-height\" data-options=\"dxContentPlaceholder : { name: 'content' } \" ></div> \
            </div>")
            },
            _getDefaultLayout: function() {
                var $result = this._$defaultLayout.clone();
                this._createComponents($result);
                return $result
            },
            findLayoutTemplate: function(layoutName) {
                if (!layoutName)
                    return this._getDefaultLayout();
                var findLayoutEventArgs = {layoutName: layoutName};
                this.layoutSelecting.fire(findLayoutEventArgs);
                return findLayoutEventArgs.layout ? $(findLayoutEventArgs.layout) : this._findTemplate(layoutName, _LAYOUT_ROLE)
            },
            _applyTemplate: function($markup, model) {
                var self = this;
                $markup.each(function(i, element) {
                    self.templateEngine.applyTemplate(element, model)
                })
            },
            _applyLayoutCore: function($view, $layout) {
                if ($layout === undefined || $layout.length === 0)
                    $layout = this._getDefaultLayout();
                if ($view.children(".dx-content").length === 0)
                    this._wrapViewDefaultContent($view);
                var $toMerge = $().add($layout).add($view);
                var $placeholderContents = $toMerge.find(".dx-content");
                $.each($placeholderContents, function() {
                    var $placeholderContent = $(this);
                    var placeholderId = $placeholderContent.data("dxContent").option("targetPlaceholder");
                    var $placeholder = $toMerge.find(".dx-content-placeholder-" + placeholderId);
                    $placeholder.empty();
                    $placeholder.append($placeholderContent)
                });
                $view.children().hide().appendTo($layout);
                return $layout
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.htmlApplication.js */
    (function($, DX, undefined) {
        var frameworkNS = DX.framework,
            htmlNS = frameworkNS.html;
        var VIEW_PORT_CLASSNAME = "dx-viewport";
        var HIDDEN_BAG_ID = "__hidden-bag";
        var HIDDEN_BAG_CLASSNAME = "dx-hidden-bag";
        htmlNS.HtmlApplication = frameworkNS.Application.inherit({
            _getHiddenBag: function($root, $viewPort) {
                var $hiddenBag = $("#" + HIDDEN_BAG_ID);
                if (!$hiddenBag.length)
                    $hiddenBag = $("<div/>").addClass(HIDDEN_BAG_CLASSNAME).attr("id", HIDDEN_BAG_ID).appendTo($root);
                $hiddenBag.addClass(($viewPort.attr("class") || "").replace(VIEW_PORT_CLASSNAME, ""));
                return $hiddenBag
            },
            ctor: function(options) {
                options = options || {};
                this.callBase(options);
                this._initViewPort(options.viewPort);
                this.device = options.device || DX.devices.current();
                this._defaultLayout = options.defaultLayout || "default";
                this._$root = $(options.rootNode || document.body);
                this._$viewPort = $("." + VIEW_PORT_CLASSNAME);
                if (!this._$viewPort.length)
                    this._$viewPort = $("<div/>").addClass(VIEW_PORT_CLASSNAME).appendTo(this._$root);
                this._$hiddenBag = this._getHiddenBag(this._$root, this._$viewPort);
                this.viewEngine = options.viewEngine || new htmlNS.ViewEngine({
                    $root: this._$root,
                    device: this.device,
                    templateEngine: options.templateEngine || new htmlNS.KnockoutJSTemplateEngine({navigationManager: this.navigationManager})
                });
                this._layoutControllers = options.layoutControllers || htmlNS.layoutControllers;
                this._availableLayoutControllers = [];
                this.components.push(this.viewEngine);
                this.viewRendered = $.Callbacks();
                this._attachCssClasses();
                this._$hiddenBag.addClass(this._$viewPort.attr("class").replace(VIEW_PORT_CLASSNAME, ""))
            },
            _showViewImpl: function(viewInfo, direction) {
                this._activateLayoutController(viewInfo.layoutController);
                return this._activeLayoutController.showView(viewInfo, direction)
            },
            _setViewLoadingState: function(viewInfo, direction) {
                this._activateLayoutController(viewInfo.layoutController);
                return this._activeLayoutController.setViewLoadingState(viewInfo, direction)
            },
            _resolveLayoutController: function(viewInfo) {
                var args = {
                        viewInfo: viewInfo,
                        layoutController: null
                    };
                this._processEvent("resolveLayoutController", args, viewInfo.model);
                var result = args.layoutController || this._resolveLayoutControllerImpl(viewInfo);
                if (result === undefined)
                    throw Error("The layout controller not found. Make sure you have a corresponding *.js reference in your main *.html file");
                return result
            },
            _resolveLayoutControllerImpl: function(viewInfo) {
                var target = $.extend({
                        root: !viewInfo.canBack,
                        name: viewInfo.viewTemplateInfo.layout || this._defaultLayout
                    }, DX.devices.current());
                return DX.utils.findBestMatch(target, this._availableLayoutControllers).controller
            },
            _activateLayoutController: function(layoutController) {
                var self = this;
                if (self._activeLayoutController !== layoutController) {
                    if (self._activeLayoutController)
                        self._activeLayoutController.deactivate();
                    layoutController.activate();
                    self._activeLayoutController = layoutController
                }
            },
            init: function() {
                var self = this,
                    result = this.callBase();
                result.done(function() {
                    self._initLayoutControllers()
                });
                return result
            },
            _disposeView: function(viewInfo) {
                if (viewInfo.renderResult) {
                    viewInfo.renderResult.$markup.remove();
                    delete viewInfo.renderResult
                }
                this.callBase(viewInfo)
            },
            viewPort: function() {
                return this._$viewPort
            },
            _initViewPort: function(options) {
                options = options || {};
                if (DX.devices.current().platform === "desktop")
                    options = $.extend({disabled: true}, options);
                if (!options.disabled)
                    DX.ui.initViewport(options)
            },
            _getThemeClasses: function(device) {
                var platformToThemeMap = {
                        ios: "dx-theme-ios dx-theme-ios-typography",
                        android: "dx-theme-android dx-theme-android-typography",
                        desktop: "dx-theme-desktop dx-theme-desktop-typography",
                        win8: "dx-theme-win8 dx-theme-win8-typography",
                        win8phone: "dx-theme-win8 dx-theme-win8-typography",
                        tizen: "dx-theme-tizen dx-theme-tizen-typography",
                        generic: "dx-theme-generic dx-theme-generic-typography"
                    };
                return platformToThemeMap[device.platform]
            },
            _createViewInfo: function(uri) {
                var viewInfo = this.callBase(uri);
                viewInfo.viewTemplateInfo = this.viewEngine.getViewTemplateInfo(viewInfo.viewName) || {};
                viewInfo.layoutController = this._resolveLayoutController(viewInfo);
                return viewInfo
            },
            _createViewModel: function(viewInfo) {
                this.callBase(viewInfo);
                viewInfo.model = $.extend({}, viewInfo.viewTemplateInfo, viewInfo.model)
            },
            _checklayoutControllersRegistration: function(controllers) {
                var result = [];
                for (var oldControllerName in controllers)
                    if (!controllers[oldControllerName].controller)
                        result.push(oldControllerName);
                if (result.length !== 0)
                    throw new Error("A deprecated way is used for the registration of the following layout controllers: '" + result.join("' ,'") + "'.\r\nFor details, read the http://dxpr.es/1bTjfj1");
            },
            _initLayoutControllers: function() {
                var self = this;
                self._checklayoutControllersRegistration(self._layoutControllers);
                $.each(self._layoutControllers, function(index, controllerInfo) {
                    var controller = controllerInfo.controller;
                    if (DX.utils.findBestMatch(DX.devices.current(), [controllerInfo])) {
                        self._availableLayoutControllers.push(controllerInfo);
                        if (controller.init)
                            controller.init({
                                app: self,
                                $viewPort: self._$viewPort,
                                $hiddenBag: self._$hiddenBag,
                                navigationManager: self.navigationManager,
                                commandManager: self.commandManager
                            });
                        if (controller.viewReleased)
                            controller.viewReleased.add(function(viewInfo) {
                                self._onViewReleased(viewInfo)
                            });
                        if (controller.viewRendered)
                            controller.viewRendered.add(function(viewInfo) {
                                self._processEvent("viewRendered", viewInfo, viewInfo.model)
                            })
                    }
                })
            },
            _attachCssClasses: function() {
                DX.devices.attachCss(this._$viewPort);
                this._$viewPort.addClass(this._getColorSchemeClass())
            },
            _getColorSchemeClass: function() {
                var $indicator = $("<div>").addClass("dx-color-scheme").appendTo(this._$viewPort),
                    colorSchemeName = $indicator.css("font-family").replace(/^['"]|['"]$/g, "");
                $indicator.remove();
                if (!colorSchemeName || colorSchemeName === "#") {
                    DX.utils.logger.info("Color scheme name is undefined");
                    return
                }
                return "dx-color-scheme-" + colorSchemeName
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.transitionExecutor.js */
    (function($, DX) {
        $.fn.extend({unwrapInner: function(selector) {
                return this.each(function() {
                        var t = this,
                            c = $(t).children(selector);
                        c.each(function() {
                            var e = $(this);
                            e.contents().appendTo(t);
                            e.remove()
                        })
                    })
            }});
        var TRANSITION_DURATION = 400;
        var TransitionExecutor = DX.Class.inherit({
                ctor: function(container, options) {
                    this.container = container;
                    this.options = options
                },
                exec: function() {
                    var self = this,
                        options = self.options;
                    var $source = options.source,
                        $destination = options.destination;
                    var $sourceAbsoluteWrapper = $source,
                        $destinationRelativeWrapper = $destination,
                        $destinationAbsoluteWrapper = self._getTransitionInnerElement($destination);
                    this._finalize = function(){};
                    return self._animate($.extend({}, options, {
                            source: $sourceAbsoluteWrapper,
                            destination: $destinationAbsoluteWrapper
                        }))
                },
                finalize: function() {
                    if (!this._finalize)
                        throw Error("The \"exec\" method should be called before the \"finalize\" one");
                    this._finalize()
                },
                _getTransitionInnerElement: function($transitionElement) {
                    return $transitionElement.children(".dx-active-view:not(.dx-transition-source)")
                },
                _animate: function() {
                    return (new $.Deferred).resolve().promise()
                }
            });
        var NoneTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    var $source = options.source,
                        $destination = options.destination;
                    var containerWidth = this.container.width();
                    DX.fx.animate($source, {
                        type: "slide",
                        from: {left: 0},
                        to: {left: 0},
                        duration: 0
                    });
                    DX.fx.animate($destination, {
                        type: "slide",
                        from: {left: -containerWidth},
                        to: {left: -containerWidth},
                        duration: 0
                    });
                    return $.Deferred().resolve().promise()
                }});
        var SlideTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    if (options.direction === "none") {
                        alert("none");
                        return $.Deferred().resolve().promise()
                    }
                    var $source = options.source,
                        $destination = options.destination;
                    var containerWidth = this.container.width(),
                        destinationLeft = $destination.position().left;
                    if (options.direction === "backward")
                        containerWidth = -containerWidth;
                    var promiseSource = DX.fx.animate($source, {
                            type: "slide",
                            from: {left: containerWidth},
                            to: {left: 0},
                            duration: TRANSITION_DURATION
                        });
                    var promiseDestination = DX.fx.animate($destination, {
                            type: "slide",
                            from: {left: 0},
                            to: {left: -containerWidth},
                            duration: TRANSITION_DURATION
                        });
                    return $.when(promiseDestination, promiseSource)
                }});
        var OverflowTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    var $source = options.source,
                        $destination = options.destination,
                        destinationTop = $destination.position().top,
                        destinationLeft = $destination.position().left,
                        containerWidth = this.container.width();
                    if (options.direction === "backward")
                        containerWidth = -containerWidth;
                    var animations = [];
                    if (options.direction === "forward")
                        animations.push(DX.fx.animate($source, {
                            type: "slide",
                            from: {
                                top: destinationTop,
                                left: containerWidth + destinationLeft
                            },
                            to: {left: destinationLeft},
                            duration: TRANSITION_DURATION
                        }));
                    else {
                        animations.push(DX.fx.animate($source, {
                            type: "slide",
                            from: {
                                left: destinationLeft,
                                "z-index": 1
                            },
                            to: {left: destinationLeft},
                            duration: TRANSITION_DURATION
                        }));
                        animations.push(DX.fx.animate($destination, {
                            type: "slide",
                            from: {"z-index": 2},
                            to: {left: destinationLeft - containerWidth},
                            duration: TRANSITION_DURATION
                        }))
                    }
                    return $.when.apply($, animations)
                }});
        var FadeTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    var $source = options.source,
                        $destination = options.destination,
                        d = new $.Deferred;
                    $source.css({opacity: 0});
                    $destination.animate({opacity: 0}, TRANSITION_DURATION);
                    $source.animate({opacity: 1}, TRANSITION_DURATION, function() {
                        d.resolve()
                    });
                    return d.promise()
                }});
        TransitionExecutor.create = function(container, options) {
            var transitionType = options.direction === "none" ? "none" : options.type;
            switch (transitionType) {
                case"none":
                    return new NoneTransitionExecutor(container, options);
                case"slide":
                    return new SlideTransitionExecutor(container, options);
                case"fade":
                    return new FadeTransitionExecutor(container, options);
                case"overflow":
                    return new OverflowTransitionExecutor(container, options);
                default:
                    throw Error(DX.utils.formatString("Unknown transition type \"{0}\"", options.type));
            }
        };
        DX.framework.html.TransitionExecutor = TransitionExecutor
    })(jQuery, DevExpress);
    DevExpress.MOD_FRAMEWORK = true
}
