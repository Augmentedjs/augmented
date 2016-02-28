/**
 * AugmentedPresentation.js - The Presentation Core UI Component and package<br/>
 * The <b>Presentation</b> extension adds extensive abilities to the presentation layer.<br/>
 * This extension adds:<br/>
 * Mediator patterned PubSub Views
 * Enhanced Application Object
     - PubSub mediation and bootstrapping for Application objects
     - CSS Stylesheet registration and injection
     - breadcrumb management
 * Automatic Tables generated from a JSON schema and data
 *
 * @author Bob Warren
 *
 * @requires augmented.js
 * @module Augmented.Presentation
 * @version 0.2.0α
 * @license Apache-2.0
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	    module.exports = moduleFactory(require('augmented'));
    } else if (typeof define === 'function' && define.amd) {
	    define(['augmented' ], moduleFactory);
    } else {
	    window.Augmented.Presentation = moduleFactory(window.Augmented);
    }
}(function(Augmented) {
    /**
     * The base namespece for all of the Presentation module.
     * @namespace Presentation
     * @memberof Augmented
     */
    Augmented.Presentation = {};

    /**
     * The standard version property
     * @constant VERSION
     */
    Augmented.Presentation.VERSION = Augmented.VERSION;

    /**
     * A private logger for use in the framework only
     * @private
     */
    var logger = Augmented.Logger.LoggerFactory.getLogger(Augmented.Logger.console, Augmented.Configuration.LoggerLevel);

    Augmented.Utility.extend(Augmented.View, {
        /**
         * Augmented Presentation View extension - getFormData<br/>
         * Two-way binding to models<br/>
         * TODO: maybe deprecate this and use something better
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

    /**
     * Augmented Presentation View extension
     * @augments Augmented.View
     * @mixes getFormData
     */

    /*
     * Mediator View
     */

    /**
     * @property delegateEvents
     * @borrows Augmented.View#delegateEvents
     * @memberof Augmented.View
     */
    var delegateEvents = Augmented.View.prototype.delegateEvents;
    /**
     * @property undelegateEvents
     * @borrows Augmented.View#delegateEvents
     * @memberof Augmented.View
     */
    var undelegateEvents = Augmented.View.prototype.undelegateEvents;

    /**
     * Colleague View - The 'child' view.<br/>
     * Allow to define convention-based subscriptions
     * as an 'subscriptions' hash on a view. Subscriptions
     * can then be easily setup and cleaned.
     *
     * @constructor Augmented.Presentation.Colleague
     * @name Augmented.Presentation.Colleague
     * @memberof Augmented.Presentation
     * @extends Augmented.View
     */
    var abstractColleague = Augmented.Presentation.Colleague = Augmented.View.extend({
        mediator: null,
    	/**
    	 * Extend delegateEvents() to set subscriptions
         * @method delegateEvents
         * @memberof Augmented.Presentation.Colleague
    	 */
    	delegateEvents: function() {
    	    delegateEvents.apply(this, arguments);
    	    this.setSubscriptions();
    	},

    	/**
    	 * Extend undelegateEvents() to unset subscriptions
         * @method undelegateEvents
         * @memberof Augmented.Presentation.Colleague
    	 */
    	undelegateEvents: function() {
    	    undelegateEvents.apply(this, arguments);
    	    this.unsetSubscriptions();
    	},

    	/**
        * @property {Object} List of subscriptions, to be defined
        * @memberof Augmented.Presentation.Colleague
        * @private
        */
    	subscriptions: {},

        /**
    	 * Gets all subscriptions
         * @method getSubscriptions
         * @memberof Augmented.Presentation.Colleague
         * @returns {object} Returns all subscriptions
    	 */
        getSubscriptions: function() {
            return this.subscriptions;
        },

    	/**
    	 * Subscribe to each subscription
         * @method setSubscriptions
    	 * @param {Object} [subscriptions] An optional hash of subscription to add
         * @memberof Augmented.Presentation.Colleague
    	 */
    	setSubscriptions: function(subscriptions) {
    	    if (subscriptions) {
    		    Augmented.Utility.extend(this.subscriptions || {}, subscriptions);
    	    }
    	    subscriptions = subscriptions || this.subscriptions;
    	    if (!subscriptions || (subscriptions.length === 0)) {
    		    return;
    	    }
    	    // Just to be sure we don't set duplicate
    	    this.unsetSubscriptions(subscriptions);

            var i = 0, l = subscriptions.length;
            for (i; i < l; i++) {
                var subscription = subscriptions[i];
                var once = false;
                if (subscription.$once) {
                    subscription = subscription.$once;
                    once = true;
                }
                if (typeof subscription === 'string') {
                    subscription = this[subscription];
                }
                this.subscribe(subscription.channel, subscription, this, once);
            }
    	},

    	/**
    	 * Unsubscribe to each subscription
         * @method unsetSubscriptions
    	 * @param {Object} [subscriptions] An optional hash of subscription to remove
         * @memberof Augmented.Presentation.Colleague
    	 */
    	unsetSubscriptions: function(subscriptions) {
    	    subscriptions = subscriptions || this.subscriptions;
    	    if (!subscriptions || (subscriptions.length === 0)) {
    		    return;
    	    }

            var i = 0, l = subscriptions.length;
            for (i; i < l; i++) {
                var subscription = subscriptions[i];
                var once = false;
                if (subscription.$once) {
                    subscription = subscription.$once;
                    once = true;
                }
                if (typeof subscription == 'string') {
                    subscription = this[subscription];
                }
                this.unsubscribe(subscription.channel, subscription.$once || subscription, this);
            }
    	},

        sendMessage: function(message, data) {
            this.mediator.trigger(message, data);
        },
        setMediatorMessageQueue: function(e) {
            this.mediator = e;
        },
        removeMediatorMessageQueue: function() {
            this.mediator = null;
        }
    });

    /**
     * Mediator View - The mediator in the Mediator Pattern<br/>
     * The mediator defines the interface for communication between colleague views.
     * Loose coupling between colleague objects is achieved by having colleagues communicate
     * with the Mediator, rather than with each other.
     * <pre>
     * [Mediator]<-----[Colleague]
     *     ^-----------[Colleague]
     * </pre>
     * @constructor Mediator
     * @name Augmented.Presentation.Mediator
     * @memberof Augmented.Presentation
     * @extends Augmented.Presentation.Colleague
     */
    var abstractMediator = Augmented.Presentation.Mediator = Augmented.Presentation.Colleague.extend({
        /**
         * Default Channel Property
         * @property {string} defaultChannel The default channel for the view
         * @memberof Augmented.Presentation.Mediator
         * @private
         */
    	defaultChannel: "augmentedChannel",
        /**
         * Channels Property
         * @property {string} channels The channels for the view
         * @memberof Augmented.Presentation.Mediator
         * @private
         */
        channels: {},
    	/**
    	 * Observe a Colleague View - observe a Colleague and add to a channel
    	 * @method observeColleague
    	 * @param {Augmented.Presentation.Colleague} colleague The Colleague to observe
    	 * @param {function} callback The callback to call for this colleague
    	 * @param {string} channel The Channel to add the pubished events to
         * @memberof Augmented.Presentation.Mediator
    	 */
    	observeColleague: function(colleague, callback, channel) {
    	    if (colleague instanceof Augmented.Presentation.Colleague) {
        		if (!channel) {
        		    channel = this.defaultChannel;
        		}
                colleague.setMediatorMessageQueue(this);

        		this.subscribe(channel, callback, colleague, false);
    	    }
    	},

    	/**
    	 * Dismiss a Colleague View - Remove a Colleague from the channel
         * @method dismissColleague
         * @param {Augmented.Presentation.Colleague} colleague The Colleague to observe
    	 * @param {string} channel The Channel events are pubished to
         * @memberof Augmented.Presentation.Mediator
    	 */
    	dismissColleague: function(colleague, channel) {
    	    if (colleague instanceof Augmented.Presentation.Colleague) {
        		if (!channel) {
        		    channel = this.defaultChannel;
        		}
                colleague.removeMediatorMessageQueue();

        		this.unsubscribe(channel, callback, colleague);
    	    }
    	},

    	/**
    	 * Subscribe to a channel
    	 * @method subscribe
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {function} callback The callback to call on channel event
    	 * @param {object} context The context (or 'this')
    	 * @param {boolean} once Toggle to set subscribe only once
         * @memberof Augmented.Presentation.Mediator
    	 */
    	subscribe: function(channel, callback, context, once) {
    	    if (!this.channels[channel]) {
        		this.channels[channel] = [];
            }
        	this.channels[channel].push({
        		fn : callback,
        		context : context || this,
        		once : once
    	    });

            this.on(channel, this.publish, context);
    	},

    	/**
    	 * Trigger all callbacks for a channel
    	 * @method publish
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {object} N Extra parameter to pass to handler
         * @memberof Augmented.Presentation.Mediator
    	 */
    	publish: function(channel) {
    	    if (!this.channels[channel])
    		return;

    	    var args = [].slice.call(arguments, 1), subscription;
            var i = 0, l = this.channels[channel].length;

    	    for (i = 0; i < l; i++) {
        		subscription = this.channels[channel][i];
        		subscription.fn.apply(subscription.context, args);
        		if (subscription.once) {
        		    this.unsubscribe(channel, subscription.fn, subscription.context);
        		    i--;
        		}
    	    }
    	},

    	/**
    	 * Cancel subscription
    	 * @method unsubscribe
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {fuction} callback The function callback regestered
    	 * @param {object} context The context (or 'this')
         * @memberof Augmented.Presentation.Mediator
    	 */
    	unsubscribe: function(channel, callback, context) {
    	    if (!this.channels[channel]) {
    		    return;
    	    }

    	    var subscription, i = 0, l = this.channels[channel].length;
    	    for (i = 0; i < l; i++) {
        		subscription = this.channels[channel][i];
        		if (subscription.fn === fn && subscription.context === context) {
        		    this.channels[channel].splice(i, 1);
        		    i--;
        		}
    	    }
    	},

    	/**
    	 * Subscribing to one event only
    	 * @method subscribeOnce
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {string} subscription The subscription to subscribe to
    	 * @param {object} context The context (or 'this')
         * @memberof Augmented.Presentation.Mediator
    	 */
    	subscribeOnce: function(channel, subscription, context) {
    	    this.subscribe(channel, subscription, context, true);
    	},

    	/**
    	 * Get All the Colleagues for a channel
    	 * @method getColleagues
    	 * @param {string} channel The Channel events are pubished to
         * @memberof Augmented.Presentation.Mediator
         * @returns {array} The colleagues for a channel
    	 */
    	getColleagues: function(channel) {
    	    var c = this.getChannel(channel);
    	    return c.context;
    	},

    	/**
    	 * Get Channels
         * @method getChannels
         * @memberof Augmented.Presentation.Mediator
         * @returns {object} Returns all the channels
    	 */
    	getChannels: function() {
    	    return this.channels;
    	},

    	/**
    	 * Get a specific channel
    	 * @method getChannel
    	 * @param {string} channel The Channel events are pubished to
         * @memberof Augmented.Presentation.Mediator
         * @returns {array} Returns the requested channel
    	 */
    	getChannel: function(channel) {
    	    if (!channel) {
    		    channel = this.defaultChannel;
    	    }
    	    return this.channels[channel];
    	},

    	/**
    	 * Get the default channel
    	 * Convenience method for getChannel(null)
         * @method getDefaultChannel
         * @memberof Augmented.Presentation.Mediator
         * @returns {array} Returns the default channel
    	 */
    	getDefaultChannel: function() {
    	    return this.channels[this.defaultChannel];
    	}
    });

    /**
     * Presentation Application - extension of Augmented.Application</br/>
     * Add registration of mediators to the application, breadcrumbs, and stylesheet registration
     * @constructor Augmented.Presentation.Application
     * @memberof Augmented.Presentation
     * @extends Augmented.Application
     */
    var app = Augmented.Presentation.Application = function() {
        Augmented.Application.apply(this, arguments);
        this.Mediators = [];
        this.Stylesheets = [];
        this.breadcrumb = new Augmented.Utility.Stack();

        /**
         * Initialize Event - adds any stylesheets registered
         * @method initialize
         * @memberof Augmented.Presentation.Application
         */
        this.initialize = function() {
            if (this.Stylesheets && this.Stylesheets.length > 0) {
                this.attachStylesheets();
            }
        };
        /**
         * Register a Mediator
         * @method registerMediator
         * @memberof Augmented.Presentation.Application
         * @param {Augmented.Presentation.Mediator} mediator The mediator to register
         */
        this.registerMediator = function(mediator) {
            if (mediator) {
                this.Mediators.push(mediator);
            }
        };
        /**
         * Deregister a Mediator
         * @method deregisterMediator
         * @memberof Augmented.Presentation.Application
         * @param {Augmented.Presentation.Mediator} mediator The mediator to deregister
         */
        this.deregisterMediator = function(mediator) {
            if (mediator) {
                var i = this.Mediators.indexOf(mediator);
                if (i != -1) {
                    this.Mediators.splice(i, 1);
                }
            }
        };
        /**
         * Get all Mediators
         * @method getMediators
         * @memberof Augmented.Presentation.Application
         * @returns {array} Returns all Mediators
         */
        this.getMediators = function() {
            return this.Mediators;
        };
        /**
         * Register a stylesheet
         * @method registerStylesheet
         * @memberof Augmented.Presentation.Application
         * @param {string} stylesheet URI of the stylesheet
         */
        this.registerStylesheet = function(s) {
            if (s) {
                this.Stylesheets.push(s);
            }
        };
        /**
         * Deregister a stylesheet
         * @method deregisterStylesheet
         * @memberof Augmented.Presentation.Application
         * @param {string} stylesheet URI of the stylesheet
         */
        this.deregisterStylesheet = function(s) {
            if (s) {
                this.Stylesheets.splice((this.Stylesheets.indexOf(s)), 1);
            }
        };
        /**
         * Attach registered stylesheets to the DOM
         * @method attachStylesheets
         * @memberof Augmented.Presentation.Application
         */
        this.attachStylesheets = function() {
            var headElement = document.getElementsByTagName("head")[0];
            var i = 0, l = this.Stylesheets.length;
            for (i; i < l; i++) {
                var link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = this.Stylesheets[i];
                headElement.appendChild(link);
            }
        };
        /**
         * Replace stylesheets then attach registered stylesheets to the DOM
         * @method replaceStylesheets
         * @memberof Augmented.Presentation.Application
         */
        this.replaceStylesheets = function() {
            var links = document.getElementsByTagName("link");
            var i = 0, l = links.length - 1;
            for (i = l; i >= 0; i--) {
                element[i].parentNode.removeChild(element[i]);
            }
            this.attachStylesheets();
        };
        /**
         * Sets the current breadcrumb
         * @method setCurrentBreadcrumb
         * @memberof Augmented.Presentation.Application
         * @param {string} uri The URI of the breadcrumb
         * @param {string} name The name of the breadcrumb
         */
        this.setCurrentBreadcrumb = function(uri, name) {
            if (this.breadcrumb.size() > 1) {
                    this.breadcrumb.pop();
            }
            this.breadcrumb.push({ "uri": uri, "name": name });
        };
        /**
         * Gets the current breadcrumb
         * @method getCurrentBreadcrumb
         * @memberof Augmented.Presentation.Application
         * @returns {object} Returns the current breadcrumb
         */
        this.getCurrentBreadcrumb = function() {
            return this.breadcrumb.peek();
        };

        /**
         * Get all the breadcrumbs
         * @method getBreadcrumbs
         * @memberof Augmented.Presentation.Application
         * @returns {array} Returns alls the breadcrumbs
         */
        this.getBreadcrumbs = function() {
            return this.breadcrumb.toArray();
        };
    };

    app.prototype.constructor = app;

    // Tables and Grids
    var autoTableCollection = Augmented.PaginatedCollection.extend({

    });

    var tableDataAttributes = {
        name:           "data-name",
        type:           "data-type",
        description:    "data-description",
        index:          "data-index",
        label:          "data-label",
        sortClass:      "sorted"
    };

    var csvTableCompile = function(name, desc, columns, data){
        var csv = "";
        if (columns) {
            var key, obj;
            for (key in columns) {
                if (columns.hasOwnProperty(key)) {
                    obj = columns[key];
                    csv = csv + key + ",";
                }
            }
            csv = csv.slice(0, -1);
            csv = csv + "\n";
        }

        var i, d, dkey, dobj, html = "", l = data.length, t;
        for (i = 0; i < l; i++) {
            d = data[i];
            for (dkey in d) {
                if (d.hasOwnProperty(dkey)) {
                    dobj = d[dkey];
                    t = (typeof dobj);
                    csv = csv + dobj + ",";
                }
            }
            csv = csv.slice(0, -1);
            csv = csv + "\n";
        }
        return csv;
    };

    var defaultTableCompile = function(name, desc, columns, data, lineNumbers, sortKey, editable) {
        var html = "<table " + tableDataAttributes.name + "=\"" + name + "\" " + tableDataAttributes.description + "=\"" + desc + "\">";
        if (name) {
            html = html + "<caption";
            if (desc) {
                html = html + " title=\"" + desc + "\"";
            }
            html = html + ">" + name + "</caption>";
        }
        html = html + "<thead>";
        html = html + defaultTableHeader(columns, lineNumbers, sortKey);
        html = html + "</thead><tbody>";
        if (data) {
            if (editable) {
                html = html + editableTableBody(data, lineNumbers, sortKey);
            } else {
                html = html + defaultTableBody(data, lineNumbers, sortKey);
            }
        }
        html = html + "</tbody></table>";
        return html;
    };

    var defaultTableHeader = function(columns, lineNumbers, sortKey) {
        var html = "";
        if (columns) {
            html = html + "<tr>";
            if (lineNumbers) {
                html = html + "<th " + tableDataAttributes.name + "=\"lineNumber\">#</th>";
            }
            var key, obj;
            for (key in columns) {
                if (columns.hasOwnProperty(key)) {
                    obj = columns[key];
                    html = html + "<th " + tableDataAttributes.name + "=\"" + key + "\" " + tableDataAttributes.description + "=\"" + obj.description + "\" " + tableDataAttributes.type + "=\"" + obj.type + "\"";
                    if (sortKey === key) {
                        html = html + " class=\"" + tableDataAttributes.sortClass + "\"";
                    }
                    html = html + ">" + key + "</th>";
                }
            }
            html = html + "</tr>";
        }
        return html;
    };

    var defaultTableBody = function(data, lineNumbers, sortKey) {
        var i, d, dkey, dobj, html = "", l = data.length, t;
        for (i = 0; i < l; i++) {
            d = data[i];
            html = html + "<tr>";
            if (lineNumbers) {
                html = html + "<td class=\"label number\">" + (i+1) + "</td>";
            }
            for (dkey in d) {
                if (d.hasOwnProperty(dkey)) {
                    dobj = d[dkey];
                    t = (typeof dobj);
                    html = html + "<td " + tableDataAttributes.type + "=\"" + t + "\" class=\"" + t;
                    if (sortKey === dkey) {
                        html = html + " " + tableDataAttributes.sortClass;
                    }
                    html = html + "\">" + dobj + "</td>";
                }
            }
            html = html + "</tr>";
        }
        return html;
    };

    var editableTableBody = function(data, lineNumbers, sortKey) {
        var i, d, dkey, dobj, html = "", l = data.length, t;
        for (i = 0; i < l; i++) {
            d = data[i];
            html = html + "<tr>";
            if (lineNumbers) {
                html = html + "<td class=\"label number\">" + (i+1) + "</td>";
            }
            for (dkey in d) {
                if (d.hasOwnProperty(dkey)) {
                    dobj = d[dkey];
                    t = (typeof dobj);
                    html = html + "<td " + tableDataAttributes.type + "=\"" + t + "\" class=\"" + t;
                    if (sortKey === dkey) {
                        html = html + " " + tableDataAttributes.sortClass;
                    }
                    html = html + "\">";
                    html = html + "<input type=\"" + (t==="number" ? "number" : "text") + "\" value=\"" + dobj + "\"" + tableDataAttributes.name + "=\"" + dkey + "\" " + tableDataAttributes.index + "=\"" + i + "\"/></td>";
                }
            }
            html = html + "</tr>";
        }
        return html;
    };

    /*
     * << First | < Previous | # | Next > | Last >>
    */
    var defaultPaginationControl = function(currentPage, totalPages) {
            return "<div class=\"paginationControl\">" +
                    "<span class=\"first\"><< First</span>" +
                    "<span class=\"previous\">< Previous</span>" +
                    "<span class=\"current\">" + currentPage + " of " + totalPages + "</span>" +
                    "<span class=\"next\">Next ></span>" +
                    "<span class=\"last\">Last >></span></div>";
    };

    /**
     * Augmented.Presentation.AutomaticTable<br/>
     * Creates a table automatically via a schema for defintion and a uri/json for data
     * @constructor Augmented.Presentation.AutomaticTable
     * @extends Augmented.Presentation.Colleague
     * @memberof Augmented.Presentation
     */
    var autoTable = Augmented.Presentation.AutomaticTable = abstractColleague.extend({
        // sorting
        /**
         * The sortable property - enable sorting in table
         * @property {boolean} sortable enable sorting in the table
         * @memberof Augmented.Presentation.AutomaticTable
         */
        sortable: false,
        /**
         * The sortStyle property - setup the sort API
         * @property {string} sortStyle setup the sort API
         * @memberof Augmented.Presentation.AutomaticTable
         */
        sortStyle: "client",
        sortKey: null,
        /**
         * Sort the tabe by a key (sent via a UI Event)
         * @method sortBy
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {string} key The key to sort by
         */
        sortBy: function(key) {
            if (key && this.sortKey !== key) {
                this.sortKey = key;
                this.collection.sortBy(key);
                this.refresh();
            }
        },

        // pagination
        /**
         * The renderPaginationControl property - render the pagination control
         * @property {boolean} renderPaginationControl render the pagination control
         * @memberof Augmented.Presentation.AutomaticTable
         */
        renderPaginationControl: false,
        /**
         * The paginationAPI property - setup the paginatin API to use
         * @property {Augmented.PaginationFactory.type} paginationAPI the pagination API to use
         * @memberof Augmented.Presentation.AutomaticTable
         */
        paginationAPI: null,
        /**
         * Return the current page number
         * @method currentPage
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {number} The current page number
         */
        currentPage: function() {
            return this.collection.currentPage;
        },
        /**
         * Return the total pages
         * @method totalPages
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {number} The total pages
         */
        totalPages: function() {
            return this.collection.totalPages;
        },
        /**
         * Advance to the next page
         * @method nextPage
         * @memberof Augmented.Presentation.AutomaticTable
         */
        nextPage: function() {
            this.collection.nextPage();
            this.refresh();
        },
        /**
         * Return to the previous page
         * @method previousPage
         * @memberof Augmented.Presentation.AutomaticTable
         */
        previousPage: function() {
            this.collection.previousPage();
            this.refresh();
        },
        /**
         * Go to a specific page
         * @method goToPage
         * @param {number} page The page to go to
         * @memberof Augmented.Presentation.AutomaticTable
         */
        goToPage: function(page) {
            this.collection.goToPage(page);
            this.refresh();
        },
        /**
         * Return to the first page
         * @method firstPage
         * @memberof Augmented.Presentation.AutomaticTable
         */
        firstPage: function() {
            this.collection.firstPage();
            this.refresh();
        },
        /**
         * Advance to the last page
         * @method lastPage
         * @memberof Augmented.Presentation.AutomaticTable
         */
        lastPage: function() {
            this.collection.lastPage();
            this.refresh();
        },

        // standard functionality

        /**
         * The editable property - enables editing of cells
         * @property {boolean} editable The editable property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        editable: false,

        /**
         * The crossOrigin property - enables cross origin fetch
         * @property {boolean} crossOrigin The crossOrigin property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        crossOrigin: false,
        /**
         * The lineNumber property - turns on line numbers
         * @property {boolean} lineNumbers The lineNumbers property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        lineNumbers: false,
        /**
         * The columns property
         * @property {object} columns The columns property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        columns: {},
        /**
         * The URI property
         * @property {string} uri The URI property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        uri: null,
        /**
         * The data property
         * @property {array} data The data property
         * @memberof Augmented.Presentation.AutomaticTable
         * @private
         */
        data: [],
        /**
         * The collection property
         * @property {Augmented.PaginatedCollection} collection The collection property
         * @memberof Augmented.Presentation.AutomaticTable
         * @private
         */
        collection: null,
        /**
        * The initialized property
         * @property {boolean} isInitalized The initialized property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        isInitalized : false,
        /**
        * Initialize the table view
         * @method initialize
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {object} options The view options
         * @returns {boolean} Returns true on success of initalization
         */
        initialize: function(options) {
            this.init();

            if (this.collection) {
                this.collection.reset();
            }
            if (options) {
                if (options.paginationAPI) {
                    this.paginationAPI = options.paginationAPI;
                }
                if (!this.collection) {
                    this.collection = Augmented.PaginationFactory.getPaginatedCollection(this.paginationAPI);
                }
                if (options.schema) {
                    this.schema = options.schema;
                }

                if (options.el) {
                    this.el = options.el;
                }

                if (options.url) {
                    this.url = options.url;
                    this.collection.url = options.url;
                }

                if (options.data && (Array.isArray(options.data))) {
                    this.populate(options.data);
                }

                if (options.renderPaginationControl) {
                    this.renderPaginationControl = options.renderPaginationControl;
                }

                if (options.sortable) {
                    this.sortable = options.sortable;
                }

                if (options.lineNumbers) {
                    this.lineNumbers = options.lineNumbers;
                }

                if (options.editable) {
                    this.editable = options.editable;
                }
            }
            if (this.uri) {
                this.collection.url = this.uri;
            }
            if (!this.schema) {
                this.isInitalized = false;
                return false;
            }
            if (!this.isInitalized) {
                this.columns = this.schema.properties;
                this.collection.schema = this.schema;
                this.isInitalized = true;
            }
            if (this.schema.title) {
                this.name = this.schema.title;
            }
            if (this.schema.description) {
                this.description = this.schema.description;
            }
            this.collection.crossOrigin = this.crossOrigin;

            return this.isInitalized;
        },
        /**
         * Fetch the data from the source URI
         * @method fetch
         * @memberof Augmented.Presentation.AutomaticTable
         */
        fetch: function() {
            this.showProgressBar(true);

            var view = this;

            var successHandler = function() {
                view.showProgressBar(false);
                view.sortKey = null;
                view.populate(view.collection.toJSON());
                view.refresh();
            };

            var failHandler = function() {
                view.showProgressBar(false);
                view.showMessage("AutomaticTable fetch failed!");
            };

            this.collection.fetch({
                reset: true,
                success: function(){
                    successHandler();
                },
                error: function(){
                    failHandler();
                }
            });
        },

        /**
         * Save the data to the source URI
         * This only functions if the table is editable
         * @method save
         * @memberof Augmented.Presentation.AutomaticTable
         */
        save: function() {
            if (this.editable) {
                this.showProgressBar(true);

                var view = this;

                var successHandler = function() {
                    view.showProgressBar(false);
                };

                var failHandler = function() {
                    view.showProgressBar(false);
                    view.showMessage("AutomaticTable save failed!");
                    logger.warn("AUGMENTED: AutomaticTable save failed!");
                };

                this.collection.save({
                    reset: true,
                    success: function(){
                        successHandler();
                    },
                    error: function(){
                        failHandler();
                    }
                });
            }
        },

        /**
         * Populate the data in the table
         * @method populate
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {array} source The source data array
         */
        populate: function(source) {
            if (source && Array.isArray(source)) {
                this.sortKey = null;
                this.data = source;
                this.collection.reset(this.data);
            }
        },
        /**
         * Clear all the data in the table
         * @method clear
         * @memberof Augmented.Presentation.AutomaticTable
         */
        clear: function() {
            this.sortKey = null;
            this.data = [];
            this.collection.reset(null);
        },
        /**
         * Refresh the table
         * @method refresh Refresh the table
         * @memberof Augmented.Presentation.AutomaticTable
         */
        refresh: function() {
            this.render();
        },
        /**
        * Render the table
         * @method render Renders the table
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {object} Returns the view context ('this')
         */
        render: function() {
            var e;
            if (this.template) {
                // refresh the table body only
                this.showProgressBar(true);
                if (this.el) {
                    e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                    var tbody = e.querySelector("tbody"), thead = e.querySelector("thead"), h;
                    if (e) {
                        if (this.columns && (Object.keys(this.columns).length > 0)){
                            if (this.sortable) {
                                this.unbindSortableColumnEvents();
                            }
                            h = defaultTableHeader(this.columns, this.lineNumbers, this.sortKey);
                        } else {
                            h = "";
                        }
                        thead.innerHTML = h;

                        if (this.collection && (this.collection.length > 0)){
                            if (this.editable) {
                                h = editableTableBody(this.collection.toJSON(), this.lineNumbers, this.sortKey);
                            } else {
                                h = defaultTableBody(this.collection.toJSON(), this.lineNumbers, this.sortKey);
                            }
                        } else {
                            h = "";
                        }
                        tbody.innerHTML = h;

                    }
                } else if (this.$el) {
                    logger.debug("AUGMENTED: AutoTable using jQuery to render.");
                    if (this.sortable) {
                        this.unbindSortableColumnEvents();
                    }
                    this.$el("thead").html(defaultTableHeader(this.columns, this.lineNumbers, this.sortKey));
                    var jh = "";
                    if (this.editable) {
                        jh = editableTableBody(this.collection.toJSON(), this.lineNumbers, this.sortKey);
                    } else {
                        jh = defaultTableBody(this.collection.toJSON(), this.lineNumbers, this.sortKey);
                    }
                    this.$el("tbody").html(jh);
                } else {
                    logger.warn("AUGMENTED: AutoTable no element anchor, not rendering.");
                }
            } else {
                this.template = "<progress>Please wait.</progress>" + this.compileTemplate() + "<p class=\"message\"></p>";
                this.showProgressBar(true);

                if (this.el) {
                    e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                    if (e) {
                        e.innerHTML = this.template;
                    }
                } else if (this.$el) {
                    this.$el.html(this.template);
                } else {
                    logger.warn("AUGMENTED: AutoTable no element anchor, not rendering.");
                }

                if (this.renderPaginationControl) {
                    this.bindPaginationControlEvents();
                }
            }
            this.delegateEvents();

            if (this.sortable) {
                this.bindSortableColumnEvents();
            }

            if (this.editable) {
                this.unbindCellChangeEvents();
                this.bindCellChangeEvents();
            }

            this.showProgressBar(false);
            return this;
        },

        saveCell: function(event) {
            var key = event.target;
            var model = this.collection.at(key.getAttribute(tableDataAttributes.index));
            model.set(key.getAttribute(tableDataAttributes.name), key.value);
        },

        bindCellChangeEvents: function() {
            var myEl = (typeof this.el === 'string') ? this.el : this.el.localName;
            var cells = [].slice.call(document.querySelectorAll(myEl + " table tr td input"));
            var i=0, l=cells.length;
            for(i=0; i < l; i++) {
                cells[i].addEventListener("change", this.saveCell.bind(this), false);
            }
        },

        unbindCellChangeEvents: function() {
            var myEl = (typeof this.el === 'string') ? this.el : this.el.localName;
            var cells = [].slice.call(document.querySelectorAll(myEl + " table tr td input"));
            var i=0, l=cells.length;
            for(i=0; i < l; i++) {
                cells[i].removeEventListener("change", this.saveCell, false);
            }
        },

        /**
         * Exports the table data in requested format
         * @method export Exports the table
         * @param {string} type The type requested (csv or html-default)
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {string} The table data in requested format
         */
        export: function(type) {
            var e = "";
            if (type === "csv") {
                e = csvTableCompile(this.name, this.description, this.columns, this.collection.toJSON());
            } else {
                // html
                e = defaultTableCompile(this.name, this.description, this.columns, this.collection.toJSON(), false, null);
            }
            return e;
        },

        unbindPaginationControlEvents: function() {
            if (this.pageControlBound) {
                var myEl = (typeof this.el === 'string') ? this.el : this.el.localName;
                var first = document.querySelector(myEl + " div.paginationControl span.first");
                var previous = document.querySelector(myEl + " div.paginationControl span.previous");
                var next = document.querySelector(myEl + " div.paginationControl span.next");
                var last = document.querySelector(myEl + " div.paginationControl span.last");
                if (first) {
                    first.removeEventListener("click", this.firstPage, false);
                }
                if (previous) {
                    previous.removeEventListener("click", this.previousPage, false);
                }
                if (next) {
                    next.removeEventListener("click", this.nextPage, false);
                }
                if (last) {
                    last.removeEventListener("click", this.lastPage, false);
                }
                this.pageControlBound = false;
            }
        },

        pageControlBound: false,

        bindPaginationControlEvents: function() {
            if (!this.pageControlBound) {
                var myEl = (typeof this.el === 'string') ? this.el : this.el.localName;
                var first = document.querySelector(myEl + " div.paginationControl span.first");
                var previous = document.querySelector(myEl + " div.paginationControl span.previous");
                var next = document.querySelector(myEl + " div.paginationControl span.next");
                var last = document.querySelector(myEl + " div.paginationControl span.last");
                if (first) {
                    first.addEventListener("click", this.firstPage.bind(this), false);
                }
                if (previous) {
                    previous.addEventListener("click", this.previousPage.bind(this), false);
                }
                if (next) {
                    next.addEventListener("click", this.nextPage.bind(this), false);
                }
                if (last) {
                    last.addEventListener("click", this.lastPage.bind(this), false);
                }
                this.pageControlBound = true;
            }
        },

        deriveEventTarget: function(event) {
            var key = null;
            if (event) {
                key = event.target.getAttribute(tableDataAttributes.name);
            }
            return key;
        },
        sortByHeaderEvent: function(event) {
            var key = this.deriveEventTarget(event);
            this.sortBy(key);
        },
        unbindSortableColumnEvents: function()  {
            if (this.el && this.sortable) {
                var list;
                if (typeof this.el === 'string') {
                    list = document.querySelectorAll(this.el + " table tr th");
                } else {
                    list = document.querySelectorAll(this.el.localName + " table tr th");
                }
                var i = 0, l = list.length;
                for (i = 0; i < l; i++) {
                    list[i].removeEventListener("click", this.sortByHeaderEvent, false);
                }
            }
        },

        bindSortableColumnEvents: function()  {
            if (this.el && this.sortable) {
                var list;
                if (typeof this.el === 'string') {
                    list = document.querySelectorAll(this.el + " table tr th");
                } else {
                    list = document.querySelectorAll(this.el.localName + " table tr th");
                }
                var i = 0, l = list.length;
                for (i = 0; i < l; i++) {
                    if (list[i].getAttribute(tableDataAttributes.name) === "lineNumber") {
                        // Do I need to do something?
                    } else {
                        list[i].addEventListener("click", this.sortByHeaderEvent.bind(this), false);
                    }
                }
            }
        },

        /**
         * An overridable template compile
         * @method compileTemplate
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {string} Returns the template
         */
        compileTemplate: function() {
            var h = defaultTableCompile(this.name, this.description, this.columns, this.collection.toJSON(), this.lineNumbers, this.sortKey, this.editable);
            if (this.renderPaginationControl) {
                h = h + defaultPaginationControl(this.currentPage(), this.totalPages());
            }
            return h;
        },
        /**
         * Sets the URI
         * @method setURI
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {string} uri The URI
         */
        setURI: function(uri) {
            this.uri = uri;
        },
        /**
         * Sets the schema
         * @method setSchema
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {object} schema The JSON schema of the dataset
         */
        setSchema: function(schema) {
            this.schema = schema;
            this.columns = schema.properties;
            this.collection.reset();
            this.collection.schema = schema;

            if (this.uri) {
                col.url = this.uri;
            }
        },

        showProgressBar: function(show) {
            if (this.el) {
                var e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                var p = e.querySelector("progress");
                if (p) {
                    p.style.display = (show) ? "block" : "none";
                    p.style.visibility = (show) ? "visible" : "hidden";
                }
            }
        },
        showMessage: function(message) {
            if (this.el) {
                var e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                var p = e.querySelector("p[class=message]");
                if (p) {
                    p.textContent = message;
                }
            }
        }
    });

    /**
     * Augmented.Presentation.AutoTable
     * Shorthand for Augmented.Presentation.AutomaticTable
     * @constructor Augmented.Presentation.AutoTable
     * @extends Augmented.Presentation.AutomaticTable
     */
    Augmented.Presentation.AutoTable = Augmented.Presentation.AutomaticTable;

    /**
     * Augmented.Presentation.BigDataTable
     * Instance class preconfigured for sorting and pagination
     * @constructor Augmented.Presentation.BigDataTable
     * @extends Augmented.Presentation.AutomaticTable
     */
    Augmented.Presentation.BigDataTable = Augmented.Presentation.AutomaticTable.extend({
        renderPaginationControl: true,
        lineNumbers: true,
        sortable: true
    });

    /**
     * Augmented.Presentation.EditableTable
     * Instance class preconfigured for editing
     * @constructor Augmented.Presentation.EditableTable
     * @extends Augmented.Presentation.AutomaticTable
     */
    Augmented.Presentation.EditableTable = Augmented.Presentation.AutomaticTable.extend({
        editable: true,
        lineNumbers: true
    });

    /**
     * Augmented.Presentation.EditableBigDataTable
     * Instance class preconfigured for editing, sorting, and pagination
     * @constructor Augmented.Presentation.EditableBigDataTable
     * @extends Augmented.Presentation.AutomaticTable
     */
    Augmented.Presentation.EditableBigDataTable = Augmented.Presentation.AutomaticTable.extend({
        renderPaginationControl: true,
        lineNumbers: true,
        sortable: true,
        editable: true
    });


    return Augmented.Presentation;
}));
