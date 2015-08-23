/**
 * AugmentedPresentation.js - The Presentation Core UI Component and package
 * 
 * @author Bob Warren
 * 
 * @requires jquery.js
 * @requires underscore.js
 * @requires augmented.js
 */
(function(moduleFactory) {
	if (typeof exports === 'object') {
		module.exports = moduleFactory(require('jquery'), require('underscore'), require('augmented'));
	} else if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'underscore', 'augmented' ], moduleFactory);
	} else {
		window.Augmented.Presentation = moduleFactory(window.$, window._, window.Augmented);
	}
}(function($, _, Augmented) {
	Augmented.Presentation = {};

	Augmented.Presentation.VERSION = '1.0.0';

	/** 
	 * Navigation Component
	 */

	
	/**
	 * Augmented Presentation View extension
	 * 
	 * Two-way binding to models
	 */
	Augmented.Utility.extend(Augmented.View, {
	    getFormData: function(region) {
		// Get form data.
		var arr = $(':input', region).serializeArray();
		
		// Get unchecked checkboxes, since they are dropped by serializeArray().
		arr = arr.concat(
			$('input[type=checkbox]:not(:checked)', region).map(
				function() {
					return { "name": this.name, "value": "off" }
				}
			).get()
		);
		
		// Format data to save to model.
		var data = _(arr).reduce(function(obj, field) {			
			var myField = $('input[name=' + field.name + ']');
			
			switch (myField.attr('type')) {
				case 'number': 
					if (field.value != "") {
						obj[field.name] = parseFloat(field.value); // for fields that are numbers.
					}
					break;
					
				case 'checkbox': 
					obj[field.name] = (field.value == 'on') ? true : false; // for checkboxes.
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

	var channels = {}, Subscriber,
	/** @borrows Augmented.View#delegateEvents */
	delegateEvents = Augmented.View.prototype.delegateEvents,
	/** @borrows Augmented.View#delegateEvents */
	undelegateEvents = Augmented.View.prototype.undelegateEvents;

	var abstractMediator = Augmented.View.extend({
		defaultChannel: "augmentedChannel",
		
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
			if (!channels[channel])
				channels[channel] = [];
			channels[channel].push({
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
			if (!channels[channel])
				return;

			var args = [].slice.call(arguments, 1), subscription;

			for (var i = 0; i < channels[channel].length; i++) {
				subscription = channels[channel][i];
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
			if (!channels[channel]) {
				return;
			}

			var subscription;
			for (var i = 0; i < channels[channel].length; i++) {
				subscription = channels[channel][i];
				if (subscription.fn === fn && subscription.context === context) {
					channels[channel].splice(i, 1);
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
			if (!channel) {
				channel = this.defaultChannel;
			}
			
			var channel = channels[channel];
			return channel.context;
		},
		
		/**
		 * Get Channels
		 */
		getChannels: function() {
			return channels;
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
			return channels[channel];
		},
		
		/**
		 * Get the default channel
		 * Convenience method for getChannel(null)
		 */
		getDefaultChannel: function() {
			return channels[this.defaultChannel];
		}
	});

	/**
	 * Allow to define convention-based subscriptions
	 * as an 'subscriptions' hash on a view. Subscriptions
	 * can then be easily setup and cleaned.
	 *
	 * @class
	 */
	var abstractColleague = Augmented.View.extend({
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
			if (!subscriptions || _.isEmpty(subscriptions)) {
				return;
			}
			// Just to be sure we don't set duplicate
			this.unsetSubscriptions(subscriptions);

			_.each(subscriptions, function(subscription, channel) {
				var once;
				if (subscription.$once) {
					subscription = subscription.$once;
					once = true;
				}
				if (_.isString(subscription)) {
					subscription = this[subscription];
				}
				abstractMediator.subscribe(channel, subscription, this, once);
			}, this);
		},

		/**
		 * Unsubscribe to each subscription
		 * @param {Object} [subscriptions] An optional hash of subscription to remove
		 */
		unsetSubscriptions: function(subscriptions) {
			subscriptions = subscriptions || this.subscriptions;
			if (!subscriptions || _.isEmpty(subscriptions)) {
				return;
			}
			_.each(subscriptions, function(subscription, channel) {
				if (_.isString(subscription)) {
					subscription = this[subscription];
				}
				abstractMediator.unsubscribe(channel, subscription.$once || subscription, this);
			}, this);
		}
	});

	Augmented.Presentation.Mediator = abstractMediator;
	Augmented.Presentation.Colleague = abstractColleague;

	return Augmented.Presentation;
}));