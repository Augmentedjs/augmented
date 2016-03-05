require.config({
	'baseUrl': '/augmented/scripts/',

    'paths': {
		'jquery': 'lib/jquery-2.1.4.min',
		'underscore': 'lib/lodash.min',
		'backbone': 'lib/backbone-min',
		'handlebars': 'lib/handlebars-v4.0.2',
		'text': 'lib/text',
		'json': 'lib/json',

		'augmented': 'core/augmented',
		'augmentedPresentation': 'presentation/augmentedPresentation',
		'augmentedService': 'service/augmentedService'
	},
	'shim': {
		/*jquery: {
			'exports': '$'
		},
		backbone: {
			'deps': ['jquery', 'underscore', 'handlebars'],
			'exports': 'Backbone'
		},*/
		underscore: {
			'exports': '_'
		}/*,
		handlebars: {
			'exports': 'Handlebars'
		}
        
		augmented: {
			'deps': ['backbone'],
			'exports': 'Augmented'
		},

		augmentedPresentation: {
			'deps': ['jquery', 'underscore', 'augmented'],
			'exports': 'augmentedPresentation'
		},

		augmentedService: {
			'deps': ['jquery', 'mockjax', 'underscore', 'augmented'],
			'exports': 'augmentedService'
		}
        */
	}
});

require(
	['backbone', 'augmented', 'handlebars', 'underscore'],
	function(Backbone, Augmented, Handlebars, _) {
		var app = new Augmented.Application();
		app.setName("About");
		app.start();


	    $("#augmented").html("Version " + Augmented.VERSION + " (" + Augmented.codename + ") Release " + Augmented.releasename);

	    var libraries = {};
		libraries.jQuery = "jQuery version " + $().jquery;

		var und;
		if (_.lodash) {
			und = 'lodash.js';
		} else {
			und = 'underscore.js';
		}

		libraries.underscore = und + " version " + _.VERSION;
		libraries.backbone = "Backbone.js version " + Backbone.VERSION;
		libraries.handlebars = "Handlebars.js version " + Handlebars.VERSION;
		libraries.require = "Require.js version " + require.version;

		$("#libraries").html("<p>Other base libraries:</p><ul><li>" + libraries.jQuery + "</li><li>" + libraries.underscore +
				"</li><li>" + libraries.backbone + "</li><li>" + libraries.handlebars + "</li><li>" + libraries.require +
				"</li></ul>");

		console.log("My JS is Augmented! - JC");
    }
);
