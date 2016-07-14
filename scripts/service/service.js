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
	    module.exports = moduleFactory(require('augmentedjs'));
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
    Augmented.Service.VERSION = Augmented.VERSION;

    /**
     * The datasource object for use as an interface for a datasource
     * @namespace DataSource
     * @memberof Augmented.Service
     */
    Augmented.Service.DataSource = function(client) {

        /**
         * @property {object} client The client for use in the DataSource
         * @memberof Augmented.Service.DataSource
         */

        this.client = (client) ? client : null;
        /**
         * @property {string} url The url for the datasource (if applicable)
         * @memberof Augmented.Service.DataSource
         */
        this.url = "";
        /**
         * @property {object} db The database (or simular) for the datasource (if applicable)
         * @memberof Augmented.Service.DataSource
         */
        this.db = null;
        /**
         * @property {object} collection The collection for use in the DataSource
         * @memberof Augmented.Service.DataSource
         */
        this.collection = null;
        /**
         * @method getConnection Get a connection to the DataSource
         * @memberof Augmented.Service.DataSource
         * @returns {boolean} Returns true if a connection is established
         */
        this.getConnection = function() { return false; };
        this.insert = function(model) {};
        this.remove = function(model) {};
        this.update = function(model) {};
        this.query = function(query) { return {}; };
    };

    // MongoDB DataSource
    /**
     * The MongoDB datasource instalce class
     * @constructor MongoDataSource
     * @memberof Augmented.Service
     */
    Augmented.Service.MongoDataSource = function() {
        Augmented.Service.DataSource.apply(this,arguments);

        this.getConnection = function(url, collection) {
            var that = this;
            if (this.client) {
                this.client.connect(url, function(err, db) {
                    if(!err) {
                        console.log("collection: " + collection);
                        that.collection = db.collection(collection);
                        that.db = db;
                        that.url = url;
                    } else {
                        console.error(err);
                        throw new Error(err);
                    }
                });
                return true;
            } else {
                console.error("no client was passed.");
            }
            return false;
        };

    };
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
        getDatasource: function(type, client) {
            if (type === "mongodb") {
                return new Augmented.Service.MongoDataSource(client);
            } else if (type === "localstorage") {

            }
            return null;
        }
    };

    /**
     * Entity class to handle ORM to a datasource</br/>
     * <em>Note: Datasource property is required</em>
     *
     * @constructor Augmented.Service.Entity
     * @memberof Augmented.Service
     */
    Augmented.Service.Entity = Augmented.Model.extend({
        id: "",
        /**
         * The query to use for the query - defaults to 'id' selection
         * @method {any} query The query string to use for selection
         * @memberof Augmented.Service.Entity
         */
        query: {},
        /**
         * @property {string} url The url for the datasource (if applicable)
         * @memberof Augmented.Service.Entity
         */
        url: "",
        /**
         * @method initialize Initialize the model with needed wireing
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        initialize: function(options) {
            console.log("initialize");
            if (options && options.datasource) {
                this.datasource = options.datasource;
                this.url = this.datasource.url;
                this.query = options.query;
            }
            this.init(options);
        },
        /**
         * @method init Custom init method for the model (called at inititlize)
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        init: function(options) {},
        /**
         * @property {Augmented.Service.DataSource} datasource Datasource instance
         * @memberof Augmented.Service.Entity
         */
        datasource: null,
        /**
         * @method sync Sync method to handle datasource functions for the model
         * @param {string} method the operation to perform
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        sync: function(method, options) {
            console.log("sync " + method);
            console.log("do I have a datasource? " + (this.datasource !== null));
            if (this.datasource) {
                var j = {}, q;
                if (method === "create") {
                    j = this.toJSON();
                    this.datasource.insert(j);
                } else if (method === "update") {
                    j = this.toJSON();
                    this.datasource.update(j);
                } else if (method === "delete") {
                    q = this.query;
                    if (options && options.query) {
                        q = options.query;
                    }
                    this.datasource.remove(q);
                    this.reset();
                } else {
                    // read
                    console.log("reading");

                    if (options && options.query) {
                        q = options.query;
                    } else {
                        q = this.query;
                    }

                    console.log("query " + JSON.stringify(q));
                    j = this.datasource.query(q);
                    this.reset(j);
                }
            } else {
                console.log("no datasource");
            }
            return {};
        },
        /**
         * @method fetch Fetch the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        fetch: function(options) {
            this.sync('read', options);
        },
        /**
         * @method save Save the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        save: function(options) {
            this.sync('create', options);
        },
        /**
         * @method update Update the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        update: function(options) {
            this.sync('update', options);
        },
        /**
         * @method destroy Destroy the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Entity
         */
        destroy: function(options) {
            this.sync('delete', options);
        }
    });

    return Augmented.Service;
}));
