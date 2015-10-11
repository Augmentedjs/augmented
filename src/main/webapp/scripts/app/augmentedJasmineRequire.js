require.config({
	'baseUrl': 'scripts/',

	'paths': {
		'jquery': 'lib/jquery-2.1.4.min',
		'underscore': 'lib/lodash.min',
		'backbone': 'lib/backbone-min',
		'handlebars': 'lib/handlebars-v4.0.2',
		'text': 'lib/text',
		'json': 'lib/json',
		'mockjax': 'lib/jquery.mockjax',

		'augmented': 'core/augmented',
		'augmentedPresentation': 'presentation/augmentedPresentation',
		'augmentedService': 'service/augmentedService',
		'augmentedLegacy': 'legacy/legacy',

		'jasmine': 'lib/jasmine-2.x/jasmine',
		'jasmine_html': 'lib/jasmine-2.x/jasmine-html',
		'boot': 'lib/jasmine-2.x/boot',
        'jasmineajax': 'lib/mock-ajax'

	},
	'shim': {
		jquery: {
			'exports': '$'
		},
		backbone: {
			'deps': ['jquery', 'underscore', 'handlebars'],
			'exports': 'Backbone'
		},
		underscore: {
			'exports': '_'
		},
		handlebars: {
			'exports': 'Handlebars'
		},
		mockjax: {
			'deps':['jquery'],
			'exports': 'mockjax'
		},

		augmented: {
			'deps': ['backbone'],
			'exports': 'Augmented'
		},

		augmentedPresentation: {
			'deps': ['augmented'],
			'exports': 'augmentedPresentation'
		},

		augmentedService: {
			'deps': ['jquery', 'mockjax', 'underscore', 'augmented'],
			'exports': 'augmentedService'
		},

		augmentedLegacy: {
			'deps': ['augmented'],
			'exports': 'augmentedLegacy'
		},

		jasmine: {
			exports : 'window.jasmineRequire'
		},
		jasmine_html: {
			deps: [ 'jasmine' ],
			exports: 'window.jasmineRequire'
		},
		boot: {
			deps: [ 'jasmine', 'jasmine_html' ],
			exports: 'window.jasmineRequire'
		},
        jasmineajax: {
            deps: [ 'jasmine' ],
            exports : 'jasmine-ajax'
        }
	}
});

//Define all of your specs here. These are RequireJS modules.
var specs = [ 'core/test/coreSpec',
              'core/test/validationSpec',
              'core/test/localStorageSpec',
              'core/test/utilitySpec',
              'core/test/resourceBundleSpec',
              'core/test/ajaxSpec',
              'core/test/applicationSpec',
			  'core/test/securitySpec',
			  'core/test/loggerSpec',
			  'core/test/asyncQueueSpec',
              'core/test/modelSpec',
              'core/test/collectionSpec',
              'core/test/viewSpec',

              'presentation/test/presentationSpec',
              'presentation/test/autoTableSpec',

              'service/test/mockServiceSpec',

			  'legacy/test/applicationContextSpec',
              'legacy/test/polyfillSpec'

            ];

// Load Jasmine - This will still create all of the normal Jasmine browser globals unless `boot.js` is re-written to use the
// AMD or UMD specs. `boot.js` will do a bunch of configuration and attach it's initializers to `window.onload()`. Because
// we are using RequireJS `window.onload()` has already been triggered so we have to manually call it again. This will
// initialize the HTML Reporter and execute the environment.
require([ 'augmented', 'boot' ], function(Augmented) {

	// Load the specs
	require(specs, function() {

		// Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
		window.onload();

		$("#augmented").html("Version " + Augmented.VERSION + " (" + Augmented.codename + ") Release " + Augmented.releasename);
	});
});
