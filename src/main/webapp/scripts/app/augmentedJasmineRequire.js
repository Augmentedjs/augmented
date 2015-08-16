require.config({
	'baseUrl': 'scripts/',

	'paths': {
		'jquery': 'lib/jquery/jquery-2.1.4.min',
		'underscore': 'lib/underscore-min',
		'backbone': 'lib/backbone-min',
		'handlebars': 'lib/handlebars-v3.0.3',
		'text': 'lib/text',
		'json': 'lib/json',
		'mockjax': 'lib/jquery.mockjax',

		'augmented': 'core/augmented',
		'augmentedPresentation': 'presentation/augmentedPresentation',

		'jasmine': 'lib/jasmine-2.x/jasmine',
		'jasmine_html': 'lib/jasmine-2.x/jasmine-html',
		'boot': 'lib/jasmine-2.x/boot'

	},
	'shim': {
		jquery: {
			'exports': '$'
		},
		backbone: {
			'deps': ['jquery', 'underscore', 'handlebars', 'mockjax'],
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
			'deps': ['jquery', 'augmented'],
			'exports': 'augmentedPresentation'
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
		}
	}
});

//Define all of your specs here. These are RequireJS modules.
var specs = [ 'core/test/coreSpec', 
              'core/test/applicationContextSpec',
              'core/test/mockServiceSpec',
              'core/test/validationSpec',
              'core/test/localStorageSpec',
              'core/test/utilitySpec',
              'core/test/polyfillSpec',
              
              'presentation/test/presentationSpec'
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
