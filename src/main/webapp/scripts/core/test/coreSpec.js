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
	});
});