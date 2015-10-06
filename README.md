# Augmented.js
## The Augmented.js Framework.

**aug·ment·ed**
/ˌôɡˈmentəd /
*adjective*
adjective: augmented

    1.
    having been made greater in size or value.


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
  - extends
  - Array tools
* HTML5 localStorage factory with namespace protection support
* Built-in logging factory with console and REST support

And much more!

## Presentation

An extension module for **Presentation** is also available and adds extensive abilities to the presentation layer.

This extension adds:
* Mediator patterned PubSub Views

## Service

Also a **Service** extension adds additional features based around backend and Ajax features.

This extension module adds:
* Mock service for Ajax calls
