/**
 * AugmentedService.js - The Service Core Component and package
 *
 * @author Bob Warren
 *
 * @requires augmented.js
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	    module.exports = moduleFactory(require('augmented'));
    } else if (typeof define === 'function' && define.amd) {
	    define([ 'augmented' ], moduleFactory);
    } else {
	    window.Augmented.Service = moduleFactory(window.Augmented);
    }
}(function(Augmented) {
    Augmented.Service = {};

    Augmented.Service.VERSION = '0.1.0 Pre';

    /** MockService
	 *
	 *  Sets up mocked REST calls that will intercept AJAX calls
	 *  and responds with a mocked response of our own choosing.
	 *
	 *  Usage: Augmented.Service.MockService.at("rest/product/123")
	 *                              .on("GET")
	 *                              .respondWithText("Hello World")
	 *                              .respondWithStatus(200)
	 *                              .respondWithHeaders({Content-Type: "text/plain", User: "Simba"})
	 *                              .register();
	 */
	var mock = function() {
		var options = {}, services = [], enabled, idInc = 0;

        this.getNextId = function() {
            return idInc++;
        };

        /**
         * Returns if the service is enabled
         */
        this.isEnabled = function() {
            return enabled;
        };
        /**
         * Enable the service
         */
        this.enableService = function() {
            enabled = true;
        };
        /**
         * Disable the service
         */
        this.disableService = function() {
            enabled = false;
        };

		/**
		 *  This url can be a string, or a regular expression. The
		 *  string supports the wildcard '*'.
		 */
		this.at = function(url) {
			options.url = url;
			return this;
		};

		/**
		 *  HTTP methods 'GET', 'POST', 'PATCH', 'DELETE', and so on.
		 */
		this.on = function(method) {
			options.type = method;
			return this;
		};

		/**
		 *	Accepts a string or accepts a JSON object if a
		 *  JSON.stringify() method is available.
		 */
		this.respondWithText = function(responseText) {
			options.responseText = responseText;
			return this;
		};

		this.respondWithStatus = function(responseStatus) {
			options.status = responseStatus;
			return this;
		};

		/**
		 *  The function parameter is an object that contains
		 *  {header field name: header field value} pairs.
		 */
		this.respondWithHeaders = function(responseHeaders) {
			options.headers = responseHeaders;
			return this;
		};

		/**
		 *  Registers the mock and activates it for mocking.
		 *  Returns the id number of the registered mock.
		 *  The id number will mostly be used to clear the
		 *  handler if it is not needed later on down the code.
		 */
		this.register = function() {
            var service = options;
            service.id = this.getNextId();
            services.push(service);
            options = {};
            return service.id;
		};

		/**
		 *  Clears the mock handler attached to the id number. If
		 *  no id is provided, it clears all the handlers.
		 */
		this.clear = function(id) {
			services[id] = null;
		};

        /**
		 *  Return all Registered Services
		 */
        this.getRegisteredMocks = function() {
            return services;
        };
	};

	var mockService = Augmented.Service.MockService = new mock();

    return Augmented.Service;
}));
