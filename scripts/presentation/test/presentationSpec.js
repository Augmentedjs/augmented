define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation', function() {
		it('is defined', function() {
			expect(Augmented.Presentation).toBeDefined();
		});

		it('has a version defined', function() {
			expect(Augmented.Presentation.VERSION).toBeDefined();
		});
	});
});
