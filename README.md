# Augmented.js
## The Augmented.js Framework.
### Version 1.4.x
### "Typhoon"
**aug·ment·ed**
/ˌôɡˈmentəd /
*adjective*
adjective: augmented

    1. having been made greater in size or value.


**Augmented.js** is a javascript framework based on (but enhances extensively) Backbone.js.  Augmented.js provides a large set of functionality designed to develop single pages applications easier.

The key focus of the project is to tie a number of missing features, patterns, and what would normally be third-party plugins together in a powerful framework.  Another goal of *Augmented.js* is to limit third party libraries for a smaller footprint, easy dependency management, and high performance.  Performance is a key item in the framework.  In every case the performance will beat other libraries and frameworks (such as jQuery) usually by large amounts.

# Modules

*All JSDoc documentation is under the /jsdoc directory in the distribution as well as on the site at http://www.augmentedjs.com/jsdoc*

## Core

A few key features of the **Core** module are:
* Validation framework for Models and Collections
  - supports JSON Schema Draft 4
* Full i18n Message Bundle support
  - mimics the Java Resource Bundle API
* Object extension with eventing support
* Security wired throughout the framework
  - Views can lock down
  - Multiple Security models supported
* Application metadata Object
* Utilities that support common abilities found in jQuery (only drastically faster)
  - Ajax (mimics jQuery API)
  - Very fast Object extends
  - Array tools
  - ES6-like Map data structure object
  - Stack data structure object
  - O(log n) Search and sort algorithms
* HTML5 localStorage factory with namespace protection support
* Built-in logging factory with console and REST support
* Async Queue for processing
* Mock support in Models and Collections
* Full support for crossOrigin requests via property

And much more!

## Presentation

The **Presentation** extension adds extensive abilities to the presentation layer.

This extension adds:
* Mediator patterned PubSub Views
* MVVM Decorator Views with declaratives
* Enhanced Application Object
  - PubSub mediation and bootstrapping for Application objects
  - CSS Stylesheet registration and injection
  - breadcrumb management
* Automatic Tables generated from a JSON schema and data
* Automatic Forms generated from a JSON schema

## Service

The **Service** extension.

The Service extension has it's own project under augmented-service.  

Install via NPM:
npm install augmentedjs-service

This extension adds:
* ORM style Entities
* REST Resource class
* Abstract Datasource interface
  - MongoDB
  - SOLR (work in progress)
