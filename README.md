# Augmented.js
## The Augmented.js Framework.

**aug·ment·ed**
/ˌôɡˈmentəd /
*adjective*
adjective: augmented

    1. having been made greater in size or value.


**Augmented.js** is a framework based on Backbone.js and provides a large set of enterprise functionality.

The key focus of the project is to tie a number of missing features, patterns, and what would normally be thrid-party plugins together in a powerful framework.  Also in created Augmented the goal is to limit third party for smaller footprint, easy dependency management, and high performance.  Performance is a key item in the framework, in every case the functionality will beat other libraries and frameworks (such as jQuery) in performance by large amounts.

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
  - Object extends
  - Array tools
  - ES6-like Map data structure object
  - Stack data structure object
* HTML5 localStorage factory with namespace protection support
* Built-in logging factory with console and REST support
* Async Queue for processing
* Mock support in Models and Collections
* Full support for crossOrigin requests via property


And much more!

## Presentation

An extension module for **Presentation** is also available and adds extensive abilities to the presentation layer.

This extension adds:
* Mediator patterned PubSub Views
* Enhanced Application Object
    - PubSub mediation and boot-straping for Application objects
    - CSS Stylesheet registration and injection
    - breadcrumb management
* Automatic Tables generated from a JSON schema and data

## Service

Also a **Service** extension adds additional features based around backend and Ajax.

This extension module in currently a work in progress.

Planned features include:
* Spark support
* MicroService capability
* MicroESB
