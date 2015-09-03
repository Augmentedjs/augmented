require.config({ 
	'baseUrl': '/augmented/scripts/',
	
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
		'augmentedService': 'service/augmentedService'
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
			'deps': ['jquery', 'underscore', 'augmented'],
			'exports': 'augmentedPresentation'
		},
		
		augmentedService: {
			'deps': ['jquery', 'mockjax', 'underscore', 'augmented'],
			'exports': 'augmentedService'
		}
		
	}	
}); 

require(
	['backbone', 'augmented', 'handlebars'], 
	function(Backbone, Augmented, Handlebars) {
	    Augmented.history.start();
		
	    $("#augmented").html("Version " + Augmented.VERSION + " (" + Augmented.codename + ") Release " + Augmented.releasename);
		
	    var libraries = {};
		libraries.jQuery = "jQuery version " + $().jquery;
		libraries.underscore = "underscore.js version " + _.VERSION;
		libraries.backbone = "Backbone.js version " + Backbone.VERSION;
		libraries.handlebars = "Handlebars.js version " + Handlebars.VERSION;
		libraries.require = "Require.js version " + require.version;
		
		$("#libraries").html("<p>Other base libraries:</p><ul><li>" + libraries.jQuery + "</li><li>" + libraries.underscore + 
				"</li><li>" + libraries.backbone + "</li><li>" + libraries.handlebars + "</li><li>" + libraries.require + 
				"</li></ul>");
		
		console.log("My JS is Augmented! - JC");	
    }
);
