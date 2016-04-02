define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Validation', function() {

		describe('Given an Augmented Model', function() {
			it('is defined', function() {
				expect(Augmented.Model).toBeDefined();
			});

			it('with no Schema does not support Validation', function() {
				var model = new Augmented.Model();
				expect(model.supportsValidation()).toBeFalsy();
			});

			it('with an empty Schema does support Validation', function() {
				var model = new Augmented.Model();
				model.schema = {};
				expect(model.supportsValidation()).toBeTruthy();
			});
		});

        describe('Given the Augmented Validation Framework', function() {
			it('is defined', function() {
				expect(Augmented.ValidationFramework).toBeDefined();
			});

            it('can generate a schema from a model', function() {
				var model = new Augmented.Model();
                model.set({ "Name": "Bob", "ID": 123, "Email": "bob@augmentedjs.org", "Role": "Architect", "Active": true });
                var schema = Augmented.ValidationFramework.generateSchema(model);
				expect(schema).toBeDefined();
                expect(Augmented.isObject(schema)).toBeTruthy();
			});
        });
        
		describe('Given an Augmented Collection', function() {
			it('has an augmented Collection', function() {
				expect(Augmented.Collection).toBeDefined();
			});

			it('with no Schema does not support Validation', function() {
				var collection = new Augmented.Collection();
				expect(collection.supportsValidation()).toBeFalsy();
			});

			it('with an empty Schema does support Validation', function() {
				var collection = new Augmented.Collection();
				collection.schema = {};
				expect(collection.supportsValidation()).toBeTruthy();
			});
		});
	});
});
