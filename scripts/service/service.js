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
     * A private logger for use in the framework only
     * @private
     */
    var logger = Augmented.Logger.LoggerFactory.getLogger(Augmented.Logger.Type.console, Augmented.Configuration.LoggerLevel);


    /**
     * The datasource object for use as an interface for a datasource
     * @namespace DataSource
     * @memberof Augmented.Service
     */
    Augmented.Service.DataSource = function(client) {
        this.connected = false;
        this.style = "database";

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
        this.closeConnection = function() {};
        this.insert = function(model) {};
        this.remove = function(model) {};
        this.update = function(model) {};
        this.query = function(query) { return null; };
    };

    // MongoDB DataSource
    /**
     * The MongoDB datasource instance class
     * @constructor MongoDataSource
     * @memberof Augmented.Service
     */
    Augmented.Service.MongoDataSource = function() {
        Augmented.Service.DataSource.apply(this,arguments);

        this.getConnection = function(url, collection) {
            this.connected = false;
            var that = this;
            if (this.client && !this.connected) {
                this.client.connect(url, function(err, db) {
                    if(!err) {
                        logger.debug("collection: " + collection);
                        that.collection = db.collection(collection);
                        that.db = db;
                        that.url = url;
                        that.connected = true;
                        that.style = "database";
                    } else {
                        logger.error(err);
                        throw new Error(err);
                    }
                });
                return true;
            } else {
                logger.error("no client was passed.");
            }
            return false;
        };

        this.closeConnection = function() {
            if (this.db && this.connected) {
                this.db.close();
                this.connected = false;
                this.db = null;
                this.collection = null;
            }
        };

        this.query = function(query, callback) {
            var ret = {};
            if (this.collection && this.connected) {
                logger.debug("The query: " + query);
                this.collection.find(query).toArray(function(err, results) {
                    if(!err) {
                        logger.debug("Results: " + JSON.stringify(results));
                        if (results && results.length > 0) {
                            ret = results;
                            if (callback) {
                                callback(ret);
                            }
                        }
                    } else {
                        logger.error(err);
                        throw new Error(err);
                    }
                });
            } else {
                logger.error("no collection defined or not connected to db.");
            }
            logger.debug("ret: " + JSON.stringify(ret));
            return ret;
        };

        this.insert = function(data, callback) {
            var ret = {};
            if (this.collection && this.connected) {
                if (Array.isArray(data)) {
                    this.collection.insertMany(data, function(err, result) {
                        if(!err) {
                            logger.debug("Result: " + JSON.stringify(result));
                            if (result) {
                                ret = result;
                                if (callback) {
                                    callback(ret);
                                }
                            }
                        } else {
                            logger.error(err);
                            throw new Error(err);
                        }
                    });
                } else {
                    this.collection.insertOne(data, function(err, result) {
                        if(!err) {
                            logger.debug("Result: " + JSON.stringify(result));
                            if (result) {
                                ret = result;
                                if (callback) {
                                    callback(ret);
                                }
                            }
                        } else {
                            logger.error(err);
                            throw new Error(err);
                        }
                    });
                }
            } else {
                logger.error("no collection defined or not connected to db.");
            }
            logger.debug("ret: " + JSON.stringify(ret));
            return ret;
        };

        this.update = function(query, data, callback) {
            if (this.collection && this.connected) {
                this.collection.update(query, data, function(err, result) {
                    if(!err) {
                        logger.debug("Result: " + JSON.stringify(result));
                    } else {
                        logger.error(err);
                        throw new Error(err);
                    }
                });

                if (callback) {
                    callback(data);
                }
            } else {
                logger.error("no collection defined or not connected to db.");
            }
            return data;
        };

        this.remove = function(query, callback) {
            var ret = {};
            if (this.collection && this.connected) {
                logger.debug("The query: " + query);
                this.collection.remove(query, function(err, results) {
                    if(!err) {
                        if (callback) {
                            callback();
                        }
                    } else {
                        logger.error(err);
                        throw new Error(err);
                    }
                });
            } else {
                logger.error("no collection defined or not connected to db.");
            }
            return ret;
        };
    };


    /**
     * The SOLR datasource instance class
     * @constructor MongoDataSource
     * @memberof Augmented.Service
     */
    Augmented.Service.SOLRDataSource = function() {
        Augmented.Service.DataSource.apply(this,arguments);

        this.getConnection = function(url, collection) {
            this.connected = false;
            var that = this;
            if (this.client && !this.connected) {
                this.client.ping(function(err, db){
                   if(!err) {
                       logger.debug("collection: " + collection);
                       that.collection = collection;
                       that.db = db;
                       that.url = url;
                       that.connected = true;
                       that.style = "search";
                   } else {
                       logger.error(err);
                       throw new Error(err);
                   }
                });
            } else {
                logger.error("no client was passed.");
            }
            return this.connected;
        };

        this.closeConnection = function() {
            if (this.db && this.connected) {
                this.connected = false;
                this.db = null;
                this.collection = null;
            }
        };

        this.query = function(query, callback) {
            var ret = {};

            return ret;
        };

        this.insert = function(data, callback) {
            var ret = {};

            return ret;
        };

        this.update = function(query, data, callback) {

            return data;
        };

        this.remove = function(query, callback) {
            var ret = {};

            return ret;
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
            "MongoDB": "mongodb",
            "SOLR": "solr"
        },
        getDatasource: function(type, client) {
            if (type === "mongodb") {
                return new Augmented.Service.MongoDataSource(client);
            } else if (type === "solr") {
                return new Augmented.Service.SOLRDataSource(client);
            }
            return null;
        }
    };

    /**
     * Collection class to handle ORM to a datasource</br/>
     * <em>Note: Datasource property is required</em>
     *
     * @constructor Augmented.Service.Collection
     * @memberof Augmented.Service
     */
    Augmented.Service.Collection = Augmented.Collection.extend({
        /**
         * The query to use for the query - defaults to 'id' selection
         * @method {any} query The query string to use for selection
         * @memberof Augmented.Service.Collection
         */
        query: null,
        /**
         * @property {string} url The url for the datasource (if applicable)
         * @memberof Augmented.Service.Collection
         */
        url: "",
        /**
         * @method initialize Initialize the model with needed wireing
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Collection
         */
        initialize: function(options) {
            logger.log("initialize");
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
         * @memberof Augmented.Service.Collection
         */
        init: function(options) {},
        /**
         * @property {Augmented.Service.DataSource} datasource Datasource instance
         * @memberof Augmented.Service.Collection
         */
        datasource: null,
        /**
         * @method sync Sync method to handle datasource functions for the Collection
         * @param {string} method the operation to perform
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Collection
         */
        sync: function(method, options) {
            logger.debug("sync " + method);
            if (this.datasource) {
                var that = this;
                try {
                    var j = {}, q;
                    if (method === "create") {
                        j = this.toJSON();
                        this.datasource.insert(j, function() {
                            that.reset(j);
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success();
                            }
                        });
                    } else if (method === "update") {
                        j = this.toJSON();
                        if (options && options.query) {
                            q = options.query;
                        } else {
                            q = this.query;
                        }

                        this.datasource.update(q, j, function() {
                            //that.reset(j);
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success();
                            }
                        });
                    } else if (method === "delete") {
                        if (options && options.query) {
                            q = options.query;
                        } else {
                            q = this.query;
                        }
                        this.datasource.remove(q, function() {
                            that.reset();
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success();
                            }
                        });
                    } else {
                        // read
                        logger.log("reading");

                        if (options && options.query) {
                            q = options.query;
                        } else {
                            q = this.query;
                        }

                        logger.debug("query " + JSON.stringify(q));
                        this.datasource.query(q, function(data) {
                            that.reset(data);

                            logger.debug("returned: " + JSON.stringify(j));
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success(data);
                            }
                        });
                    }
                } catch(e) {
                    if (options && options.error && (typeof options.error === "function")) {
                        options.error(e);
                    }
                    //throw(e);
                }
            } else {
                logger.warn("no datasource");
            }
            return {};
        },
        /**
         * @method fetch Fetch the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Collection
         */
        fetch: function(options) {
            this.sync('read', options);
        },
        /**
         * @method save Save the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Collection
         */
        save: function(options) {
            this.sync('create', options);
        },
        /**
         * @method update Update the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Collection
         */
        update: function(options) {
            this.sync('update', options);
        },
        /**
         * @method destroy Destroy the entity
         * @param {object} options Any options to pass
         * @memberof Augmented.Service.Collection
         */
        destroy: function(options) {
            this.sync('delete', options);
        }
    });

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
            logger.log("initialize");
            if (options && options.datasource) {
                this.datasource = options.datasource;
                this.url = this.datasource.url;
                this.query = options.query;
            }
            // don't save this as data, but properties via the object base class options copy.
            this.unset("datasource");
            this.unset("url");
            this.unset("query");
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
            logger.debug("sync " + method);
            if (this.datasource) {
                var that = this;
                try {
                    var j = {}, q;
                    if (method === "create") {
                        j = that.attributes;
                        this.datasource.insert(j, function() {
                            that.reset(j);
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success();
                            }
                        });
                    } else if (method === "update") {
                        j = that.attributes;

                        //logger.debug("The object: " + JSON.stringify(j));

                        if (options && options.query) {
                            q = options.query;
                        } else {
                            q = this.query;
                        }

                        this.datasource.update(q, j, function() {
                            //that.reset(j);
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success();
                            }
                        });
                    } else if (method === "delete") {
                        if (options && options.query) {
                            q = options.query;
                        } else {
                            q = this.query;
                        }
                        this.datasource.remove(q, function() {
                            that.reset();
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success();
                            }
                        });
                    } else {
                        // read
                        logger.debug("reading");

                        if (options && options.query) {
                            q = options.query;
                        } else {
                            q = that.query;
                        }

                        logger.debug("query " + JSON.stringify(q));
                        this.datasource.query(q, function(data) {
                            if (Array.isArray(data)) {
                                that.reset(data[0]);
                            } else {
                                that.reset(data);
                            }

                            logger.debug("returned: " + JSON.stringify(j));
                            if (options && options.success && (typeof options.success === "function")) {
                                options.success(data);
                            }
                        });
                    }
                } catch(e) {
                    if (options && options.error && (typeof options.error === "function")) {
                        options.error(e);
                    }
                    //throw(e);
                }
            } else {
                logger.warn("no datasource");
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
