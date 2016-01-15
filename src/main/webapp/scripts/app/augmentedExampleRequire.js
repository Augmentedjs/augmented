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
		'augmentedPresentation': 'presentation/augmentedPresentation'
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

		augmented: {
			'deps': ['backbone'],
			'exports': 'Augmented'
		},

		augmentedPresentation: {
			'deps': ['augmented'],
			'exports': 'Presentation'
		}
	}
});

require(['augmented', 'augmentedPresentation'], function(Augmented, Presentation) {
    var app = new Augmented.Application("main");
    app.start();

    var schema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "User",
        "description": "A list of users",
        "type": "object",
        "properties": {
            "Name" : {
                "description": "Name of the user",
                "type" : "string"
            },
            "ID" : {
                "description": "The unique identifier for a user",
                "type" : "integer"
            },
            "Email" : {
                "description": "The email of the user",
                "type" : "string"
            }
        },
        "required": ["ID", "Name"]
    };

    var data = [ { "Name": "Bob", "ID": 123, "Email": "bob@augmentedjs.org" },
                 { "Name": "Jonathan", "ID": 234, "Email": "jonathon@augmentedjs.org" },
                 { "Name": "Corey", "ID": 345, "Email": "corey@augmentedjs.org" },
                 { "Name": "Seema", "ID": 456, "Email": "seema@augmentedjs.org" },
                 { "Name": "Jasmine", "ID": 567, "Email": "jasmine@augmentedjs.org" }
                ];

    var at = new Presentation.AutomaticTable({schema : schema, el: "#autoTable", data: data});
    at.render();
});
