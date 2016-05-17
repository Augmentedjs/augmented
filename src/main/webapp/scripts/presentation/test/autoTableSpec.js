define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Automatic Table', function() {
        it('is defined', function() {
			expect(Presentation.AutomaticTable).toBeDefined();
		});

        it('is not initialized without a schema', function() {
            var at = new Presentation.AutomaticTable();
			expect(at).toBeDefined();
            expect(at.isInitalized).toBeFalsy();
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
                at.remove();
                at = null;
            });

            it('can create an instance', function() {
    			expect(at instanceof Presentation.AutomaticTable).toBeTruthy();
    		});

            it('is initialized with a schema', function() {
    			expect(at).toBeDefined();
                expect(at.isInitalized).toBeTruthy();
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

            xit('can compile data to a template (DEPRECATED)', function() {
    			at.populate(data);
                var html = at.compileTemplate();
                expect(html).not.toEqual("");
    		});

            it('can render the table', function() {
    			at.populate(data);
                var t = at.render();
                expect(t).toBeDefined();
    		});

            it('can export the table to csv', function() {
    			at.populate(data);
                var t = at.exportTo('csv');
                expect(t).toBeDefined();
                expect(t).not.toEqual("");
    		});

            it('can export the table to tsv', function() {
    			at.populate(data);
                var t = at.exportTo('tsv');
                expect(t).toBeDefined();
                expect(t).not.toEqual("");
    		});

            it('can export the table to html', function() {
    			at.populate(data);
                var t = at.exportTo('html');
                expect(t).toBeDefined();
                expect(t).not.toEqual("");
    		});

            it('can validate', function() {
    			at.populate(data);
                var m = at.validate();
                expect(m).toBeDefined();
                expect(at.isValid()).toBeTruthy();
    		});
        });

        describe("Can create subclasses", function() {
            it('can create a BigDataTable class', function() {
                var b = new Presentation.BigDataTable();
                expect(Presentation.BigDataTable).toBeDefined();
                expect(b instanceof Presentation.BigDataTable).toBeTruthy();
                expect(b.paginationAPI).toBeDefined();
                b.remove();
                b = null;
    		});

            it('can create a EditableTable class', function() {
                var b = new Presentation.EditableTable();
                expect(Presentation.EditableTable).toBeDefined();
                expect(b instanceof Presentation.EditableTable).toBeTruthy();
                expect(b.editable).toBeTruthy();
                b.remove();
                b = null;
    		});

            it('can create a EditableBigDataTable class', function() {
                var b = new Presentation.EditableBigDataTable();
                expect(Presentation.EditableBigDataTable).toBeDefined();
                expect(b instanceof Presentation.EditableBigDataTable).toBeTruthy();
                expect(b.editable).toBeTruthy();
                expect(b.paginationAPI).toBeDefined();
                b.remove();
                b = null;
    		});

            it('can create a LocalStorageTable class', function() {
                var b = new Presentation.LocalStorageTable();
                expect(Presentation.LocalStorageTable).toBeDefined();
                expect(b instanceof Presentation.LocalStorageTable).toBeTruthy();
                expect(b.localStorage).toBeTruthy();
                expect(b.localStorageKey).toBeDefined();
                expect(b.uri).toEqual(null);
                b.remove();
                b = null;
    		});

            it('can create a EditableLocalStorageTable class', function() {
                var b = new Presentation.EditableLocalStorageTable();
                expect(Presentation.EditableLocalStorageTable).toBeDefined();
                expect(b instanceof Presentation.EditableLocalStorageTable).toBeTruthy();
                expect(b.localStorage).toBeTruthy();
                expect(b.localStorageKey).toBeDefined();
                expect(b.editable).toBeTruthy();
                expect(b.uri).toEqual(null);
                b.remove();
                b = null;
    		});
        });
	});
});
