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
 * @requires underscore.js
 * @requires augmented.js
 * @module Augmented.Presentation
 * @version 0.2.0α
 * @license Apache-2.0
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	    module.exports = moduleFactory(require('underscore', 'augmented'));
    } else if (typeof define === 'function' && define.amd) {
	    define([ 'underscore', 'augmented' ], moduleFactory);
    } else {
	    window.Augmented.Presentation = moduleFactory(window._, window.Augmented);
    }
}(function(_, Augmented) {
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

    Augmented.Utility.extend(Augmented.View, {
        /**
         * Augmented Presentation View extension - getFormData<br/>
         * Two-way binding to models<br/>
         * <em>uses _.reduce</em>
         * TODO: maybe deprecate this and use something better
         * @method getFormData
         * @param {string} region The region (element) to parse
         * @memberof Augmented.View
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

    	    var data = _(n).reduce(function(obj, field) {
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

            var i = 0;
            for (i; i < subscriptions.length; i++) {
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

            var i = 0;
            for (i; i < subscriptions.length; i++) {
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

    	    for (var i = 0; i < this.channels[channel].length; i++) {
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

    	    var subscription;
    	    for (var i = 0; i < this.channels[channel].length; i++) {
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
            var i = 0;
            for (i; i<this.Stylesheets.length; i++) {
                var link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = this.Stylesheets[i];
                headElement.appendChild(link);
            }
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

    var defaultTableCompile = function(name, desc, columns, data, lineNumbers) {
        var html = "<table>";
        if (name) {
            if (desc) {
                html = html + "<caption title=\"" + desc + "\">";
            }
            html = html + name + "</caption>";
        }
        if (columns) {
            html = html + "<thead><tr>";
            if (lineNumbers) {
                html = html + "<th data-name=\"number\">#</th>";
            }
            var key, obj;
            for (key in columns) {
                if (columns.hasOwnProperty(key)) {
                    obj = columns[key];
                    html = html + "<th data-name=\"" + key + "\">" + key + "</th>";
                }
            }
            html = html + "</tr></thead>";
        }

        if (data) {
            html = html + "<tbody>";
            var i, d, dkey, dobj;
            for (i=0; i< data.length; i++) {
                d = data[i];
                html = html + "<tr>";
                if (lineNumbers) {
                    html = html + "<td class=\"number\">" + (i+1) + "</td>";
                }
                for (dkey in d) {
                    if (d.hasOwnProperty(dkey)) {
                        dobj = d[dkey];
                        html = html + "<td>" + dobj + "</td>";
                    }
                }
                html = html + "</tr>";
            }
            html = html + "</tbody>";
        }

        html = html + "</table>";
        return html;
    };

    /*
     * << First | < Previous | # | Next > | Last >>
    */
    var defaultPaginationControl = function(currentPage, totalPages) {
            var html = "<div class=\"paginationControl\">";
            html = html + "<span class=\"first\"><< First</span>" +
                            "<span class=\"previous\">< Previous</span>" +
                            "<span class=\"current\">" + currentPage + "</span>" +
                            "<span class=\"next\">Next ></span>" +
                            "<span class=\"last\">Last >></span>";
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
        sortable: true,
        sortBy: function(name) {

        },

        // pagination
        renderPaginationControl: true,
        paginationAPI: null,
        currentPage: function() {
            return this.collection.currentPage;
        },
        totalPages: function() {
            return this.collection.totalPages;
        },
        nextPage: function() {
            this.collection.nextPage();
        },
        previousPage: function() {
            this.collection.previousPage();
        },
        goToPage: function(page) {
            this.collection.goToPage(page);
        },
        firstPage: function() {
            this.collection.firstPage();
        },
        lastPage: function() {
            this.collection.lastPage();
        },

        // standard functionality

        lineNumbers: true,
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
         * @property {object} data The data property
         * @memberof Augmented.Presentation.AutomaticTable
         */
        data: [],
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

                if (options.data) {
                    this.populate(options.data);
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

            return this.isInitalized;
        },
        /**
         * Fetch the data from the source URI
         * @method fetch
         * @memberof Augmented.Presentation.AutomaticTable
         */
        fetch: function() {
            this.collection.fetch();
        },
        /**
         * Populate the data in the table
         * @method populate
         * @memberof Augmented.Presentation.AutomaticTable
         * @param {array} source The source data array
         */
        populate: function(source) {
            this.data = source;
            this.collection.reset(this.data);
        },
        clear: function() {
            this.populate(null);
        },
        refresh: function() {
            this.render();
        },
        /**
        * Render the table
         * @method render
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {object} Returns the view context ('this')
         */
        render: function() {
            this.template = this.compileTemplate();
            if (this.el) {
                var e = Augmented.Utility.isString(this.el) ? document.querySelector(this.el) : this.el;
                if (e) {
                    e.innerHTML = this.template;
                }
            } else if (this.$el) {
                this.$el.html(this.template);
            } else {
                logger.warn("no element anchor");
            }
            return this;
        },
        /**
         * An overridable template compile
         * @method compileTemplate
         * @memberof Augmented.Presentation.AutomaticTable
         * @returns {string} Returns the template
         */
        compileTemplate: function() {
            var h = defaultTableCompile(this.name, this.description, this.columns, this.collection.toJSON(), this.lineNumbers);
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
        }
    });

    /**
     * Augmented.Presentation.AutoTable
     * Shorthand for Augmented.Presentation.AutomaticTable
     * @constructor Augmented.Presentation.AutoTable
     * @extends Augmented.Presentation.AutomaticTable
     */
    Augmented.Presentation.AutoTable = Augmented.Presentation.AutomaticTable;

    return Augmented.Presentation;
}));
