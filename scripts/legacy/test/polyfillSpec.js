define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Basic ES5.1 or ES6', function() {

        describe('Given an Array Utility', function() {
          var arr = [ 'x', 'y', 'z'];
          it('can check if an Array has an item', function() {
            var au = new Augmented.Utility.Array(arr);
            expect(au.has('z')).toBeTruthy();
          });
        });

		describe('supports by native or polyfill', function() {

            it('supports String.repeat', function() {
				expect(String.prototype.repeat).toBeDefined();
			});
			it('supports Object.keys', function() {
				expect(Object.keys).toBeDefined();
			});

			it('supports Object.create', function() {
				expect(Object.create).toBeDefined();
			});

			it('supports Array.isArray', function() {
				expect(Array.isArray).toBeDefined();
			});

			it('supports Array.indexOf', function() {
				expect(Array.prototype.indexOf).toBeDefined();
			});

			it('supports Object.isFrozen', function() {
				expect(Object.isFrozen).toBeDefined();
			});

			it('supports String.split', function() {
				expect(String.prototype.split).toBeDefined();
			});

			it('supports Array.includes', function() {
				expect(Array.prototype.includes).toBeDefined();
			});
		});
	});
});
