require.config({
	"baseUrl": "scripts/",

	"paths": {
		"jquery": "lib/jquery.min",
		"underscore": "lib/lodash.min",
		"backbone": "lib/backbone-min",

		"augmented": "core/augmented",
		//"augmentedPresentation": "presentation/augmentedPresentation",
        // Deprecated
		//"augmentedLegacy": "legacy/legacy",

		"jasmine": "lib/jasmine-2.x/jasmine",
		"jasmine_html": "lib/jasmine-2.x/jasmine-html",
		"boot": "lib/jasmine-2.x/boot",
        "jasmineajax": "lib/mock-ajax"
	},
	"shim": {
		jasmine: {
			exports: "window.jasmineRequire"
		},
		jasmine_html: {
			deps: [ "jasmine" ],
			exports: "window.jasmineRequire"
		},
		boot: {
			deps: [ "jasmine", "jasmine_html" ],
			exports: "window.jasmineRequire"
		},
        jasmineajax: {
            deps: [ "jasmine" ],
            exports: "jasmine-ajax"
        }
	}
});

//Define all of your specs here. These are RequireJS modules.
var specs = [ "core/test/coreSpec",
              "core/test/routerSpec",
              "core/test/validationSpec",
              "core/test/localStorageSpec",
              "core/test/utilitySpec",
              "core/test/ajaxSpec",
              "core/test/applicationSpec",
			  "core/test/securitySpec",
			  "core/test/loggerSpec",
			  "core/test/asyncQueueSpec",
              "core/test/modelSpec",
              "core/test/collectionSpec",
              "core/test/viewSpec",
              "core/test/transformerSpec",
              "core/test/structureSpec",
/* moved
              "presentation/test/presentationSpec",
              "presentation/test/autoTableSpec",
              "presentation/test/applicationSpec",
              "presentation/test/mediationSpec",
              "presentation/test/decoratorViewSpec",
              "presentation/test/DOMSpec",
              "presentation/test/widgetSpec",
              "presentation/test/viewControllerSpec",
              "presentation/test/dialogSpec",
              "presentation/test/autoFormSpec",
              "presentation/test/dollar",
*/
              "core/test/resourceBundleSpec"
              // Deprecated
			  //"legacy/test/applicationContextSpec",
              //"legacy/test/polyfillSpec"
            ];

// Load Jasmine - This will still create all of the normal Jasmine browser globals unless `boot.js` is re-written to use the
// AMD or UMD specs. `boot.js` will do a bunch of configuration and attach it"s initializers to `window.onload()`. Because
// we are using RequireJS `window.onload()` has already been triggered so we have to manually call it again. This will
// initialize the HTML Reporter and execute the environment.
require(["augmented", "boot"], function(Augmented) {
    "use strict";
    var app = new Augmented.Application("Jasmine Suite");
    app.start();

	var v = document.querySelector("h2#augmented");
	v.innerHTML = "<span class=\"version\">Version " + Augmented.VERSION +
		" (" + Augmented.codename + ")</span>&emsp;<span class=\"release\">Release (" +
		Augmented.releasename + ")</span>";

	// Load the specs
	require(specs, function() {
		// Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
		window.onload();
	});
});
