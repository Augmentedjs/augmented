/**
 * AugmentedPresentation.js - The Core UI Component and package
 * 
 * @author Bob Warren
 * 
 * @requires jquery.js
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
	 * Mediator
	 */

	var channels = {}, Subscriber,
	/** @borrows Augmented.View#delegateEvents */
	delegateEvents = Augmented.View.prototype.delegateEvents,
	/** @borrows Augmented.View#delegateEvents */
	undelegateEvents = Augmented.View.prototype.undelegateEvents;

	var abstractMediator = Augmented.View.extend({
		defaultChannel: "augmentedChannel",
		
		observeColleague: function(colleague, callback, channel) {
			if (!channel) {
				channel = this.defaultChannel;
			}
			
			this.subscribe(channel, callback, colleague, false);
		},
		
		dismissColleague: function(colleague, channel) {
			if (!channel) {
				channel = this.defaultChannel;
			}
			
			this.unsubscribe(channel, callback, colleague);
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

		getColleagues: function() {
			// TODO: return collection of colleagues not channels
			return channels;
		},
		
		getChannels: function() {
			return channels;
		},
		
		getChannel: function(channel) {
			return channels[channel];
		},
		
		getDefaultChannel: function() {
			return channels[this.defaultChannel];
		},
		
		getColleague: function(colleague, channel) {
			if (!channel) {
				channel = this.defaultChannel;
			}
			
			var channel = channels[channel];
			return channel.context;
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
		unsetSubscriptions : function(subscriptions) {
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