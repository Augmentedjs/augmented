const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const {document} = (new JSDOM("<!doctype html><html><body></body></html>")).window;
global.document = document;
global.window = document.defaultView;
XMLHttpRequest = require("xhr");
const Augmented = require("../scripts/core/augmented.js");

describe('Given Augmented Application', function() {
	it('is defined', function() {
		expect(Augmented.Application).toBeDefined();
	});

	describe('can create an instance', function() {
		var app = null;
		beforeEach(function() {
			app = new Augmented.Application();
		});
		afterEach(function() {
			app = null;
		});

  		it('can create an instance', function() {
              app = null;
  		    app = new Augmented.Application();

  		    expect(app instanceof Augmented.Application).toBeTruthy();
  		});

  		it('to be able to add metadata "name"', function() {
  		    app.setMetadataItem("name", "test");
  			expect(app.getMetadataItem("name")).toEqual("test");
  		});

          it('can start and History is present', function() {
  		    app.start();
              expect(app.started).toBeTruthy();
  		    expect(Augmented.History.started).toBeTruthy();
  		});

          it('can stop', function() {
              app.stop();
              expect(app.started).toBeFalsy();
          });
	});
});
