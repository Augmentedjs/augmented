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
 * @version 0.3.0
 * @license Apache-2.0
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	    module.exports = moduleFactory(require('augmented'));
    } else if (typeof define === 'function' && define.amd) {
	    define(['augmented'], moduleFactory);
    } else {
	    window.Augmented.Presentation = moduleFactory(window.Augmented);
    }
}(function(Augmented) {
    "use strict";
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
    var logger = Augmented.Logger.LoggerFactory.getLogger(Augmented.Logger.Type.console, Augmented.Configuration.LoggerLevel);

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
        _mediator: null,

        sendMessage: function(message, data) {
            this._mediator.trigger(message, data);
        },

        setMediatorMessageQueue: function(e) {
            this._mediator = e;
        },

        removeMediatorMessageQueue: function() {
            this._mediator = null;
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
    	_defaultChannel: "augmentedChannel",

        /**
         * Default identifer Property
         * @property {string} defaultIdentifier The default identifer for the view
         * @memberof Augmented.Presentation.Mediator
         * @private
         */
        _defaultIdentifier: "augmentedIdentifier",

        /**
         * Channels Property
         * @property {string} channels The channels for the view
         * @memberof Augmented.Presentation.Mediator
         * @private
         */
        _channels: {},

        /**
        * @property {Object} List of subscriptions, to be defined
        * @memberof Augmented.Presentation.Colleague
        * @private
        */
        _subscriptions: {},


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
         * Gets all subscriptions
         * @method getSubscriptions
         * @memberof Augmented.Presentation.Colleague
         * @returns {object} Returns all subscriptions
         */
        getSubscriptions: function() {
            return this._subscriptions;
        },

        /**
         * Subscribe to each subscription
         * @method setSubscriptions
         * @param {Object} [subscriptions] An optional hash of subscription to add
         * @memberof Augmented.Presentation.Colleague
         */
        setSubscriptions: function(subscriptions) {
            if (subscriptions) {
                Augmented.Utility.extend(this._subscriptions || {}, subscriptions);
            }
            subscriptions = subscriptions || this._subscriptions;
            if (!subscriptions || (subscriptions.length === 0)) {
                return;
            }
            // Just to be sure we don't set duplicate
            this.unsetSubscriptions(subscriptions);

            var i = 0, l = subscriptions.length;
            for (i = 0; i < l; i++) {
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
            subscriptions = subscriptions || this._subscriptions;
            if (!subscriptions || (subscriptions.length === 0)) {
                return;
            }

            var i = 0, l = subscriptions.length;
            for (i = 0; i < l; i++) {
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

    	/**
    	 * Observe a Colleague View - observe a Colleague and add to a channel
    	 * @method observeColleague
    	 * @param {Augmented.Presentation.Colleague} colleague The Colleague to observe
    	 * @param {function} callback The callback to call for this colleague
    	 * @param {string} channel The Channel to add the pubished events to
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
    	observeColleague: function(colleague, callback, channel, identifier) {
    	    if (colleague instanceof Augmented.Presentation.Colleague) {
        		if (!channel) {
        		    channel = this._defaultChannel;
        		}
                colleague.setMediatorMessageQueue(this);

        		this.subscribe(channel, callback, colleague, false, (identifier) ? identifier : this._defaultIdentifier);
    	    }
    	},

        /**
    	 * Observe a Colleague View - observe a Colleague and add to a channel and auto trigger events
    	 * @method observeColleague
    	 * @param {Augmented.Presentation.Colleague} colleague The Colleague to observe
    	 * @param {string} channel The Channel to add the pubished events to
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
        observeColleagueAndTrigger: function(colleague, channel, identifier) {
            this.observeColleague(
                colleague,
                function() {
                    colleague.trigger(arguments[0], arguments[1]);
                },
                channel,
                (identifier) ? identifier : this._defaultIdentifier
            );
        },

    	/**
    	 * Dismiss a Colleague View - Remove a Colleague from the channel
         * @method dismissColleague
         * @param {Augmented.Presentation.Colleague} colleague The Colleague to observe
         * @param {function} callback The callback to call on channel event
    	 * @param {string} channel The Channel events are pubished to
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
    	dismissColleague: function(colleague, callback, channel, identifier) {
    	    if (colleague instanceof Augmented.Presentation.Colleague) {
        		if (!channel) {
        		    channel = this._defaultChannel;
        		}
                colleague.removeMediatorMessageQueue();
        		this.unsubscribe(channel, callback, colleague, (identifier) ? identifier : this._defaultIdentifier);
    	    }
    	},

        /**
    	 * Dismiss a Colleague View - Remove a Colleague from the channel that has an auto trigger
         * @method dismissColleagueTrigger
         * @param {Augmented.Presentation.Colleague} colleague The Colleague to observe
    	 * @param {string} channel The Channel events are pubished to
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
        dismissColleagueTrigger: function(colleague, channel, identifier) {
            var id = (identifier) ? identifier : this._defaultIdentifier;
            this.dismissColleague(
                colleague,
                function() {
                    colleague.trigger(arguments[0], arguments[1]);
                },
                channel,
                id
            );
        },

    	/**
    	 * Subscribe to a channel
    	 * @method subscribe
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {function} callback The callback to call on channel event
    	 * @param {object} context The context (or 'this')
    	 * @param {boolean} once Toggle to set subscribe only once
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
    	subscribe: function(channel, callback, context, once, identifier) {
    	    if (!this._channels[channel]) {
        		this._channels[channel] = [];
            }
        	this._channels[channel].push({
        		fn: callback,
        		context: context || this,
        		once: once,
                identifier: (identifier) ? identifier : this._defaultIdentifier
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
    	    if (!this._channels[channel]) {
    		    return;
            }

    	    var args = [].slice.call(arguments, 1), subscription;
            var i = 0, l = this._channels[channel].length;

    	    for (i = 0; i < l; i++) {
        		subscription = this._channels[channel][i];
                if (subscription) {
                    if (subscription.fn) {
            		    subscription.fn.apply(subscription.context, args);
                    }
            		if (subscription.once) {
            		    this.unsubscribe(channel, subscription.fn, subscription.context, subscription.identifier);
            		    i--;
            		}
                } else {
                    logger.warn("AUGMENTED: Mediator: No subscription for channel '" + channel + "' on row " + i);
                }
    	    }
    	},

    	/**
    	 * Cancel subscription
    	 * @method unsubscribe
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {function} callback The function callback regestered
    	 * @param {object} context The context (or 'this')
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
    	unsubscribe: function(channel, callback, context, identifier) {
    	    if (!this._channels[channel]) {
    		    return;
    	    }

            var id = (identifier) ? identifier : this._defaultIdentifier;

    	    var subscription, i = 0;
    	    for (i = 0; i < this._channels[channel].length; i++) {
                subscription = this._channels[channel][i];
                if (subscription) {
                    if (subscription.identifier === id && subscription.context === context) {
                    // originally compared function callbacks, but wwe don't alsways pass one so use identifier
            		//if (subscription.fn === callback && subscription.context === context) {
            		    this._channels[channel].splice(i, 1);
            		    i--;
            		}
                } else {
                    logger.warn("AUGMENTED: Mediator: No subscription for channel '" + channel + "' on row " + i);
                    logger.debug("AUGMENTED: Mediator: subscription " + this._channels[channel]);
                }
    	    }
    	},

    	/**
    	 * Subscribing to one event only
    	 * @method subscribeOnce
    	 * @param {string} channel The Channel events are pubished to
    	 * @param {string} subscription The subscription to subscribe to
    	 * @param {object} context The context (or 'this')
         * @param {string} identifier The identifier for this function
         * @memberof Augmented.Presentation.Mediator
    	 */
    	subscribeOnce: function(channel, subscription, context, identifier) {
    	    this.subscribe(channel, subscription, context, true, identifier);
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
    	    return this._channels;
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
    		    channel = this._defaultChannel;
    	    }
    	    return this._channels[channel];
    	},

    	/**
    	 * Get the default channel
    	 * Convenience method for getChannel(null)
         * @method getDefaultChannel
         * @memberof Augmented.Presentation.Mediator
         * @returns {array} Returns the default channel
    	 */
    	getDefaultChannel: function() {
    	    return this._channels[this._defaultChannel];
    	},

        /**
    	 * Get the default identifer
         * @method getDefaultIdentifier
         * @memberof Augmented.Presentation.Mediator
         * @returns {string} Returns the default identifer
    	 */
        getDefaultIdentifier: function() {
            return this._defaultIdentifier;
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
            var headElement = document.getElementsByTagName("head")[0],
            // create a shadow DOM
                shaddowDom = document.createDocumentFragment(),
                i = 0, l = this.Stylesheets.length, link = null;
            for (i = 0; i < l; i++) {
                link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = this.Stylesheets[i];
                shaddowDom.appendChild(link);
            }
            // add the shadow to the real DOM
            headElement.appendChild(shaddowDom);
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

    var csvTableCompile = function(name, desc, columns, data, del){
        var csv = "";
        if (!del) {
            del = ",";
        }
        if (columns) {
            var key, obj;
            for (key in columns) {
                if (columns.hasOwnProperty(key)) {
                    obj = columns[key];
                    csv = csv + key + del;
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
                    csv = csv + dobj + del;
                }
            }
            csv = csv.slice(0, -1);
            csv = csv + "\n";
        }
        return csv;
    };

    var tsvTableCompile = function(name, desc, columns, data){
        return csvTableCompile(name, desc, columns, data, "\t");
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
                html = html + editableTableBody(data, columns, lineNumbers, sortKey);
            } else {
                html = html + defaultTableBody(data, columns, lineNumbers, sortKey);
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

    var defaultTableBody = function(data, columns, lineNumbers, sortKey) {
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

    var editableTableBody = function(data, columns, lineNumbers, sortKey) {
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
                    var myType = "text";
                    if (t === "boolean") {
                        myType = "checkbox";
                    } else if (t === "number") {
                        myType = "number";
                    } else if (t === "array") {
                        myType = "radio";
                    }

                    html = html + "<input type=\"" + myType + "\" " +
                        (dobj === true ? "checked=\"checked\"" : "") +
                        " value=\"" + dobj + "\"" +
                        tableDataAttributes.name + "=\"" + dkey + "\" " +
                        tableDataAttributes.index + "=\"" + i + "\"/></td>";
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

    var formatValidationMessages = function(messages) {
        var html = "";
        if (messages && messages.length > 0) {
            html = html + "<ul class=\"errors\">";
            var i = 0, l = messages.length;
            for (i = 0; i < l; i++) {
                var ii = 0, ll = messages[i].errors.length;
                for (ii = 0; ii < ll; ii++) {
                    html = html + "<li>" + messages[i].errors[ii] + "</li>";
                }
            }
            html = html + "</ul>";
        }
        return html;
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
        /**
         * The sortKey property
         * @property {string} sortKey sorted key
         * @private
         * @memberof Augmented.Presentation.AutomaticTable
         */
        sortKey: null,
        /**
         * Sort the tabe by a key (sent via a UI Event)
         * @method sortBy
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {string} key The key to sort by
         */
        sortBy: function(key) {
            if (key && ( (this.editable) || (!this.editable && this.sortKey !== key))) {
                this.sortKey = key;
                this.collection.sortByKey(key);
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

        // local storage

        /**
         * The localStorage property - enables localStorage
         * @property {boolean} localStorage The localStorage property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        localStorage: false,
        /**
         * The localStorageKey property - set the key for use in storage
         * @property {string} localStorageKey The localStorage key property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        localStorageKey: "augmented.localstorage.autotable.key",

        // editable

        /**
         * The editable property - enables editing of cells
         * @property {boolean} editable The editable property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        editable: false,

        /**
         * Edit a cell at the row and column specified
         * @method editCell
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {number} row The row
         * @param {number} col The column
         * @param {any} value The value to set
         */
        editCell: function(row, col, value) {
            if (row && col) {
                var model = this.collection.at(row), name = this.columns[col];
                if (model && name) {
                    model.set(name, value);
                }
            }
        },
        /**
         * Copy a cell at the row and column  to another
         * @method copyCell
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {number} row1 The 'from' row
         * @param {number} col1 The 'from' column
         * @param {number} row2 The 'to' row
         * @param {number} col2 The 'to' column
         */
        copyCell: function(row1, col1, row2, col2) {
            if (row1 && col1 && row2 && col2) {
                var model1 = this.collection.at(row1), name1 = this.columns[col1],
                    model2 = this.collection.at(row);
                if (model1 && name1 && model2) {
                    model2.set(name1, value1);
                }
            }
        },
        /**
         * Clear a cell at the row and column specified
         * @method clearCell
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {number} row The row
         * @param {number} col The column
         */
        clearCell: function(row, col) {
            this.editCell(row, col, null);
        },

        // standard functionality

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
         * @private
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
                if (!this.collection && this.paginationAPI) {
                    this.collection = Augmented.PaginationFactory.getPaginatedCollection(this.paginationAPI);
                    this.paginationAPI = this.collection.paginationAPI;
                    this.localStorage = false;
                } else if (!this.collection && this.localStorage) {
                    this.collection = new Augmented.LocalStorageCollection();
                } else if (!this.collection) {
                    this.collection = new Augmented.Collection();
                }
                if (options.schema) {
                    // check if this is a schema vs a URI to get a schema
                    if (Augmented.isObject(options.schema)) {
                        this.schema = options.schema;
                    } else {
                        // is a URI?
                        var parsedSchema = null;
                        try {
                            parsedSchema = JSON.parse(options.schema);
                            if (parsedSchema && Augmented.isObject(parsedSchema)) {
                                this.schema = parsedSchema;
                            }
                        } catch(e) {
                            logger.warn("AUGMENTED: AutoTable parsing string schema failed.  URI perhaps?");
                        }
                        if (!this.schema) {
                            this.retrieveSchema(options.schema);
                            this.isInitalized = false;
                            //return false;
                        }
                    }
                }

                if (options.el) {
                    this.el = options.el;
                }

                if (options.uri) {
                    this.uri = options.uri;
                    this.collection.url = options.uri;
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

                if (options.localStorageKey && !options.uri) {
                    this.localStorageKey = options.localStorageKey;
                    this.uri = null;
                }
            }

            if (this.collection && this.uri) {
                this.collection.url = this.uri;
            }
            if (this.collection) {
                this.collection.crossOrigin = this.crossOrigin;
            }
            if (this.schema) {
                if (this.schema.title) {
                    this.name = this.schema.title;
                }
                if (this.schema.description) {
                    this.description = this.schema.description;
                }

                if (!this.isInitalized) {
                    this.columns = this.schema.properties;
                    this.collection.schema = this.schema;
                    this.isInitalized = true;
                }

            } else {
                this.isInitalized = false;
                return false;
            }

            return this.isInitalized;
        },
        retrieveSchema: function(uri){
            var that = this;
            var schema = null;
            Augmented.ajax({
                url: uri,
                contentType: 'application/json',
                dataType: 'json',
                success: function(data, status) {
                    if (typeof data === "string") {
                        schema = JSON.parse(data);
                    } else {
                        schema = data;
                    }
                    var options = { "schema": schema };
                    that.initialize(options);
                },
                failure: function(data, status) {
                    logger.warn("AUGMENTED: AutoTable Failed to fetch schema!");
                }
            });
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
         * Save the data to the source
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
         * Refresh the table (Same as render)
         * @method refresh Refresh the table
         * @memberof Augmented.Presentation.AutomaticTable
         * @see Augmented.Presentation.AutomaticTable.render
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
                        if (this.editable) {
                            this.unbindCellChangeEvents();
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
                        jh = editableTableBody(this.collection.toJSON(), this.columns, this.lineNumbers, this.sortKey);
                    } else {
                        jh = defaultTableBody(this.collection.toJSON(), this.columns, this.lineNumbers, this.sortKey);
                    }
                    if (this.editable) {
                        this.unbindCellChangeEvents();
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
                this.bindCellChangeEvents();
            }

            this.showProgressBar(false);
            return this;
        },

        /**
         * Save Cell Event
         * @private
         */
        saveCell: function(event) {
            var key = event.target;
            var model = this.collection.at(parseInt(key.getAttribute(tableDataAttributes.index)));
            var value = key.value;
            if ((key.getAttribute("type")) === "number") {
                value = parseInt(key.value);
            }
            model.set(key.getAttribute(tableDataAttributes.name), value);
        },

        /**
         * @private
         */
        bindCellChangeEvents: function() {
            var myEl = (typeof this.el === 'string') ? this.el : this.el.localName;
            var cells = [].slice.call(document.querySelectorAll(myEl + " table tr td input"));
            var i=0, l=cells.length;
            for(i=0; i < l; i++) {
                cells[i].addEventListener("change", this.saveCell.bind(this), false);
            }
            // bind the select boxes as well
            cells = [].slice.call(document.querySelectorAll(myEl + " table tr td select"));
            i=0;
            l=cells.length;
            for(i=0; i < l; i++) {
                cells[i].addEventListener("change", this.saveCell.bind(this), false);
            }
        },

        /**
         * @private
         */
        unbindCellChangeEvents: function() {
            var myEl = (typeof this.el === 'string') ? this.el : this.el.localName;
            var cells = [].slice.call(document.querySelectorAll(myEl + " table tr td input"));
            var i=0, l=cells.length;
            for(i=0; i < l; i++) {
                cells[i].removeEventListener("change", this.saveCell, false);
            }
            // unbind the select boxes as well
            cells = [].slice.call(document.querySelectorAll(myEl + " table tr td select"));
            i=0;
            l=cells.length;
            for(i=0; i < l; i++) {
                cells[i].removeEventListener("change", this.saveCell, false);
            }
        },

        /**
         * Export the table data in requested format
         * @method exportTo Exports the table
         * @param {string} type The type requested (csv or html-default)
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {string} The table data in requested format
         */
        exportTo: function(type) {
            var e = "";
            if (type === "csv") {
                e = csvTableCompile(this.name, this.description, this.columns, this.collection.toJSON());
            } else if (type === "tsv") {
                e = tsvTableCompile(this.name, this.description, this.columns, this.collection.toJSON());
            } else {
                // html
                e = defaultTableCompile(this.name, this.description, this.columns, this.collection.toJSON(), false, null);
            }
            return e;
        },

        /**
         * @private
         */
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

        /**
         * @private
         */
        pageControlBound: false,

        /**
         * @private
         */
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

        /**
         * @private
         */
        deriveEventTarget: function(event) {
            var key = null;
            if (event) {
                key = event.target.getAttribute(tableDataAttributes.name);
            }
            return key;
        },
        /**
         * @private
         */
        sortByHeaderEvent: function(event) {
            var key = this.deriveEventTarget(event);
            this.sortBy(key);
        },
        /**
         * @private
         */
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
        /**
         * @private
         */
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

        /**
         * Enable/Disable the progress bar
         * @method showProgressBar
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {boolean} show Show or Hide the progress bar
         */
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
        /**
         * Show a message related to the table
         * @method showMessage
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {string} message Some message to display
         */
        showMessage: function(message) {
            if (this.el) {
                var e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                var p = e.querySelector("p[class=message]");
                if (p) {
                    p.innerHTML = message;
                }
            }
        },
        validate: function() {
            var messages = (this.collection) ? this.collection.validate() : null;
            if (!this.collection.isValid() && messages && messages.messages) {
                this.showMessage(formatValidationMessages(messages.messages));
            } else {
                this.showMessage("");
            }
            return messages;
        },
        isValid: function() {
            return (this.collection) ? this.collection.isValid() : true;
        }
    });

    /**
     * Augmented.Presentation.AutoTable
     * Shorthand for Augmented.Presentation.AutomaticTable
     * @constructor Augmented.Presentation.AutoTable
     * @extends Augmented.Presentation.AutomaticTable
     */
    Augmented.Presentation.AutoTable = Augmented.Presentation.AutomaticTable;

    var directDOMTableCompile = function(el, name, desc, columns, data, lineNumbers, sortKey, editable) {
        var table, thead, tbody, n, t;

        table = document.createElement("table");
        table.setAttribute(tableDataAttributes.name, name);
        table.setAttribute(tableDataAttributes.description, desc);
        if (name) {
            n = document.createElement("caption");
            if (desc) {
                n.setAttribute("title", desc);
            }
            t = document.createTextNode(name);
            n.appendChild(t);
            table.appendChild(n);
        }
        thead = document.createElement("thead");
        directDOMTableHeader(thead, columns, lineNumbers, sortKey);
        table.appendChild(thead);
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
        if (data) {
            if (editable) {
                directDOMEditableTableBody(tbody, data, columns, lineNumbers, sortKey);
            } else {
                directDOMTableBody(tbody, data, columns, lineNumbers, sortKey);
            }
        }
        el.appendChild(table);
    };

    var directDOMTableHeader = function(el, columns, lineNumbers, sortKey) {
        var tr, n, t;

        if (columns) {
            tr = document.createElement("tr");
            if (lineNumbers) {
                n = document.createElement("th");
                n.setAttribute(tableDataAttributes.name, "lineNumber");
                t = document.createTextNode("#");
                n.appendChild(t);
                tr.appendChild(n);
            }
            var key, obj;
            for (key in columns) {
                if (columns.hasOwnProperty(key)) {
                    obj = columns[key];

                    n = document.createElement("th");
                    n.setAttribute(tableDataAttributes.name, key);
                    n.setAttribute(tableDataAttributes.description, obj.description);
                    n.setAttribute(tableDataAttributes.type, obj.type);
                    if (sortKey === key) {
                        n.classList.add(tableDataAttributes.sortClass);
                    }

                    t = document.createTextNode(key);
                    n.appendChild(t);
                    tr.appendChild(n);
                }
            }
            el.appendChild(tr);
        }
    };

    var directDOMTableBody = function(el, data, columns, lineNumbers, sortKey) {
        var i, d, dkey, dobj, l = data.length, t, td, tn, tr, cobj;
        for (i = 0; i < l; i++) {
            d = data[i];
            tr = document.createElement("tr");

            if (lineNumbers) {
                td = document.createElement("td");
                tn = document.createTextNode("" + (i+1));
                td.appendChild(tn);
                td.classList.add("label", "number");
                tr.appendChild(td);
            }
            for (dkey in d) {
                if (d.hasOwnProperty(dkey)) {
                    dobj = d[dkey];
                    //cobj = columns[dkey];
                    //logger.debug("AUGMENTED: AutoTable column key: " + cobj);
                    t = (typeof dobj);

                    td = document.createElement("td");
                    tn = document.createTextNode(dobj);
                    td.appendChild(tn);
                    td.classList.add(t);
                    if (sortKey === dkey) {
                        td.classList.add(tableDataAttributes.sortClass);
                    }
                    td.setAttribute(tableDataAttributes.type, t);

                    tr.appendChild(td);
                }
            }
            el.appendChild(tr);
        }
    };

    var directDOMEditableTableBody = function(el, data, columns, lineNumbers, sortKey) {
        var i, d, dkey, dobj, l = data.length, t, td, tn, tr, input, cobj, ln;
        ln = lineNumbers;
        for (i = 0; i < l; i++) {
            d = data[i];
            tr = document.createElement("tr");

            if (ln) {
                td = document.createElement("td");
                tn = document.createTextNode("" + (i+1));
                td.appendChild(tn);
                td.classList.add("label", "number");
                tr.appendChild(td);
            }

            for (dkey in d) {
                if (d.hasOwnProperty(dkey)) {
                    cobj = (columns[dkey]) ? columns[dkey] : {};
                    dobj = d[dkey];

                    logger.debug("column type: " + JSON.stringify(cobj));

                    t = (typeof dobj);

                    td = document.createElement("td");
                    td.classList.add(t);
                    if (sortKey === dkey) {
                        td.classList.add(tableDataAttributes.sortClass);
                    }
                    td.setAttribute(tableDataAttributes.type, t);

                    // input field

                    if (t === "object") {
                        if (Array.isArray(dobj)) {
                            var iii = 0, lll = dobj.length, option, tOption;
                            input = document.createElement("select");
                            for (iii = 0; iii < lll; iii++) {
                                option = document.createElement("option");
                                option.setAttribute("value", dobj[iii]);
                                tOption = document.createTextNode(dobj[iii]);
                                option.appendChild(tOption);
                                input.appendChild(option);
                            }
                        } else {
                            input = document.createElement("textarea");
                            input.value = JSON.stringify(dobj);
                        }
                    } else if (t === "boolean") {
                        input = document.createElement("input");
                        input.setAttribute("type", "checkbox");
                        if (dobj === true) {
                            input.setAttribute("checked", "checked");
                        }
                        input.value = dobj;
                    } else if (t === "number") {
                        input = document.createElement("input");
                        input.setAttribute("type", "number");
                        input.value = dobj;
                    } else if (t === "string" && cobj.enum) {
                        input = document.createElement("select");
                        var iii = 0, lll = cobj.enum.length, option, tOption;
                        for (iii = 0; iii < lll; iii++) {
                            option = document.createElement("option");
                            option.setAttribute("value", cobj.enum[iii]);
                            tOption = document.createTextNode(cobj.enum[iii]);
                            if (dobj === cobj.enum[iii]) {
                                option.setAttribute("selected", "selected");
                            }
                            option.appendChild(tOption);
                            input.appendChild(option);
                        }
                    } else if (t === "string" && (cobj.format === "email")) {
                        input = document.createElement("input");
                        input.setAttribute("type", "email");
                        input.value = dobj;
                    } else if (t === "string" && (cobj.format === "uri")) {
                        input = document.createElement("input");
                        input.setAttribute("type", "url");
                        input.value = dobj;
                    } else if (t === "string" && (cobj.format === "date-time")) {
                        input = document.createElement("input");
                        input.setAttribute("type", "datetime");
                        input.value = dobj;
                    } else {
                        input = document.createElement("input");
                        input.setAttribute("type", "text");
                        input.value = dobj;
                    }

                    if (t === "string" && cobj.pattern) {
                        input.setAttribute("pattern", cobj.pattern);
                    }

                    if (cobj.minimum) {
                        input.setAttribute("min", cobj.minimum);
                    }

                    if (cobj.maximum) {
                        input.setAttribute("max", cobj.maximum);
                    }

                    if (t === "string" && cobj.minlength) {
                        input.setAttribute("minlength", cobj.minlength);
                    }

                    if (t === "string" && cobj.maxlength) {
                        input.setAttribute("maxlength", cobj.maxlength);
                    }

                    input.setAttribute(tableDataAttributes.name, dkey);
                    input.setAttribute(tableDataAttributes.index, i);

                    td.appendChild(input);

                    tr.appendChild(td);
                }
            }
            el.appendChild(tr);
        }
    };

    /*
     * << First | < Previous | # | Next > | Last >>
    */
    var directDOMPaginationControl = function(el, currentPage, totalPages) {
        var d, n, t;
        d = document.createElement("div");
        d.classList.add("paginationControl");

        n = document.createElement("span");
        n.classList.add("first");
        t = document.createTextNode("<< First");
        n.appendChild(t);
        d.appendChild(n);

        n = document.createElement("span");
        n.classList.add("previous");
        t = document.createTextNode("< Previous");
        n.appendChild(t);
        d.appendChild(n);

        n = document.createElement("span");
        n.classList.add("current");
        t = document.createTextNode(currentPage + " of " + totalPages);
        n.appendChild(t);
        d.appendChild(n);

        n = document.createElement("span");
        n.classList.add("next");
        t = document.createTextNode("Next >");
        n.appendChild(t);
        d.appendChild(n);

        n = document.createElement("span");
        n.classList.add("last");
        t = document.createTextNode("Last >>");
        n.appendChild(t);
        d.appendChild(n);

        el.appendChild(d);
    };

    /**
     * Augmented.Presentation.DirectDOMAutomaticTable<br/>
     * Uses direct DOM methods vs cached HTML<br/>
     * Creates a table automatically via a schema for defintion and a uri/json for data
     * @constructor Augmented.Presentation.DirectDOMAutomaticTable
     * @extends Augmented.Presentation.AutomaticTable
     * @memberof Augmented.Presentation
     * @example
     * var myAt = Augmented.Presentation.DirectDOMAutomaticTable.extend({ ... });
     * var at = new myAt({
     *     schema : schema,
     *     el: "#autoTable",
     *     crossOrigin: false,
     *     sortable: true,
     *     lineNumbers: true,
     *     editable: true,
     *     uri: "/example/data/table.json"
     * });
     */
    Augmented.Presentation.DirectDOMAutomaticTable = Augmented.Presentation.AutomaticTable.extend({
        compileTemplate: function() {
            return "";
        },
        render: function() {
            if (!this.isInitalized) {
                logger.warn("AUGMENTED: AutoTable Can't render yet, not initialized!");
                return this;
            }
            var e;
            if (this.template) {
                // refresh the table body only
                this.showProgressBar(true);
                if (this.el) {
                    e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                    var tbody = e.querySelector("tbody"), thead = e.querySelector("thead");
                    if (e) {
                        if (this.sortable) {
                            this.unbindSortableColumnEvents();
                        }
                        if (this.editable) {
                            this.unbindCellChangeEvents();
                        }
                        if (this.columns && (Object.keys(this.columns).length > 0)){

                            while (thead.hasChildNodes()) {
                                thead.removeChild(thead.lastChild);
                            }
                            directDOMTableHeader(thead, this.columns, this.lineNumbers, this.sortKey);
                        } else {
                            while (thead.hasChildNodes()) {
                                thead.removeChild(thead.lastChild);
                            }
                        }

                        if (this.collection && (this.collection.length > 0)){
                            while (tbody.hasChildNodes()) {
                                tbody.removeChild(tbody.lastChild);
                            }
                            if (this.editable) {
                                directDOMEditableTableBody(tbody, this.collection.toJSON(), this.columns, this.lineNumbers, this.sortKey);
                            } else {
                                directDOMTableBody(tbody, this.collection.toJSON(), this.columns, this.lineNumbers, this.sortKey);
                            }
                        } else {
                            while (tbody.hasChildNodes()) {
                                tbody.removeChild(tbody.lastChild);
                            }
                        }
                    }
                } else if (this.$el) {
                    logger.warn("AUGMENTED: AutoTable no jquery, sorry not rendering.");
                } else {
                    logger.warn("AUGMENTED: AutoTable no element anchor, not rendering.");
                }
            } else {
                this.template = "notused";
                this.showProgressBar(true);

                if (this.el) {
                    e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                    if (e) {
                        // progress bar
                        var n = document.createElement("progress");
                        var t = document.createTextNode("Please wait.");
                        n.appendChild(t);
                        e.appendChild(n);

                        // the table
                        directDOMTableCompile(e, this.name, this.description, this.columns, this.collection.toJSON(), this.lineNumbers, this.sortKey, this.editable);

                        // pagination control
                        if (this.renderPaginationControl) {
                            directDOMPaginationControl(e, this.currentPage(), this.totalPages());
                        }

                        // message
                        n = document.createElement("p");
                        n.classList.add("message");
                        e.appendChild(n);
                    }
                } else if (this.$el) {
                    logger.warn("AUGMENTED: AutoTable no jquery render, sorry not rendering.");
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
                this.bindCellChangeEvents();
            }

            this.showProgressBar(false);
            return this;
        }
    });

    /**
     * Augmented.Presentation.BigDataTable
     * Instance class preconfigured for sorting and pagination
     * @constructor Augmented.Presentation.BigDataTable
     * @extends Augmented.Presentation.DirectDOMAutomaticTable
     */
    Augmented.Presentation.BigDataTable = Augmented.Presentation.DirectDOMAutomaticTable.extend({
        renderPaginationControl: true,
        lineNumbers: true,
        sortable: true
    });

    /**
     * Augmented.Presentation.EditableTable
     * Instance class preconfigured for editing
     * @constructor Augmented.Presentation.EditableTable
     * @extends Augmented.Presentation.DirectDOMAutomaticTable
     */
    Augmented.Presentation.EditableTable = Augmented.Presentation.DirectDOMAutomaticTable.extend({
        editable: true,
        lineNumbers: true
    });

    /**
     * Augmented.Presentation.EditableBigDataTable
     * Instance class preconfigured for editing, sorting, and pagination
     * @constructor Augmented.Presentation.EditableBigDataTable
     * @extends Augmented.Presentation.DirectDOMAutomaticTable
     */
    Augmented.Presentation.EditableBigDataTable = Augmented.Presentation.DirectDOMAutomaticTable.extend({
        renderPaginationControl: true,
        lineNumbers: true,
        sortable: true,
        editable: true
    });

    /**
     * Augmented.Presentation.LocalStorageTable
     * Instance class preconfigured for local storage-based table
     * @constructor Augmented.Presentation.LocalStorageTable
     * @extends Augmented.Presentation.DirectDOMAutomaticTable
     */
    Augmented.Presentation.LocalStorageTable = Augmented.Presentation.DirectDOMAutomaticTable.extend({
        renderPaginationControl: false,
        lineNumbers: true,
        sortable: true,
        editable: false,
        localStorage: true
    });

    /**
     * Augmented.Presentation.EditableLocalStorageTable
     * Instance class preconfigured for editing, sorting, from local storage
     * @constructor Augmented.Presentation.EditableLocalStorageTable
     * @extends Augmented.Presentation.DirectDOMAutomaticTable
     */
    Augmented.Presentation.EditableLocalStorageTable = Augmented.Presentation.DirectDOMAutomaticTable.extend({
        renderPaginationControl: false,
        lineNumbers: true,
        sortable: true,
        editable: true,
        localStorage: true
    });

    /**
     * DOM related functions - Same as Augmented.Presentation.Dom
     * @namespace D
     * @memberof Augmented
     */

    /**
     * DOM related functions
     * @namespace Dom
     * @memberof Augmented.Presentation
     */
    Augmented.D = Augmented.Presentation.Dom = {
        getViewportHeight: function() {
            return window.innerHeight;
        },
        getViewportWidth: function() {
            return window.innerWidth;
        },
        /**
         * Sets the value of an element<br/>
         * Will detect the correct method to do so by element type
         * @method setValue
         * @param {Element} el Element or string of element selector
         * @param {string} value Value to set (or HTML)
         * @param {boolean} onlyText Value will set as text only
         * @memberof Augmented.Presentation.Dom
         */
        setValue: function(el, value, onlyText) {
            if (el) {
                value = (value) ? value : "";
                var myEl = this.selector(el);

                if (myEl && (myEl.nodeType === 1) &&
                        (myEl.nodeName === "input" || myEl.nodeName === "INPUT" ||
                         myEl.nodeName === "textarea" || myEl.nodeName === "TEXTAREA" ||
                         myEl.nodeName === "select" || myEl.nodeName === "SELECT")
                    ) {
                    myEl.value = value;
                } else if (myEl && (myEl.nodeType === 1)) {
                    if (onlyText){
                        myEl.innerText = value;
                    } else {
                        myEl.innerHTML = value;
                    }
                }
            }
        },
        /**
         * Gets the value of an element<br/>
         * Will detect the correct method to do so by element type
         * @method getValue
         * @param {Element} el Element or string of element selector
         * @returns {string} Returns the value of the element (or HTML)
         * @memberof Augmented.Presentation.Dom
         */
        getValue: function(el) {
            if (el) {
                var myEl = this.selector(el);

                if (myEl && (myEl.nodeType === 1) &&
                        (myEl.nodeName === "input" || myEl.nodeName === "INPUT" ||
                        myEl.nodeName === "textarea" || myEl.nodeName === "TEXTAREA" ||
                        myEl.nodeName === "select" || myEl.nodeName === "SELECT")) {
                    return myEl.value;
                } else if (myEl && (myEl.nodeType === 1)) {
                    return myEl.innerHTML;
                }
            }
            return null;
        },
        /**
         * Selector function<br/>
         * Supports full query selection
         * @method selector
         * @param {string} query Element or string of element selector
         * @returns {Element} Returns the element (or first of type)
         * @memberof Augmented.Presentation.Dom
         */
        selector: function(query) {
            if (query) {
                return Augmented.isString(query) ? document.querySelector(query) : query;
            }
            return null;
        },
        /**
         * Selectors function<br/>
         * Supports full query selection
         * @method selectors
         * @param {string} query Element or string of element selector
         * @returns {NodeList} Returns all the nodes selected
         * @memberof Augmented.Presentation.Dom
         */
        selectors: function(query) {
            if (query) {
                return Augmented.isString(query) ? document.querySelectorAll(query) : query;
            }
            return null;
        },
        /**
         * Hides an element
         * @method hide
         * @param {Element} el Element or string of element selector
         * @memberof Augmented.Presentation.Dom
         */
        hide: function(el) {
            var myEl = this.selector(el);
            if (myEl) {
                myEl.style.display = "none";
                myEl.style.visibility = "hidden";
            }
        },
        /**
         * Shows an element
         * @method show
         * @param {Element} el Element or string of element selector
         * @param {string} display Value to set for 'display' property (optional)
         * @memberof Augmented.Presentation.Dom
         */
        show: function(el, display) {
            var myEl = this.selector(el);
            if (myEl) {
                myEl.style.display = (display) ? display : "block";
                myEl.style.visibility = "visible";
            }
        },
        setClass: function(el, cls) {
            var myEl = this.selector(el);
            if (myEl) {
                myEl.setAttribute("class", cls);
            }
        },
        addClass: function(el, cls) {
            var myEl = this.selector(el);
            if (myEl) {
                myEl.classList.add(cls);
            }
        },
        removeClass: function(el, cls) {
            var myEl = this.selector(el);
            if (myEl) {
                myEl.classList.remove(cls);
            }
        },
        empty: function(el) {
            this.setValue(el, "", true);
        },
        /**
         * injectTemplate method - Injects a template element at a mount point
         * @method injectTemplate
         * @param {string} template The template selector
         * @param {Element} mount The mount point as Document.Element or String
         * @memberof Augmented.Presentation.Dom
         */
        injectTemplate: function(template, mount) {
            var t = this.selector(template), el = this.selector(mount);
            if (t && el) {
                var clone = document.importNode(t.content, true);
                el.appendChild(clone);
            }
        }
    };

    Augmented.Presentation.Widget = {
        List: function(data, ordered) {
            var list = (ordered) ? document.createElement("ol") : document.createElement("ul"), i = 0, l, li, t, d;
            if (data && Array.isArray(data)) {
                l = data.length;
                for (i = 0; i < l; i++) {
                    li = document.createElement("li");
                    li.setAttribute("data-index", i);
                    t = document.createTextNode(String(data[i]));
                    li.appendChild(t);
                    list.appendChild(li);
                }
            }
            return list;
        },
        DescriptionList: function(data) {
            var list = document.createElement("dl"), i = 0, l, dd, dt, t, keys, key;
            if (data && Augmented.isObject(data)) {
                keys = Object.keys(data);
                l = keys.length;
                for (i = 0; i < l; i++) {
                    dt = document.createElement("dt");
                    t = document.createTextNode(String(keys[i]));
                    dt.appendChild(t);
                    list.appendChild(dt);

                    key = data[keys[i]];
                    dd = document.createElement("dd");
                    t = document.createTextNode(String(key));
                    dd.appendChild(t);
                    list.appendChild(dd);
                }
            }
            return list;
        },
        DataList: function(id, data) {
            var list = document.createElement("datalist"), i = 0, l, o;
            list.setAttribute("id", id);
            if (data && Array.isArray(data)) {
                l = data.length;
                for (i = 0; i < l; i++) {
                    o = document.createElement("option");
                    o.value = String(data[i]);
                    list.appendChild(o);
                }
            }
            return list;
        }
    };

    var decoratorAttributeEnum = {
            "click": "data-click",
            "func": "data-function",
            "style": "data-style",
            "appendTemplate": "data-append-template"
    };

    /**
     * Augmented.Presentation.DecoratorView<br/>
     * An MVVM view designed around decorating the DOM with bindings.
     * This concept is designed to decouple the view from the backend contract.
     * Although this is achieved via views in general, the idea is:<br/>
     * <blockquote>As a Javascript Developer, I'd like the ability to decorate HTML and control view rendering without the use of CSS selectors</blockquote>
     * <em>Important to note: This view <strong>gives up</strong> it's template and events!
     * This is because all events and templates are used on the DOM directly.</em><br/>
     * To add custom events, use customEvents instead of 'events'
     * @constructor Augmented.Presentation.DecoratorView
     * @extends Augmented.Presentation.Colleague
     */
    Augmented.Presentation.DecoratorView = Augmented.Presentation.Colleague.extend({
        /**
         * Events Property - Do Not Override
         * @property Events
         */
        events: function(){
            var _events = (this.customEvents) ? this.customEvents : {};
            if (this.name) {
                _events["change input[" + this.bindingAttribute() + "]"] = "changed";
                _events["change textarea[" + this.bindingAttribute() + "]"] = "changed";
                _events["change select[" + this.bindingAttribute() + "]"] = "changed";
                //_events["click button[" + this.bindingAttribute() + "]"] = "click";
                // regular elements with click bindings
                _events["click *[" + this.bindingAttribute() + "][" + decoratorAttributeEnum.click + "]"] = "click";

            }
            return _events;
        },
        changed: function(event) {
            var key = event.currentTarget.getAttribute(this.bindingAttribute());
            var val = event.currentTarget.value;
            if(event.currentTarget.type === "checkbox") {
                val = (event.currentTarget.checked) ? true : false;
            }
            this.model.set(( (key) ? key : event.currentTarget.name ), val);
            this.func(event);
            logger.debug("AUGMENTED: DecoratorView updated Model: " + JSON.stringify(this.model.toJSON()));
        },
        click: function(event) {
            var func = event.currentTarget.getAttribute(decoratorAttributeEnum.click);
            if (func && this[func]) {
                this._executeFunctionByName(func, this, event);
            }/* else {
                logger.debug("AUGMENTED: DecoratorView No function bound or no function exists! " + func);
            }*/
            this.func(event);
        },
        func: function(event) {
            var func = event.currentTarget.getAttribute(decoratorAttributeEnum.func);
            if (func && this[func]) {
                this._executeFunctionByName(func, this, event);
            } /*else {
                logger.debug("AUGMENTED: DecoratorView No function bound or no function exists! " + func);
            }*/
        },
        /**
         * Initialize method - Do Not Override
         * @method initialize
         */
        initialize: function(options) {
            this.init(options);

            if (!this.model) {
                this.model = new Augmented.Model();
            }
        },
        /**
         * Remove method - Does not remove DOM elements only bindings.
         * @method remove
         */
        remove: function() {
            /* off to unbind the events */
            this.off();
            //this.off(this.el);
            this.stopListening();
            return this;
        },
        /**
         * _executeFunctionByName method - Private
         * @method _executeFunctionByName
         * @private
         */
        _executeFunctionByName: function(functionName, context /*, args */) {
            var args = Array.prototype.slice.call(arguments, 2);
            var namespaces = functionName.split(".");
            var func = namespaces.pop();
            for (var i = 0; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }
            return context[func].apply(context, args);
            //return Augmented.exec(arguments);
        },
        /**
         * bindingAttribute method - Returns the binging data attribute name
         * @method bindingAttribute
         * @returns {string} Binding attribute name
         */
        bindingAttribute: function() {
            return "data-" + this.name;
        },
        /**
         * injectTemplate method - Injects a template at a mount point
         * @method injectTemplate
         * @param {string} template The template to inject
         * @param {Element} mount The mount point as Document.Element or String
         */
        injectTemplate: function(template, mount) {
            var m = mount;
            if (!mount) {
                mount = this.el;
            }
            if (Augmented.isString(mount)) {
                mount = document.querySelector(mount);
            }
            if (Augmented.isString(template)) {
                // html
                var currentHTML = mount.innerHTML;
                mount.innerHTML = currentHTML + template;
            } else if ((template.nodeType && template.nodeName) &&
                template.nodeType > 0 && !(template.nodeName === "template" || template.nodeName === "TEMPLATE")) {
                // DOM
                mount.appendChild(template);
            } else if (template instanceof DocumentFragment  || template.nodeName === "template" || template.nodeName === "TEMPLATE") {
                // Document Fragment
                Augmented.Presentation.Dom.injectTemplate(template, mount);
            }
            this.delegateEvents();
        },
        /**
         * removeTemplate method - Removes a template (children) at a mount point
         * @method removeTemplate
         * @param {Element} mount The mount point as Document.Element or String
         * @param {boolean} onlyContent Only remove the content not the mount point
         */
        removeTemplate: function(mount, onlyContent) {
            if (mount) {
                while (mount.firstChild) {
                    mount.removeChild(mount.firstChild);
                }
                if (!onlyContent) {
                    var p = mount.parentNode;
                    if (p) {
                        p.removeChild(mount);
                    }
                }
                this.delegateEvents();
            }
        },
        /**
         * boundElement method - returns the bound element from identifer
         * @method boundElement
         * @param {string} id The identifier (not id attribute) of the element
         * @example
         * from HTML: <div data-myMountedView="something" id="anything"></div>
         * from JavaScript: var el = this.boundElement("something");
         */
        boundElement: function(id) {
            if (this.el && id) {
                return this.el.querySelector("[" + this.bindingAttribute() + "=" + id + "]");
            }
            return null;
        },
        /**
         * syncBoundElement - Syncs the data of a bound element by firing a change event
         * @method syncBoundElement
         * @param {string} id The identifier (not id attribute) of the element
         */
        syncBoundElement: function(id) {
            if (id) {
                var event = new UIEvent("change", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": true
                }), sel = this.boundElement(id);
                if (sel) {
                    sel.dispatchEvent(event);
                }
            }
        },
        addClass: function(id, cls) {
            var myEl = this.boundElement(id);
            myEl.classList.add(cls);
        },
        removeClass: function(id, cls) {
            var myEl = this.boundElement(id);
            myEl.classList.remove(cls);
        },
        /**
         * bindModelChange method - binds the model changes to functions
         * @method bindModelChange
         * @param {func} func The function to call when changing (normally render)
         */
        bindModelChange: function(func) {
            if (!this.model) {
                this.model = new Augmented.Model();
            }
            this.model.on('change', func, this);
        },
        /**
         * syncModelChange method - binds the model changes to a specified bound element
         * @method syncModelChange
         * @param {Element} element The element to bind as Document.Element or string
         */
        syncModelChange: function(element) {
            if (!this.model) {
                this.model = new Augmented.Model();
            }
            if (element) {
                this.model.on('change:' + element, this._syncData.bind(this, element), this);
            } else {
                this.model.on('change', this._syncAllData.bind(this, element), this);
            }
        },
        /**
         * _syncData method - syncs the model changes to a specified bound element
         * @method _syncData
         * @param {Element} element The element to bind as Document.Element or string
         * @private
         */
        _syncData: function(element) {
            var e = this.boundElement(element);
            if (e) {
                var d = this.model.get(element),
                renderStyle = e.getAttribute(decoratorAttributeEnum.style),
                prependTemplate = e.getAttribute(decoratorAttributeEnum.prependTemplate),
                appendTemplate = e.getAttribute(decoratorAttributeEnum.appendTemplate),
                mount, template;

                if (prependTemplate) {
                    mount = document.createElement("div");
                    template = Augmented.Presentation.Dom.selector("#" + prependTemplate);
                    e.appendChild(mount);
                    this.injectTemplate(template, mount);
                }

                if (renderStyle) {
                    var ee,
                    prependTemplateEach = e.getAttribute(decoratorAttributeEnum.prependTemplateEach),
                    appendTemplateEach = e.getAttribute(decoratorAttributeEnum.appendTemplateEach),
                    pEach = prependTemplateEach ? prependTemplateEach : null,
                    aEach = appendTemplateEach ? appendTemplateEach : null;

                    if (renderStyle === "list" || renderStyle === "unordered-list") {
                        ee = Augmented.Presentation.Widget.List(d, false);
                        Augmented.Presentation.Dom.empty(e);
                        e.appendChild(ee);
                    } else if (renderStyle === "ordered-list") {
                        ee = Augmented.Presentation.Widget.List(d, true);
                        Augmented.Presentation.Dom.empty(e);
                        e.appendChild(ee);
                    } else if (renderStyle === "description-list") {
                        ee = Augmented.Presentation.Widget.DescriptionList(d);
                        Augmented.Presentation.Dom.empty(e);
                        e.appendChild(ee);
                    }
                } else {
                    Augmented.Presentation.Dom.setValue(e, ((d) ? d : ""));
                }

                if (appendTemplate) {
                    mount = document.createElement("div");
                    template = Augmented.Presentation.Dom.selector("#" + appendTemplate);
                    e.appendChild(mount);

                    this.injectTemplate(template, mount);
                }
            }
        },
        _syncAllData: function() {
            // get all model properties
            var attr = this.model.attributes;
            if (attr) {
                var i = 0, keys = Object.keys(attr), l = keys.length;
                for (i = 0; i < l; i++) {
                    this._syncData(keys[i]);
                }
            }
        },
        /**
         * unbindModelChange method - unbinds the model changes to elements
         * @method unbindModelChange
         * @param {func} func The function to call when changing (normally render)
         */
        unbindModelChange: function(func) {
            this.model.unBind('change', func, this);
        },
        /**
         * unbindModelSync method - unbinds the model changes to a specified bound element
         * @method unbindModelSync
         * @param {Element} element The element to bind as Document.Element or string
         */
        unbindModelSync: function(element) {
            this.model.unBind('change:' + element, this._syncData, this);
        }
    });

    Augmented.Presentation.ViewController = Augmented.Object.extend({
        _views: [],
        initialize: function() {},
        render: function() {},
        remove: function() {},
        manageView: function(view) {
            this._views.push(view);
        },
        removeAllViews: function() {
            var i = 0, l = this._views.length;
            for (i = 0; i < l; i++) {
                this._views[i].remove();
            }
            this._views = [];
        },
        getViews: function () {
            return this._views;
        }
    });

    // dialog
    Augmented.Presentation.DialogView = Augmented.Presentation.DecoratorView.extend({
        name: "dialog",
        title: "",
        body: "",
        style: "form",
        buttons: {
            //name : callback
        },

        template: function() {
            return "<div class=\"blur\"><dialog class=\"" + this.style + "\"><h1>" + this.title + "</h1>" + this.body + this._getButtonGroup() + "</dialog></div>";
        },
        setBody: function(body) {
            this.body = body;
        },
        _getButtonGroup: function() {
            var html = "<div class=\"buttonGroup\">", i = 0, keys = Object.keys(this.buttons), l = (keys) ? keys.length: 0;

            for (i = 0; i < l; i++) {
                html = html + "<button data-" + this.name + "=\"" + this.buttons[keys[i]] + "\"data-click=\"" + this.buttons[keys[i]] + "\">" + keys[i] + "</button>";
            }

            return html + "</div>";
        },
        render: function() {
            Augmented.Presentation.Dom.setValue(this.el, this.template());
            this.delegateEvents();
            this.trigger("open");
            return this;
        },
        // built-in callbacks
        cancel: function(event) {
            this.close();
        },
        open: function() {
            this.render();
        },
        close: function() {
            this.trigger("close");
            Augmented.Presentation.Dom.empty(this.el, true);
        }
    });

    Augmented.Presentation.ConfirmationDialogView = Augmented.Presentation.DialogView.extend({
        buttons: {
            //name : callback
            "yes": "yes",
            "no": "no"
        },
        style: "alert"
    });

    Augmented.Presentation.AlertDialogView = Augmented.Presentation.DialogView.extend({
        buttons: {
            //name : callback
            "cancel": "cancel"
        },
        style: "alert"
    });

    return Augmented.Presentation;
}));
