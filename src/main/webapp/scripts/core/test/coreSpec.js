define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented', function() {
		it('is defined', function() {
			expect(Augmented).toBeDefined();
		});

		it('has a version defined', function() {
			expect(Augmented.VERSION).toBeDefined();;
		});

		it('supports noConflict', function() {
			expect(typeof Augmented.noConflict === 'function').toBeTruthy();
		});

		describe('Given an Augmented Object', function() {
			it('is defined', function() {
				expect(Augmented.Object).toBeDefined();
			});

			it('can be created with options', function() {
				var object = new Augmented.Object({stuff: "stuff"});

				expect(object.options.stuff).toEqual("stuff");
			});

			it('can be extended', function() {
				var exObject = Augmented.Object.extend({stuff: "stuff"});
				var object = new exObject();
				expect(object.stuff).toEqual("stuff");
			});
		});

		describe('Given Augmented.isFunction', function() {
			it('is defined', function() {
				expect(Augmented.isFunction).toBeDefined();
			});

			it('returns true for a function call', function() {
				var t = function() {};
				expect(Augmented.isFunction(t)).toBeTruthy();
			});

			it('returns false for a string value', function() {
				var t = "x";
				expect(Augmented.isFunction(t)).toBeFalsy();
			});

			it('returns false for a property call', function() {
				var t = { stuff: "stuff"};
				expect(Augmented.isFunction(t.stuff)).toBeFalsy();
			});

			it('returns false for an Array', function() {
				var t = [];
				expect(Augmented.isFunction(t)).toBeFalsy();
			});

			it('returns false for an Object', function() {
				var t = {};
				expect(Augmented.isFunction(t)).toBeFalsy();
			});

			it('returns false for an Augmented.Object', function() {
				var t = new Augmented.Object();
				expect(Augmented.isFunction(t)).toBeFalsy();
			});
		});

		describe('Given Augmented.result', function() {
			it('is defined', function() {
				expect(Augmented.result).toBeDefined();
			});

			it('returns the function call', function() {
				var t = { test: function() { return true; } };
				expect(Augmented.result(t, "test")).toBeTruthy();
			});

			it('returns the property', function() {
				var t = { test: true };
				expect(Augmented.result(t, "test")).toBeTruthy();
			});

		});

		// test base function calls, isFunction, result

		describe('Given an Augmented Model', function() {
			it('is defined', function() {
				expect(Augmented.Model).toBeDefined();
			});

			it('without Cross Origin Support will not make Cross Origin requests', function() {
				var model = new Augmented.Model();
				model.crossOrigin = false;
				expect(model.crossOrigin).toBeFalsy();
			});

			it('with Cross Origin Support will make Cross Origin requests', function() {
				var model = new Augmented.Model();
				model.crossOrigin = true;
				expect(model.crossOrigin).toBeTruthy();
			});

		});

		describe('Given an Augmented Collection', function() {
			it('has an augmented Collection', function() {
				expect(Augmented.Collection).toBeDefined();
			});
		});

		describe('Given an Augmented View', function() {
			var view = new Augmented.View();

			it('has an augmented View', function() {
				expect(Augmented.View).toBeDefined();
			});
			it('can set a name property', function() {
				view.setName("test");
				expect(view.getName()).toEqual("test");
			});
			it('can set security', function() {
				view.setSecurity(['admin']);
				expect(view.getSecurity()).not.toEqual([]);
			});
			it('can match a security item', function() {
				view.setSecurity(['admin', 'bubba']);
				expect(view.matchesSecurityItem('bubba')).toBeTruthy();
			});
			it('contains a overridable canDisplay', function() {
				expect(view.canDisplay()).toBeTruthy();
			});

		});
	});
});
