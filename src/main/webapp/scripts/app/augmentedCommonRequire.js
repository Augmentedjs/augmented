require.config({ 
	'paths': { 
    	'jquery': augmented.base + 'scripts/lib/jquery/jquery-2.1.4.min',
		'underscore': augmented.base + 'scripts/lib/underscore-min',
		'backbone': augmented.base + 'scripts/lib/backbone-min',
		'handlebars': augmented.base + 'scripts/lib/handlebars-v3.0.3',
		'text': augmented.base + 'scripts/lib/text',
		'json': augmented.base + 'scripts/lib/json',
		'mockjax': augmented.base + 'scripts/lib/jquery.mockjax.js',

		'augmented': augmented.base + 'scripts/core/augmented'
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
		}
	}	
}); 

require(['augmented']);
