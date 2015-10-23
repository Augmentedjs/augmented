/**
 * AugmentedPresentation.js - The Presentation Core UI Component and package
 *
 * @author Bob Warren
 *
 * @requires underscore.js
 * @requires augmented.js
 * @module
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
    Augmented.Presentation = {};

    Augmented.Presentation.VERSION = '0.1.0';

    /**
     * Augmented Presentation View extension
     *
     * Two-way binding to models
     * uses _.reduce
     * TODO: maybe deprecate this and use something better
     */
    Augmented.Utility.extend(Augmented.View, {
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
     * Mediator
     */
    /** @borrows Augmented.View#delegateEvents */
    var delegateEvents = Augmented.View.prototype.delegateEvents;
    /** @borrows Augmented.View#delegateEvents */
    var undelegateEvents = Augmented.View.prototype.undelegateEvents;

    var abstractMediator = Augmented.Presentation.Mediator = Augmented.View.extend({
    	defaultChannel: "augmentedChannel",
        channels: {},
    	/**
    	 * Observe a Colleague View
    	 *
    	 * @param colleague
    	 * @param callback
    	 * @param channel
    	 */
    	observeColleague: function(colleague, callback, channel) {
    	    if (colleague instanceof Augmented.Presentation.Colleague) {
        		if (!channel) {
        		    channel = this.defaultChannel;
        		}

        		this.subscribe(channel, callback, colleague, false);
    	    }
    	},

    	/**
    	 * Dismiss a Colleague View
    	 *
    	 * @param colleague
    	 * @param channel
    	 */
    	dismissColleague: function(colleague, channel) {
    	    if (colleague instanceof Augmented.Presentation.Colleague) {
        		if (!channel) {
        		    channel = this.defaultChannel;
        		}

        		this.unsubscribe(channel, callback, colleague);
    	    }
    	},

    	/**
    	 * Subscribe to a channel
    	 *
    	 * @param channel
    	 * @param subscription
    	 * @param context
    	 * @param once
    	 */
    	subscribe: function(channel, subscription, context, once) {
    	    if (!this.channels[channel])
        		this.channels[channel] = [];
        	    this.channels[channel].push({
        		fn : subscription,
        		context : context || this,
        		once : once
    	    });
    	},

    	/**
    	 * Trigger all callbacks for a channel
    	 *
    	 * @param channel
    	 * @params N Extra parameter to pass to handler
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
    	 *
    	 * @param channel
    	 * @param fn
    	 * @param context
    	 */
    	unsubscribe: function(channel, fn, context) {
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
    	 *
    	 * @param channel
    	 * @param subscription
    	 * @param context
    	 */
    	subscribeOnce: function(channel, subscription, context) {
    	    this.subscribe(channel, subscription, context, true);
    	},

    	/**
    	 * Get All the Colleagues for a channel
    	 *
    	 * @param channel
    	 */
    	getColleagues: function(channel) {
    	    var c = this.getChannel(channel);
    	    return c.context;
    	},

    	/**
    	 * Get Channels
    	 */
    	getChannels: function() {
    	    return this.channels;
    	},

    	/**
    	 * Get a specific channel
    	 *
    	 * @param channel
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
    	 */
    	getDefaultChannel: function() {
    	    return this.channels[this.defaultChannel];
    	}
        });

        /**
         * Allow to define convention-based subscriptions
         * as an 'subscriptions' hash on a view. Subscriptions
         * can then be easily setup and cleaned.
         *
         * @class
         */
        var abstractColleague = Augmented.Presentation.Colleague = Augmented.View.extend({
    	/**
    	 * Extend delegateEvents() to set subscriptions
    	 */
    	delegateEvents: function() {
    	    delegateEvents.apply(this, arguments);
    	    this.setSubscriptions();
    	},

    	/**
    	 * Extend undelegateEvents() to unset subscriptions
    	 */
    	undelegateEvents: function() {
    	    undelegateEvents.apply(this, arguments);
    	    this.unsetSubscriptions();
    	},

    	/** @property {Object} List of subscriptions, to be defined */
    	subscriptions: {},

    	/**
    	 * Subscribe to each subscription
    	 * @param {Object} [subscriptions] An optional hash of subscription to add
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
    	 * @param {Object} [subscriptions] An optional hash of subscription to remove
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
    	}
    });

    /**
     * Add registration of mediators to the application
     * @class
     */
    var app = Augmented.Presentation.Application = function() {
        Augmented.Application.apply(this, arguments);
        this.Mediators = [];
        this.Stylesheets = [];
        this.breadcrumb = new Augmented.Utility.Stack();

        this.initialize = function() {
            if (this.Stylesheets && this.Stylesheets.length > 0) {
                this.attachStylesheets();
            }
        };

        this.registerMediator = function(mediator) {
            if (mediator) {
                this.Mediators.push(mediator);
            }
        };
        this.deregisterMediator = function(mediator) {
            if (mediator) {
                var i = this.Mediators.indexOf(mediator);
                if (i != -1) {
                    this.Mediators.splice(i, 1);
                }
            }
        };
        this.getMediators = function() {
            return this.Mediators;
        };
        this.registerStylesheet = function(s) {
            if (s) {
                this.Stylesheets.push(s);
            }
        };
        this.deregisterStylesheet = function(s) {
            if (s) {
                this.Stylesheets.splice((this.Stylesheets.indexOf(s)), 1);
            }
        };
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
        this.setCurrentBreadcrumb = function(uri, name) {
            if (this.breadcrumb.size() > 1) {
                    this.breadcrumb.pop();
            }
            this.breadcrumb.push({ "uri": uri, "name": name });
        };
        this.getCurrentBreadcrumb = function() {
            return this.breadcrumb.peek();
        };

        this.getBreadcrumbs = function() {
            return this.breadcrumb.toArray();
        };
    };

    app.prototype.constructor = app;

    // Tables and Grids
    var autoTableCollection = Augmented.PaginatedCollection.extend({

    });

    var defaultTableCompile = function(columns, data) {
        var html = "<table>";

        if (columns) {
            html = html + "<thead><tr>";
            var key, obj;
            for (key in columns) {
                if (columns.hasOwnProperty(key)) {
                    obj = columns[key];
                    html = html + "<th>" + key + "</th>";
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

    /**
     * Augmented.Presentation.AutomaticTable
     * Creates a table automatically via a schema for defintion and a uri/json for data
     * @class
     * @constructor
     */
    var autoTable = Augmented.Presentation.AutomaticTable = abstractColleague.extend({
        columns: {},
        uri: null,
        data: [],
        collection: null,
        isInitalized : false,
        initialize: function(options) {
            if (this.collection) {
                this.collection.reset();
            } else {
                this.collection = new autoTableCollection();
            }
            if (options) {
                if (options.schema) {
                    this.schema = options.schema;
                }

                if (options.el) {
                    this.el = options.el;
                }

                if (options.url) {
                    this.url = options.url;
                }

                if (options.data) {
                    this.populate(options.data);
                }
            }
            if (!this.schema) {
                this.isInitalized = false;
                return this.isInitalized;
            }
            if (!this.isInitalized) {
                this.columns = this.schema.properties;
                this.collection.schema = this.schema;
                if (this.uri) {
                    this.collection.url = this.uri;
                }
                this.isInitalized = true;
            } else {
                // TODO: this isn't right, if I call again what do I do?  Refresh????
            }
            return this.isInitalized;
        },
        fetch: function() {
            this.collection.fetch();
        },
        populate: function(source) {
            this.data = source;
            this.collection.reset(this.data);
        },
        render: function() {
            if (this.el) {
                var e = (typeof this.el === 'string') ? document.querySelector(this.el) : this.el;
                if (e) {
                    this.template = this.compileTemplate();
                    e.innerHTML = this.template;
                }
            }
            return this;
        },
        compileTemplate: function() {
            return defaultTableCompile(this.columns, this.data);
        },
        setURI: function(uri) {
            this.uri = uri;
        },
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
     * @class
     */
    Augmented.Presentation.AutoTable = Augmented.Presentation.AutomaticTable;

    return Augmented.Presentation;
}));
