var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, "");
    allTestFiles.push(normalizedTestModule);
  }
});

require.config({
	"baseUrl": "/base",

	"paths": {
		"jquery": "scripts/lib/jquery.min",
		"underscore": "scripts/lib/lodash.min",
		"backbone": "scripts/lib/backbone-min",

		"augmented": "scripts/core/augmented",
    "jasmineajax": "scripts/lib/mock-ajax"
	},
	"shim": {
	},
	// ask Require.js to load these files (all our tests)
  deps: allTestFiles,
	callback: window.__karma__.start
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
              "core/test/resourceBundleSpec"
            ];
