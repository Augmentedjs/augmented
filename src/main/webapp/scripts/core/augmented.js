/**
 * Augmented.js - The Core UI Component and package
 *
 * @author Bob Warren
 *
 * @requires Backbone.js
 * @module Augmented
 * @version 0.3.0
 * @license Apache-2.0
 */
(function(root, factory) {

    // Set up Augmented appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define([ 'backbone', 'exports'],
		function(Backbone, exports) {
	    // Export global even in AMD case in case this script is
	    // loaded with
	    // others that may still expect a global Augmented.
	    root.Augmented = factory(root, exports, Backbone);
	});

	// Next for Node.js or CommonJS.
    } else if (typeof exports !== 'undefined') {
	    var _ = require('backbone');
	factory(root, exports, Backbone);

	// Finally, as a browser global.
    } else {
	    root.Augmented = factory(root, {}, root.Backbone);
    }

}(this, function(root, Augmented, Backbone) {
    "use strict";
    /* Extend function for use throughout the framework */
    var extend = function() {
        var i =0, l = arguments.length;
    	for (i=1; i<l; i++) {
    	    for(var key in arguments[i]) {
        		if(arguments[i].hasOwnProperty(key)) {
        		    arguments[0][key] = arguments[i][key];
                }
            }
        }
    	return arguments[0];
    };

    extend(Augmented, Backbone);

    /*
     * Save the previous value of the `Augmented` variable, so that it can be
     * restored later on, if `noConflict` is used (just like Backbone)
     */
    var previousAugmented = root.Augmented;
    /**
     * The standard version property
     * @constant VERSION
     */
    Augmented.VERSION = '0.3.0ɑ';
    /**
     * A codename for internal use
     * @constant codename
     */
    Augmented.codename = "Adam Jensen";
    /**
     * A release name to help with identification of minor releases
     * @constant releasename
     */
    Augmented.releasename = "The Hive";

    /**
     * Runs Augmented.js in 'noConflict' mode, returning the 'Augmented'
     * variable to its previous owner. Returns a reference to 'this' Augmented
     * object.
     * @function noConflict
     * @memberof Augmented
     */
    Augmented.noConflict = function() {
  		root.Augmented = previousAugmented;
        Backbone.noConflict();
  		return this;
    };

    /**
     * Augmented underscore (if it exists from Backbone.js)
     * @module _
     * @name _
     * @private
     * @memberof Augmented
     */
    var _ = Augmented._ = Backbone._;
    /**
     * Augmented jQuery (if it exists from Backbone.js)
     * @module $
     * @name $
     * @private
     * @memberof Augmented
     */
    var $ = Augmented.$ = Backbone.$; // Does $ exist?

    /**
     * Augmented.Configuration - a set of configuration properties for the framework
     * @enum Configuration
     * @memberof Augmented
     * @property {string} LoggerLevel The level of the framework internal logger
     * @property {string} MessageBundle - the base name for messages in the framework (default: Messages)
     * @property {number} AsynchronousQueueTimeout the default milisecond timeout (default: 2000)
     * @property {number} ApplicationInitProcessTimeout the application init even timeout (default: 1000)
     */
    Augmented.Configuration = {
        LoggerLevel: "debug",
        MessageBundle: "Messages",
        AsynchronousQueueTimeout: 2000,
        ApplicationInitProcessTimeout: 1000
    };

    /*
     * Base functionality
     * Set of base capabilities used throughout the framework
     */

    /**
     * Augmented.has
     * @method has
     * @param {object} obj The input object
     * @param {object} key The test key
     * @returns {boolean} Returns true of the key exists
     */
    Augmented.has = function(obj, key) {
        return obj !== null && hasOwnProperty.call(obj, key);
    };

    var createAssigner = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length;
            if (length < 2 || obj === null) return obj;
                var index = 1, i = 0;
                for (index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    };

    /**
     * Augmented.isObject
     * @method isObject
     * @param {object} obj The input object
     * @returns {boolean} Returns true of the param is an object
     */
    Augmented.isObject = function(obj) {
        var type = typeof obj;
        return (type === 'function' || type === 'object' && !!obj);
    };

    /**
     * Augmented.allKeys
     * @method allKeys
     * @param {object} obj The input object
     * @returns {array} Returns the array of ALL keys including prototyped
     */
    Augmented.allKeys = function(obj) {
      if (!Augmented.isObject(obj)) return [];
      return Object.getOwnPropertyNames(obj);
    };

    /**
     * Augmented.create
     * @method create
     * @param {object} prototype The input prototype
     * @param {object} props The properties (optional)
     * @returns {object} Returns the created object
     */
    Augmented.create = function(prototype, props) {
        var result = function(prototype) {
            if (!Augmented.isObject(prototype)) return {};
            return Object.create(prototype);
          };
        if (props) Object.assign(result, props);
        return result;
    };

    /** Helper function to correctly set up the prototype chain for subclasses.
     * Similar to `goog.inherits`, but uses a hash of prototype properties and
     * class properties to be extended.
     */
    var classExtend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        if (protoProps && Augmented.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){
                return parent.apply(this, arguments);
            };
        }

        // Add static properties to the constructor function, if supplied.
        createAssigner(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function and add the prototype properties.
        child.prototype = Augmented.create(parent.prototype, protoProps);
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

     /**
      * Augmented.extend - Can extend base classes via .extend simular to Backbone.js
      * @function extend
      * @memberof Augmented
      */
    Augmented.extend = Backbone.Model.extend;

    /**
     * Augmented.sync - Base sync method that can pass special augmented features
     * @function sync
     * @memberof Augmented
     */
    Augmented.sync = Backbone.sync;

    /**
     * Augmented.isFunction -
     * returns true if called name is a function
     * simular to jQuery .isFunction method
     * @function Augmented.isFunction
     * @param {function} name The name of the function to test
     * @memberof Augmented
     * @returns true if called name is a function
     */
    var isFunction = Augmented.isFunction = function(name) {
        return Object.prototype.toString.call(name) == '[object Function]';
    };

    /**
     * Augmented.result - returns named property in an object
     * simular to underscore .result method
     * @function result
     * @memberof Augmented
     * @returns named property in an object
     */
    var result = Augmented.result = function(object, property) {
        if (object === null) return;
        var value = object[property];
        return Augmented.isFunction(value) ? value.call(object) : value;
    };


    if (!Array.prototype.includes) {
        /**
         * Array.includes - returns is a property is included in the array (can pass an start index)
         * <em>ES7 Polyfill</em>
         * @function Array.includes
         * @memberof Array
         * @param {object} searchElement Element to search for
         * @param {number} fromIndex Optional index to start from
         * @returns true if property is included in an array
         */
        Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
            'use strict';
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {
                    k = 0;
                }
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) {
                    return true;
                }
                k++;
            }
            return false;
        };
    }

    /**
     * Array.has - returns is a property is in the array (very fast return)
     * @function Array.has
     * @memberof Array
     * @param {object} key Key to test for
     * @returns true if property is included in an array
     */
    Array.prototype.has = function(key) {
        return (this.indexOf(key) !== -1);
    };

    /**
     * Utility Package -
     * Small Utilities
     * @namespace Augmented.Utility
     * @memberof Augmented
     */
    Augmented.Utility = {};

    Augmented.Utility.classExtend = classExtend;

    /**
     * Sorts an array by key
     * @function Sort
     * @namespace Augmented.Utility
     * @param {array} array The array to sort
     * @param {object} key The key to sort by
     * @returns {array} The sorted array
     */
    Augmented.Utility.Sort = function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    /**
     * Augmented.Utility.TransformerType <br/>
     * Transformer type for use in the transformer
     * @enum {number} Augmented.Utility.TransformerType
     * @name Augmented.Utility.TransformerType
     * @memberof Augmented.Utility
     * @property {number} xString Standard String
     * @property {number} nInteger Integer
     * @property {number} xNumber Any number
     * @property {number} xBoolean True/False
     * @property {number} xArray Stanrdard Array
     * @property {number} xObject Any Object
     * @property {number} xNull Null
     */
    var transformerType = Augmented.Utility.TransformerType = {
        "xString": 0,
        "xInteger": 1,
        "xNumber": 2,
        "xBoolean": 3,
        "xArray": 4,
        "xObject": 5,
        "xNull": 6
    };

    /**
     * Augmented.Utility.Transformer <br/>
     * Transform an object, type, or array to another type, object, or array
     * @namespace Augmented.Utility.Transformer
     * @memberof Augmented.Utility
     */
    var transformer = Augmented.Utility.Transformer = {
        /**
         * The transformer type enum
         * @method type The transformer type enum
         * @type {Augmented.Utility.TransformerType}
         * @memberof Augmented.Utility.Transformer
         */
        type: transformerType,
        /**
         * Transform an object, primitive, or array to another object, primitive, or array
         * @method transform
         * @param {object} source Source primitive to transform
         * @param {Augmented.Utility.TransformerType} type Type to transform to
         * @memberof Augmented.Utility.Transformer
         * @returns {object} returns a transformed object or primitive
         */
        transform: function(source, type) {
            var out = null;
            switch(type) {
                case transformerType.xString:
                    if (typeof source === 'object') {
                        out = JSON.stringify(source);
                    } else {
                        out = String(source);
                    }
                break;
                case transformerType.xInteger:
                    out = parseInt(source);
                break;
                case transformerType.xNumber:
                    out = Number(source);
                break;
                case transformerType.xBoolean:
                    out = Boolean(source);
                break;
                case transformerType.xArray:
                    if (!Array.isArray(source)) {
                        out = [];
                        out[0] = source;
                    } else {
                        out = source;
                    }
                break;
                case transformerType.xObject:
                    if (typeof source !== 'object') {
                        out = {};
                        out[source] = source;
                    } else {
                        out = source;
                    }
                break;
            }
            return out;
        },
        /**
         * Returns a Augmented.Utility.TransformerType of a passed object
         * @method isType
         * @memberof Augmented.Utility.Transformer
         * @param {object} source The source primitive
         * @returns {Augmented.Utility.TransformerType} type of source as Augmented.Utility.TransformerType
         */
        isType: function(source) {
            if (source === null) {
                return transformerType.xNull;
            } else if (typeof source === 'string') {
                return transformerType.xString;
            } else if (typeof source === 'number') {
                return transformerType.xNumber;
            } else if (typeof source === 'boolean') {
                return transformerType.xBoolean;
            } else if (Array.isArray(source)) {
                return transformerType.xArray;
            } else if (typeof source === 'object') {
                return transformerType.xObject;
            }
        }
    };

    /**
     * Augmented.isString -
     * checks is a value is a String
     * @function isString
     * @memberof Augmented
     * @param {string} variable to check
     * @returns {boolean} true if value is a string
     */
    Augmented.isString = function(val) {
        return typeof val === 'string' ||
            ((!!val && typeof val === 'object') &&
            Object.prototype.toString.call(val) === '[object String]');
    };

    /**
     * Augmented.Utility.extend -
     * Object Extend ability simular to jQuery.extend()
     * @function Augmented.Utility.extend
     * @memberof Augmented.Utility
     */
    Augmented.Utility.extend = extend;

    /*
     * Setup the rest of jQuery-like eventing and handlers for native xhr
     */
    var aXHR = XMLHttpRequest;
    Augmented.Utility.extend(aXHR, {
        done: function() {},
        fail: function() {},
        always: function() {},
        then: function() {}
    });

    var mockXHR = function(){
         this.responseType = "text";
         this.responseText = "";
         this.async = true;
         this.status = 200;
         this.header = {};
         this.timeout = 70;
         this.open = function(method, uri, async, user, password) {
             this.url = uri;
             this.async = async;
             this.user = user;
             this.method = method;
         };
         this.send = function() { this.onload(); };
         this.setRequestHeader = function(header, value) {
             this.header.header = value;
         };
         this.done = function() {};
         this.fail = function() {};
         this.always = function() {};
         this.then = function() {};
         this.options = {};
     };

    /**
     * Ajax namespace for use with Ajax related configuration and methods
     * @namespace Augmented.Ajax
     * @memberof Augmented
     */
    Augmented.Ajax = {};

    /**
     * Object of configuration properties and callbacks.
     * @namespace Augmented.Ajax.Configuration
     * @name Augmented.Ajax.Configuration
     * @memberof Augmented.Ajax
     */
    Augmented.Ajax.Configuration = {
        url: 'localhost',
        contentType: 'text/plain',
        dataType: 'text',
        async: true
    };

    /**
     * AJAX capability using simple jQuery-like API<br/>
     * Supports the following object properties and features:
     * <ul>
     * <li>method</li>
     * <li>url</li>
     * <li>async</li>
     * <li>contentType</li>
     * <li>dataType</li>
     * <li>beforeSend function</li>
     * <li>success callback</li>
     * <li>failure callback</li>
     * <li>complete callback</li>
     * <li>user</li>
     * <li>password</li>
     * <li>withCredentials</li>
     * <li>cache</li>
     * <li>timeout</li>
     * <li>mock - special flag for mocking response</li>
     * </ul>
     * @method Augmented.Ajax.ajax
     * @static
     * @param {Augmented.Ajax.Configuration} ajaxObject object of configuration properties and callbacks.
     * @returns success or failure callback
     * @memberof Augmented.Ajax
     * @example Augmented.ajax({
     *         url: uri,
     *         contentType: 'text/plain',
     *         dataType: 'text',
     *         async: true,
     *         success: function (data, status) { ... },
     *         failure: function (data, status) { ... }
     *     });
     */
    Augmented.ajax = Augmented.Ajax.ajax = function(ajaxObject) {
        logger.debug("AUGMENTED: Ajax object: " + JSON.stringify(ajaxObject));
        var xhr = null;
  		if (ajaxObject && ajaxObject.url) {
    	    var method = (ajaxObject.method) ? ajaxObject.method : 'GET';
    	    var cache = (ajaxObject.cache) ? (ajaxObject.cache) : true;

    	    xhr = (ajaxObject.mock) ? new mockXHR() : new aXHR();

            if (ajaxObject.timeout) {
                xhr.timeout = ajaxObject.timeout;
            }
    	    var async = (ajaxObject.async !== undefined) ? ajaxObject.async : true;

    	    // CORS & Async
    	    if (ajaxObject.crossDomain && ajaxObject.xhrFields && ajaxObject.xhrFields.withCredentials) {
        		xhr.withCredentials = ajaxObject.xhrFields.withCredentials;
        		// Sync Not supported for all browsers in CORS mode
                if (!async) {
                    logger.warn("AUGMENTED: Augmented.ajax: Sync Not supported for all browsers in CORS mode!");
                }
        		async = true;
    	    }

    	    if (async && ajaxObject.dataType) {
                xhr.responseType = (ajaxObject.dataType) ? ajaxObject.dataType : 'text';
    	    }

    	    xhr.open(method, encodeURI(ajaxObject.url), async,
    		      (ajaxObject.user !== undefined) ? ajaxObject.user : '',
	            (ajaxObject.password !== undefined) ? ajaxObject.password : '');
    	    xhr.setRequestHeader('Content-Type', (ajaxObject.contentType) ? ajaxObject.contentType : 'text/plain');

            if (ajaxObject.dataType === "json") {
                xhr.setRequestHeader("Accept", "application/json");
            }

    	    if (!cache) {
                xhr.setRequestHeader('Cache-Control', 'no-cache');
    	    }

            // CORS
            if (xhr.withCredentials) {
                var allowOrigins = '*', allowMethods = 'GET';
                if (ajaxObject.allowOrigins) {
                    allowOrigins = ajaxObject.allowOrigins;
                }
                if (ajaxObject.allowMethods) {
                    allowMethods = ajaxObject.allowMethods;
                }

                xhr.setRequestHeader('Access-Control-Allow-Origin', allowOrigins);
                xhr.setRequestHeader('Access-Control-Allow-Methods', allowMethods);
            }

            // Authorization
            if (xhr.withCredentials && ajaxObject.user && ajaxObject.password) {
                xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(ajaxObject.user + ':' + ajaxObject.password));
            }

    	    xhr.onload = function() {
                try {
        		    if (xhr.status > 199 && xhr.status < 300) {
                        if (ajaxObject.success) {
                            if (xhr.responseType === "" || xhr.responseType === "text") {
                                if (xhr.responseText) {
                                    ajaxObject.success(xhr.responseText, xhr.status, xhr);
                                } else {
                                    logger.warn("AUGMENTED: Ajax (" + xhr.responseType + " responseType) did not return anything.");
                                    ajaxObject.success("", xhr.status, xhr);
                                }
                            } else if (xhr.responseType === "json") {
                                if (xhr.response) {
                                    logger.debug("AUGMENTED: Ajax (JSON responseType) native JSON.");
                                    ajaxObject.success(xhr.response, xhr.status, xhr);
                                } else if (xhr.responseText) {
                                    logger.debug("AUGMENTED: Ajax (JSON responseType) parsed JSON from string.");
                                    ajaxObject.success(JSON.parse(xhr.responseText), xhr.status, xhr);
                                } else {
                                    logger.warn("AUGMENTED: Ajax (" + xhr.responseType + " responseType) did not return anything.");
                                    ajaxObject.success("", xhr.status, xhr);
                                }
                            } else {
                                if (xhr.responseText) {
                                    ajaxObject.success(xhr.responseText, xhr.status, xhr);
                                } else if (xhr.response) {
                                    ajaxObject.success(xhr.response, xhr.status, xhr);
                                } else {
                                    logger.warn("AUGMENTED: Ajax (" + xhr.responseType + " responseType) did not return anything.");
                                    ajaxObject.success("", xhr.status, xhr);
                                }
                            }
                        }
        		    } else if (xhr.status > 399 && xhr.status < 600) {
                        if (ajaxObject.failure) {
                            ajaxObject.failure(xhr, xhr.status, xhr.statusText);
                        } else if (ajaxObject.error) {
                            ajaxObject.error(xhr, xhr.status, xhr.statusText);
                        }
        		    }
                } catch(e) {
                    logger.error("AUGMENTED: Ajax (" + e + ")");
                    ajaxObject.error(xhr, xhr.status, xhr.statusText);
                }
                if (ajaxObject.complete) {
                    ajaxObject.complete(xhr, xhr.status);
                }
                return xhr;
    	    };

            if (ajaxObject.beforeSend) {
                ajaxObject.beforeSend(xhr);
            }

        	xhr.send();
  		}

        this.done = function() {};
        this.fail = function() {};
        this.always = function() {};
        this.then = function() {};

        return this;
    };

    /* Overide Backbone.ajax so models and collections use Augmented Ajax instead */
    Backbone.ajax = Augmented.ajax;

    /**
     * @namespace Augmented.Logger
     * @memberof Augmented
     */
    Augmented.Logger = {};

    /**
     * Augmented.Logger.Type
     * @name Augmented.Logger.Type
     * @enum {string}
     * @memberof Augmented.Logger
     * @property {string} console The console logger (HTML5 console)
     * @property {string} rest A REST-based logger
     * @memberof Augmented.Logger
     */
    var loggerType = Augmented.Logger.Type = {
        console: "console",
        rest: "rest"
    };

    /**
     * Augmented.Logger.Level
     * @name Augmented.Logger.Level
     * @enum {string}
     * @property {string} info The Info level
     * @property {string} debug The debug level
     * @property {string} error The error level
     * @property {string} warn The warning level
     * @memberof Augmented.Logger
     */
    var loggerLevelTypes = Augmented.Logger.Level = {
        info: "info",
        debug: "debug",
        error: "error",
        warn: "warn"
    };

    /**
     * Augmented Logger - abstractLogger
     * @constructor abstractLogger
     * @param {Augmented.Logger.Level} l The level to initialize the logger with
     * @abstract
     * @memberof Augmented.Logger
     */
    var abstractLogger = function(l) {
        this.TIME_SEPERATOR = ":";
        this.DATE_SEPERATOR = "-";
        this.OPEN_GROUP = " [ ";
        this.CLOSE_GROUP = " ] ";

        this.label = loggerLevelTypes;

        this.loggerLevel = (l) ? l : loggerLevelTypes.info;

        this.getLogTime = function() {
            var now = new Date();
            return now.getFullYear() + this.DATE_SEPERATOR + (now.getMonth() + 1) + this.DATE_SEPERATOR + now.getDate() + " " +
                now.getHours() + this.TIME_SEPERATOR + now.getMinutes() + this.TIME_SEPERATOR + now.getSeconds() + this.TIME_SEPERATOR + now.getMilliseconds();
        };

        /**
         * log a message
         * @ethod log
	     * @memberof abstractLogger
         * @param {string} message The message to log
         * @param {Augmented.Logger.Level} level The level of the log message
         */
        this.log = function(message, level) {
            if (message) {
                if (!level) {
                    level = loggerLevelTypes.info;
                }

                if (this.loggerLevel === loggerLevelTypes.debug && level === loggerLevelTypes.debug) {
                    this.logMe(this.getLogTime() + this.OPEN_GROUP + loggerLevelTypes.debug + this.CLOSE_GROUP + message, level);
                } else if (level === loggerLevelTypes.error) {
                    this.logMe(this.getLogTime() + this.OPEN_GROUP + loggerLevelTypes.error + this.CLOSE_GROUP + message, level);
                } else if (level === loggerLevelTypes.warn) {
                    this.logMe(this.getLogTime() + this.OPEN_GROUP + loggerLevelTypes.warn + this.CLOSE_GROUP + message, level);
                } else if (this.loggerLevel === loggerLevelTypes.debug || this.loggerLevel === loggerLevelTypes.info) {
                    this.logMe(this.getLogTime() + this.OPEN_GROUP + loggerLevelTypes.info + this.CLOSE_GROUP + message, level);
                }
            }
        };

    	/**
    	 * Logs a message in info level
    	 * @method info
    	 * @param {string} message
    	 * @memberof abstractLogger
    	 */
        this.info = function(message) {
            this.log(message, loggerLevelTypes.info);
        };

    	/**
    	 * Log a message in error level
    	 * @method error
    	 * @param {string} message
    	 * @memberof abstractLogger
    	 */
        this.error = function(message) {
            this.log(message, loggerLevelTypes.error);
        };

    	/**
    	 * Log a message in debug level
    	 * @method debug
    	 * @param {string} message
    	 * @memberof abstractLogger
    	 */
        this.debug = function(message) {
            this.log(message, loggerLevelTypes.debug);
        };

    	/**
    	 * Log a message in warn level
    	 * @method warn
    	 * @param {string} message
    	 * @memberof abstractLogger
    	 */
        this.warn = function(message) {
            this.log(message, loggerLevelTypes.warn);
        };

      /**
       * logMe method - the actual logger method that logs.  Each instance will have it's own<br/>
       * override this in an instance
       * @example this.logMe = function(message, level) { ... };
       * @method logMe
       * @memberof abstractLogger
       * @param {string} message The message to log
       * @param {string} level The level to log to
       */
    };

    var consoleLogger = function() {
        abstractLogger.apply(this, arguments);
    };
    consoleLogger.prototype = Object.create(abstractLogger.prototype);
    consoleLogger.prototype.constructor = consoleLogger;

    consoleLogger.prototype.logMe = function(message, level) {
        if (level === loggerLevelTypes.info) {
            console.info(message);
        } else if (level === loggerLevelTypes.error) {
            console.error(message);
        } else if (level === loggerLevelTypes.debug) {
            console.log(message);
        } else if (level === loggerLevelTypes.warn) {
            console.warn(message);
        } else {
            console.log(message);
        }
    };

    var restLogger = function() {
       abstractLogger.apply(this, arguments);
    };

    restLogger.prototype = Object.create(abstractLogger.prototype);
    restLogger.prototype.constructor = restLogger;
    restLogger.prototype.setURI = function(uri) {
        this.uri = uri;
    };
    restLogger.prototype.logMe = function(message) {
        Augmented.ajax({
            url: this.uri,
            method: "POST",
            contentType: 'text/plain',
            dataType: 'text',
            async: true,
            data: message,
            success: function (data, status) { this.success(); },
            failure: function (data, status) { this.failure(); }
        });
    };

    /**
     * Augmented.Logger.LoggerFactory - A logger factory for creating a logger instance
     * @namespace Augmented.Logger.LoggerFactory
     * @memberof Augmented.Logger
     */
    Augmented.Logger.LoggerFactory = {
    	/**
    	 * getLogger - get an instance of a logger
    	 * @method getLogger
    	 * @param {Augmented.Logger.Type} type Type of logger instance
    	 * @param {Augmented.Logger.Level} level Level to set the logger to
    	 * @memberof Augmented.Logger.LoggerFactory
    	 * @returns {Augmented.Logger.abstractLogger} logger Instance of a logger by istance type
    	 * @example Augmented.Logger.LoggerFactory.getLogger(Augmented.Logger.Type.console, Augmented.Logger.Level.debug);
    	 */
        getLogger: function(type, level) {
            if (type === loggerType.console) {
               return new consoleLogger(level);
            } else if (type === loggerType.rest) {
               return new restLogger(level);
            }
        }
    };

   /**
    * A private logger for use in the framework only
    * @private
    */
   var logger = Augmented.Logger.LoggerFactory.getLogger(loggerType.console, Augmented.Configuration.LoggerLevel);

    /**
    * Wrap method to handle wrapping functions (simular to _.wrap)
    * @method wrap
    * @memberof Augmented.Utility
    */
    var wrap = Augmented.Utility.wrap = function(fn, wrap) {
        return function () {
            return wrap.apply(this, [fn].concat(Array.prototype.slice.call(arguments)));
        };
    };

    /**
     * ES6-like Map
     * @constructor Augmented.Utility.AugmentedMap
     * @param myData {object} Map data to fill map
     * @memberof Augmented.Utility
     */
    var augmentedMap = Augmented.Utility.AugmentedMap = function(myData) {
    	this.keys = [];
    	this.data = {};

      /**
       * Set the value by key in the map
       * @method set
       * @memberof Augmented.Utility.AugmentedMap
       * @param key {string} name of the key
       * @param value {any} value for the key
       */
    	this.set = function(key, value) {
    	    if (key !== null && value !== null) {
        		if (!this.data[key]) {
        		    this.keys.push(key);
        		}
        		this.data[key] = value;
    	    }
    	};

      /**
       * Get the value by key in the map
       * @method get
       * @memberof Augmented.Utility.AugmentedMap
       * @param key {string} name of the key
       * @returns The value for the key
       */
    	this.get = function(key) {
    	    return this.data[key];
    	};

      /**
       * Index of the key in the map
       * @method indexOf
       * @memberof Augmented.Utility.AugmentedMap
       * @param key {string} name of the key
       * @returns index of the key
       */
    	this.indexOf = function(key) {
    	    return this.keys.indexOf(key);
    	};

      /**
       * Remove the value by key in the map
       * @method remove
       * @memberof Augmented.Utility.AugmentedMap
       * @param key {string} name of the key
       */
    	this.remove = function(key) {
    	    var i = this.indexOf(key);
    	    this.keys.splice(i, 1);
    	    delete this.data[key];
    	};

      /**
       * Has returns whether a key exists in the map
       * @method has
       * @memberof Augmented.Utility.AugmentedMap
       * @param key {string} name of the key
       * @returns true if the key exists in the map
       */
    	this.has = function(key) {
    	    return (this.indexOf(key) !== -1);
    	};

      /**
       * Iterator forEach key to value in the map
       * @method forEach
       * @memberof Augmented.Utility.AugmentedMap
       * @param fn {function} callback for the iterator
       */
    	this.forEach = function(fn) {
    	    if (typeof fn !== 'function') {
    		    return;
    	    }
    	    var len = this.keys.length;
    	    var i = 0;
    	    var k;
    	    for (i = 0; i < len; i++) {
    		    k = this.keys[i];
    		    fn(k, this.data[k], i);
    	    }
    	};

      /**
       * Get the key for the index in the map
       * @method key
       * @memberof Augmented.Utility.AugmentedMap
       * @param i {number} index of the key
       * @returns the key at index
       */
    	this.key = function(i) {
    	    return this.keys[i];
    	};

      /**
       * The entries value object in the map
       * @method entries
       * @memberof Augmented.Utility.AugmentedMap
       * @returns Array of entries value objects
       */
    	this.entries = function() {
    	    var len = this.keys.length;
    	    var entries = new Array(len);
    	    for (var i = 0; i < len; i++) {
        		entries[i] = {
        			key : this.keys[i],
        			value : this.data[i]
        		};
    	    }
    	    return entries;
    	};

      /**
       * The values in the map as an Array
       * @method values
       * @memberof Augmented.Utility.AugmentedMap
       * @returns values as an Array
       */
    	this.values = function() {
    	    var len = this.keys.length;
    	    var values = new Array(len);
    	    for (var i = 0; i < len; i++) {
    		    values[i] = this.data[i];
    	    }
    	    return values;
    	};

      /**
       * Clear the map
       * @method clear
       * @memberof Augmented.Utility.AugmentedMap
       */
    	this.clear = function() {
    	    this.keys = [];
    	    this.data = {};
    	};

      /**
       * The size of the map in keys
       * @method size
       * @memberof Augmented.Utility.AugmentedMap
       * @returns size of map by keys
       */
    	this.size = function() {
    	    return this.keys.length;
    	};

      /**
       * Represent the map in JSON
       * @method toJSON
       * @memberof Augmented.Utility.AugmentedMap
       * @returns JSON of the map
       */
    	this.toJSON = function() {
    	    return this.data;
    	};

      /**
       * Represent the map in a String of JSON
       * @method toString
       * @memberof Augmented.Utility.AugmentedMap
       * @returns Stringified JSON of the map
       */
    	this.toString = function() {
    	    return JSON.stringify(this.data);
    	};

    	// non-es6 API

      /**
       * Checks of the map is empty (not ES6)
       * @method isEmpty
       * @memberof Augmented.Utility.AugmentedMap
       * @returns true if the map is empty
       */
    	this.isEmpty = function() {
    	    return this.keys.length === 0;
    	};

        /**
         * Marshalls a map
         * @method marshall
         * @param {Augmented.Utility.AugmentedMap} data Data to marsh as a map
         * @memberof Augmented.Utility.AugmentedMap
         */
        this.marshall = function(dataToMarshall) {
            /* dataToMarshall must be the following type of data to parse:
             * Map
             * JSON object with properties (key/value)
             */
            var dataToParse;
            if (dataToMarshall && dataToMarshall instanceof Augmented.Utility.AugmentedMap) {
                dataToParse = dataToMarshall.toJSON();
            } else if(dataToMarshall && dataToMarshall instanceof Object && (Object.keys(dataToMarshall).length > 0)) {
                dataToParse = dataToMarshall;
            } else {
                logger.warn("AUGMENTED: AugmentedMap: Could not marshall data: " + JSON.stringify(dataToMarshall));
                return false;
            }
            //logger.debug("data to parse: " + JSON.stringify(dataToParse));

            var props = Object.keys(dataToParse);
            var l = props.length;
            var i = 0;
            for (i = 0; i < l; i++) {
                var p = props[i];
                var v = dataToParse[p];
                //logger.debug("setting " + p + ", " + v);
                this.set(p, v);
            }
            return true;
        };

    	if (myData) {
            return this.marshall(myData);
    	}
    };

    /*
     * Base Classes
     */

    /**
     * Augmented Object
	 * Base class for other classes to extend from
	 * triggers events with Backbone.Events
     * @constructor Augmented.Object
     * @param {object} options Object options
     * @memberof Augmented
     */
	Augmented.Object = function(options) {
    	this.options = Augmented.Utility.extend({}, Augmented.result(this, 'options'), options);

	};

    Augmented.Object.prototype = function () {
        this.initialize.apply(this, arguments);
    };

  /**
   * Entend the Object as a new instance
   * @function Augmented.Object.extend
   * @memberof Augmented.Object
   * @returns Child class of Augmented.Object
   */
  	Augmented.Object.extend = Augmented.extend;

  	Augmented.Utility.extend(Augmented.Object.prototype, Backbone.Events, {
  		initialize: function() {}
	});

    // Security

    /**
    * Security Package and API
    * @namespace Augmented.Security
    * @memberof Augmented
    */
    Augmented.Security = {};

    /**
     * Security client namespace
     * @namespace Augmented.Security.Client
     * @memberof Augmented.Security
     */
    Augmented.Security.Client = {};

    /**
     * Pricipal object for use in security as part of the abstract implimentation
     * @namespace Augmented.Security.Principal
     * @memberof Augmented.Security
     * @property {string} fullName The full name of the principal
     * @property {number} id The id of the principal
     * @property {string} login The login of the principal
     * @property {string} email The email of the principal
     */
    var principal = Augmented.Security.Principal = {
        fullName: "",
        id: 0,
        login: "",
        email: ""
    };

    /**
    * Augmented.Security.Context
    * Used as a security data storage class
    * @constructor Augmented.Security.Context
    * @param {Augmented.Security.Principal} principal The principal for this context
    * @param {array} permissions Permissions to add to the context
    * @memberof Augmented.Security
    */
    var securityContext = Augmented.Security.Context = function(principal, permissions) {
        this.principal = (principal) ? principal : (new principal().login = "guest");
        this.permissions = (permissions) ? permissions : [];

    	/**
    	 * getPrincipal - get the principal of this context
    	 * @method getPrincipal
    	 * @memberof Augmented.Security.Context
    	 * @returns {Augmented.Security.Principal} principal The principal of this context
    	 */
        this.getPrincipal = function() {
          return this.principal;
        };

    	/**
    	 * getPermissions - Get all the permissions for a principal
    	 * @method getPermissions
    	 * @memberof Augmented.Security.Context
    	 * @returns {array} permissions All permissions
    	 */
        this.getPermissions = function() {
          return this.permissions;
        };

    	/**
    	 * setPermissions - Set all permissions for a principal
    	 * @method setPermissions
    	 * @param {array} permissions
    	 * @memberof Augmented.Security.Context
    	 */
        this.setPermissions = function(p) {
          this.permissions = p;
        };

    	/**
    	 * addPermission - Add a new permission for a principal
    	 * @method addPermission
    	 * @param {string} permission
    	 * @memberof Augmented.Security.Context
    	 */
        this.addPermission = function(p) {
          this.permissions.push(p);
        };

    	/**
    	 * removePermission - Remove a permission for a principal
    	 * @method removePermission
    	 * @param {string} permission
    	 * @memberof Augmented.Security.Context
    	 */
        this.removePermission = function(p) {
          var i = this.permissions.indexOf(p);
          this.permissions.splice(i, 1);
        };

    	/**
    	 * hasPermission - checks for a permission for this principal
    	 * @method hasPermission
    	 * @param {string} permission
    	 * @memberof Augmented.Security.Context
    	 */
        this.hasPermission = function(p) {
          return (this.permissions.indexOf(p) != -1);
        };
    };

    /**
     * Augmented.Security.ClientType - Security client type
     * @enum {number}
     * @memberof Augmented.Security
     * @name Augmented.Security.ClientType
     * @property {number} OAuth2 The OAuth2 type
     * @property {number} ACL The ACL type
     */
    Augmented.Security.ClientType = {
        OAUTH2 : 0,
        ACL: 1
    };

    /**
     * The abstract Security Client
     * @name abstractSecurityClient
     * @constructor abstractSecurityClient
     * @property {Augmented.Security.ClientType} type The client type
     * @property {string} uri The base uri
     * @private
     */
    var abstractSecurityClient = Augmented.Object.extend({
        type: null,
        uri: ""
    });

    /**
     * The OAUTH2 Client
     * @name Augmented.Security.Client.OAUTH2Client
     * @constructor Augmented.Security.Client.OAUTH2Client
     * @memberof Augmented.Security.Client
     */
    Augmented.Security.Client.OAUTH2Client = abstractSecurityClient.extend({
        type: Augmented.Security.ClientType.OAUTH2,
        /**
         * Access Token
         * @property accessToken
         * @memberof Augmented.Security.Client.OAUTH2Client
         */
        accessToken: "",
        /**
         * Authorization Token
         * @property authorizationToken
         * @memberof Augmented.Security.Client.OAUTH2Client
         */
        authorizationToken: "",
        /**
         * Authorize the application/service/module via OAUTH
         * @method authorize
         * @param {string} name The name of the application/service/module
         * @memberof Augmented.Security.Client.OAUTH2Client
         */
        authorize: function(name) {
          // TODO: Go authorize the app and get a token
          this.authorizationToken = "";
        },
        /**
         * access the application/service/module via OAUTH
         * @method access
         * @param {string} principal The principal
         * @memberof Augmented.Security.Client.OAUTH2Client
         * TODO: Refresh the token and store it
         */
        access: function(principal) {
          this.accessToken = "";
        }
    });

    /**
     * Role/Privilege (ACL) Security
     * @name Augmented.Security.Client.ACLClient
     * @constructor Augmented.Security.Client.ACLClient
     * @memberof Augmented.Security.Client
     */
  Augmented.Security.Client.ACLClient = abstractSecurityClient.extend({
    type: Augmented.Security.ClientType.ACL,
    /**
     * authenticate the user
     * @method authenticate
     * @param {string} username The name of the user (login)
     * @param {string} password The password for the user (not stored)
     * @returns {Augmented.Security.Context} Returns a security context or null is case of failure
     * @memberof Augmented.Security.Client.ACL
     * @throws Error Failed to authenticate
     */
    authenticate: function(username, password) {
        var c = null;
        Augmented.ajax({
            url: this.uri,
            method: "GET",
            user: username,
            password: password,
            success: function(data, status) {
                var p = new principal({
                    fullName: data.fullName,
                    id: data.id,
                    login: data.login,
                    email: data.email
                });
                c = new securityContext(p, data.permissions);
            },
            failure: function(data, status) {
                // TODO: Bundle this perhaps
                throw new Error("Failed to authenticate with response of - " + status);
            }
        });
        return c;
    }
  });

    /**
     * AuthenticationFactory Class -
     * Returns a client of given type for use with security
     * @namespace Augmented.Security.AuthenticationFactory
     * @memberof Augmented.Security
     * @static
     */
    var authenticationFactory = Augmented.Security.AuthenticationFactory = {
        /**
        * Get an instance of a security client
        * @method getSecurityClient
        * @param {Augmented.Security.ClientType} clientType The Client Type to return
        * @returns {Augmented.Security.Client} Returns a security client instance
        * @memberof Augmented.Security.AuthenticationFactory
        */
        getSecurityClient: function(clientType) {
            if (clientType === Augmented.Security.ClientType.OAUTH2) {
                return new Augmented.Security.Client.OAUTH2Client();
            } else if (clientType === Augmented.Security.ClientType.ACL) {
                return new Augmented.Security.Client.ACLClient();
            }
            return null;
        }
    };

    /**
     * Augmented.Security.Entry -
     * Used to secure a resource via permissions
     * @class Augmented.Security.Entry
     * @memberof Augmented.Security
     * @param {array} permissions Permissions to add to the entry (optional)
     * @param {boolean} negaive Sets negative permissions (optional)
     */
    var securityEntry = Augmented.Security.Entry = function(p, neg) {
        /**
         * Gets the permissions
         * @property {array} permissions
         * @memberof Augmented.Security.Entry
         * @private
         */
        this.permissions = (p) ? p : [];

        /**
         * Negative flag
         * @property {boolean} isNegative
         * @memberof Augmented.Security.Entry
         */
        this.isNegative = (neg) ? neg : false;

        /**
         * Gets the permissions
         * @method getPermissions
         * @memberof Augmented.Security.Entry
         * @returns {array} Permissions
         */
        this.getPermissions = function() {
          return this.permissions;
        };
        /**
         * Sets the permissions
         * @method setPermissions
         * @memberof Augmented.Security.Entry
         * @param {array} permissions Permissions Array to set
         */
        this.setPermissions = function(p) {
          this.permissions = p;
        };
        /**
         * Add a permission
         * @method addPermission
         * @memberof Augmented.Security.Entry
         * @param {string} permission Permission to add
         */
        this.addPermission = function(p) {
          this.permissions.push(p);
        };
        /**
         * Remove a permission
         * @method removePermission
         * @memberof Augmented.Security.Entry
         * @param {string} permission Permission to remove
         */
        this.removePermission = function(p) {
          var i = this.permissions.indexOf(p);
          this.permissions.splice(i, 1);
        };
        /**
         * Returns if this entry has a permission
         * @method hasPermission
         * @memberof Augmented.Security.Entry
         * @param {string} permission Permission to test for
         * @returns {boolean} Returns true if this entry has this permission
         */
        this.hasPermission = function(p) {
          return (this.permissions.indexOf(p) != -1);
        };
        /**
         * Sets this entry negaive or positive
         * @method setNegative
         * @memberof Augmented.Security.Entry
         * @param {boolean} negative flag True or False
         */
        this.setNegative = function(n) {
          this.isNegative = n;
        };
    };

    /** Validation framework - forked from TV4 and extended
     *
     * @constructor Validator
     * @private
    */
    var Validator = function() {

        /**@see https://github.com/geraintluff/uri-templates
        * but with all the de-substitution stuff removed
        */
    	var uriTemplateGlobalModifiers = {
    		"+": true,
    		"#": true,
    		".": true,
    		"/": true,
    		";": true,
    		"?": true,
    		"&": true
    	};
    	var uriTemplateSuffices = {
    		"*": true
    	};

    	function notReallyPercentEncode(string) {
    	    return encodeURI(string).replace(/%25[0-9][0-9]/g, function (doubleEncoded) {
    		return "%" + doubleEncoded.substring(3);
    	    });
    	}

    	function uriTemplateSubstitution(spec) {
    	    var modifier = "";
    	    if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
    		modifier = spec.charAt(0);
    		spec = spec.substring(1);
    	    }
    	    var separator = "";
    	    var prefix = "";
    	    var shouldEscape = true;
    	    var showVariables = false;
    	    var trimEmptyString = false;
    	    if (modifier === '+') {
    		shouldEscape = false;
    	    } else if (modifier === ".") {
    		prefix = ".";
    		separator = ".";
    	    } else if (modifier === "/") {
    		prefix = "/";
    		separator = "/";
    	    } else if (modifier === '#') {
    		prefix = "#";
    		shouldEscape = false;
    	    } else if (modifier === ';') {
    		prefix = ";";
    		separator = ";";
    		showVariables = true;
    		trimEmptyString = true;
    	    } else if (modifier === '?') {
    		prefix = "?";
    		separator = "&";
    		showVariables = true;
    	    } else if (modifier === '&') {
    		prefix = "&";
    		separator = "&";
    		showVariables = true;
    	    }

    	    var varNames = [];
    	    var varList = spec.split(",");
    	    var varSpecs = [];
    	    var varSpecMap = {};
            var i = 0, l = varList.length;
    	    for (i = 0; i < l; i++) {
    		var varName = varList[i];
    		var truncate = null;
    		if (varName.indexOf(":") !== -1) {
    		    var parts = varName.split(":");
    		    varName = parts[0];
    		    truncate = parseInt(parts[1], 10);
    		}
    		var suffices = {};
    		while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
    		    suffices[varName.charAt(varName.length - 1)] = true;
    		    varName = varName.substring(0, varName.length - 1);
    		}
    		var varSpec = {
    			truncate: truncate,
    			name: varName,
    			suffices: suffices
    		};
    		varSpecs.push(varSpec);
    		varSpecMap[varName] = varSpec;
    		varNames.push(varName);
    	    }
    	    var subFunction = function (valueFunction) {
    		var result = "";
    		var startIndex = 0;
            var i = 0, l = varSpecs.length;
    		for (i = 0; i < l; i++) {
    		    var varSpec = varSpecs[i];
    		    var value = valueFunction(varSpec.name);
    		    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
    			startIndex++;
    			continue;
    		    }
    		    if (i === startIndex) {
    			result += prefix;
    		    } else {
    			result += (separator || ",");
    		    }
    		    if (Array.isArray(value)) {
    			if (showVariables) {
    			    result += varSpec.name + "=";
    			}
                var j=0, l = value.length;
    			for (var j = 0; j < l; j++) {
    			    if (j > 0) {
    				result += varSpec.suffices['*'] ? (separator || ",") : ",";
    				if (varSpec.suffices['*'] && showVariables) {
    				    result += varSpec.name + "=";
    				}
    			    }
    			    result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
    			}
    		    } else if (typeof value === "object") {
    			if (showVariables && !varSpec.suffices['*']) {
    			    result += varSpec.name + "=";
    			}
    			var first = true;
    			for (var key in value) {
    			    if (!first) {
    				result += varSpec.suffices['*'] ? (separator || ",") : ",";
    			    }
    			    first = false;
    			    result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
    			    result += varSpec.suffices['*'] ? '=' : ",";
    			    result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
    			}
    		    } else {
    			if (showVariables) {
    			    result += varSpec.name;
    			    if (!trimEmptyString || value !== "") {
    				result += "=";
    			    }
    			}
    			if (varSpec.truncate !== null) {
    			    value = value.substring(0, varSpec.truncate);
    			}
    			result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21"): notReallyPercentEncode(value);
    		    }
    		}
    		return result;
    	    };
    	    subFunction.varNames = varNames;
    	    return {
    		prefix: prefix,
    		substitution: subFunction
    	    };
    	}

    	function UriTemplate(template) {
    	    if (!(this instanceof UriTemplate)) {
    		return new UriTemplate(template);
    	    }
    	    var parts = template.split("{");
    	    var textParts = [parts.shift()];
    	    var prefixes = [];
    	    var substitutions = [];
    	    var varNames = [];
    	    while (parts.length > 0) {
    		var part = parts.shift();
    		var spec = part.split("}")[0];
    		var remainder = part.substring(spec.length + 1);
    		var funcs = uriTemplateSubstitution(spec);
    		substitutions.push(funcs.substitution);
    		prefixes.push(funcs.prefix);
    		textParts.push(remainder);
    		varNames = varNames.concat(funcs.substitution.varNames);
    	    }
    	    this.fill = function (valueFunction) {
    		var result = textParts[0];
            var i=0, l = substitutions.length;
    		for (i = 0; i < l; i++) {
    		    var substitution = substitutions[i];
    		    result += substitution(valueFunction);
    		    result += textParts[i + 1];
    		}
    		return result;
    	    };
    	    this.varNames = varNames;
    	    this.template = template;
    	}
    	UriTemplate.prototype = {
    		toString: function () {
    		    return this.template;
    		},
    		fillFromObject: function (obj) {
    		    return this.fill(function (varName) {
    			return obj[varName];
    		    });
    		}
    	};
    	var ValidatorContext = function ValidatorContext(parent, collectMultiple, errorMessages, checkRecursive, trackUnknownProperties) {
    	    this.missing = [];
    	    this.missingMap = {};
    	    this.formatValidators = parent ? Object.create(parent.formatValidators) : {};
    	    this.schemas = parent ? Object.create(parent.schemas) : {};
    	    this.collectMultiple = collectMultiple;
    	    this.errors = [];
    	    this.handleError = collectMultiple ? this.collectError : this.returnError;
    	    if (checkRecursive) {
    		this.checkRecursive = true;
    		this.scanned = [];
    		this.scannedFrozen = [];
    		this.scannedFrozenSchemas = [];
    		this.scannedFrozenValidationErrors = [];
    		this.validatedSchemasKey = 'tv4_validation_id';
    		this.validationErrorsKey = 'tv4_validation_errors_id';
    	    }
    	    if (trackUnknownProperties) {
    		this.trackUnknownProperties = true;
    		this.knownPropertyPaths = {};
    		this.unknownPropertyPaths = {};
    	    }
    	    this.errorMessages = errorMessages;
    	    this.definedKeywords = {};
    	    if (parent) {
    		for (var key in parent.definedKeywords) {
    		    this.definedKeywords[key] = parent.definedKeywords[key].slice(0);
    		}
    	    }
    	};
    	ValidatorContext.prototype.defineKeyword = function (keyword, keywordFunction) {
    	    this.definedKeywords[keyword] = this.definedKeywords[keyword] || [];
    	    this.definedKeywords[keyword].push(keywordFunction);
    	};
    	ValidatorContext.prototype.createError = function (code, messageParams, dataPath, schemaPath, subErrors) {
    	    var messageTemplate = this.errorMessages[code] || ErrorMessagesDefault[code];
    	    if (typeof messageTemplate !== 'string') {
    		return new ValidationError(code, "Unknown error code " + code + ": " + JSON.stringify(messageParams), messageParams, dataPath, schemaPath, subErrors);
    	    }
    	    // Adapted from Crockford's supplant()
    	    var message = messageTemplate.replace(/\{([^{}]*)\}/g, function (whole, varName) {
    		var subValue = messageParams[varName];
    		return typeof subValue === 'string' || typeof subValue === 'number' ? subValue : whole;
    	    });
    	    return new ValidationError(code, message, messageParams, dataPath, schemaPath, subErrors);
    	};
    	ValidatorContext.prototype.returnError = function (error) {
    	    return error;
    	};
    	ValidatorContext.prototype.collectError = function (error) {
    	    if (error) {
    		this.errors.push(error);
    	    }
    	    return null;
    	};
    	ValidatorContext.prototype.prefixErrors = function (startIndex, dataPath, schemaPath) {
            var i = 0, l = this.errors.length;
    	    for (i = startIndex; i < l; i++) {
    		this.errors[i] = this.errors[i].prefixWith(dataPath, schemaPath);
    	    }
    	    return this;
    	};
    	ValidatorContext.prototype.banUnknownProperties = function () {
    	    for (var unknownPath in this.unknownPropertyPaths) {
    		var error = this.createError(ErrorCodes.UNKNOWN_PROPERTY, {path: unknownPath}, unknownPath, "");
    		var result = this.handleError(error);
    		if (result) {
    		    return result;
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.addFormat = function (format, validator) {
    	    if (typeof format === 'object') {
    		for (var key in format) {
    		    this.addFormat(key, format[key]);
    		}
    		return this;
    	    }
    	    this.formatValidators[format] = validator;
    	};
    	ValidatorContext.prototype.resolveRefs = function (schema, urlHistory) {
    	    if (schema['$ref'] !== undefined) {
    		urlHistory = urlHistory || {};
    		if (urlHistory[schema['$ref']]) {
    		    return this.createError(ErrorCodes.CIRCULAR_REFERENCE, {urls: Object.keys(urlHistory).join(', ')}, '', '');
    		}
    		urlHistory[schema['$ref']] = true;
    		schema = this.getSchema(schema['$ref'], urlHistory);
    	    }
    	    return schema;
    	};
    	ValidatorContext.prototype.getSchema = function (url, urlHistory) {
    	    var schema;
    	    if (this.schemas[url] !== undefined) {
    		schema = this.schemas[url];
    		return this.resolveRefs(schema, urlHistory);
    	    }
    	    var baseUrl = url;
    	    var fragment = "";
    	    if (url.indexOf('#') !== -1) {
    		fragment = url.substring(url.indexOf("#") + 1);
    		baseUrl = url.substring(0, url.indexOf("#"));
    	    }
    	    if (typeof this.schemas[baseUrl] === 'object') {
    		schema = this.schemas[baseUrl];
    		var pointerPath = decodeURIComponent(fragment);
    		if (pointerPath === "") {
    		    return this.resolveRefs(schema, urlHistory);
    		} else if (pointerPath.charAt(0) !== "/") {
    		    return undefined;
    		}
    		var parts = pointerPath.split("/").slice(1);
            var i = 0, l = parts.length;
    		for (i = 0; i < l; i++) {
    		    var component = parts[i].replace(/~1/g, "/").replace(/~0/g, "~");
    		    if (schema[component] === undefined) {
    			schema = undefined;
    			break;
    		    }
    		    schema = schema[component];
    		}
    		if (schema !== undefined) {
    		    return this.resolveRefs(schema, urlHistory);
    		}
    	    }
    	    if (this.missing[baseUrl] === undefined) {
    		this.missing.push(baseUrl);
    		this.missing[baseUrl] = baseUrl;
    		this.missingMap[baseUrl] = baseUrl;
    	    }
    	};
    	ValidatorContext.prototype.searchSchemas = function (schema, url) {
    	    if (Array.isArray(schema)) {
                var i = 0, l = schema.length;
    		for (i = 0; i < l; i++) {
    		    this.searchSchemas(schema[i], url);
    		}
    	    } else if (schema && typeof schema === "object") {
    		if (typeof schema.id === "string") {
    		    if (isTrustedUrl(url, schema.id)) {
    			if (this.schemas[schema.id] === undefined) {
    			    this.schemas[schema.id] = schema;
    			}
    		    }
    		}
    		for (var key in schema) {
    		    if (key !== "enum") {
    			if (typeof schema[key] === "object") {
    			    this.searchSchemas(schema[key], url);
    			} else if (key === "$ref") {
    			    var uri = getDocumentUri(schema[key]);
    			    if (uri && this.schemas[uri] === undefined && this.missingMap[uri] === undefined) {
    				this.missingMap[uri] = uri;
    			    }
    			}
    		    }
    		}
    	    }
    	};
    	ValidatorContext.prototype.addSchema = function (url, schema) {
    	    // overload
    	    if (typeof url !== 'string' || typeof schema === 'undefined') {
    		if (typeof url === 'object' && typeof url.id === 'string') {
    		    schema = url;
    		    url = schema.id;
    		}
    		else {
    		    return;
    		}
    	    }
    	    if (url === getDocumentUri(url) + "#") {
    		// Remove empty fragment
    		url = getDocumentUri(url);
    	    }
    	    this.schemas[url] = schema;
    	    delete this.missingMap[url];
    	    normSchema(schema, url);
    	    this.searchSchemas(schema, url);
    	};

    	ValidatorContext.prototype.getSchemaMap = function () {
    	    var map = {};
    	    for (var key in this.schemas) {
    		map[key] = this.schemas[key];
    	    }
    	    return map;
    	};

    	ValidatorContext.prototype.getSchemaUris = function (filterRegExp) {
    	    var list = [];
    	    for (var key in this.schemas) {
    		if (!filterRegExp || filterRegExp.test(key)) {
    		    list.push(key);
    		}
    	    }
    	    return list;
    	};

    	ValidatorContext.prototype.getMissingUris = function (filterRegExp) {
    	    var list = [];
    	    for (var key in this.missingMap) {
    		if (!filterRegExp || filterRegExp.test(key)) {
    		    list.push(key);
    		}
    	    }
    	    return list;
    	};

    	ValidatorContext.prototype.dropSchemas = function () {
    	    this.schemas = {};
    	    this.reset();
    	};
    	ValidatorContext.prototype.reset = function () {
    	    this.missing = [];
    	    this.missingMap = {};
    	    this.errors = [];
    	};

    	ValidatorContext.prototype.validateAll = function (data, schema, dataPathParts, schemaPathParts, dataPointerPath) {
    	    var topLevel;
    	    schema = this.resolveRefs(schema);
    	    if (!schema) {
    		return null;
    	    } else if (schema instanceof ValidationError) {
    		this.errors.push(schema);
    		return schema;
    	    }

    	    var startErrorCount = this.errors.length;
    	    var frozenIndex, scannedFrozenSchemaIndex = null, scannedSchemasIndex = null;
    	    if (this.checkRecursive && data && typeof data === 'object') {
    		topLevel = !this.scanned.length;
    		if (data[this.validatedSchemasKey]) {
    		    var schemaIndex = data[this.validatedSchemasKey].indexOf(schema);
    		    if (schemaIndex !== -1) {
    			this.errors = this.errors.concat(data[this.validationErrorsKey][schemaIndex]);
    			return null;
    		    }
    		}
    		if (Object.isFrozen(data)) {
    		    frozenIndex = this.scannedFrozen.indexOf(data);
    		    if (frozenIndex !== -1) {
    			var frozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].indexOf(schema);
    			if (frozenSchemaIndex !== -1) {
    			    this.errors = this.errors.concat(this.scannedFrozenValidationErrors[frozenIndex][frozenSchemaIndex]);
    			    return null;
    			}
    		    }
    		}
    		this.scanned.push(data);
    		if (Object.isFrozen(data)) {
    		    if (frozenIndex === -1) {
    			frozenIndex = this.scannedFrozen.length;
    			this.scannedFrozen.push(data);
    			this.scannedFrozenSchemas.push([]);
    		    }
    		    scannedFrozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].length;
    		    this.scannedFrozenSchemas[frozenIndex][scannedFrozenSchemaIndex] = schema;
    		    this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = [];
    		} else {
    		    if (!data[this.validatedSchemasKey]) {
    			try {
    			    Object.defineProperty(data, this.validatedSchemasKey, {
    				value: [],
    				configurable: true
    			    });
    			    Object.defineProperty(data, this.validationErrorsKey, {
    				value: [],
    				configurable: true
    			    });
    			} catch (e) {
    			    // IE 7/8 workaround
    			    data[this.validatedSchemasKey] = [];
    			    data[this.validationErrorsKey] = [];
    			}
    		    }
    		    scannedSchemasIndex = data[this.validatedSchemasKey].length;
    		    data[this.validatedSchemasKey][scannedSchemasIndex] = schema;
    		    data[this.validationErrorsKey][scannedSchemasIndex] = [];
    		}
    	    }

    	    var errorCount = this.errors.length;
    	    var error = this.validateBasic(data, schema, dataPointerPath) || this.validateNumeric(data, schema, dataPointerPath) || this.validateString(data, schema, dataPointerPath) || this.validateArray(data, schema, dataPointerPath) || this.validateObject(data, schema, dataPointerPath) || this.validateCombinations(data, schema, dataPointerPath) || this.validateHypermedia(data, schema, dataPointerPath) || this.validateFormat(data, schema, dataPointerPath) || this.validateDefinedKeywords(data, schema, dataPointerPath) || null;

    	    if (topLevel) {
        		while (this.scanned.length) {
        		    var item = this.scanned.pop();
        		    delete item[this.validatedSchemasKey];
        		}
        		this.scannedFrozen = [];
        		this.scannedFrozenSchemas = [];
    	    }

    	    if (error || errorCount !== this.errors.length) {
        		while ((dataPathParts && dataPathParts.length) || (schemaPathParts && schemaPathParts.length)) {
        		    var dataPart = (dataPathParts && dataPathParts.length) ? "" + dataPathParts.pop() : null;
        		    var schemaPart = (schemaPathParts && schemaPathParts.length) ? "" + schemaPathParts.pop() : null;
        		    if (error) {
        			    error = error.prefixWith(dataPart, schemaPart);
        		    }
        		    this.prefixErrors(errorCount, dataPart, schemaPart);
        		}
    	    }

    	    if (scannedFrozenSchemaIndex !== null) {
    		    this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = this.errors.slice(startErrorCount);
    	    } else if (scannedSchemasIndex !== null) {
    		    data[this.validationErrorsKey][scannedSchemasIndex] = this.errors.slice(startErrorCount);
    	    }

    	    return this.handleError(error);
    	};
    	ValidatorContext.prototype.validateFormat = function (data, schema) {
    	    if (typeof schema.format !== 'string' || !this.formatValidators[schema.format]) {
    		return null;
    	    }
    	    var errorMessage = this.formatValidators[schema.format].call(null, data, schema);
    	    if (typeof errorMessage === 'string' || typeof errorMessage === 'number') {
    		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage}).prefixWith(null, "format");
    	    } else if (errorMessage && typeof errorMessage === 'object') {
    		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage.message || "?"}, errorMessage.dataPath || null, errorMessage.schemaPath || "/format");
    	    }
    	    return null;
    	};
    	ValidatorContext.prototype.validateDefinedKeywords = function (data, schema, dataPointerPath) {
    	    for (var key in this.definedKeywords) {
    		if (typeof schema[key] === 'undefined') {
    		    continue;
    		}
    		var validationFunctions = this.definedKeywords[key];
            var i = 0, l = validationFunctions.length;
    		for (i = 0; i < l; i++) {
    		    var func = validationFunctions[i];
    		    var result = func(data, schema[key], schema, dataPointerPath);
    		    if (typeof result === 'string' || typeof result === 'number') {
    			return this.createError(ErrorCodes.KEYWORD_CUSTOM, {key: key, message: result}).prefixWith(null, "format");
    		    } else if (result && typeof result === 'object') {
    			var code = result.code;
    			if (typeof code === 'string') {
    			    if (!ErrorCodes[code]) {
    				throw new Error('Undefined error code (use defineError): ' + code);
    			    }
    			    code = ErrorCodes[code];
    			} else if (typeof code !== 'number') {
    			    code = ErrorCodes.KEYWORD_CUSTOM;
    			}
    			var messageParams = (typeof result.message === 'object') ? result.message : {key: key, message: result.message || "?"};
    			var schemaPath = result.schemaPath ||( "/" + key.replace(/~/g, '~0').replace(/\//g, '~1'));
    			return this.createError(code, messageParams, result.dataPath || null, schemaPath);
    		    }
    		}
    	    }
    	    return null;
    	};

    	function recursiveCompare(A, B) {
    	    if (A === B) {
    		return true;
    	    }
    	    if (typeof A === "object" && typeof B === "object") {
    		if (Array.isArray(A) !== Array.isArray(B)) {
    		    return false;
    		} else if (Array.isArray(A)) {
    		    if (A.length !== B.length) {
    			return false;
    		    }
                var i = 0, l = A.length;
    		    for (i = 0; i < l; i++) {
    			if (!recursiveCompare(A[i], B[i])) {
    			    return false;
    			}
    		    }
    		} else {
    		    var key;
    		    for (key in A) {
    			if (B[key] === undefined && A[key] !== undefined) {
    			    return false;
    			}
    		    }
    		    for (key in B) {
    			if (A[key] === undefined && B[key] !== undefined) {
    			    return false;
    			}
    		    }
    		    for (key in A) {
    			if (!recursiveCompare(A[key], B[key])) {
    			    return false;
    			}
    		    }
    		}
    		return true;
    	    }
    	    return false;
    	}

    	ValidatorContext.prototype.validateBasic = function validateBasic(data, schema, dataPointerPath) {
    	    var error;
    	    if (error = this.validateType(data, schema, dataPointerPath)) {
    		return error.prefixWith(null, "type");
    	    }
    	    if (error = this.validateEnum(data, schema, dataPointerPath)) {
    		return error.prefixWith(null, "type");
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateType = function validateType(data, schema) {
    	    if (schema.type === undefined) {
    		return null;
    	    }
    	    var dataType = typeof data;
    	    if (data === null) {
    		dataType = "null";
    	    } else if (Array.isArray(data)) {
    		dataType = "array";
    	    }
    	    var allowedTypes = schema.type;
    	    if (typeof allowedTypes !== "object") {
    		allowedTypes = [allowedTypes];
    	    }

            var i = 0, l = allowedTypes.length;
    	    for (i = 0; i < l; i++) {
    		var type = allowedTypes[i];
    		if (type === dataType || (type === "integer" && dataType === "number" && (data % 1 === 0))) {
    		    return null;
    		}
    	    }
    	    return this.createError(ErrorCodes.INVALID_TYPE, {type: dataType, expected: allowedTypes.join("/")});
    	};

    	ValidatorContext.prototype.validateEnum = function validateEnum(data, schema) {
    	    if (schema["enum"] === undefined) {
    		return null;
    	    }
            var i = 0, l = schema["enum"].length;
    	    for (i = 0; i < l; i++) {
    		var enumVal = schema["enum"][i];
    		if (recursiveCompare(data, enumVal)) {
    		    return null;
    		}
    	    }
    	    return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data});
    	};

    	ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
    	    return this.validateMultipleOf(data, schema, dataPointerPath) || this.validateMinMax(data, schema, dataPointerPath) || this.validateNaN(data, schema, dataPointerPath) || null;
    	};

    	var CLOSE_ENOUGH_LOW = Math.pow(2, -51);
    	var CLOSE_ENOUGH_HIGH = 1 - CLOSE_ENOUGH_LOW;
    	ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
    	    var multipleOf = schema.multipleOf || schema.divisibleBy;
    	    if (multipleOf === undefined) {
    		return null;
    	    }
    	    if (typeof data === "number") {
    		var remainder = (data/multipleOf)%1;
    		if (remainder >= CLOSE_ENOUGH_LOW && remainder < CLOSE_ENOUGH_HIGH) {
    		    return this.createError(ErrorCodes.NUMBER_MULTIPLE_OF, {value: data, multipleOf: multipleOf});
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateMinMax = function validateMinMax(data, schema) {
    	    if (typeof data !== "number") {
    		return null;
    	    }
    	    if (schema.minimum !== undefined) {
    		if (data < schema.minimum) {
    		    return this.createError(ErrorCodes.NUMBER_MINIMUM, {value: data, minimum: schema.minimum}).prefixWith(null, "minimum");
    		}
    		if (schema.exclusiveMinimum && data === schema.minimum) {
    		    return this.createError(ErrorCodes.NUMBER_MINIMUM_EXCLUSIVE, {value: data, minimum: schema.minimum}).prefixWith(null, "exclusiveMinimum");
    		}
    	    }
    	    if (schema.maximum !== undefined) {
    		if (data > schema.maximum) {
    		    return this.createError(ErrorCodes.NUMBER_MAXIMUM, {value: data, maximum: schema.maximum}).prefixWith(null, "maximum");
    		}
    		if (schema.exclusiveMaximum && data === schema.maximum) {
    		    return this.createError(ErrorCodes.NUMBER_MAXIMUM_EXCLUSIVE, {value: data, maximum: schema.maximum}).prefixWith(null, "exclusiveMaximum");
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateNaN = function validateNaN(data) {
    	    if (typeof data !== "number") {
    		return null;
    	    }
    	    if (isNaN(data) === true || data === Infinity || data === -Infinity) {
    		return this.createError(ErrorCodes.NUMBER_NOT_A_NUMBER, {value: data}).prefixWith(null, "type");
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateString = function validateString(data, schema, dataPointerPath) {
    	    return this.validateStringLength(data, schema, dataPointerPath) || this.validateStringPattern(data, schema, dataPointerPath) || null;
    	};

    	ValidatorContext.prototype.validateStringLength = function validateStringLength(data, schema) {
    	    if (typeof data !== "string") {
    		return null;
    	    }
    	    if (schema.minLength !== undefined) {
    		if (data.length < schema.minLength) {
    		    return this.createError(ErrorCodes.STRING_LENGTH_SHORT, {length: data.length, minimum: schema.minLength}).prefixWith(null, "minLength");
    		}
    	    }
    	    if (schema.maxLength !== undefined) {
    		if (data.length > schema.maxLength) {
    		    return this.createError(ErrorCodes.STRING_LENGTH_LONG, {length: data.length, maximum: schema.maxLength}).prefixWith(null, "maxLength");
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateStringPattern = function validateStringPattern(data, schema) {
    	    if (typeof data !== "string" || schema.pattern === undefined) {
    		return null;
    	    }
    	    var regexp = new RegExp(schema.pattern);
    	    if (!regexp.test(data)) {
    		return this.createError(ErrorCodes.STRING_PATTERN, {pattern: schema.pattern}).prefixWith(null, "pattern");
    	    }
    	    return null;
    	};
    	ValidatorContext.prototype.validateArray = function validateArray(data, schema, dataPointerPath) {
    	    if (!Array.isArray(data)) {
    		return null;
    	    }
    	    return this.validateArrayLength(data, schema, dataPointerPath) || this.validateArrayUniqueItems(data, schema, dataPointerPath) || this.validateArrayItems(data, schema, dataPointerPath) || null;
    	};

    	ValidatorContext.prototype.validateArrayLength = function validateArrayLength(data, schema) {
    	    var error;
    	    if (schema.minItems !== undefined) {
    		if (data.length < schema.minItems) {
    		    error = (this.createError(ErrorCodes.ARRAY_LENGTH_SHORT, {length: data.length, minimum: schema.minItems})).prefixWith(null, "minItems");
    		    if (this.handleError(error)) {
    			return error;
    		    }
    		}
    	    }
    	    if (schema.maxItems !== undefined) {
    		if (data.length > schema.maxItems) {
    		    error = (this.createError(ErrorCodes.ARRAY_LENGTH_LONG, {length: data.length, maximum: schema.maxItems})).prefixWith(null, "maxItems");
    		    if (this.handleError(error)) {
    			return error;
    		    }
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateArrayUniqueItems = function validateArrayUniqueItems(data, schema) {
    	    if (schema.uniqueItems) {
            var i = 0, l = data.length;
    		for (i = 0; i < l; i++) {
                var j = 0;
    		    for (j = i + 1; j < l; j++) {
    			if (recursiveCompare(data[i], data[j])) {
    			    var error = (this.createError(ErrorCodes.ARRAY_UNIQUE, {match1: i, match2: j})).prefixWith(null, "uniqueItems");
    			    if (this.handleError(error)) {
    				return error;
    			    }
    			}
    		    }
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateArrayItems = function validateArrayItems(data, schema, dataPointerPath) {
    	    if (schema.items === undefined) {
    		return null;
    	    }
    	    var error, i;
    	    if (Array.isArray(schema.items)) {
            var l = data.length;
    		for (i = 0; i < l; i++) {
    		    if (i < schema.items.length) {
    			if (error = this.validateAll(data[i], schema.items[i], [i], ["items", i], dataPointerPath + "/" + i)) {
    			    return error;
    			}
    		    } else if (schema.additionalItems !== undefined) {
    			if (typeof schema.additionalItems === "boolean") {
    			    if (!schema.additionalItems) {
    				error = (this.createError(ErrorCodes.ARRAY_ADDITIONAL_ITEMS, {})).prefixWith("" + i, "additionalItems");
    				if (this.handleError(error)) {
    				    return error;
    				}
    			    }
    			} else if (error = this.validateAll(data[i], schema.additionalItems, [i], ["additionalItems"], dataPointerPath + "/" + i)) {
    			    return error;
    			}
    		    }
    		}
    	    } else {
            var l = data.length;
    		for (i = 0; i < l; i++) {
    		    if (error = this.validateAll(data[i], schema.items, [i], ["items"], dataPointerPath + "/" + i)) {
    			return error;
    		    }
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateObject = function validateObject(data, schema, dataPointerPath) {
    	    if (typeof data !== "object" || data === null || Array.isArray(data)) {
    		return null;
    	    }
    	    return this.validateObjectMinMaxProperties(data, schema, dataPointerPath) || this.validateObjectRequiredProperties(data, schema, dataPointerPath) || this.validateObjectProperties(data, schema, dataPointerPath) || this.validateObjectDependencies(data, schema, dataPointerPath) || null;
    	};

    	ValidatorContext.prototype.validateObjectMinMaxProperties = function validateObjectMinMaxProperties(data, schema) {
    	    var keys = Object.keys(data);
    	    var error;
    	    if (schema.minProperties !== undefined) {
    		if (keys.length < schema.minProperties) {
    		    error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MINIMUM, {propertyCount: keys.length, minimum: schema.minProperties}).prefixWith(null, "minProperties");
    		    if (this.handleError(error)) {
    			return error;
    		    }
    		}
    	    }
    	    if (schema.maxProperties !== undefined) {
    		if (keys.length > schema.maxProperties) {
    		    error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MAXIMUM, {propertyCount: keys.length, maximum: schema.maxProperties}).prefixWith(null, "maxProperties");
    		    if (this.handleError(error)) {
    			return error;
    		    }
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateObjectRequiredProperties = function validateObjectRequiredProperties(data, schema) {
    	    if (schema.required !== undefined) {
                var i = 0, l = schema.required.length;
    		for (i = 0; i < l; i++) {
    		    var key = schema.required[i];
    		    if (data[key] === undefined) {
    			var error = this.createError(ErrorCodes.OBJECT_REQUIRED, {key: key}).prefixWith(null, "" + i).prefixWith(null, "required");
    			if (this.handleError(error)) {
    			    return error;
    			}
    		    }
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateObjectProperties = function validateObjectProperties(data, schema, dataPointerPath) {
    	    var error;
    	    for (var key in data) {
    		var keyPointerPath = dataPointerPath + "/" + key.replace(/~/g, '~0').replace(/\//g, '~1');
    		var foundMatch = false;
    		if (schema.properties !== undefined && schema.properties[key] !== undefined) {
    		    foundMatch = true;
    		    if (error = this.validateAll(data[key], schema.properties[key], [key], ["properties", key], keyPointerPath)) {
    			return error;
    		    }
    		}
    		if (schema.patternProperties !== undefined) {
    		    for (var patternKey in schema.patternProperties) {
    			var regexp = new RegExp(patternKey);
    			if (regexp.test(key)) {
    			    foundMatch = true;
    			    if (error = this.validateAll(data[key], schema.patternProperties[patternKey], [key], ["patternProperties", patternKey], keyPointerPath)) {
    				return error;
    			    }
    			}
    		    }
    		}
    		if (!foundMatch) {
    		    if (schema.additionalProperties !== undefined) {
    			if (this.trackUnknownProperties) {
    			    this.knownPropertyPaths[keyPointerPath] = true;
    			    delete this.unknownPropertyPaths[keyPointerPath];
    			}
    			if (typeof schema.additionalProperties === "boolean") {
    			    if (!schema.additionalProperties) {
    				error = this.createError(ErrorCodes.OBJECT_ADDITIONAL_PROPERTIES, {}).prefixWith(key, "additionalProperties");
    				if (this.handleError(error)) {
    				    return error;
    				}
    			    }
    			} else {
    			    if (error = this.validateAll(data[key], schema.additionalProperties, [key], ["additionalProperties"], keyPointerPath)) {
    				return error;
    			    }
    			}
    		    } else if (this.trackUnknownProperties && !this.knownPropertyPaths[keyPointerPath]) {
    			this.unknownPropertyPaths[keyPointerPath] = true;
    		    }
    		} else if (this.trackUnknownProperties) {
    		    this.knownPropertyPaths[keyPointerPath] = true;
    		    delete this.unknownPropertyPaths[keyPointerPath];
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateObjectDependencies = function validateObjectDependencies(data, schema, dataPointerPath) {
    	    var error;
    	    if (schema.dependencies !== undefined) {
    		for (var depKey in schema.dependencies) {
    		    if (data[depKey] !== undefined) {
    			var dep = schema.dependencies[depKey];
    			if (typeof dep === "string") {
    			    if (data[dep] === undefined) {
    				error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: dep}).prefixWith(null, depKey).prefixWith(null, "dependencies");
    				if (this.handleError(error)) {
    				    return error;
    				}
    			    }
    			} else if (Array.isArray(dep)) {
                    var i = 0, l = dep.lenth;
    			    for (i = 0; i < l; i++) {
    				var requiredKey = dep[i];
    				if (data[requiredKey] === undefined) {
    				    error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: requiredKey}).prefixWith(null, "" + i).prefixWith(null, depKey).prefixWith(null, "dependencies");
    				    if (this.handleError(error)) {
    					return error;
    				    }
    				}
    			    }
    			} else {
    			    if (error = this.validateAll(data, dep, [], ["dependencies", depKey], dataPointerPath)) {
    				return error;
    			    }
    			}
    		    }
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateCombinations = function validateCombinations(data, schema, dataPointerPath) {
    	    return this.validateAllOf(data, schema, dataPointerPath) || this.validateAnyOf(data, schema, dataPointerPath) || this.validateOneOf(data, schema, dataPointerPath) || this.validateNot(data, schema, dataPointerPath) || null;
    	};

    	ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
    	    if (schema.allOf === undefined) {
    		return null;
    	    }
    	    var error;
            var i = 0, l = schema.allOf.length;
    	    for (i = 0; i < l; i++) {
    		var subSchema = schema.allOf[i];
    		if (error = this.validateAll(data, subSchema, [], ["allOf", i], dataPointerPath)) {
    		    return error;
    		}
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateAnyOf = function validateAnyOf(data, schema, dataPointerPath) {
    	    if (schema.anyOf === undefined) {
    		return null;
    	    }
    	    var errors = [];
    	    var startErrorCount = this.errors.length;
    	    var oldUnknownPropertyPaths, oldKnownPropertyPaths;
    	    if (this.trackUnknownProperties) {
    		oldUnknownPropertyPaths = this.unknownPropertyPaths;
    		oldKnownPropertyPaths = this.knownPropertyPaths;
    	    }
    	    var errorAtEnd = true;
            var i = 0, l = schema.anyOf.length;
    	    for (i = 0; i < l; i++) {
    		if (this.trackUnknownProperties) {
    		    this.unknownPropertyPaths = {};
    		    this.knownPropertyPaths = {};
    		}
    		var subSchema = schema.anyOf[i];

    		var errorCount = this.errors.length;
    		var error = this.validateAll(data, subSchema, [], ["anyOf", i], dataPointerPath);

    		if (error === null && errorCount === this.errors.length) {
    		    this.errors = this.errors.slice(0, startErrorCount);

    		    if (this.trackUnknownProperties) {
    			for (var knownKey in this.knownPropertyPaths) {
    			    oldKnownPropertyPaths[knownKey] = true;
    			    delete oldUnknownPropertyPaths[knownKey];
    			}
    			for (var unknownKey in this.unknownPropertyPaths) {
    			    if (!oldKnownPropertyPaths[unknownKey]) {
    				oldUnknownPropertyPaths[unknownKey] = true;
    			    }
    			}
    			// We need to continue looping so we catch all the
    			// property definitions, but we don't want to return an
    			// error
    			errorAtEnd = false;
    			continue;
    		    }

    		    return null;
    		}
    		if (error) {
    		    errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
    		}
    	    }
    	    if (this.trackUnknownProperties) {
    		this.unknownPropertyPaths = oldUnknownPropertyPaths;
    		this.knownPropertyPaths = oldKnownPropertyPaths;
    	    }
    	    if (errorAtEnd) {
    		errors = errors.concat(this.errors.slice(startErrorCount));
    		this.errors = this.errors.slice(0, startErrorCount);
    		return this.createError(ErrorCodes.ANY_OF_MISSING, {}, "", "/anyOf", errors);
    	    }
    	};

    	ValidatorContext.prototype.validateOneOf = function validateOneOf(data, schema, dataPointerPath) {
    	    if (schema.oneOf === undefined) {
    		return null;
    	    }
    	    var validIndex = null;
    	    var errors = [];
    	    var startErrorCount = this.errors.length;
    	    var oldUnknownPropertyPaths, oldKnownPropertyPaths;
    	    if (this.trackUnknownProperties) {
    		oldUnknownPropertyPaths = this.unknownPropertyPaths;
    		oldKnownPropertyPaths = this.knownPropertyPaths;
    	    }
            var i = 0, l = schema.oneOf.length;
    	    for (i = 0; i < l; i++) {
    		if (this.trackUnknownProperties) {
    		    this.unknownPropertyPaths = {};
    		    this.knownPropertyPaths = {};
    		}
    		var subSchema = schema.oneOf[i];

    		var errorCount = this.errors.length;
    		var error = this.validateAll(data, subSchema, [], ["oneOf", i], dataPointerPath);

    		if (error === null && errorCount === this.errors.length) {
    		    if (validIndex === null) {
    			validIndex = i;
    		    } else {
    			this.errors = this.errors.slice(0, startErrorCount);
    			return this.createError(ErrorCodes.ONE_OF_MULTIPLE, {index1: validIndex, index2: i}, "", "/oneOf");
    		    }
    		    if (this.trackUnknownProperties) {
    			for (var knownKey in this.knownPropertyPaths) {
    			    oldKnownPropertyPaths[knownKey] = true;
    			    delete oldUnknownPropertyPaths[knownKey];
    			}
    			for (var unknownKey in this.unknownPropertyPaths) {
    			    if (!oldKnownPropertyPaths[unknownKey]) {
    				oldUnknownPropertyPaths[unknownKey] = true;
    			    }
    			}
    		    }
    		} else if (error) {
    		    errors.push(error);
    		}
    	    }
    	    if (this.trackUnknownProperties) {
    		this.unknownPropertyPaths = oldUnknownPropertyPaths;
    		this.knownPropertyPaths = oldKnownPropertyPaths;
    	    }
    	    if (validIndex === null) {
    		errors = errors.concat(this.errors.slice(startErrorCount));
    		this.errors = this.errors.slice(0, startErrorCount);
    		return this.createError(ErrorCodes.ONE_OF_MISSING, {}, "", "/oneOf", errors);
    	    } else {
    		this.errors = this.errors.slice(0, startErrorCount);
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateNot = function validateNot(data, schema, dataPointerPath) {
    	    if (schema.not === undefined) {
    		return null;
    	    }
    	    var oldErrorCount = this.errors.length;
    	    var oldUnknownPropertyPaths, oldKnownPropertyPaths;
    	    if (this.trackUnknownProperties) {
    		oldUnknownPropertyPaths = this.unknownPropertyPaths;
    		oldKnownPropertyPaths = this.knownPropertyPaths;
    		this.unknownPropertyPaths = {};
    		this.knownPropertyPaths = {};
    	    }
    	    var error = this.validateAll(data, schema.not, null, null, dataPointerPath);
    	    var notErrors = this.errors.slice(oldErrorCount);
    	    this.errors = this.errors.slice(0, oldErrorCount);
    	    if (this.trackUnknownProperties) {
    		this.unknownPropertyPaths = oldUnknownPropertyPaths;
    		this.knownPropertyPaths = oldKnownPropertyPaths;
    	    }
    	    if (error === null && notErrors.length === 0) {
    		return this.createError(ErrorCodes.NOT_PASSED, {}, "", "/not");
    	    }
    	    return null;
    	};

    	ValidatorContext.prototype.validateHypermedia = function validateCombinations(data, schema, dataPointerPath) {
    	    if (!schema.links) {
    		return null;
    	    }
    	    var error;
            var i = 0, l = schema.links.length;
    	    for (i = 0; i < l; i++) {
    		var ldo = schema.links[i];
    		if (ldo.rel === "describedby") {
    		    var template = new UriTemplate(ldo.href);
    		    var allPresent = true;
                var j = 0, ll = template.varNames.length;
    		    for (j = 0; j < ll; j++) {
    			if (!(template.varNames[j] in data)) {
    			    allPresent = false;
    			    break;
    			}
    		    }
    		    if (allPresent) {
    			var schemaUrl = template.fillFromObject(data);
    			var subSchema = {"$ref": schemaUrl};
    			if (error = this.validateAll(data, subSchema, [], ["links", i], dataPointerPath)) {
    			    return error;
    			}
    		    }
    		}
    	    }
    	};

    	// parseURI() and resolveUrl() are from https://gist.github.com/1088850
    	// - released as public domain by author ("Yaffle") - see comments on
    	// gist

    	function parseURI(url) {
    	    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    	    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    	    return (m ? {
    		href     : m[0] || '',
    		protocol : m[1] || '',
    		authority: m[2] || '',
    		host     : m[3] || '',
    		hostname : m[4] || '',
    		port     : m[5] || '',
    		pathname : m[6] || '',
    		search   : m[7] || '',
    		hash     : m[8] || ''
    	    } : null);
    	}

    	function resolveUrl(base, href) {// RFC 3986

    	    function removeDotSegments(input) {
    		var output = [];
    		input.replace(/^(\.\.?(\/|$))+/, '')
    		.replace(/\/(\.(\/|$))+/g, '/')
    		.replace(/\/\.\.$/, '/../')
    		.replace(/\/?[^\/]*/g, function (p) {
    		    if (p === '/..') {
    			output.pop();
    		    } else {
    			output.push(p);
    		    }
    		});
    		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    	    }

    	    href = parseURI(href || '');
    	    base = parseURI(base || '');

    	    return !href || !base ? null : (href.protocol || base.protocol) +
    		    (href.protocol || href.authority ? href.authority : base.authority) +
    		    removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
    		    (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
    		    href.hash;
    	}

    	function getDocumentUri(uri) {
    	    return uri.split('#')[0];
    	}
    	function normSchema(schema, baseUri) {
    	    if (schema && typeof schema === "object") {
    		if (baseUri === undefined) {
    		    baseUri = schema.id;
    		} else if (typeof schema.id === "string") {
    		    baseUri = resolveUrl(baseUri, schema.id);
    		    schema.id = baseUri;
    		}
    		if (Array.isArray(schema)) {
                var i = 0, l = schema.length;
    		    for (i = 0; i < l; i++) {
    			normSchema(schema[i], baseUri);
    		    }
    		} else {
    		    if (typeof schema['$ref'] === "string") {
    			schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
    		    }
    		    for (var key in schema) {
    			if (key !== "enum") {
    			    normSchema(schema[key], baseUri);
    			}
    		    }
    		}
    	    }
    	}

    	var ErrorCodes = {
    		INVALID_TYPE: 0,
    		ENUM_MISMATCH: 1,
    		ANY_OF_MISSING: 10,
    		ONE_OF_MISSING: 11,
    		ONE_OF_MULTIPLE: 12,
    		NOT_PASSED: 13,
    		// Numeric errors
    		NUMBER_MULTIPLE_OF: 100,
    		NUMBER_MINIMUM: 101,
    		NUMBER_MINIMUM_EXCLUSIVE: 102,
    		NUMBER_MAXIMUM: 103,
    		NUMBER_MAXIMUM_EXCLUSIVE: 104,
    		NUMBER_NOT_A_NUMBER: 105,
    		// String errors
    		STRING_LENGTH_SHORT: 200,
    		STRING_LENGTH_LONG: 201,
    		STRING_PATTERN: 202,
    		// Object errors
    		OBJECT_PROPERTIES_MINIMUM: 300,
    		OBJECT_PROPERTIES_MAXIMUM: 301,
    		OBJECT_REQUIRED: 302,
    		OBJECT_ADDITIONAL_PROPERTIES: 303,
    		OBJECT_DEPENDENCY_KEY: 304,
    		// Array errors
    		ARRAY_LENGTH_SHORT: 400,
    		ARRAY_LENGTH_LONG: 401,
    		ARRAY_UNIQUE: 402,
    		ARRAY_ADDITIONAL_ITEMS: 403,
    		// Custom/user-defined errors
    		FORMAT_CUSTOM: 500,
    		KEYWORD_CUSTOM: 501,
    		// Schema structure
    		CIRCULAR_REFERENCE: 600,
    		// Non-standard validation options
    		UNKNOWN_PROPERTY: 1000
    	};
    	var ErrorCodeLookup = {};
    	for (var key in ErrorCodes) {
    	    ErrorCodeLookup[ErrorCodes[key]] = key;
    	}
    	// TODO: bundle this
    	var ErrorMessagesDefault = {
    		INVALID_TYPE: "Invalid type: {type} (expected {expected})",
    		ENUM_MISMATCH: "No enum match for: {value}",
    		ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
    		ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
    		ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
    		NOT_PASSED: "Data matches schema from \"not\"",
    		// Numeric errors
    		NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
    		NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
    		NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
    		NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
    		NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
    		NUMBER_NOT_A_NUMBER: "Value {value} is not a valid number",
    		// String errors
    		STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
    		STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
    		STRING_PATTERN: "String does not match pattern: {pattern}",
    		// Object errors
    		OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
    		OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
    		OBJECT_REQUIRED: "Missing required property: {key}",
    		OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
    		OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
    		// Array errors
    		ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
    		ARRAY_LENGTH_LONG: "Array is too long ({length}), maximum {maximum}",
    		ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
    		ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
    		// Format errors
    		FORMAT_CUSTOM: "Format validation failed ({message})",
    		KEYWORD_CUSTOM: "Keyword failed: {key} ({message})",
    		// Schema structure
    		CIRCULAR_REFERENCE: "Circular $refs: {urls}",
    		// Non-standard validation options
    		UNKNOWN_PROPERTY: "Unknown property (not in schema)"
    	};

    	function ValidationError(code, message, params, dataPath, schemaPath, subErrors) {
    	    Error.call(this);
    	    if (code === undefined) {
    		throw new Error ("No code supplied for error: "+ message);
    	    }
    	    this.message = message;
    	    this.params = params;
    	    this.code = code;
    	    this.dataPath = dataPath || "";
    	    this.schemaPath = schemaPath || "";
    	    this.subErrors = subErrors || null;

    	    var err = new Error(this.message);
    	    this.stack = err.stack || err.stacktrace;
    	    if (!this.stack) {
    		try {
    		    throw err;
    		}
    		catch(err) {
    		    this.stack = err.stack || err.stacktrace;
    		}
    	    }
    	}
    	ValidationError.prototype = Object.create(Error.prototype);
    	ValidationError.prototype.constructor = ValidationError;
    	ValidationError.prototype.name = 'ValidationError';

    	ValidationError.prototype.prefixWith = function (dataPrefix, schemaPrefix) {
    	    if (dataPrefix !== null) {
    		dataPrefix = dataPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
    		this.dataPath = "/" + dataPrefix + this.dataPath;
    	    }
    	    if (schemaPrefix !== null) {
    		schemaPrefix = schemaPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
    		this.schemaPath = "/" + schemaPrefix + this.schemaPath;
    	    }
    	    if (this.subErrors !== null) {
                var i = 0, l = this.subErrors.length;
    		for (i = 0; i < l; i++) {
    		    this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
    		}
    	    }
    	    return this;
    	};

    	function isTrustedUrl(baseUrl, testUrl) {
    	    if(testUrl.substring(0, baseUrl.length) === baseUrl){
    		var remainder = testUrl.substring(baseUrl.length);
    		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/") || remainder.charAt(0) === "#" || remainder.charAt(0) === "?") {
    		    return true;
    		}
    	    }
    	    return false;
    	}

    	var languages = {};
    	function createApi(language) {
    	    var globalContext = new ValidatorContext();
    	    var currentLanguage = language || 'en';
    	    var api = {
    		    addFormat: function () {
    			globalContext.addFormat.apply(globalContext, arguments);
    		    },
    		    language: function (code) {
    			if (!code) {
    			    return currentLanguage;
    			}
    			if (!languages[code]) {
    			    code = code.split('-')[0]; // fall back to base
    							// language
    			}
    			if (languages[code]) {
    			    currentLanguage = code;
    			    return code; // so you can tell if fall-back has
    					    // happened
    			}
    			return false;
    		    },
    		    addLanguage: function (code, messageMap) {
    			var key;
    			for (key in ErrorCodes) {
    			    if (messageMap[key] && !messageMap[ErrorCodes[key]]) {
    				messageMap[ErrorCodes[key]] = messageMap[key];
    			    }
    			}
    			var rootCode = code.split('-')[0];
    			if (!languages[rootCode]) { // use for base language if
    						    // not yet defined
    			    languages[code] = messageMap;
    			    languages[rootCode] = messageMap;
    			} else {
    			    languages[code] = Object.create(languages[rootCode]);
    			    for (key in messageMap) {
    				if (typeof languages[rootCode][key] === 'undefined') {
    				    languages[rootCode][key] = messageMap[key];
    				}
    				languages[code][key] = messageMap[key];
    			    }
    			}
    			return this;
    		    },
    		    freshApi: function (language) {
    			var result = createApi();
    			if (language) {
    			    result.language(language);
    			}
    			return result;
    		    },
    		    validate: function (data, schema, checkRecursive, banUnknownProperties) {
    			var context = new ValidatorContext(globalContext, false, languages[currentLanguage], checkRecursive, banUnknownProperties);
    			if (typeof schema === "string") {
    			    schema = {"$ref": schema};
    			}
    			context.addSchema("", schema);
    			var error = context.validateAll(data, schema, null, null, "");
    			if (!error && banUnknownProperties) {
    			    error = context.banUnknownProperties();
    			}
    			this.error = error;
    			this.missing = context.missing;
    			this.valid = (error === null);
    			return this.valid;
    		    },
    		    validateResult: function () {
    			var result = {};
    			this.validate.apply(result, arguments);
    			return result;
    		    },
    		    validateMultiple: function (data, schema, checkRecursive, banUnknownProperties) {
    			var context = new ValidatorContext(globalContext, true, languages[currentLanguage], checkRecursive, banUnknownProperties);
    			if (typeof schema === "string") {
    			    schema = {"$ref": schema};
    			}
    			context.addSchema("", schema);
    			context.validateAll(data, schema, null, null, "");
    			if (banUnknownProperties) {
    			    context.banUnknownProperties();
    			}
    			var result = {};
    			result.errors = context.errors;
    			result.missing = context.missing;
    			result.valid = (result.errors.length === 0);
    			return result;
    		    },
    		    addSchema: function () {
    			return globalContext.addSchema.apply(globalContext, arguments);
    		    },
    		    getSchema: function () {
    			return globalContext.getSchema.apply(globalContext, arguments);
    		    },
    		    getSchemaMap: function () {
    			return globalContext.getSchemaMap.apply(globalContext, arguments);
    		    },
    		    getSchemaUris: function () {
    			return globalContext.getSchemaUris.apply(globalContext, arguments);
    		    },
    		    getMissingUris: function () {
    			return globalContext.getMissingUris.apply(globalContext, arguments);
    		    },
    		    dropSchemas: function () {
    			globalContext.dropSchemas.apply(globalContext, arguments);
    		    },
    		    defineKeyword: function () {
    			globalContext.defineKeyword.apply(globalContext, arguments);
    		    },
    		    defineError: function (codeName, codeNumber, defaultMessage) {
    			if (typeof codeName !== 'string' || !/^[A-Z]+(_[A-Z]+)*$/.test(codeName)) {
    			    // TODO message bundle this
    			    throw new Error('Code name must be a string in UPPER_CASE_WITH_UNDERSCORES');
    			}
    			if (typeof codeNumber !== 'number' || codeNumber%1 !== 0 || codeNumber < 10000) {
    			    // TODO message bundle this
    			    throw new Error('Code number must be an integer > 10000');
    			}
    			if (typeof ErrorCodes[codeName] !== 'undefined') {
    			    // TODO message bundle this
    			    throw new Error('Error already defined: ' + codeName + ' as ' + ErrorCodes[codeName]);
    			}
    			if (typeof ErrorCodeLookup[codeNumber] !== 'undefined') {
    			    // TODO message bundle this
    			    throw new Error('Error code already used: ' + ErrorCodeLookup[codeNumber] + ' as ' + codeNumber);
    			}
    			ErrorCodes[codeName] = codeNumber;
    			ErrorCodeLookup[codeNumber] = codeName;
    			ErrorMessagesDefault[codeName] = ErrorMessagesDefault[codeNumber] = defaultMessage;
    			for (var langCode in languages) {
    			    var language = languages[langCode];
    			    if (language[codeName]) {
    				language[codeNumber] = language[codeNumber] || language[codeName];
    			    }
    			}
    		    },
    		    reset: function () {
    			globalContext.reset();
    			this.error = null;
    			this.missing = [];
    			this.valid = true;
    		    },
    		    missing: [],
    		    error: null,
    		    valid: true,
    		    normSchema: normSchema,
    		    resolveUrl: resolveUrl,
    		    getDocumentUri: getDocumentUri,
    		    errorCodes: ErrorCodes
    	    };
    	    return api;
    	}

    	var tv4 = createApi();
    	tv4.addLanguage('en-us', ErrorMessagesDefault);  // changed to US
    							    // Engilsh

    	// legacy property
    	tv4.tv4 = tv4;

	return tv4;
    };
    // End of TV4 fork, will provide base JSON-Schema Draft 4 support and then some


    /**
     * <p>Fork of Jquery i18n plugin turned component<br/>
     * Load and parse message bundle files (.properties), making bundles
	 * keys available as javascript variables.</p>
	 *
	 * <p>i18n files are named <name>.js, or <name>_<language>.js or <name>_<language>_<country>.js
	 * Where: The <language> argument is a valid ISO Language Code. These
	 * codes are the lower-case, two-letter codes as defined by ISO-639. You
	 * can find a full list of these codes at a number of sites, such as:
	 * <em>http://www.loc.gov/standards/iso639-2/englangn.html</em> The <country>
	 * argument is a valid ISO Country Code. These codes are the upper-case,
	 * two-letter codes as defined by ISO-3166. You can find a full list of
	 * these codes at a number of sites, such as:
	 * <em>http://www.iso.ch/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html</em></p>
	 *
	 * <p>Sample usage for a bundles/Messages.properties bundle:
	 * i18n.properties({ name: 'Messages', language: 'en_US', path:
	 * 'bundles' });</p>
     *
     * @constructor i18nBase
     * @private
     */
    var i18nBase = function() {
    	var i18n = {};

    	/** Map holding bundle keys (if mode: 'map') */
    	i18n.map = {};

    	/**
    	 *
         * @method properties
         * @memberof i18nBase
    	 *
    	 * @param name
    	 *                (string/string[], optional) names of file to load (eg,
    	 *                'Messages' or ['Msg1','Msg2']). Defaults to "Messages"
    	 * @param language
    	 *                (string, optional) language/country code (eg, 'en',
    	 *                'en_US', 'pt_PT'). if not specified, language reported
    	 *                by the browser will be used instead.
    	 * @param path
    	 *                (string, optional) path of directory that contains
    	 *                file to load
    	 * @param mode
    	 *                (string, optional) whether bundles keys are available
    	 *                as JavaScript variables/functions or as a map (eg,
    	 *                'vars' or 'map')
    	 * @param cache
    	 *                (boolean, optional) whether bundles should be cached
    	 *                by the browser, or forcibly reloaded on each page
    	 *                load. Defaults to false (i.e. forcibly reloaded)
    	 * @param encoding
    	 *                (string, optional) the encoding to request for
    	 *                bundles. Property file resource bundles are specified
    	 *                to be in ISO-8859-1 format. Defaults to UTF-8 for
    	 *                backward compatibility.
    	 * @param callback
    	 *                (function, optional) callback function to be called
    	 *                after script is terminated
    	 */
    	this.properties = function(settings) {
    	    // set up settings
    	    var defaults = {
    		    name: Augmented.Configuration.MessageBundle,//'Messages',
    		    language: '',
    		    path: '',
    		    mode: 'vars',
    		    cache: false,
    		    encoding: 'UTF-8',
    		    callback: null
    	    };
    	    settings = Augmented.Utility.extend(defaults, settings);
    	    if (settings.language === null || settings.language === '') {
    		settings.language = browserLang();
    	    }
    	    if (settings.language === null) {
    		settings.language = '';
    	    }

    	    // load and parse bundle files
    	    var files = getFiles(settings.name);
            var i = 0, l = files.length;
    	    for (i = 0; i < l; i++) {
    		// 1. load base (eg, Messages.properties)
    		loadAndParseFile(settings.path + files[i] + '.properties', settings);
    		// 2. with language code (eg, Messages_pt.properties)
    		if (settings.language.length >= 2) {
    		    loadAndParseFile(settings.path + files[i] + '_' + settings.language.substring(0, 2) + '.properties', settings);
    		}
    		// 3. with language code and country code (eg,
    		// Messages_pt_PT.properties)
    		if (settings.language.length >= 5) {
    		    loadAndParseFile(settings.path + files[i] + '_' + settings.language.substring(0, 5) + '.properties', settings);
    		}
    	    }

    	    // call callback
    	    if (settings.callback) {
    		settings.callback();
    	    }
    	};

    	/**
    	 * When configured with mode: 'map', allows access to bundle values by
    	 * specifying its key. Eg, prop('com.company.bundles.menu_add')
       * @method prop
       * @memberof i18nBase
    	 */
    	this.prop = function(key /*
    				     * Add parameters as function arguments as
    				     * necessary
    				     */) {
    	    var value = i18n.map[key];
    	    if (!value) {
    		    return '[' + key + ']';
            }

    	    var phvList;
    	    if (arguments.length == 2 && Array.isArray(arguments[1]))
    		// An array was passed as the only parameter, so assume it is
    		// the list of place holder values.
    		phvList = arguments[1];

    	    // Place holder replacement
    	    /**
    	     * Tested with: test.t1=asdf ''{0}'' test.t2=asdf '{0}'
    	     * '{1}'{1}'zxcv test.t3=This is \"a quote" 'a''{0}''s'd{fgh{ij'
    	     * test.t4="'''{'0}''" {0}{a} test.t5="'''{0}'''" {1} test.t6=a {1}
    	     * b {0} c test.t7=a 'quoted \\ s\ttringy' \t\t x
    	     *
    	     * Produces: test.t1, p1 ==> asdf 'p1' test.t2, p1 ==> asdf {0}
    	     * {1}{1}zxcv test.t3, p1 ==> This is "a quote" a'{0}'sd{fgh{ij
    	     * test.t4, p1 ==> "'{0}'" p1{a} test.t5, p1 ==> "'{0}'" {1}
    	     * test.t6, p1 ==> a {1} b p1 c test.t6, p1, p2 ==> a p2 b p1 c
    	     * test.t6, p1, p2, p3 ==> a p2 b p1 c test.t7 ==> a quoted \ s
    	     * tringy x
    	     */

    	    var i;
    	    if (typeof(value) == 'string') {
    		// Handle escape characters. Done separately from the tokenizing
    		// loop below because escape characters are
    		// active in quoted strings.
    		i = 0;
    		while ((i = value.indexOf('\\', i)) != -1) {
    		    if (value.charAt(i + 1) == 't')
    			value = value.substring(0, i) + '\t' + value.substring((i++) + 2); // tab
    		    else if (value.charAt(i + 1) == 'r')
    			value = value.substring(0, i) + '\r' + value.substring((i++) + 2); // return
    		    else if (value.charAt(i + 1) == 'n')
    			value = value.substring(0, i) + '\n' + value.substring((i++) + 2); // line
    											    // feed
    		    else if (value.charAt(i + 1) == 'f')
    			value = value.substring(0, i) + '\f' + value.substring((i++) + 2); // form
    											    // feed
    		    else if (value.charAt(i + 1) == '\\')
    			value = value.substring(0, i) + '\\' + value.substring((i++) + 2); // \
    		    else
    			value = value.substring(0, i) + value.substring(i + 1); // Quietly
    										// drop
    										// the
    										// character
    		}

    		// Lazily convert the string to a list of tokens.
    		var arr = [], j, index;
    		i = 0;
    		while (i < value.length) {
    		    if (value.charAt(i) == '\'') {
    			// Handle quotes
    			if (i == value.length - 1)
    			    value = value.substring(0, i); // Silently drop the
    							    // trailing quote
    			else if (value.charAt(i + 1) == '\'')
    			    value = value.substring(0, i) + value.substring(++i); // Escaped
    										    // quote
    			else {
    			    // Quoted string
    			    j = i + 2;
    			    while ((j = value.indexOf('\'', j)) != -1) {
    				if (j == value.length - 1 || value.charAt(j + 1) != '\'') {
    				    // Found start and end quotes. Remove them
    				    value = value.substring(0, i) + value.substring(i + 1, j) + value.substring(j + 1);
    				    i = j - 1;
    				    break;
    				}
    				else {
    				    // Found a double quote, reduce to a single
    				    // quote.
    				    value = value.substring(0, j) + value.substring(++j);
    				}
    			    }

    			    if (j == -1) {
    				// There is no end quote. Drop the start quote
    				value = value.substring(0, i) + value.substring(i + 1);
    			    }
    			}
    		    }
    		    else if (value.charAt(i) == '{') {
    			// Beginning of an unquoted place holder.
    			j = value.indexOf('}', i + 1);
    			if (j == -1)
    			    i++; // No end. Process the rest of the line.
    				    // Java would throw an exception
    			else {
    			    // Add 1 to the index so that it aligns with the
    			    // function arguments.
    			    index = parseInt(value.substring(i + 1, j));
    			    if (!isNaN(index) && index >= 0) {
    				// Put the line thus far (if it isn't empty)
    				// into the array
    				var s = value.substring(0, i);
    				if (s !== "")
    				    arr.push(s);
    				// Put the parameter reference into the array
    				arr.push(index);
    				// Start the processing over again starting from
    				// the rest of the line.
    				i = 0;
    				value = value.substring(j + 1);
    			    }
    			    else
    				i = j + 1; // Invalid parameter. Leave as is.
    			}
    		    }
    		    else
    			i++;
    		}

    		// Put the remainder of the no-empty line into the array.
    		if (value !== "")
    		    arr.push(value);
    		value = arr;

    		// Make the array the value for the entry.
    		i18n.map[key] = arr;
    	    }

    	    if (value.length === 0)
    		return "";
    	    if (value.lengh == 1 && typeof(value[0]) == "string")
    		return value[0];

    	    var s = "";
            var l = value.length;
    	    for (i = 0; i < l; i++) {
    		if (typeof(value[i]) == "string")
    		    s += value[i];
    		// Must be a number
    		else if (phvList && value[i] < phvList.length)
    		    s += phvList[value[i]];
    		else if (!phvList && value[i] + 1 < arguments.length)
    		    s += arguments[value[i] + 1];
    		else
    		    s += "{" + value[i] + "}";
    	    }

    	    return s;
    	};

    	/*
       * Language reported by browser, normalized code
       */
    	function browserLang() {
    	    return normaliseLanguageCode(navigator.language /* Mozilla */ || navigator.userLanguage /* IE */);
    	}

    	/** Load and parse .properties files
       * @method loadAndParseFile
       * @memberof i18nBase
       * @param filename
       * @param settings
       */
    	function loadAndParseFile(filename, settings) {
    	    Augmented.ajax({
    		url: filename,
    		async: false,
    		cache: settings.cache,
    		contentType: 'text/plain;charset=' + settings.encoding,
    		dataType: 'text',
    		success: function (data, status) {
    		    parseData(data, settings.mode);
    		}
    	    });
    	}

    	/*
       * Parse .properties files
       */
    	function parseData(data, mode) {
    	    var parsed = '';
    	    var parameters = data.split(/\n/);
    	    var regPlaceHolder = /(\{\d+\})/g;
    	    var regRepPlaceHolder = /\{(\d+)\}/g;
    	    var unicodeRE = /(\\u.{4})/ig;
            var i = 0, l = parameters.length;
    	    for (i = 0; i < l; i++) {
    		parameters[i] = parameters[i].replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim
    		if (parameters[i].length > 0 && parameters[i].match("^#") != "#") { // skip
    										    // comments
    		    var pair = parameters[i].split('=');
    		    if (pair.length > 0) {
    			/** Process key & value */
    			var name = unescape(pair[0]).replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim
    			var value = pair.length == 1 ? "" : pair[1];
    			// process multi-line values
    			while (value.match(/\\$/) == "\\") {
    			    value = value.substring(0, value.length - 1);
    			    value += parameters[++i].replace(/\s\s*$/, ''); // right
    									    // trim
    			}
    			// Put values with embedded '='s back together
    			for (var s = 2; s < pair.length; s++) {
    			    value += '=' + pair[s];
    			}
    			value = value.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim

    			/** Mode: bundle keys in a map */
    			if (mode == 'map' || mode == 'both') {
    			    // handle unicode chars possibly left out
    			    var unicodeMatches = value.match(unicodeRE);
    			    if (unicodeMatches) {
    				for (var u = 0; u < unicodeMatches.length; u++) {
    				    value = value.replace(unicodeMatches[u], unescapeUnicode(unicodeMatches[u]));
    				}
    			    }
    			    // add to map
    			    i18n.map[name] = value;
    			}

    			/* Mode: bundle keys as vars/functions */
    			if (mode == 'vars' || mode == 'both') {
    			    value = value.replace(/"/g, '\\"'); // escape quotation mark

    			    // make sure namespaced key exists (eg, some.key')
    			    checkKeyNamespace(name);

    			    // value with variable substitutions
    			    if (regPlaceHolder.test(value)) {
    				var parts = value.split(regPlaceHolder);
    				// process function args
    				var first = true;
    				var fnArgs = '';
    				var usedArgs = [];
    				for (var p = 0; p < parts.length; p++) {
    				    if (regPlaceHolder.test(parts[p]) && (usedArgs.length === 0 || usedArgs.indexOf(parts[p]) === -1)) {
    					if (!first) {
    					    fnArgs += ',';
    					}
    					fnArgs += parts[p].replace(regRepPlaceHolder, 'v$1');
    					usedArgs.push(parts[p]);
    					first = false;
    				    }
    				}
    				parsed += name + '=function(' + fnArgs + '){';
    				// process function body
    				var fnExpr = '"' + value.replace(regRepPlaceHolder, '"+v$1+"') + '"';
    				parsed += 'return ' + fnExpr + ';' + '};';

    				// simple value
    			    } else {
    				parsed += name + '="' + value + '";';
    			    }
    			} // END: Mode: bundle keys as vars/functions
    		    } // END: if(pair.length > 0)
    		} // END: skip comments
    	    }
    	    eval(parsed);
    	}

    	/** Make sure namespace exists (for keys with dots in name) */
    	// TODO key parts that start with numbers quietly fail. i.e.
    	// month.short.1=Jan
    	function checkKeyNamespace(key) {
    	    var regDot = /\./;
    	    if (regDot.test(key)) {
    		var fullname = '';
    		var names = key.split(/\./);
    		for (var i = 0; i < names.length; i++) {
    		    if (i > 0) {
    			fullname += '.';
    		    }
    		    fullname += names[i];
    		    if (eval('typeof ' + fullname + ' == "undefined"')) {
    			eval(fullname + '={};');
    		    }
    		}
    	    }
    	}

    	/* Make sure filename is an array */
    	function getFiles(names) {
    	    return (names && names.constructor == Array) ? names : [names];
    	}

    	/* Ensure language code is in the format aa_AA. */
    	function normaliseLanguageCode(lang) {
    	    lang = lang.toLowerCase();
    	    if (lang.length > 3) {
    		lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
    	    }
    	    return lang;
    	}

    	/* Unescape unicode chars ('\u00e3') */
    	function unescapeUnicode(str) {
    	    // unescape unicode codes
    	    var codes = [];
    	    var code = parseInt(str.substr(2), 16);
    	    if (code >= 0 && code < Math.pow(2, 16)) {
    		codes.push(code);
    	    }
    	    // convert codes to text
    	    var unescaped = '';
    	    for (var i = 0; i < codes.length; ++i) {
    		unescaped += String.fromCharCode(codes[i]);
    	    }
    	    return unescaped;
    	}
    };

    /* Assign an object if null */
    var resourceBundle = (!resourceBundle) ? new i18nBase() : resourceBundle;

    /**
     * ResourceBundle Object used for configuration of a bundle
     * @namespace Augmented.Utility.BundleObject
     * @memberof Augmented.Utility
     * @name Augmented.Utility.BundleObject
     * @property {string} name Name/uri/file of the bundle
     * @property {string} mode Bundlefile type (default: both)
     * @property {boolean} cache Cache reading from bundle (default: true)
     */
    var bundleObject = Augmented.Utility.BundleObject = {
        name: '',
        mode: 'both',
        cache: true
    };

    /**
     * Augmented.Utility.ResourceBundle
     * @namespace Augmented.Utility.ResourceBundle
     * @memberof Augmented.Utility
     * @name Augmented.Utility.ResourceBundle
     */
    Augmented.Utility.ResourceBundle = {
        /**
         * Gets the bundle(s) and registers to Augmented.Utility.ResourceBundle
         * @method getBundle
         * @param {Augmented.Utility.BundleObject} Bundle to get
         * @memberof Augmented.Utility.ResourceBundle
         * @returns {object} returns a bundle
         */
	    getBundle: function() {
		    return resourceBundle.properties.apply(this, arguments);
	    },

        /**
         * Gets a string from the registered bundle
         * @method getString
         * @memberof Augmented.Utility.ResourceBundle
         */
	    getString: function() {
		    return resourceBundle.prop.apply(this, arguments);
	    }
    };

    /**
     * Reads a message out of the bundle
     * @namespace Augmented.Utility.MessageReader
     * @memberof Augmented.Utility
     * @name Augmented.Utility.MessageReader
     */
    Augmented.Utility.MessageReader = {
        /**
         * getMessage - get the message out of the bundle.<br/>
         * If message is not found, then ResourceBundle returns the key
 		 * wrapped in square brackets
 		 * loop through the fallback path of the key by removing the
 		 * last attribute and searching the bundle again
 		 * stop when you get back a real message (not just the [key])
         * @method getMessage
         * @memberof Augmented.Utility.MessageReader
         * @param {string} key The key to return from the bundle
         */
	    getMessage: function(key) {
    		// try getting the message out of the bundle
    		var msg = Augmented.Utility.ResourceBundle.getString.apply(this,arguments),
    		delimiter = ".",
    		last = key.length,
    		originalKey = key;
    		// if message is not found, then ResourceBundle returns the key
    		// wrapped in square brackets
    		// loop through the fallback path of the key by removing the
    		// last attribute and searching the bundle again
    		// stop when you get back a real message (not just the [key])
    		while ( last > 0 && msg == '[' + key + ']') {
    		    last = key.lastIndexOf(delimiter);
    		    key = key.substring(0,last);
    		    msg = Augmented.Utility.ResourceBundle.getString.apply(this,arguments);
    		}
    		// if the original key or a fallback was found, return the
    		// message
    		// otherwise return the original key with square brackets
    		// (default jquery.i18n.properties plugin result)
    		return key ? msg : "[" + originalKey + "]";
	    }
    };

    /**
     * <p>Augmented.Utility.MessageKeyFormatter<br/>
     *
     * Concatenate the pieces of the message together if a portion of the key is
     * missing, the rest of the key is ignored. <em>ex. if the "rule" attribute is
     * missing, then the key will return with the message.level + message.kind only</em></p>
     * @namespace Augmented.Utility.MessageKeyFormatter
     * @memberof Augmented.Utility
     * @name Augmented.Utility.MessageKeyFormatter
     */
    Augmented.Utility.MessageKeyFormatter = {
        /**
         * Key Delimiter
         * @property {srting} delimiter The delimter used to seperate each key
         * @memberof Augmented.Utility.MessageKeyFormatter
         */
	    delimiter: ".",
        /**
         * Format a key for a message
         * @function format
         * @param {message} message The message to format
         * @memberof Augmented.Utility.MessageKeyFormatter
         * @returns The key to lookup in a bundle
         */
	    format: function(message) {
    		var key = "";
            if (message) {
                var x = message.level &&
                (key += message.level, message.kind &&
                (key += this.delimiter + message.kind, message.rule &&
                (key += this.delimiter + message.rule, message.values.title &&
                (key += this.delimiter + message.values.title))));
            }
    		return (key) ? key : "";
	    }
    };

    /**
     * Augmented.ValidationFramework -
     * The Validation Framework Base Wrapper Class.
     * Provides abstraction for base validation build-in library
     * @constructor Augmented.ValidationFramework
     * @memberof Augmented
     */
    var validationFramework = function() {
    	var myValidator;
    	if (myValidator === undefined) {
    	    myValidator = new Validator();
    	}
        /**
         * Returns if the framework supports validation
         * @method supportsValidation
         * @returns {boolean} Returns true if the framework supports validation
         * @memberof Augmented.ValidationFramework
         */
    	this.supportsValidation = function() {
    	    return (myValidator !== null);
    	};
        /**
         * Registers a schema to the Framework
         * @method registerSchema
         * @param {string} identity The identity of the schema
         * @param {object} schema The JSON schema
         * @memberof Augmented.ValidationFramework
         */
    	this.registerSchema = function(identity, schema) {
    	    myValidator.addSchema(identity, schema);
    	};
        /**
         * Gets a schema
         * @method getSchema
         * @param {string} identity The identity of the schema
         * @returns {object} The JSON schema
         * @memberof Augmented.ValidationFramework
         */
    	this.getSchema = function(identity) {
    	    return myValidator.getSchema(identity);
    	};
        /**
         * Gets all schemas
         * @method getSchemas
         * @returns {array} all JSON schemas
         * @memberof Augmented.ValidationFramework
         */
    	this.getSchemas = function() {
    	    return myValidator.getSchemaMap();
    	};
        /**
         * Clears all schemas
         * @method clearSchemas
         * @memberof Augmented.ValidationFramework
         */
    	this.clearSchemas = function() {
    	    myValidator.dropSchemas();
    	};
        /**
         * Validates data via a schema
         * @method validate
         * @param {object} data The data to validate
         * @param {object} The JSON schema
         * @returns {object} Returns the validation object
         * @memberof Augmented.ValidationFramework
         */
    	this.validate = function(data, schema) {
    	    return myValidator.validateMultiple(data, schema);
    	};
        /**
         * Validates data via a schema
         * @method getValidationMessages
         * @returns {array} Returns the validation messages
         * @memberof Augmented.ValidationFramework
         */
    	this.getValidationMessages = function() {
    	    return myValidator.error;
    	};
    };

    Augmented.ValidationFramework = (!Augmented.ValidationFramework) ? new validationFramework() : Augmented.ValidationFramework;

    /**
     * Augmented Model <br/>
     * Supports: <ul>
     * <li>REST</li>
     * <li>Validation and Schemas</li>
     * <li>CORS</li>
     * <li>Security</li>
     * </ul>
     * TODO: implement OAUTH 2
     * @constructor Augmented.Model
     * @memberof Augmented
     * @borrows Backbone.Model
     * @see http://backbonejs.org/#Model
     * @extends Augmented.Object
     */
    var augmentedModel = Backbone.Model.extend({
        /**
         * Schema property
         * @property {object} schema The JSON schema from this model
         * @memberof Augmented.Model
         */
    	schema: null,
        /**
         * mock property
         * @property {boolean} mock Sets mock mode in the model
         * @memberof Augmented.Model
         */
        mock: false,
        /**
         * Validation Message property
         * @property {object} validationMessages The property holding validation message data
         * @memberof Augmented.Model
         */
    	validationMessages: {
    	    valid: true
    	},
        /**
         * supportsValidation - Returns True if this model supports validation
         * @method supportsValidation
         * @memberof Augmented.Model
         * @returns {boolean} Returns True if this model supports validation
         */
    	supportsValidation: function() {
    	    if (this.schema !== null) {
    		    return true;
    	    }
    	    return false;
    	},
        /**
         * isValid - Returns True if this model is valid
         * @method isValid
         * @memberof Augmented.Model
         * @returns {boolean} Returns True if this model is valid
         */
    	isValid: function() {
    	    this.validate();
    	    return this.validationMessages.valid;
    	},
        /**
         * Validates the model
         * @method validate
         * @memberof Augmented.Model
         * @returns {array} Returns array of message from validation
         */
    	validate: function() {
    	    if (this.supportsValidation() && Augmented.ValidationFramework.supportsValidation()) {
    		    // validate from Validator
    		    this.validationMessages = Augmented.ValidationFramework.validate(this.toJSON(), this.schema);
    	    } else {
    		    this.validationMessages.valid = true;
    	    }
    	    return this.validationMessages;
    	},
        /**
         * Cross Origin property
         * @property {boolean} crossOrigin Cross Origin property
         * @memberof Augmented.Model
         */
    	crossOrigin: false,
        /**
         * Model.sync - rewritten sync method from Backbone.Model.sync
         * @method sync
         * @memberof Augmented.Model
         * @borrows Model.sync
         */
    	sync: function(method, model, options) {
    	    if (!options) {
    		    options = {};
    	    }
    	    if (this.crossOrigin === true) {
    		    options.crossDomain = true;
    	    }
    	    if (!options.xhrFields) {
        		options.xhrFields = {
        			withCredentials: true
        		};
    	    }

            if (this.mock) {
                options.mock = this.mock;
            }

            var ret = Augmented.sync(method, model, options);
    	    return ret;
    	}
    });

    // Extend Model with Object base functions
    Augmented.Utility.extend(augmentedModel, Augmented.Object);

    /**
     * Abstract Augmented Collection <br/>
     * Supports: <ul>
     * <li>REST</li>
     * <li>Validation and Schemas</li>
     * <li>CORS</li>
     * <li>Security</li>
     * </ul>
     * TODO: implement OAUTH 2
     * @constructor Augmented.Collection
     * @memberof Augmented
     * @borrows Backbone.Collection
     * @see http://backbonejs.org/#Collection
     * @extends Augmented.Object
     */
    var augmentedCollection = Backbone.Collection.extend({
        /**
         * Schema property
         * @property {object} schema The JSON schema from this collection
         * @memberof Augmented.Collection
         */
    	schema: null,
        /**
         * mock property
         * @property {boolean} mock Sets mock mode in the model
         * @memberof Augmented.Collection
         */
        mock: false,
        /**
         * Validation Message property
         * @property {object} validationMessages The property holding validation message data
         * @memberof Augmented.Collection
         */
    	validationMessages: {
    	    valid: true
    	},
        /**
         * supportsValidation - Returns True if this collection supports validation
         * @method supportsValidation
         * @memberof Augmented.Collection
         * @returns {boolean} Returns True if this collection supports validation
         */
    	supportsValidation: function() {
            return (this.schema && this.schema !== {});
    	},
        /**
         * isValid - Returns True if this collection is valid
         * @method isValid
         * @memberof Augmented.Collection
         * @returns {boolean} Returns True if this collection is valid
         */
    	isValid: function() {
    	    return (this.validationMessages) ? this.validationMessages.valid : true;
    	},
        /**
         * getValidationMessages - Returns the validation messages
         * @method getValidationMessages
         * @memberof Augmented.Collection
         * @returns {array} Returns the message is an array of objects.
         */
        getValidationMessages: function() {
            return (this.validationMessages && this.validationMessages.messages) ? this.validationMessages.messages : [];
        },
        /**
         * Validates the collection
         * @method validate
         * @memberof Augmented.Collection
         * @returns {array} Returns array of message from validation
         */
    	validate: function() {
    	    if (this.supportsValidation() && Augmented.ValidationFramework.supportsValidation()) {
                // validate from Validator
                var messages = [];
                this.validationMessages.messages = messages;
                this.validationMessages.valid = true;

                var a = this.toJSON(), i = 0, l = a.length;
                logger.debug("AUGMENTED: Collection Validate: Beginning with " + l + " models.");
                for (i = 0; i < l; i++) {
                    messages[i] = Augmented.ValidationFramework.validate(a[i], this.schema);
                    if (!messages[i].valid) {
                        this.validationMessages.valid = false;
                    }
                }

                logger.debug("AUGMENTED: Collection Validate: Completed isValid " + this.validationMessages.valid);
    	    } else {
    		    this.validationMessages.valid = true;
    	    }
    	    return this.validationMessages;
    	},
        /**
         * Cross Origin property
         * @property {boolean} crossOrigin Cross Origin property
         * @memberof Augmented.Collection
         */
    	crossOrigin: false,
        /**
         * Collecion.sync - rewritten sync method from Backbone.Collection.sync
         * @method sync
         * @memberof Augmented.Collection
         * @borrows Backbone.sync
         */
    	sync: function(method, model, options) {
    	    if (!options) {
    		    options = {};
    	    }
    	    if (this.crossOrigin === true) {
    		    options.crossDomain = true;
    	    }
    	    if (!options.xhrFields) {
    		    options.xhrFields = {
        			withCredentials: true
        		};
    	    }

            if (this.mock) {
                options.mock = this.mock;
            }

            var ret = Augmented.sync(method, model, options);
    	    return ret;
    	},
        /**
         * Collection.save - Saves the collection as a 'create'
         * @method save
         * @memberof Augmented.Collection
         */
        save: function (options) {
            Augmented.sync("create", this, options);
        },
        /**
         * Collection.update - Updates the collection as a 'update'
         * @method update
         * @memberof Augmented.Collection
         */
        update: function (options) {
            Augmented.sync("update", this, options);
        },
        /**
         * sortByKey - Sorts the collection by a property key
         * @method sortByKey
         * @param {object} key The key to sort by
         * @memberof Augmented.Collection
         */
        sortByKey: function(key) {
            if (key) {
                var data = this.toJSON();
                if (data) {
                    var sorted = Augmented.Utility.Sort(data, key);
                    this.reset(sorted);
                }
            }
        }
    });

	// Extend Collection with Object base functions
    Augmented.Utility.extend(augmentedCollection, Augmented.Object);

    /**
     * Paginated Collection Class - A Collection that handles pagination from client or server-side
     * @constructor Augmented.PaginatedCollection
     * @memberof Augmented
     * @extends Augmented.Collection
     */
    var paginatedCollection = Augmented.PaginatedCollection = augmentedCollection.extend({
        /**
         * Configuration for the pagination
         * @property paginationConfiguration
         * @memberof Augmented.PaginatedCollection
         * @private
         */
        paginationConfiguration: {
            currentPageParam: "page",
            pageSizeParam: "per_page"
        },
        /**
         * Page Size for the collection
         * @property pageSize
         * @memberof Augmented.PaginatedCollection
         * @private
         */
        pageSize: 20,
        /**
         * Current page for the collection
         * @property currentPage
         * @memberof Augmented.PaginatedCollection
         */
        currentPage: 1,
        /**
         * Total pages for the collection
         * @property totalPages
         * @memberof Augmented.PaginatedCollection
         */
        totalPages: 1,
        /**
         * Sets the number of items in a page
         * @method setPageSize
         * @memberof Augmented.PaginatedCollection
         * @param {number} size Number of items in each page
         */
        setPageSize: function(size) {
            if (size) {
                this.pageSize = size;
            }
            this.refresh();
        },
        /**
         * Sets the current page
         * @method setCurrentPage
         * @memberof Augmented.PaginatedCollection
         * @param {number} page Current page in collection
         */
        setCurrentPage: function(page) {
            if (!page) {
                page = 1;
            }
            this.currentPage = page;
            this.refresh();
        },
        /**
         * Sets pagination configuration
         * @method setPaginationConfiguration
         * @memberof Augmented.PaginatedCollection
         * @param {object} config pagination configuration
         * @private
         */
        setPaginationConfiguration: function(config) {
            this.paginationConfiguration = config;
        },
        /**
         * Collection.fetch - rewritten fetch method from Backbone.Collection.fetch
         * @method fetch
         * @memberof Augmented.PaginatedCollection
         * @borrows Collection.fetch
         */
        fetch: function(options) {
            options = (options) ? options : {};
            var data = (options.data || {});
            var p = this.paginationConfiguration;
            var d = {};
            d[p.currentPageParam] = this.currentPage;
            d[p.pageSizeParam] = this.pageSize;

            options.data = d;

            var xhr = Augmented.Collection.prototype.fetch.call(this, options);

            // TODO: parse header links to sync up vars

            return xhr;
        },
        /**
         * Moves to the next page
         * @method nextPage
         * @memberof Augmented.PaginatedCollection
         */
        nextPage: function() {
            if (this.currentPage < this.totalPages) {
                this.currentPage = this.currentPage + 1;
                this.refresh();
            }
        },
        /**
         * Moves to the previous page
         * @method previousPage
         * @memberof Augmented.PaginatedCollection
         */
        previousPage: function() {
            if (this.currentPage > 0) {
                this.currentPage = this.currentPage - 1;
                this.refresh();
            }
        },
        /**
         * Goes to page
         * @method goToPage
         * @memberof Augmented.PaginatedCollection
         * @param {number} page Page to go to
         */
        goToPage: function(page) {
            if ((page) && (page < this.totalPages) && (page > 0)) {
                this.currentPage = page;
                this.refresh();
            }
        },
        /**
         * Moves to the first page
         * @method firstPage
         * @memberof Augmented.PaginatedCollection
         */
        firstPage: function() {
            this.currentPage = 1;
            this.refresh();
        },
        /**
         * Moves to the last page
         * @method lastPage
         * @memberof Augmented.PaginatedCollection
         */
        lastPage: function() {
            this.currentPage = this.totalPages;
            this.refresh();
        },
        /**
         * Refreshes the collection
         * @method refresh
         * @memberof Augmented.PaginatedCollection
         */
        refresh: function() {
            this.fetch();
        }
    });

    /**
     * Types of pagination API
     * @enum
     * @name Augmented.PaginationFactory.type
     * @memberof Augmented.PaginationFactory
     * @property {string} github GitHub API
     * @property {string} solr SOLR API
     * @property {string} database Database-like API
     */
    var paginationAPIType = {
        github: "github",
        solr: "solr",
        database: "database"
    };

    /**
     * Pagination factory for returning pagination collections of an API type
     * @namespace Augmented.PaginationFactory
     * @memberof Augmented
     */
    var paginationFactory = Augmented.PaginationFactory = {
        type: paginationAPIType,
        /**
         * Get a pagination collection of type
         * @method getPaginatedCollection
         * @memberof Augmented.PaginationFactory
         * @param {Augmented.PaginationFactory.type} apiType The API type to return an instance of
         * @param {object} args Collection arguments
         */
        getPaginatedCollection: function(apiType, data) {
            var arg = (data) ? data : {};
            var collection = null;

            if (!apiType) {
                apiType = paginationAPIType.github;
            }
            if (apiType === paginationAPIType.github) {
                collection = new paginatedCollection(arg);
                collection.setPaginationConfiguration({
                    currentPageParam: "page",
                    pageSizeParam: "per_page"
                });
            } else if (apiType === paginationAPIType.solr) {
                collection = new paginatedCollection(arg);
                collection.setPaginationConfiguration({
                    currentPageParam: "start",
                    pageSizeParam: "rows"
                });
            } else if (apiType === paginationAPIType.database) {
                collection = new paginatedCollection(arg);
                collection.setPaginationConfiguration({
                    currentPageParam: "offset",
                    pageSizeParam: "limit"
                });
            }
            return collection;
        }
    };

    /**
     * Augmented View - the base view for handlng display in the MV* Concept
     * @constructor
     * @name Augmented.View
     * @memberof Augmented
     * @borrows Backbone.View
     * @see http://backbonejs.org/#View
     * @extends Augmented.Object
     */
    var augmentedView = Backbone.View.extend({
        /**
         * Custom initialize - Override for custom code
         * @method init
         * @param {object} options Optional options to pass to the view
         * @memberof Augmented.View
         */
        init: function(options) {
        },
        /**
         * Initializes the view - <em>Note: Do not override, use init instead!</em>
         * @method initialize
         * @param {object} options Optional options to pass to the view
         * @memberof Augmented.View
         * @returns {Augmented.View} Returns 'this,' as in, this view context
         */
        initialize: function(options) {
            this.init(options);
            this.render = Augmented.Utility.wrap(this.render, function(render) {
                this.beforeRender();
                render.apply(this);
                //render();
                this.afterRender();
                return this;
            });
        },
        /**
         * Before Render callback for the view
         * @method beforeRender
         * @returns this Context of the view
         * @memberof Augmented.View
         */
        beforeRender: function() {
            return this;
        },
        /**
         * Render callback for the view
         * @method render
         * @returns this Context of the view
         * @memberof Augmented.View
         */
        render: function() {
            return this;
        },
        /**
         * After Render callback for the view
         * @method afterRender
         * @returns this Context of the view
         * @memberof Augmented.View
         */
        afterRender: function() {
            return this;
        },
        /**
         * The name property of the view
         * @property {string} name The Name of the view
         * @memberof Augmented.View
         * @private
         */
        name: "",
        /**
         * Sets the name of the view
         * @method setName
         * @param {string} name The name of the view
         * @memberof Augmented.View
         */
        setName: function(name) {
            this.name = name;
        },
        /**
         * Gets the name of the view
         * @method getName
         * @returns {string} Returns the name of the view
         * @memberof Augmented.View
         */
        getName: function() {
            return this.name;
        },
        /**
         * Permissions in the view
         * @property permissions
         * @memberof Augmented.View
         * @private
         */
        permissions: {
            include: [],
            exclude: []
        },
        /**
         * Adds a permission to the view
         * @method addPermission
         * @param {string} permission The permission to add
         * @param {boolean} negative Flag to set a nagative permission (optional)
         * @memberof Augmented.View
         */
        addPermission: function(permission, negative) {
            if (!negative) {
                negative = false;
            }
            if (permission !== null && !Array.isArray(permission)) {
                var p = (negative) ? this.permissions.exclude : this.permissions.include;
                p.push(permission);
            }
        },
        /**
         * Removes a permission to the view
         * @method removePermission
         * @param {string} permission The permission to remove
         * @param {boolean} negative Flag to set a nagative permission (optional)
         * @memberof Augmented.View
         */
        removePermission: function(permission, negative) {
            if (!negative) {
                negative = false;
            }
            if (permission !== null && !Array.isArray(permission)) {
                var p = (negative) ? this.permissions.exclude : this.permissions.include;
                p.splice((p.indexOf(permission)), 1);
            }
        },
        /**
         * Sets the permissions to the view
         * @method setPermissions
         * @param {array} permissions The permissions to set
         * @param {boolean} negative Flag to set a nagative permission (optional)
         * @memberof Augmented.View
         */
        setPermissions: function(permissions, negative) {
            if (!negative) {
                negative = false;
            }
            if (permissions !== null && Array.isArray(permissions)) {
                if (negative) {
                    this.permissions.exclude = permissions;
                } else {
                    this.permissions.include = permissions;
                }
            }
        },
        /**
         * Gets the permissions to the view<br/>
         * Return format:<br/>
         * <pre>{
         *     include: [],
         *     exclude: []
         * }</pre>
         *
         * @method getPermissions
         * @returns {object} The permissions in the view
         * @memberof Augmented.View
         */
        getPermissions: function() {
            return this.permissions;
        },
        /**
         * Clears the permissions in the view
         * @method clearPermissions
         * @memberof Augmented.View
         */
        clearPermissions: function() {
            this.permissions = {
                include: [],
                exclude: []
            };
        },
        /**
         * Matches a permission in the view
         * @method matchesPermission
         * @param {string} match The permissions to match
         * @param {boolean} negative Flag to set a nagative permission (optional)
         * @returns {boolean} Returns true if the match exists
         * @memberof Augmented.View
         */
        matchesPermission: function(match, negative) {
            if (!negative) {
                negative = false;
            }
            var p = (negative) ? this.permissions.exclude : this.permissions.include;
            return (p.indexOf(match) !== -1);
        },
        /**
         * Callback to return if this view can display
         * @method canDisplay
         * @returns {boolean} Returns true if this view can display
         * @memberof Augmented.View
         */
        canDisplay: function() {
            return true;
        }
    });

    // Extend View with Object base functions
    //Augmented.Utility.extend(augmentedView, Augmented.Object);

    /* Augmented Backbone - Extend Backbone with awesome */
    Augmented.Model = augmentedModel;
    Augmented.Collection = augmentedCollection;
    Augmented.View = augmentedView;

    /**
     * @function history
     * @extends Backbone.history
     * @memberof Augmented
     */
    Augmented.history = Backbone.history;
    /**
     * @class History
     * @extends Backbone.History
     * @memberof Augmented
     */
    Augmented.History = Backbone.History;
    /**
     * @class Router
     * @extends Backbone.Router
     * @memberof Augmented
     */
    Augmented.Router = Backbone.Router;

    Augmented.Object.extend = Augmented.Model.extend = Augmented.Collection.extend = Augmented.Router.extend = Augmented.View.extend = Augmented.History.extend = Augmented.extend;

    /* Core Package */

    /* local Storage */

    /**
     * Local Storage API
     * @constructor augmentedLocalStorage
     * @name augmentedLocalStorage
     * @memberof Augmented
     * @param {boolean} persist Persistant storage or not
     */
    var augmentedLocalStorage = function(persist) {
        /**
         * is Persistant or not
         * @property {boolean} isPersisted Persistant property
         * @memberof augmentedLocalStorage
         */
    	this.isPersisted = persist;

    	this.myStore = null;
        /**
         * Is storage supported
         * @method isSupported
         * @memberof augmentedLocalStorage
         * @returns {boolean} Returns true if supported
         */
    	this.isSupported = function() {
    	    return (typeof (Storage) !== "undefined");
    	};

    	// true = localStorage, false = sessionStorage
    	if (this.isSupported()) {
    	    logger.debug("AUGMENTED: localStorage exists");

    	    if (this.isPersisted) {
    		this.myStore = localStorage;
    	    } else {
    		this.myStore = sessionStorage;
    	    }
    	} else {
    	    logger.warn("AUGMENTED: No localStorage.");
    	}

        /**
         * Gets an item from storage
         * @method getItem
         * @memberof augmentedLocalStorage
         * @param {string} key The key in storage
         * @returns {object} Returns object from storage
         */
    	this.getItem = function(itemKey) {
    	    var item = this.myStore.getItem(itemKey);
    	    if (item) {
    		    return JSON.parse(item);
    	    }
    	    return null;
    	};

        /**
         * Sets an item to storage
         * @method setItem
         * @memberof augmentedLocalStorage
         * @param {string} key The key in storage
         * @param {object} object The data to set
         */
    	this.setItem = function(itemKey, object) {
    	    this.myStore.setItem(itemKey, JSON.stringify(object));
    	};

        /**
         * Removes an item from storage
         * @method removeItem
         * @memberof augmentedLocalStorage
         * @param {string} key The key in storage
         */
    	this.removeItem = function(itemKey) {
    	    this.myStore.removeItem(itemKey);
    	};

        /**
         * Clears storage - <b>Warning: Destructive in non-namespaced instances!</b>
         * @method clear
         * @memberof augmentedLocalStorage
         */
    	this.clear = function() {
    	    this.myStore.clear();
    	};

        /**
         * Gets the key from storage for index
         * @method key
         * @memberof augmentedLocalStorage
         * @param {number} i The index in storage
         * @returns {string} Returns the key from storage
         */
    	this.key = function(i) {
    	    return this.myStore.key(i);
    	};

        /**
         * The length of storage by keys
         * @method length
         * @memberof augmentedLocalStorage
         * @returns {number} Returns the length of storage by keys
         */
    	this.length = function() {
    	    return this.myStore.length;
    	};
    };

    var namespacedAugmentedLocalStorage = function(persist,namespace) {
    	var ls = localStorageFactory.getStorage(persist);
    	this.myNameSpacedStore = new Augmented.Utility.AugmentedMap();
    	this.namespace = namespace;

    	// public
    	this.isSupported = function() {
    	    return (ls && ls.isSupported());
    	};

    	// true = localStorage, false = sessionStorage
    	if (this.isSupported() && this.namespace) {
    	    ls.setItem(this.namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	}

    	this.getItem = function(itemKey) {
            var map = {};
            try {
    	        map = JSON.parse(ls.getItem(this.namespace));
            } catch(e) {
                // TODO: bundle this
                logger.error("AUGMENTED: Augmented Local Strorage could not parse item map from storage!");
                return null;
            }
            this.myNameSpacedStore.clear();
            this.myNameSpacedStore.marshall(map);

    	    var item = this.myNameSpacedStore.get(itemKey);

    	    if (item) {
    		    // support regular string as well as object
        		var ret;
        		try {
        		    ret = JSON.parse(item);
        		} catch(e){
        		    // not JSON
        		    ret = item;
        		}
        		return ret;
    	    }
    	    return null;
    	};

    	this.setItem = function(itemKey, object) {
            if (!this.myNameSpacedStore) {
    		    this.myNameSpacedStore = new Augmented.Utility.AugmentedMap();
    	    }
    	    this.myNameSpacedStore.set(itemKey, object);
    	    ls.setItem(namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	};

    	this.removeItem = function(itemKey) {
    	    var item = this.getItem(itemKey);

    	    this.myNameSpacedStore.remove(itemKey);
    	    ls.setItem(namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	};

    	this.clear = function() {
    	    this.myNameSpacedStore.clear();
    	    ls.setItem(namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	};

    	this.key = function(i) {
    	    return this.myNameSpacedStore.key(i);
    	};

    	this.length = function() {
    	    return this.myNameSpacedStore.size();
    	};
    };

    /**
     * Augmented.LocalStorageFactory
     * Retrieve a local storage Object
     * @namespace Augmented.LocalStorageFactory
     * @name Augmented.LocalStorageFactory
     * @memberof Augmented
     */
    var localStorageFactory = Augmented.LocalStorageFactory = {
        /**
         * @method getStorage Get the storage instance
         * @param {boolean} persist Persistance or not
         * @param {string} namespace The namespace of the storage if needed (optional)
         * @returns Returns an instance of local storage
         * @memberof Augmented.LocalStorageFactory
         */
	    getStorage: function(persist, namespace) {
    		var ls = null;
    		if (namespace) {
    		    ls = new namespacedAugmentedLocalStorage(persist,namespace);
    		} else {
    		    ls = new augmentedLocalStorage(persist);
    		}
    		if (ls && ls.isSupported()) {
    		    return ls;
    		}
    		return null;
	    }
    };

    /**
     * Augmented.LocalStorageCollection
     * A local storage-based Collection
     * @constructor Augmented.Collection
     * @memberof Augmented
     * @extends Augmented.Collection
     */
    Augmented.LocalStorageCollection = Augmented.Collection.extend({
        /**
         * Base key name for the collection (simular to url for rest-based)
         * @property {string} key The key
         * @memberof augmentedLocalStorage
         */
        key: "augmented.localstorage.collection.key",
        /**
         * is Persistant or not
         * @property {boolean} isPersisted Persistant property
         * @memberof LocalStorageCollection
         */
        persist: false,
        /**
         * Storage for the collection
         * @property {string} storage The storage used for the collection
         * @memberof augmentedLocalStorage
         * @private
         */
        storage: null,
        url: null,
        initialize: function (attributes, options) {
            if (options && options.persist) {
                this.persist = options.persist;
            }
            if (options && options.key) {
                this.key = options.key;
            }
            this.storage = Augmented.LocalStorageFactory.getStorage(this.persist,"augmented.localstorage.collection");
        },
        /**
         * @method fetch Fetch the collection
         * @param {object} options Any options to pass
         * @memberof Augmented.augmentedLocalStorage
         */
        fetch: function(options) {
            this.sync('read', this, options);
        },
        /**
         * @method save Save the collection
         * @param {object} options Any options to pass
         * @memberof Augmented.augmentedLocalStorage
         */
        save: function(options) {
            this.sync('create', this, options);
        },
        /**
         * @method update Update the collection
         * @param {object} options Any options to pass
         * @memberof Augmented.augmentedLocalStorage
         */
        update: function(options) {
            this.sync('update', this, options);
        },
        /**
         * @method destroy Destroy the collection
         * @param {object} options Any options to pass
         * @memberof Augmented.augmentedLocalStorage
         */
        destroy: function(options) {
            this.sync('delete', this, options);
        },
        sync: function(method, model, options) {
            if (!options) {
                options = {};
            }
            var s = "", j = {};
            if (method === "create" || method === "update") {
                j = this.toJSON();
                this.storage.setItem(this.key, j);
            } else if (method === "delete") {
                this.storage.removeItem(this.key);
            } else {
                // read
                j = this.storage.getItem(this.key);
                //j = JSON.parse(s);
                this.reset(j);
            }

            return {};
        }
    });


    /**
     * Augmented.Utility.Stack -
     * Standard Stack data structure
     * @constructor Augmented.Utility.Stack
     * @memberof Augmented.Utility
     */
    var stack = Augmented.Utility.Stack = function() {
        this.stack = [];
        /**
         * The empty method clears the stack
         * @method empty
         * @memberof Augmented.Utility.Stack
         */
        this.empty = function() {
            return (this.stack.length === 0);
        };
        /**
         * The peek method returns the first in the stack
         * @method peek
         * @memberof Augmented.Utility.Stack
         * @returns {object} Returns the first object in the stack
         */
        this.peek = function() {
            return this.stack[0];
        };
        /**
         * The pop method returns and removes the first in the stack
         * @method pop
         * @memberof Augmented.Utility.Stack
         * @returns {object} Returns the first object in the stack
         */
        this.pop = function() {
            return this.stack.pop();
        };
        /**
         * The push method adds to the stack
         * @method push
         * @memberof Augmented.Utility.Stack
         * @param {object} item The item to push to the stack
         */
        this.push = function(item) {
            this.stack.push(item);
        };
        /**
         * The search method returns where in the stack an item exists
         * @method search
         * @memberof Augmented.Utility.Stack
         * @returns {number} Returns the index of the item
         */
        this.search = function(item) {
            return this.stack.indexOf(item);
        };
        /**
         * The size method returns the size of the stack
         * @method size
         * @memberof Augmented.Utility.Stack
         * @returns {number} Returns the size of the stack
         */
        this.size = function() {
            return this.stack.length;
        };
        /**
         * The clear method clears the stack
         * @method clear
         * @memberof Augmented.Utility.Stack
         */
        this.clear = function() {
            this.stack.splice(0, this.stack.length);
        };
        /**
         * The toArray method returns the stack as an array
         * @method toArray
         * @memberof Augmented.Utility.Stack
         * @returns {array} Returns the stack as an array
         */
        this.toArray = function() {
            return this.stack;
        };
    };

    /**
     * Augmented.Utility.AsynchronousQueue -
     * An Async queue for handling async chained functions
     * @constructor Augmented.Utility.AsynchronousQueue
     * @param {number} timeout The timout period for each process in the queue (optional)
     * @memberof Augmented.Utility
     */
    var asyncQueue = Augmented.Utility.AsynchronousQueue = function(timeout) {
        var to = (timeout) ? timeout : Augmented.Configuration.AsynchronousQueueTimeout;
        this.queue = {};

        /**
         * @method add The Add method for adding processes to the queue
         * @memberof Augmented.Utility.AsynchronousQueue
         */
        this.add = function() {
            var args = arguments;
            if (args.length <= 0) {
                return false;
            }

            Augmented.Utility.extend(this.queue, args);
        };

        /**
         * @method clear Clear all processes in the queue
         * @memberof Augmented.Utility.AsynchronousQueue
         */
        this.clear = function() {
            if (this.queue.length > 0) {
                this.queue.splice(0, this.queue.length);
            }
        };

        /**
         * @method process Process the queue
         * @memberof Augmented.Utility.AsynchronousQueue
         */
        this.process = function() {
            if (arguments) {
                Augmented.Utility.extend(this.queue, arguments);
            }
            var args = this.queue;
            var l = args.length;
            if (l <= 0) {
                return false;
            }
            (function chain(i) {
                if (i >= l || typeof args[i] !== 'function') {
                    return false;
                }
                window.setTimeout(function() {
                    args[i]();
                    chain(i + 1);
                }, to);
            })(0);
            return true;
        };
        /**
         * @method getTimeout Get the timeout for the queue
         * @memberof Augmented.Utility.AsynchronousQueue
         */
        this.getTimeout = function() {
            return to;
        };
        /**
         * @method getQueue get the full queue
         * @memberof Augmented.Utility.AsynchronousQueue
         */
        this.getQueue = function() {
            return this.queue;
        };
    };

    /**
     * <p>Application Class for use to define an application.<br/>
     * An application contains metadata and initializers for the application.<br/>
     * <em>Applications track history, and normally would contain the entire single page App startup.</em></p>
     * @constructor Augmented.Application
     * @param {string} name Name of the application
     * @memberof Augmented
     * @example var app = new Augmented.Application();
     * app.setName("My Super Application!");
     * app.setMetadataItem("description", "something very awesome");
     * app.beforeInitialize() = function() { do some stuff... };
     * app.start();
     */
    var application = Augmented.Application = function(name) {
		var metadata;
        /**
         * The started property of the view
         * @property started
         * @memberof Augmented.Application
         * @returns {boolean} Returns the property of the started Event
         */
        this.started = false;

        if (!metadata) {
            metadata = new Augmented.Utility.AugmentedMap();
        } else {
            metadata.clear();
        }

        if (name) {
            metadata.set("name", name);
        } else {
            metadata.set("name", "untitled");
        }

        /** Event for after during startup of the application
         * @method initialize
         * @memberof Augmented.Application
         */
        this.initialize = function() {

        };
        /** Event for before the startup of the application
         * @method beforeInitialize
         * @memberof Augmented.Application
         */
        this.beforeInitialize = function() {

        };
        /** Event for after the startup of the application
         * @method afterInitialize
         * @memberof Augmented.Application
         */
        this.afterInitialize = function() {

        };

        /** Get the application name
         * @method getName
         * @memberof Augmented.Application
         */
        this.getName = function() {
            return this.getMetadataItem("name");
        };

        /** Set the application name
         * @method setName
         * @memberof Augmented.Application
         */
        this.setName = function(n) {
            return this.setMetadataItem("name", n);
        };

        /** Get the metadata map
         * @method getMetadata
         * @memberof Augmented.Application
         * @returns Map of metadata in an Augmented.Utility.AugmentedMap
         */
		this.getMetadata = function() {
			return metadata;
		};

        /** Set a specific item in metadata
         * @method setMetadataItem
         * @memberof Augmented.Application
         */
		this.setMetadataItem = function(key, value) {
			metadata.set(key, value);
		};

        /** Get a specific item in metadata
         * @method getMetadataItem
         * @memberof Augmented.Application
         */
		this.getMetadataItem = function(key) {
			return metadata.get(key);
		};

        /** Event to start the application and history
         * @method start
         * @memberof Augmented.Application
         */
        this.start = function() {
            var asyncQueue = new Augmented.Utility.AsynchronousQueue(Augmented.Configuration.ApplicationInitProcessTimeout);
            var startCheck = function() {
                if (!Augmented.History.started) {
                    Augmented.history.start();
                }
            };
            this.started = asyncQueue.process(
                this.beforeInitialize(),
                this.initialize(),
                this.afterInitialize(),
                startCheck()
            );
            if (!this.started) {
                this.stop();
            }
 		};

        /** Event to stop the application and history
         * @method stop
         * @memberof Augmented.Application
         */
        this.stop = function() {
		    if (Augmented.History.started) {
				Augmented.history.stop();
		    }
		    this.started = false;
		};
    };
    Augmented.Application.prototype.constructor = application;

    return Augmented;
}));
