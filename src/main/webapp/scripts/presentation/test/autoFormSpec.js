define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Automatic Form', function() {
        it('is defined', function() {
			expect(Presentation.AutomaticForm).toBeDefined();
		});

        it('is not initialized without a schema', function() {
            var f = new Presentation.AutomaticForm();
			expect(f).toBeDefined();
            expect(f.isInitalized).toBeFalsy();
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

            var data = { "Name": "Bob", "ID": 123, "Email": "bob@augmentedjs.org" };

            var f;

            beforeEach(function() {
                f = new Presentation.AutomaticForm({schema: schema});
            });

            afterEach(function() {
                f.remove();
                f = null;
            });

            it('can create an instance', function() {
    			expect(f instanceof Presentation.AutomaticForm).toBeTruthy();
    		});

            it('is initialized with a schema', function() {
    			expect(f).toBeDefined();
                expect(f.isInitalized).toBeTruthy();
    		});

            it('can set uri and schema', function() {
                f.setURI(uri);
                expect(f.uri).toEqual(uri);
                expect(f.schema).toEqual(schema);
            });

            it('can populate data', function() {
    			f.populate(data);
                expect(f.model.toJSON()).toEqual(data);
    		});

            it('can validate', function() {
    			f.populate(data);
                var m = f.validate();
                expect(m).toBeDefined();
                expect(f.isValid()).toBeTruthy();
    		});

            it('can invalidate bad data', function() {
    			f.populate({ "x": "x" });
                var m = f.validate();
                expect(m).toBeDefined();
                expect(f.isValid()).toBeFalsy();
    		});
        });
	});
});
