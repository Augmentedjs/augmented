define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Automatic Table', function() {
        it('is defined', function() {
			expect(Presentation.AutomaticTable).toBeDefined();
		});

        describe('Given some user data and a schema', function() {
            var uri = "test.json";
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

            var at;

            beforeEach(function() {
                at = new Presentation.AutomaticTable({schema: schema});
            });

            afterEach(function() {
                at = null;
            });

            it('can create an instance', function() {
    			expect(at instanceof Presentation.AutomaticTable).toBeTruthy();
    		});

            it('can set uri and schema', function() {
                at.setURI(uri);
                expect(at.uri).toEqual(uri);
                expect(at.schema).toEqual(schema);
            });

            it('can populate data', function() {
    			at.populate(data);
                expect(at.data).toEqual(data);
    		});

            it('won\'t populate a string', function() {
    			at.populate("data");
                expect(at.data).toEqual([]);
    		});

            it('won\'t populate a number', function() {
    			at.populate(123);
                expect(at.data).toEqual([]);
    		});

            it('won\'t populate an object', function() {
    			at.populate({ 123: 123 });
                expect(at.data).toEqual([]);
    		});

            it('can compile data to a template', function() {
    			at.populate(data);
                var html = at.compileTemplate();
                expect(html).not.toEqual("");
    		});

            it('can render the table', function() {
    			at.populate(data);
                var t = at.render();
                expect(t).toBeDefined();
    		});

            xit('can paginate the table', function() {

    		});
        });
	});
});
