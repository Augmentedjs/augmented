/**
 * polyfill.js - Some base polyfills if needed
 *
 * @author Bob Warren
 *
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	    module.exports = moduleFactory();
    } else if (typeof define === 'function' && define.amd) {
	    define([], moduleFactory);
    } else {
	    window.polyfill = moduleFactory();
    }
}(function() {

    if (!String.prototype.repeat) {
      String.prototype.repeat = function(count) {
        'use strict';
        if (this === null) {
          throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
          count = 0;
        }
        if (count < 0) {
          throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
          throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length === 0 || count === 0) {
          return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
          throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (;;) {
          if ((count & 1) == 1) {
            rpt += str;
          }
          count >>>= 1;
          if (count === 0) {
            break;
          }
          str += str;
        }
        // Could we try:
        // return Array(count + 1).join(this);
        return rpt;
    };
  }

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
}));
