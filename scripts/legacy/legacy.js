/**
 * Legacy.js - The Legacy Component and package
 * Collection of legacy code (polyfills) and deprecated code to be removed later
 *
 * @author Bob Warren
 * @deprecated
 * @requires augmented.js
 * @module
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	       module.exports = moduleFactory(require('augmented', 'underscore'));
    } else if (typeof define === 'function' && define.amd) {
	       define(['augmented', 'underscore'], moduleFactory);
    } else {
	       window.Augmented.Legacy = moduleFactory(window.Augmented);
    }
}(function(Augmented, _) {
    Augmented.Legacy = {};

    Augmented.Legacy.VERSION = '0.3.0';



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
        		async: true,
        		cache: settings.cache,
        		contentType: 'text/plain;charset=' + settings.encoding,
        		dataType: 'text',
        		success: function (data, status) {
                    logger.debug("message bundel ajax call - success");
        		    parseData(data, settings.mode);
        		},
                error: function(data, status) {
logger.debug("message bundel ajax call - fail " + data);
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
    	    //eval(parsed);
            /* TODO: refactor */
    	}

    	/** Make sure namespace exists (for keys with dots in name) */
    	// TODO key parts that start with numbers quietly fail. i.e.
    	// month.short.1=Jan
    	function checkKeyNamespace(key) {
            try {
        	    var regDot = /\./;
        	    if (regDot.test(key)) {
            		var fullname = '';
            		var names = key.split(/\./);
            		for (var i = 0; i < names.length; i++) {
            		    if (i > 0) {
            			    fullname += '.';
            		    }
            		    fullname += names[i];

                        if (typeof fullname === "undefined") {
                            fullname = {};
                        }

            		    /*if (eval('typeof ' + fullname + ' == "undefined"')) {
            			    eval(fullname + '={};');
            		    }*/
        		    }
    	        }
            } catch(e) {
                logger.error("AUGMENTED: MessageBundle " + e);
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
    
    /**
     * Augmented Array Utility
     * @constructor Augmented.Utility.Array
     * @memberof Augmented.Utility
     * @param array to work with
     * @memberof Augmented.Utility
     * @deprecated
     */
    Augmented.Utility.Array = function(arr) {
        /**
         * Has returns whether a key exists in the Array
         * @method has
         * @param key {string} name of the key
         * @returns true if the key exists in the Array
         * @memberof Augmented.Utility.Array
         */
        this.has = function(key) {
            return arr.has(key);
        };
    };

    /**
     * Application Context
     * @deprecated Use Augmented.Application and Augmented.Security instead
     */

    /** Application Context Schema */
    var applicationContextSchema = {
	    "id" : "applicationContext",
	    "type" : "object",
	    "properties" : {
		"metadata" : {
		    "type" : "object",
		    "required" : true,
		    "properties" : {
			"title" : {
			    "type" : "string",
			    "required" : true
			},
			"context" : {
			    "type" : "string"
			}
		    }
		},
		"security" : {
		    "type" : "object",
		    "required" : true,
		    "properties" : {
			"user" : {
			    "type" : "string",
			    "required" : false
			},
			"loginName" : {
			    "type" : "string",
			    "required" : false
			},
			"userName" : {
			    "type" : "string",
			    "required" : false
			},
			"userId" : {
			    "type" : "number",
			    "required" : true
			},
			"email" : {
			    "type" : "string",
			    "required" : false
			},
			"role" : {
			    "type" : "array",
			    "required" : true,
			    "items" : {
				"type" : "string"
			    }
			},
			"privilege" : {
			    "type" : "array",
			    "required" : true,
			    "items" : {
				"type" : "string"
			    }
			},
			"oauth" : {
			    "type" : "object",
			    "properties" : {
				"authorization" : {
				    "type" : "string"
				},
				"access" : {
				    "type" : "string"
				}
			    }
			}
		    }
		}
	    }
    };

    /**
     * Application Context
     *
     * Collection of data for use to define the application
     */
    var applicationContextModel = Augmented.Model.extend({
	schema: applicationContextSchema,
	defaults: {
	    "metadata" : {
		"title" : "",
		"context" : ""
	    },
	    "principal": "",
	    "security" : {  // Replace this
		"loginName" : "",
		"userName" : "",
		"userId" : 0,
		"email" : "",
		"role" :[],
		"privilege" : [],
		"oauth" : {
		    "authorization" : "",
		    "access" : ""
		}
	    }
	},
	save: function() {
	    throw new Error("Not Supported!");
	},
	remove: function() {
	    throw new Error("Not Supported!");
	}
    });

    var applicationContext = function() {
	if(!this.model) {
	    this.model = new applicationContextModel();
	}
	this.hasPrivilege = function(privilegeName) {
	    var ret = false;

	    if (this.model && this.model.attributes.security.privilege !== undefined) {
		var priv = this.model.attributes.security.privilege;

		ret = (priv.indexOf(privilegeName) != -1);
	    }
	    return ret;
	};
	this.hasRole = function(roleName){
    var ret = false;
	    if (this.model && this.model.attributes.security.role !== undefined) {
		var role = this.model.attributes.security.role;

		ret = (role.indexOf(roleName) != -1);
	    }
	    return ret;

	};

	this.getAllPrivileges = function() {
	    if (this.model && this.model.attributes.security.privilege !== undefined) {
		var priv = this.model.attributes.security.privilege;
		return priv;
	    }
	};

	this.getAllRoles = function(){
	    if (this.model && this.model.attributes.security.role !== undefined) {
		var priv = this.model.attributes.security.role;
		return priv;
	    }
	};

	this.hasMetadata = function(metadataName) {
	    var ret = false;

	    if (this.model && this.model.attributes.metadata !== undefined && (metadataName in this.model.attributes.metadata)) {
		ret = true;
	    }
	    return ret;
	};

	this.getAllMetadata = function() {

	    if (this.model && this.model.attributes.metadata !== undefined) {
		return this.model.attributes.metadata;
	    }

	};

	this.getMetadata = function(metadataName){

	    if (this.model && this.model.attributes.metadata !== undefined && (metadataName in this.model.attributes.metadata)) {
		if (this.model.attributes.metadata.hasOwnProperty(metadataName)) {
		    return this.model.attributes.metadata[metadataName];
		}
	    }
	};

	this.setMetadata = function(metadata)
	{
	    if (this.model && this.model.attributes.metadata !== undefined){

		this.model.attributes.metadata[metadata[0]] = metadata[1];

	    }
	    return this.model.attributes.metadata;
	};


	this.authorize = function() {

	};
	this.access = function() {

	};
	this.fetch = function() {
	    if (this.model) {
		this.model.fetch();
	    }
	};
	this.save = function() {
	    if (this.model) {
		this.model.save();
	    }
	};
	this.isValid = function() {
	    if (this.model) {
		return this.model.isValid();
	    }
	    return false;
	};
	this.populate = function(data) {
	    if (this.model && data) {
		this.model = new applicationContextModel(data);
	    }
	};
	this.setURI = function(uri) {
	    if (this.model && uri) {
		this.model.url = uri;
		this.model.attributes.url = uri;
	    }
	};

	this.clear = function()
	{
	    this.model = new applicationContextModel();
	};

    };

    /** Application Context - The Security Object for the framework */

    Augmented.ApplicationContext = null;

    var applicationContextFactory = {
	    getApplicationContext : function() {
		if(!Augmented.ApplicationContext) {
		    Augmented.ApplicationContext = new applicationContext();
		}
		return Augmented.ApplicationContext;
	    }
    };

    Augmented.ApplicationContextFactory = applicationContextFactory;

    /**
     * Augmented Presentation View extension
     * @augments Augmented.View
     * @mixes getFormData
     */
    Augmented.Utility.extend(Augmented.View, {
        /**
         * Augmented Presentation View extension - getFormData<br/>
         * Two-way binding to models<br/>
         * @method getFormData
         * @param {string} region The region (element) to parse
         * @memberof Augmented.View
         * @deprecated
         * @mixin
         */
        getFormData: function(region) {
            // Get form data.
            var serializeFormField = function(array) {
                var sarr = [];

                var i = 0;
                for (i=0; i<array.length;i++) {
                    var a = array[i];
                    var o = {};
                    o.name = a.name;
                    o.value = a.value;
                    o.type = a.type;
                    if (a.type === "checkbox") {
                        o.value = (a.checked) ? "on" : "off";
                    }
                    sarr.push(o);
                }
                return sarr;
            };

            var n = serializeFormField(document.querySelectorAll(region + " > input"));

            var data = (n).reduce(function(obj, field) {
                switch (field.type) {
                case 'number':
                    if (field.value !== "") {
                        obj[field.name] = parseFloat(field.value); // for fields that are numbers.
                    }
                    break;

                case 'checkbox':
                    obj[field.name] = (field.value === 'on') ? true : false; // for checkboxes.
                    break;

                default:
                    obj[field.name] = field.value; // default for fields that are text.
                    break;
                }

                return obj;
            }, {});

            return data;
        }
    });

}));
