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
		'augmentedPresentation': 'presentation/augmentedPresentation'
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
			'deps': ['jquery', 'underscore', 'augmented'],
			'exports': 'augmentedPresentation'
		}
	}	
}); 

require(['augmented'], function(Augmented) {
	    var app = new AugmentedApplication("main");
	    
	    app.start();
	    
	    
		
});