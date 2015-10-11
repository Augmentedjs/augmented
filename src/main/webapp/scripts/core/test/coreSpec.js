define([
	'augmented',
    'jasmineajax'
], function(
	Augmented
) {
	describe('Given Augmented', function() {
		it('is defined', function() {
			expect(Augmented).toBeDefined();
		});

		it('has a version defined', function() {
			expect(Augmented.VERSION).toBeDefined();
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
		describe('Given Augmented Array', function() {
			it('can check if a string is included', function() {
				var arr = ['x','y','z'];
				expect(arr.includes('z')).toBeTruthy();
			});
			it('can check if a number is included', function() {
				var arr = [1,2,3];
				expect(arr.includes(2)).toBeTruthy();
			});
            it('can check if a number is not included', function() {
				var arr = [1,2,3];
				expect(arr.includes(5)).toBeFalsy();
			});
			it('can check if it has a string', function() {
				var arr = ['x','y','z'];
				expect(arr.has('z')).toBeTruthy();
			});
			it('can check if it has a number', function() {
				var arr = [1,2,3];
				expect(arr.has(2)).toBeTruthy();
			});
            it('can check if it does not have a number', function() {
				var arr = [1,2,3];
				expect(arr.has(5)).toBeFalsy();
			});
		});

	});
});
