/**
 * service.js - The Service Core Component<br/>
 * The <b>Service</b> extension adds extensive abilities to the service (Node.js) layer.<br/>
 * This extension adds:<br/>
 * <ul>
 * <li>DataSource</li>
 * </ul>
 *
 * @author Bob Warren
 *
 * @requires augmented.js
 * @module Augmented.Service
 * @version 0.4.0
 * @license Apache-2.0
 */
(function(moduleFactory) {
    if (typeof exports === 'object') {
	    module.exports = moduleFactory(require('augmented'));
    } else if (typeof define === 'function' && define.amd) {
	    define(['augmented'], moduleFactory);
    } else {
	    window.Augmented.Service = moduleFactory(window.Augmented.Service);
    }
}(function(Augmented) {
    "use strict";
    /**
     * The base namespece for all of the Service module.
     * @namespace Service
     * @memberof Augmented
     */
    Augmented.Service = {};

    /**
     * The standard version property
     * @constant VERSION
     * @memberof Augmented.Service
     */
    Augmented.Service.VERSION = Service.VERSION;



    /**
     * The datasource factory to return an instance of a datasource configured by type
     * @namespace DataSourceFactory
     * @memberof Augmented.Service
     */
    Augmented.Service.DataSourceFactory = {
        Type: {
            "LocalStorage": "localstorage",
            "MongoDB": "mongodb"
        },
        getInstance: function(type) {
            if (type === "mongodb") {
                return new Augmented.Service.MongoDataSource();
            } else if (type === "localstorage") {

            }
            return null;
        }
    };



    /**
     * The datasource object for use as an interface for a datasource
     * @namespace DataSource
     * @memberof Augmented.Service
     */
    Augmented.Service.DataSource = {
        /**
         * @property {object} client The client for use in the DataSource
         * @memberof Augmented.Service.DataSource
         */
        client: {},
        /**
         * @property {object} collection The collection for use in the DataSource
         * @memberof Augmented.Service.DataSource
         */
        collection: {},
        /**
         * @method {object} collection The collection for use in the DataSource
         * @memberof Augmented.Service.DataSource
         */
        getConnection: function() {},
        insert: function(model) {},
        remove: function(model) {},
        update: function(model) {},
        query: function(id) {}
    };

    // MongoDB DataSource

    Augmented.Service.MongoDataSource = {};

    Augmented.Service.MongoDataSource.prototype = Object.create(Augmented.Service.DataSource);

    Augmented.Service.MongoDataSource.prototype.getConnection = function(url, collection) {
        this.client.connect(url, function(err, db) {
            if(!err) {
                //logger.info("We are connected to MongoDB 'user' collection on 'contacts.'");
                this.collection = db.collection(collection);
                return true;
            } else {
                //logger.error("Connection failed with error: " + err);
            }
            return false;
        });
    };


    Augmented.Service.Entity = Augmented.Model.extend({
        datasource: null,
        sync: function(method) {
            if (this.datasource) {
                var j = {};
                if (method === "create") {
                    j = this.toJSON();
                    this.datasource.insert(j);
                } else if (method === "update") {
                    j = this.toJSON();
                    this.datasource.update(j);
                } else if (method === "delete") {
                    this.datasource.remove(this.id);
                } else {
                    // read
                    j = this.datasource.query(this.id);
                    this.reset(j);
                }
            }
            return {};
        }
    });


    return Augmented.Service;
}));
