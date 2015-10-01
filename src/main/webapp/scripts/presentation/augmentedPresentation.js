/**
 * AugmentedPresentation.js - The Presentation Core UI Component and package
 *
 * @author Bob Warren
 *
 * @requires augmented.js
 * @module
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	       module.exports = moduleFactory(require('augmented'));
    } else if (typeof define === 'function' && define.amd) {
	       define([ 'augmented' ], moduleFactory);
    } else {
	       window.Augmented.Presentation = moduleFactory(window.Augmented);
    }
}(function(Augmented) {
    Augmented.Presentation = {};

    Augmented.Presentation.VERSION = '0.1.0';

    /**
     * Augmented Presentation View extension
     *
     * Two-way binding to models
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
     //TODO: not quite working
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
            if (typeof subscription == 'string') {
                subscription = this[subscription];
            }
            this.subscribe(subscription.channel, subscription, this, once);
        }
        /*
        subscriptions.forEach(
	    //_.each(subscriptions,
            function(subscription, channel) {
        		var once;
        		if (subscription.$once) {
        		    subscription = subscription.$once;
        		    once = true;
        		}
        		if (typeof subscription == 'string') {
        		    subscription = this[subscription];
        		}
        		abstractMediator.subscribe(channel, subscription, this, once);
    	    },
        this);
        */
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

        /*
	    //_.each(subscriptions,
        subscriptions.forEach(
            function(subscription, channel) {
		if (typeof subscription == 'string') {
		    subscription = this[subscription];
		}
		abstractMediator.unsubscribe(channel, subscription.$once || subscription, this);
	    }, this);
        */
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

        this.registerMediator = function(mediator) {
            if (mediator) {//} && ((mediator instanceof Augmented.Presentation.Mediator) || (typeof mediator === Augmented.Presentation.Mediator))) {
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
        this.setCurrentBreadcrumb = function(here) {
            if (this.breadcrumb.size() > 1) {
                    this.breadcrumb.pop();
            }
            this.breadcrumb.push(here);
        };
        this.getCurrentBreadcrumb = function() {
            return this.breadcrumb.peek();
        };

        this.getBreadcrumbs = function() {
            return this.breadcrumb.toArray();
        };
    };

    app.prototype.constructor = app;

    return Augmented.Presentation;
}));
