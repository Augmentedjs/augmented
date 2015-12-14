require.config({
	'paths': {
    	'jquery': augmented.base + 'scripts/lib/jquery-2.1.4.min',
		'underscore': augmented.base + 'scripts/lib/lodash.min',
		'backbone': augmented.base + 'scripts/lib/backbone-min',
		'handlebars': augmented.base + 'scripts/lib/handlebars-v4.0.2',
		'text': augmented.base + 'scripts/lib/text',
		'json': augmented.base + 'scripts/lib/json',
		'mockjax': augmented.base + 'scripts/lib/jquery.mockjax.js',

		'augmented': augmented.base + 'scripts/core/augmented-min',
		'augmentedPresentation':  augmented.base + 'scripts/presentation/augmentedPresentation-min',
		'augmentedService':  augmented.base + 'scripts/service/augmentedService',
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

require(['augmented']);
