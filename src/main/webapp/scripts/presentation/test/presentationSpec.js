define([
	'augmentedPresentation'
], function(
	presentation
) {
	describe('Given Augmented.Presentation', function() {
		it('is defined', function() {
			expect(Augmented.Presentation).toBeDefined();
		});
		
		it('has a version defined', function() {
			expect(Augmented.Presentation.VERSION).not.toEqual('1.0.0');
		});
	});
});