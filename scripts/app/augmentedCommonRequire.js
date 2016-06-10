require.config({
	'paths': {
    	'jquery': augmented.base + 'scripts/lib/jquery.min',
		'underscore': augmented.base + 'scripts/lib/lodash.min',
		'backbone': augmented.base + 'scripts/lib/backbone-min',

		'augmented': augmented.base + 'scripts/core/augmented-min',
		'augmentedPresentation':  augmented.base + 'scripts/presentation/augmentedPresentation-min'
	},
	'shim': {}
});

require(['augmented']);
