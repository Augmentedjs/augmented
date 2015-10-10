/**
 * Augmented.js - The Core UI Component and package
 *
 * @author Bob Warren
 *
 * @requires Backbone.js
 * @module Augmented
 * @version 0.1.0
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
    /*
     * Save the previous value of the `Augmented` variable, so that it can be
     * restored later on, if `noConflict` is used (just like Backbone)
     */
    var previousAugmented = root.Augmented;
    /**
     * The standard version property
     * @constant VERSION
     */
    Augmented.VERSION = '0.1.0';
    /**
     * A codename for internal use
     * @constant codename
     */
    Augmented.codename = "Adam Jensen";
    /**
     * A release name to help with identification of minor releases
     * @constant releasename
     */
    Augmented.releasename = "Tai Yong";

    /**
     * Runs Augmented.js in 'noConflict' mode, returning the 'Augmented'
     * variable to its previous owner. Returns a reference to 'this' Augmented
     * object.
     * @property Augmented.noConflict
     */
    Augmented.noConflict = function() {
  		root.Augmented = previousAugmented;
        Backbone.noConflict();
  		return this;
    };

    /**
     * Configuration
     */
     Augmented.Configuration = {
                                LoggerLevel: "debug",
                                MessageBundle: "Messages"
                                };

    /*
     * Base functionality
     * Set of base capabilities used throughout the framework
     * . ajax
     * . result
     * . isFunction
     */

     /**
      * Augmented.extend - Can extend base classes via .extend simular to Backbone.js
      * @function Augmented.extend
      */
    Augmented.extend = Backbone.Model.extend;

    /**
     * Augmented.isFunction
     * @function Augmented.isFunction
     * @returns returns true if called name is a function
     * simular to jQuery .isFunction method
     */
    var isFunction = Augmented.isFunction = function(name) {
        return Object.prototype.toString.call(name) == '[object Function]';
    };

    /**
     * Augmented.result
     * @function Augmented.result
     * @returns returns named property in an object
     * simular to underscore .result method
     */
    var result = Augmented.result = function(object, property) {
        if (object === null) return;
        var value = object[property];
        return Augmented.isFunction(value) ? value.call(object) : value;
    };

    var mockXHR = {
         responseType: "text",
         responseText: "",
         async: true,
         status: 200,
         header: {},
         timeout: 70,
         open: function(method, uri, async, user, password) {
             this.url = uri;
             this.async = async;
             this.user = user;
             this.method = method;
         },
         send: function() { this.onload(); },
         setRequestHeader: function(header, value) {
             this.header.header = value;
         }
     };

    /**
     * AJAX capability using simple jQuery-like API
     * Supports the following object properties and features:
     *
     * method
     * url
     * async
     * contentType
     * dataType
     * beforeSend function
     * success callback
     * failure callback
     * complete callback
     * user
     * password
     * withCredentials
     * cache
     * timeout
     * mock - special flag for mocking response
     * @function Augmented.ajax
     * @param {object} ajaxObject object of configuration properties and callbacks.
     * @returns success or failure callback
     */
    var ajax = Augmented.ajax = function(ajaxObject) {
  		if (ajaxObject && ajaxObject.url) {
    	    var method = (ajaxObject.method) ? ajaxObject.method : 'GET';
    	    var cache = (ajaxObject.cache) ? (ajaxObject.cache) : true;

    	    var xhr = (ajaxObject.mock) ? new mockXHR() : new XMLHttpRequest();

            if (ajaxObject.timeout) {
                xhr.timeout = ajaxObject.timeout;
            }
    	    var async = (ajaxObject.async !== undefined) ? ajaxObject.async : true;

    	    // CORS
    	    if (ajaxObject.withCredentials) {
        		xhr.withCredentials = ajaxObject.withCredentials;
        		// Sync Not supported for all browsers in CORS mode
        		async = true;
    	    }

    	    if (async && ajaxObject.dataType) {
                xhr.responseType = (ajaxObject.dataType) ? ajaxObject.dataType : 'text';
    	    }

    	    xhr.open(method, encodeURI(ajaxObject.url), async,
    		      (ajaxObject.user !== undefined) ? ajaxObject.user : '',
	            (ajaxObject.password !== undefined) ? ajaxObject.password : '');
    	    xhr.setRequestHeader('Content-Type', (ajaxObject.contentType) ? ajaxObject.contentType : 'text/plain');

    	    if (!cache) {
                xhr.setRequestHeader('Cache-Control', 'no-cache');
    	    }

    	    xhr.onload = function() {
    		    if (xhr.status > 199 && xhr.status < 300) {
                    ajaxObject.success(xhr.responseText, xhr.status);
    		    } else if (xhr.status > 399 && xhr.status < 600) {
                    ajaxObject.failure(xhr.responseText, xhr.status);
    		    }
                if (ajaxObject.complete) {
                    ajaxObject.complete(xhr.responseText, xhr.status);
                }
                return xhr;
    	    };

            if (ajaxObject.beforeSend) {
                ajaxObject.beforeSend(xhr);
            }

        	xhr.send();
  		}
    };

    /* Overide Backbone.ajax so models and collections use Augmented Ajax instead */
    Backbone.ajax = ajax;

    /**
     * Polyfills for basic capability of ES5.1 and ES6
     *
     * Object.keys Object.create Array.isArray Array.indexOf
     * @function Object.keys
     */
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FObject%2Fkeys
    if (!Object.keys) {
  	Object.keys = (function () {
  	    var hasOwnProperty = Object.prototype.hasOwnProperty,
  	    hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
  	    dontEnums = [
  	                 'toString',
  	                 'toLocaleString',
  	                 'valueOf',
  	                 'hasOwnProperty',
  	                 'isPrototypeOf',
  	                 'propertyIsEnumerable',
  	                 'constructor'
  	                 ],
  	                 dontEnumsLength = dontEnums.length;

  	    return function (obj) {
  		if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
  		    throw new TypeError('Object.keys called on non-object');
  		}

  		var result = [];

  		for (var prop in obj) {
  		    if (hasOwnProperty.call(obj, prop)) {
  			result.push(prop);
  		    }
  		}

  		if (hasDontEnumBug) {
  		    for (var i=0; i < dontEnumsLength; i++) {
  			if (hasOwnProperty.call(obj, dontEnums[i])) {
  			    result.push(dontEnums[i]);
  			}
  		    }
  		}
  		return result;
  	    };
  	})();
  }

    /**
     * Object.create Polyfill
     * @function Object.create
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
     */
    if (!Object.create) {
    	Object.create = (function(){
    	    function F(){}

    	    return function(o){
    		if (arguments.length !== 1) {
    		    throw new Error('Object.create implementation only accepts one parameter.');
    		}
    		F.prototype = o;
    		return new F();
    	    };
    	})();
    }

    /**
     * Array.isArray Polyfill
     * @function Array.isArray
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FisArray
     */
    if(!Array.isArray) {
	Array.isArray = function (vArg) {
	    return Object.prototype.toString.call(vArg) === "[object Array]";
	};
    }

    /**
     * Array.indexOf Polyfill
     * @function Array.indexOf
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
     */
    if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /* , fromIndex */ ) {
	    if (this === null) {
		throw new TypeError();
	    }
	    var t = Object(this);
	    var len = t.length >>> 0;

	    if (len === 0) {
		return -1;
	    }
	    var n = 0;
	    if (arguments.length > 1) {
		n = Number(arguments[1]);
		if (n !== n) { // shortcut for verifying if it's NaN
		    n = 0;
		} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
		    n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
	    }
	    if (n >= len) {
		return -1;
	    }
	    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	    for (; k < len; k++) {
		if (k in t && t[k] === searchElement) {
		    return k;
		}
	    }
	    return -1;
	};
    }

    /**
     * Object.isFrozen hack Polyfill if needed
     * @function Object.isFrozen
     */
    if (!Object.isFrozen) {
    	Object.isFrozen = function (obj) {
    	    var key = "test_frozen_key";
    	    while (obj.hasOwnProperty(key)) {
        		key += Math.random();
        	    }
        	    try {
        		obj[key] = true;
        		delete obj[key];
    		return false;
    	    } catch (e) {
    		return true;
    	    }
    	};
    }

    /**
     * Cross-Browser Split 1.0.1 (c) Steven Levithan <stevenlevithan.com>; MIT
     * License An ECMA-compliant, uniform cross-browser split method
     * @function String.split
     */

    if (!String.prototype.split) {
	var cbSplit;
	// avoid running twice, which would break `cbSplit._nativeSplit`'s
	// reference to the native `split`
	if (!cbSplit) {
	    cbSplit = function (str, separator, limit) {
		// if `separator` is not a regex, use the native `split`
		if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
		    if (typeof cbSplit._nativeSplit == "undefined")
			return str.split(separator, limit);
		    else
			return cbSplit._nativeSplit.call(str, separator, limit);
		}

		var output = [],
		lastLastIndex = 0,
		flags = (separator.ignoreCase ? "i" : "") +
		(separator.multiline ? "m" : "") +
		(separator.sticky ? "y" : ""),
		separator = RegExp(separator.source, flags + "g"), // make
								    // `global`
								    // and avoid
								    // `lastIndex`
								    // issues by
								    // working
								    // with a
								    // copy
		separator2, match, lastIndex, lastLength;

		str = str + ""; // type conversion
		if (!cbSplit._compliantExecNpcg) {
		    separator2 = RegExp("^" + separator.source + "$(?!\\s)", flags); // doesn't
											// need
											// /g
											// or
											// /y,
											// but
											// they
											// don't
											// hurt
		}

		/*
		 * behavior for `limit`: if it's... - `undefined`: no limit. -
		 * `NaN` or zero: return an empty array. - a positive number:
		 * use `Math.floor(limit)`. - a negative number: no limit. -
		 * other: type-convert, then use the above rules.
		 */
		if (limit === undefined || +limit < 0) {
		    limit = Infinity;
		} else {
		    limit = Math.floor(+limit);
		    if (!limit) {
			return [];
		    }
		}

		while (match = separator.exec(str)) {
		    lastIndex = match.index + match[0].length; // `separator.lastIndex`
								// is not
								// reliable
								// cross-browser

		    if (lastIndex > lastLastIndex) {
			output.push(str.slice(lastLastIndex, match.index));

			// fix browsers whose `exec` methods don't consistently
			// return `undefined` for nonparticipating capturing
			// groups
			if (!cbSplit._compliantExecNpcg && match.length > 1) {
			    match[0].replace(separator2, function () {
				for (var i = 1; i < arguments.length - 2; i++) {
				    if (arguments[i] === undefined) {
					match[i] = undefined;
				    }
				}
			    });
			}

			if (match.length > 1 && match.index < str.length) {
			    Array.prototype.push.apply(output, match.slice(1));
			}

			lastLength = match[0].length;
			lastLastIndex = lastIndex;

			if (output.length >= limit) {
			    break;
			}
		    }

		    if (separator.lastIndex === match.index) {
			separator.lastIndex++; // avoid an infinite loop
		    }
		}

		if (lastLastIndex === str.length) {
		    if (lastLength || !separator.test("")) {
			output.push("");
		    }
		} else {
		    output.push(str.slice(lastLastIndex));
		}

		return output.length > limit ? output.slice(0, limit) : output;
	    };

	    cbSplit._compliantExecNpcg = /()??/.exec("")[1] === undefined; // NPCG:
									    // nonparticipating
									    // capturing
									    // group
	    cbSplit._nativeSplit = String.prototype.split;

	} // end `if (!cbSplit)`
	String.prototype.split = function (separator, limit) {
	    return cbSplit(this, separator, limit);
	};
    }

    // ES7 Polyfill
    if (!Array.prototype.includes) {
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

    Array.prototype.has = function(key) {
        return (this.indexOf(key) !== -1);
    };

    /* Packages */

    Augmented.Logger = {};

    /**
     * Augmented Logger
     * @constructor
     * @abstract
     */
    var abstractLogger = function(l) {
        this.label = { info: "info",
                       debug: "debug",
                       error: "error",
                       warn: "warn"
                     };

      this.loggerLevel = (l) ? l : this.label.info;

      this.getLogTime = function() {
          var now = new Date();
          return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " +
           now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds();
      };

      this.log = function(message, level) {
           if (message) {
               if (!level) {
                   level = this.label.info;
               }

               if (this.loggerLevel === this.label.debug && level === this.label.debug) {
                   this.logMe(this.getLogTime() + " [" + this.label.debug + "] " + message, level);
               } else if (level === this.label.error) {
                   this.logMe(this.getLogTime() + " [" + this.label.error + "] " + message, level);
               } else if (this.loggerLevel === this.label.debug || this.loggerLevel === this.label.info) {
                   this.logMe(this.getLogTime() + " [" + this.label.info + "] " + message, level);
               } else if (level === this.label.warn) {
                   this.logMe(this.getLogTime() + " [" + this.label.warn + "] " + message, level);
               }
           }
      };

      this.info = function(message) {
        this.log(message, this.label.info);
    };
      this.error = function(message) {
        this.log(message, this.label.error);
    };
      this.debug = function(message) {
          this.log(message, this.label.debug);
      };
      this.warn = function(message) {
          this.log(message, this.label.warn);
      };
      /*
       * override this in an instance
       * this.logMe = ...
       */
  };

   var consoleLogger = function() {
      abstractLogger.apply(this, arguments);
   };
   consoleLogger.prototype = Object.create(abstractLogger.prototype);
   consoleLogger.prototype.constructor = consoleLogger;

   consoleLogger.prototype.logMe = function(message, level) {
       if (level === this.label.info) {
           console.info(message);
       } else if (level === this.label.error) {
           console.error(message);
       } else if (level === this.label.debug) {
           console.log(message);
       } else if (level === this.label.warn) {
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
       ajax({
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

   var loggerType = Augmented.Logger.Type = { console: "console",
                                              rest: "rest"
                                           };

   var loggerLevel = Augmented.Logger.Level = { info: "info",
                                                 debug: "debug",
                                                 error: "error",
                                                 warn: "warn"
                                               };
   Augmented.Logger.LoggerFactory = {
       getLogger: function(type, level) {
           if (type === loggerType.console) {
               return new consoleLogger(level);
           } else if (type === loggerType.rest) {
               return new restLogger(level);
           }
       }
   };

   /* A private logger for use in the framework only */
   var logger = Augmented.Logger.LoggerFactory.getLogger(loggerType.console, Augmented.Configuration.LoggerLevel);

    /**
     * Utility Package
     *
     * Small utilities
     * @namespace Augmented.Utility
     */
    Augmented.Utility = {};

    /**
     * Object Extend ability simular to jQuery.extend()
     * @function Augmented.Utility.extend
     */
    Augmented.Utility.extend = function() {
    	for(var i=1; i<arguments.length; i++)
    	    for(var key in arguments[i])
    		if(arguments[i].hasOwnProperty(key))
    		    arguments[0][key] = arguments[i][key];
    	return arguments[0];
    };

    /**
     * Augmented Array Utility
     * @function Augmented.Utility.Array
     */
    Augmented.Utility.Array = function(arr) {
      /**
       * Has returns whether a key exists in the Array
       * @function has
       * @param key {string} name of the key
       * @returns true if the key exists in the Array
       */
    	this.has = function(key) {
    	    return (arr.indexOf(key) !== -1);
    	};
    };

    /**
     * ES6-like Map
     * @constructor Augmented.Utility.AugmentedMap
     * @param myData {object} Map data to fill map
     */
    var augmentedMap = Augmented.Utility.AugmentedMap = function(myData) {
    	this.keys = [];
    	this.data = {};

    	// API

      /**
       * Set the value by key in the map
       * @function set
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
       * @function get
       * @param key {string} name of the key
       * @returns The value for the key
       */
    	this.get = function(key) {
    	    return this.data[key];
    	};

      /**
       * Index of the key in the map
       * @function indexOf
       * @param key {string} name of the key
       * @returns index of the key
       */
    	this.indexOf = function(key) {
    	    return this.keys.indexOf(key);
    	};

      /**
       * Remove the value by key in the map
       * @function remove
       * @param key {string} name of the key
       */
    	this.remove = function(key) {
    	    var i = this.indexOf(key);
    	    this.keys.splice(i, 1);
    	    delete this.data[key];
    	};

      /**
       * Has returns whether a key exists in the map
       * @function has
       * @param key {string} name of the key
       * @returns true if the key exists in the map
       */
    	this.has = function(key) {
    	    return (this.indexOf(key) !== -1);
    	};

      /**
       * Iterator forEach key to value in the map
       * @function forEach
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
       * @function key
       * @param i {number} index of the key
       * @returns the key at index
       */
    	this.key = function(i) {
    	    return this.keys[i];
    	};

      /**
       * The entries value object in the map
       * @function entries
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
       * @function values
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
       * @function clear
       */
    	this.clear = function() {
    	    this.keys = [];
    	    this.data = {};
    	};

      /**
       * The size of the map in keys
       * @function size
       * @returns size of map by keys
       */
    	this.size = function() {
    	    return this.keys.length;
    	};

      /**
       * Represent the map in JSON
       * @function toJSON
       * @returns JSON of the map
       */
    	this.toJSON = function() {
    	    return this.data;
    	};

      /**
       * Represent the map in a String of JSON
       * @function toString
       * @returns Stringified JSON of the map
       */
    	this.toString = function() {
    	    return JSON.stringify(this.data);
    	};

    	// non-es6 API

      /**
       * Checks of the map is empty (not ES6)
       * @function isEmpty
       * @returns true if the map is empty
       */
    	this.isEmpty = function() {
    	    return this.keys.length === 0;
    	};

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
                logger.warn("Could not marshall data: " + JSON.stringify(dataToMarshall));
                return false;
            }
            //logger.debug("data to parse: " + JSON.stringify(dataToParse));

            var props = Object.keys(dataToParse);
            for (var i = 0; i < props.length; i++) {
                var p = props[i];
                var v = dataToParse[p];
                logger.debug("setting " + p + ", " + v);
                this.set(p, v);
            }
            return true;
        };

    	if (myData) {
            return this.marshall(myData);
    	}
    };

    /**
     * Base Classes
     */

    /**
     * Augmented Object
	 * Base class for other classes to extend from
	 * triggers events with Backbone.Events
     * @constructor Augmented.Object
     */
	Augmented.Object = function(options) {
    	this.options = Augmented.Utility.extend({}, Augmented.result(this, 'options'), options);
	    this.initialize.apply(this, arguments);
	};

  /**
   * Entend the Object as a new instance
   * @function Augmented.Object.extend
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
   */
  Augmented.Security = {};
  Augmented.Security.Client = {};

  var principal = Augmented.Security.Principal = {
    fullName: "",
    id: 0,
    login: "",
    email: ""
  };

  /**
   * Augmented.Security.Context
   * Used as a security data storage class
   * @class
   */
  var securityContext = Augmented.Security.Context = function(principal, permissions) {
      this.principal = (principal) ? principal : "guest";
      this.permissions = (permissions) ? permissions : [];
      this.getPrincipal = function() {
          return this.principal;
      };

      this.getPermission = function() {
          return this.permissions;
      };

      this.setPermissions = function(p) {
          this.permissions = p;
      };

      this.addPermission = function(p) {
          this.permissions.push(p);
      };

      this.removePermission = function(p) {
          var i = this.permissions.indexOf(p);
          this.permissions.splice(i, 1);
      };

      this.hasPermission = function(p) {
          return (this.permissions.indexOf(p) != -1);
      };
  };

  Augmented.Security.ClientType = { OAUTH2 : 0,
                                    ACL: 1
                                  };

  var abstractSecurityClient = Augmented.Object.extend({
    type: null,
    uri: ""
  });

  Augmented.Security.Client.OAUTH2Client = abstractSecurityClient.extend({
    type: Augmented.Security.ClientType.OAUTH2,
    accessToken: "",
    authorizationToken: "",
    authorize: function(applicationName) {
      // TODO: Go authorize the app and get a token
      this.authorizationToken = "";
    },
    // TODO: Refresh the token and store it
    access: function(principal) {
      this.accessToken = "";
    }
  });

  /** Role/Privilege (ACL) Security
   * assuming data to be the following from an ajax call:
   * login, u
  */
  Augmented.Security.Client.ACLClient = abstractSecurityClient.extend({
    type: Augmented.Security.ClientType.ACL,
    authenticate: function(username, password) {
        var c = null;
        ajax({
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
   * AuthenticationFactory Class
   * Returns a client of given type for use with security
   */
  var authenticationFactory = Augmented.Security.AuthenticationFactory = {
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
 * Augmented.Security.Entry
 * Used to secure a resource
 * @class
 */
  var securityEntry = Augmented.Security.Entry = function(p, neg) {
      this.permissions = (p) ? p : [];
      this.isNegative = (neg) ? neg : false;

      this.getPermissions = function() {
          return this.permissions;
      };
      this.setPermissions = function(p) {
          this.permissions = p;
      };
      this.addPermission = function(p) {
          this.permissions.push(p);
      };
      this.removePermission = function(p) {
          var i = this.permissions.indexOf(p);
          this.permissions.splice(i, 1);
      };
      this.hasPermission = function(p) {
          return (this.permissions.indexOf(p) != -1);
      };
      this.setNegative = function(n) {
          this.isNegative = n;
      };
  };

    /** Validation framework - forked from TV4 and extended
     * @see https://github.com/geraintluff/uri-templates
     * but with all the de-substitution stuff removed
     * @constructor
    */
    var Validator = function() {

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
	    for (var i = 0; i < varList.length; i++) {
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
		for (var i = 0; i < varSpecs.length; i++) {
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
			for (var j = 0; j < value.length; j++) {
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
			if (varSpec.truncate != null) {
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
		for (var i = 0; i < substitutions.length; i++) {
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
	    for (var i = startIndex; i < this.errors.length; i++) {
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
		for (var i = 0; i < parts.length; i++) {
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
		for (var i = 0; i < schema.length; i++) {
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
	    var error = this.validateBasic(data, schema, dataPointerPath)
	    || this.validateNumeric(data, schema, dataPointerPath)
	    || this.validateString(data, schema, dataPointerPath)
	    || this.validateArray(data, schema, dataPointerPath)
	    || this.validateObject(data, schema, dataPointerPath)
	    || this.validateCombinations(data, schema, dataPointerPath)
	    || this.validateHypermedia(data, schema, dataPointerPath)
	    || this.validateFormat(data, schema, dataPointerPath)
	    || this.validateDefinedKeywords(data, schema, dataPointerPath)
	    || null;

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
		for (var i = 0; i < validationFunctions.length; i++) {
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
		    for (var i = 0; i < A.length; i++) {
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

	    for (var i = 0; i < allowedTypes.length; i++) {
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
	    for (var i = 0; i < schema["enum"].length; i++) {
		var enumVal = schema["enum"][i];
		if (recursiveCompare(data, enumVal)) {
		    return null;
		}
	    }
	    return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data});
	};

	ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
	    return this.validateMultipleOf(data, schema, dataPointerPath)
	    || this.validateMinMax(data, schema, dataPointerPath)
	    || this.validateNaN(data, schema, dataPointerPath)
	    || null;
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
	    return this.validateStringLength(data, schema, dataPointerPath)
	    || this.validateStringPattern(data, schema, dataPointerPath)
	    || null;
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
	    return this.validateArrayLength(data, schema, dataPointerPath)
	    || this.validateArrayUniqueItems(data, schema, dataPointerPath)
	    || this.validateArrayItems(data, schema, dataPointerPath)
	    || null;
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
		for (var i = 0; i < data.length; i++) {
		    for (var j = i + 1; j < data.length; j++) {
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
		for (i = 0; i < data.length; i++) {
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
		for (i = 0; i < data.length; i++) {
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
	    return this.validateObjectMinMaxProperties(data, schema, dataPointerPath)
	    || this.validateObjectRequiredProperties(data, schema, dataPointerPath)
	    || this.validateObjectProperties(data, schema, dataPointerPath)
	    || this.validateObjectDependencies(data, schema, dataPointerPath)
	    || null;
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
		for (var i = 0; i < schema.required.length; i++) {
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
			    for (var i = 0; i < dep.length; i++) {
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
	    return this.validateAllOf(data, schema, dataPointerPath)
	    || this.validateAnyOf(data, schema, dataPointerPath)
	    || this.validateOneOf(data, schema, dataPointerPath)
	    || this.validateNot(data, schema, dataPointerPath)
	    || null;
	};

	ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
	    if (schema.allOf === undefined) {
		return null;
	    }
	    var error;
	    for (var i = 0; i < schema.allOf.length; i++) {
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
	    for (var i = 0; i < schema.anyOf.length; i++) {
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
	    for (var i = 0; i < schema.oneOf.length; i++) {
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
	    for (var i = 0; i < schema.links.length; i++) {
		var ldo = schema.links[i];
		if (ldo.rel === "describedby") {
		    var template = new UriTemplate(ldo.href);
		    var allPresent = true;
		    for (var j = 0; j < template.varNames.length; j++) {
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
		    for (var i = 0; i < schema.length; i++) {
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
		for (var i = 0; i < this.subErrors.length; i++) {
		    this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
		}
	    }
	    return this;
	};

	function isTrustedUrl(baseUrl, testUrl) {
	    if(testUrl.substring(0, baseUrl.length) === baseUrl){
		var remainder = testUrl.substring(baseUrl.length);
		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/")
			|| remainder.charAt(0) === "#"
			    || remainder.charAt(0) === "?") {
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
     * Fork of Jquery i18n plugin turned component
     * @constructor
     */
    var i18nBase = function() {
	var i18n = {};

	/** Map holding bundle keys (if mode: 'map') */
	i18n.map = {};

	/**
	 * Load and parse message bundle files (.properties), making bundles
	 * keys available as javascript variables.
	 *
	 * i18n files are named <name>.js, or <name>_<language>.js or <name>_<language>_<country>.js
	 * Where: The <language> argument is a valid ISO Language Code. These
	 * codes are the lower-case, two-letter codes as defined by ISO-639. You
	 * can find a full list of these codes at a number of sites, such as:
	 * http://www.loc.gov/standards/iso639-2/englangn.html The <country>
	 * argument is a valid ISO Country Code. These codes are the upper-case,
	 * two-letter codes as defined by ISO-3166. You can find a full list of
	 * these codes at a number of sites, such as:
	 * http://www.iso.ch/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html
	 *
	 * Sample usage for a bundles/Messages.properties bundle:
	 * i18n.properties({ name: 'Messages', language: 'en_US', path:
	 * 'bundles' });
   * @function properties
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
	    if (settings.language === null || settings.language == '') {
		settings.language = browserLang();
	    }
	    if (settings.language === null) {
		settings.language = '';
	    }

	    // load and parse bundle files
	    var files = getFiles(settings.name);
	    for (var i = 0; i < files.length; i++) {
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
   * @function prop
	 */
	this.prop = function(key /*
				     * Add parameters as function arguments as
				     * necessary
				     */) {
	    var value = i18n.map[key];
	    if (value == null)
		return '[' + key + ']';

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
				if (s != "")
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
		if (value != "")
		    arr.push(value);
		value = arr;

		// Make the array the value for the entry.
		i18n.map[key] = arr;
	    }

	    if (value.length == 0)
		return "";
	    if (value.lengh == 1 && typeof(value[0]) == "string")
		return value[0];

	    var s = "";
	    for (i = 0; i < value.length; i++) {
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

	/**
   * Language reported by browser, normalized code
   * @function browserLang
    * @returns Browser language code
   */
	function browserLang() {
	    return normaliseLanguageCode(navigator.language /* Mozilla */ || navigator.userLanguage /* IE */);
	};

	/** Load and parse .properties files
   * @function loadAndParseFile
   * @param filename
   * @param settings
   */
	function loadAndParseFile(filename, settings) {
	    ajax({
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

	/**
   * Parse .properties files
   * @function parseData
   * @param data
   * @param mode
   */
	function parseData(data, mode) {
	    var parsed = '';
	    var parameters = data.split(/\n/);
	    var regPlaceHolder = /(\{\d+\})/g;
	    var regRepPlaceHolder = /\{(\d+)\}/g;
	    var unicodeRE = /(\\u.{4})/ig;
	    for (var i = 0; i < parameters.length; i++) {
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

			/** Mode: bundle keys as vars/functions */
			if (mode == 'vars' || mode == 'both') {
			    value = value.replace(/"/g, '\\"'); // escape
								// quotation
								// mark (")

			    // make sure namespaced key exists (eg, 'some.key')
			    checkKeyNamespace(name);

			    // value with variable substitutions
			    if (regPlaceHolder.test(value)) {
				var parts = value.split(regPlaceHolder);
				// process function args
				var first = true;
				var fnArgs = '';
				var usedArgs = [];
				for (var p = 0; p < parts.length; p++) {
				    if (regPlaceHolder.test(parts[p]) && (usedArgs.length == 0 || usedArgs.indexOf(parts[p]) == -1)) {
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

	/** Make sure filename is an array */
	function getFiles(names) {
	    return (names && names.constructor == Array) ? names : [names];
	}

	/** Ensure language code is in the format aa_AA. */
	function normaliseLanguageCode(lang) {
	    lang = lang.toLowerCase();
	    if (lang.length > 3) {
		lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
	    }
	    return lang;
	}

	/** Unescape unicode chars ('\u00e3') */
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
    }

    /* Assign an object if null */
    var resourceBundle = (!resourceBundle) ? new i18nBase() : resourceBundle;

    Augmented.Utility.ResourceBundle = {
	    getBundle: function() {
		    return resourceBundle.properties.apply(this, arguments);
	    },

	    getString: function() {
		    return resourceBundle.prop.apply(this, arguments);
	    }
    }

    Augmented.Utility.MessageReader = {
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
     * Augmented.Utility.MessageKeyFormatter
     *
     * concatenate the pieces of the error together if a portion of the key is
     * missing, the rest of the key is ignored. ex. if the "rule" attribute is
     * missing, then the key will return with the error.level + error.kind only
     */
    Augmented.Utility.MessageKeyFormatter = {
	    delimiter: ".",
	    format:function(error) {
		var key = "";
		error.level && (key += error.level, error.kind && (key += this.delimiter + error.kind, error.rule && (key += this.delimiter + error.rule, error.values.title && (key += this.delimiter + error.values.title))));
		return key;
	    }
    };

    /**
     * The Validation Framework Base Wrapper Class
     * Provides abstraction for base validation build-in library
     */
    var validationFramework = function() {
	var myValidator;
	if (myValidator === undefined) {
	    myValidator = new Validator();
	}

	this.supportsValidation = function() {
	    return (myValidator != null);
	}
	this.registerSchema = function(identity, schema) {
	    myValidator.addSchema(identity, schema);
	}
	this.getSchema = function(identity) {
	    return myValidator.getSchema(identity);
	}
	this.getSchemas = function() {
	    return myValidator.getSchemaMap();
	}
	this.clearSchemas = function() {
	    myValidator.dropSchemas();
	}
	this.validate = function(data, schema) {
	    return myValidator.validateMultiple(data, schema);
	}
	this.getValidationMessages = function() {
	    return myValidator.error;
	}
    };

    Augmented.ValidationFramework = (!Augmented.ValidationFramework) ? new validationFramework() : Augmented.ValidationFramework;

    /**
     * Abstract Augmented Model Supports: CORS Schemas Security * TODO:
     * implement OAUTH 2
     */
    var augmentedModel = Backbone.Model.extend({
    	schema: null,
    	validationMessages: {
    	    valid: true
    	},
    	supportsValidation: function() {
    	    if (this.schema != null) {
    		    return true;
    	    }
    	    return false;
    	},
    	isValid: function() {
    	    this.validate();
    	    return this.validationMessages.valid;
    	},
    	validate: function() {
    	    if (this.supportsValidation()
    		    && Augmented.ValidationFramework.supportsValidation()) {
    		    // validate from Validator
    		    this.validationMessages = Augmented.ValidationFramework.validate(this.toJSON(), this.schema);
    	    } else {
    		    this.validationMessages.valid = true;
    	    }
    	    return this.validationMessages;
    	},
    	crossOrigin: false,
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
    	    return Backbone.sync(method, model, options);
    	}
    });

    // Extend Model with Object base functions
    Augmented.Utility.extend(augmentedModel, Augmented.Object);

    var paginationConfig = {

    };

    /**
     * Abstract Augmented Collection Supports: CORS Schemas Security * TODO:
     * implement OAUTH 2
     */
    var augmentedCollection = Backbone.Collection.extend({
    	schema: null,
    	validationMessages: {
    	    valid: true
    	},
    	supportsValidation: function() {
    	    if (this.schema != null) {
    		    return true;
    	    }
    	    return false;
    	},
    	isValid: function() {
    	    this.validate();
    	    return this.validationMessages.valid;
    	},
    	validate: function() {
    	    if (this.supportsValidation()
    		    && Augmented.ValidationFramework.supportsValidation()) {
    		// validate from Validator

    		// TODO: Should we validate every model to call this valid or is
    		// this be a 'instance' validation?
    		this.validationMessages = Augmented.ValidationFramework.validate(this.toJSON(), this.schema);
    	    } else {
    		this.validationMessages.valid = true;
    	    }
    	    return this.validationMessages;
    	},
    	crossOrigin: false,
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
    	    return Backbone.sync(method, model, options);
    	}
    });

	// Extend Collection with Object base functions
    Augmented.Utility.extend(augmentedCollection, Augmented.Object);

    var paginatedCollection = Augmented.PaginatedCollection = augmentedCollection.extend({
        paginationConfiguration: {
            currentPageParam: "page",
            pageSizeParam: "per_page",
            pageSize: 20,
            currentPage: 1
        },
        setPaginationConfiguration: function(config) {
            this.paginationConfiguration = config;
        },
        fetch() {
            var p = this.paginationConfiguration;

            //TODO: set the right key names
            var mainArguments = Array.prototype.slice.call(arguments);
            mainArguments.push({ data: {"page": p.currentPage, "per_page": p.pageSize} });
            return Backbone.fetch.apply(this, mainArguments);
        }
    });

    var augmentedView = Backbone.View.extend({
        name: "",
        setName: function(name) {
            this.name = name;
        },
        getName: function() {
            return this.name;
        },
        permissions: { include: [],
                       exclude: []
                     },
        addPermission: function(permission, negative) {
            if (permission != null && !Array.isArray(permission)) {
                var p = (negative) ? this.permissions.exclude : this.permissions.include;
                p.push(permission);
            }
        },
        removePermission: function(permission, negative) {
            if (permission != null && !Array.isArray(permission)) {
                var p = (negative) ? this.permissions.exclude : this.permissions.include;
                p.splice((p.indexOf(permission)), 1);
            }
        },
        setPermissions: function(permissions, negative) {
            if (permissions != null && Array.isArray(permissions)) {
                if (negative) {
                    this.permissions.exclude = permissions;
                } else {
                    this.permissions.include = permissions;
                }
            }
        },
        getPermissions: function() {
            return this.permissions;
        },
        clearPermissions: function() {
            this.permissions = {
                            include: [],
                            exclude: []
                            };
        },
        matchesPermission: function(match, negative) {
            var p = (negative) ? this.permissions.exclude : this.permissions.include;
            return (p.indexOf(match) !== -1);
        },
        canDisplay: function() {
            return true;
        }
    });

    // Extend View with Object base functions
    Augmented.Utility.extend(augmentedView, Augmented.Object);

    /** Augmented Backbone - Extend Backbone with awesome */
    Augmented.Model = augmentedModel;
    Augmented.Collection = augmentedCollection;
    Augmented.View = augmentedView;
    Augmented.history = Backbone.history;
    Augmented.History = Backbone.History;
    Augmented.Router = Backbone.Router;

    /** Core Package */

    /** local Storage */

    var augmentedLocalStorage = function(persist) {
    	this.isPersisted = persist;
    	this.myStore = null;
    	this.isSupported = function() {
    	    return (typeof (Storage) !== "undefined");
    	}

    	// true = localStorage, false = sessionStorage
    	if (this.isSupported()) {
    	    console.log("localStorage exists");

    	    if (this.isPersisted) {
    		this.myStore = localStorage;
    	    } else {
    		this.myStore = sessionStorage;
    	    }
    	} else {
    	    console.log("No localStorage.");
    	}

    	this.getItem = function(itemKey) {
    	    var item = this.myStore.getItem(itemKey);
    	    if (item) {
    		return JSON.parse(item);
    	    }
    	    return null;
    	}

    	this.setItem = function(itemKey, object) {
    	    this.myStore.setItem(itemKey, JSON.stringify(object));
    	}

    	this.removeItem = function(itemKey) {
    	    this.myStore.removeItem(itemKey);
    	}

    	this.clear = function() {
    	    this.myStore.clear();
    	}

    	this.key = function(i) {
    	    return this.myStore.key(i);
    	}

    	this.length = function() {
    	    return this.myStore.length;
    	}
    };

    var namespacedAugmentedLocalStorage = function(persist,namespace) {
    	var ls = localStorageFactory.getStorage(persist);
    	this.myNameSpacedStore = new Augmented.Utility.AugmentedMap();
    	this.namespace = namespace;

    	// public
    	this.isSupported = function() {
    	    return (ls && ls.isSupported());
    	}

    	// true = localStorage, false = sessionStorage
    	if (this.isSupported() && this.namespace) {
    	    ls.setItem(this.namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	}

    	this.getItem = function(itemKey) {
            var map = {};
            try {
    	        map = JSON.parse(ls.getItem(this.namespace));
            } catch(e) {
                logger.error("Could not parse item map fro storage!");
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
    	}

    	this.setItem = function(itemKey, object) {
            if (!this.myNameSpacedStore) {
    		    this.myNameSpacedStore = new Augmented.Utility.AugmentedMap();
    	    }
    	    this.myNameSpacedStore.set(itemKey, object);
    	    ls.setItem(namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	}

    	this.removeItem = function(itemKey) {
    	    var item = this.getItem(itemKey);

    	    this.myNameSpacedStore.remove(itemKey);
    	    ls.setItem(namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	}

    	this.clear = function() {
    	    this.myNameSpacedStore.clear();
    	    ls.setItem(namespace, JSON.stringify(this.myNameSpacedStore.toJSON()));
    	}

    	this.key = function(i) {
    	    return this.myNameSpacedStore.key(i);
    	}

    	this.length = function() {
    	    return this.myNameSpacedStore.size();
    	}
    };

    /**
     * Augmented.LocalStorageFactory
     * Retrieve a local storage Object
     * @function
     */
    var localStorageFactory = Augmented.LocalStorageFactory = {
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
     * Augmented.Utility.Stack
     * Standard Stack data structure
     * @class
     */
    var stack = Augmented.Utility.Stack = function() {
        this.stack = [];
        this.empty = function() {
            return (this.stack.length === 0);
        };
        this.peek = function() {
            return this.stack[0];
        };
        this.pop = function() {
            return this.stack.pop();
        };
        this.push = function(item) {
            this.stack.push(item);
        };
        this.search = function(item) {
            return this.stack.indexOf(item);
        };
        this.size = function() {
            return this.stack.length;
        };
        this.clear = function() {
            this.stack.splice(0,this.stack.length);
        };
        this.toArray = function() {
            return this.stack;
        };
    };

    /**
     * Augmented.Utility.AsynchronousQueue
     * An Async queue for handling async chained functions
     */
    var asyncQueue = Augmented.Utility.AsynchronousQueue = function(timeout) {
        var to = (timeout) ? timeout : 2000;
        this.queue = {};

        this.add = function() {
            var args = arguments;
            if (args.length <= 0) {
                return false;
            }

            Augmented.Utility.extend(this.queue, args);
        }

        this.clear = function() {
            if (this.queue.length > 0) {
                this.queue.splice(0,this.queue.length);
            }
        }

        this.process = function() {
            if (arguments) {
                Augmented.Utility.extend(this.queue, arguments);
            }
            var args = this.queue;
            if (args.length <= 0) {
                return false;
            }
            (function chain(i) {
                if (i >= args.length || typeof args[i] !== 'function') {
                    return false;
                }
                window.setTimeout(function() {
                    args[i]();
                    chain(i + 1);
                }, to);
            })(0);
            return true;
        };
        this.getTimeout = function() {
            return to;
        }
        this.getQueue = function() {
            return this.queue;
        }
    };

    /**
     * Application Class for use to define an application
     * @constructor
     */
    var application = Augmented.Application = function(name) {
		var metadata;
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

        // Events for use in the startup of the application
        this.initialize = function() {

        }
        this.beforeInitialize = function() {

        }
        this.afterInitialize = function() {

        }

        this.getName = function() {
            return this.getMetadataItem("name");
        }

        this.setName = function(n) {
            return this.setMetadataItem("name", n);
        }

		this.getMetadata = function() {
			return metadata;
		}

		this.setMetadataItem = function(key, value) {
			metadata.set(key, value);
		}

		this.getMetadataItem = function(key) {
			return metadata.get(key);
		}

		this.start = function() {
            var asyncQueue = new Augmented.Utility.AsynchronousQueue(1000);
            this.started = asyncQueue.process(
                this.beforeInitialize(),
                this.initialize(),
                this.afterInitialize(),
                function() {
                    if (!Augmented.history.started) {
        				Augmented.history.start();
        		    }
                }
            );
            if (!this.started) {
                this.stop();
            }
		}

        this.stop = function() {
		    if (Augmented.history.started) {
				Augmented.history.stop();
		    }
		    this.started = false;
		}
    };
    Augmented.Application.prototype.constructor = application;

    return Augmented;
}));
