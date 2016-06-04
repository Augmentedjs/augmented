define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation $', function() {
		it('is defined', function() {
			expect(Augmented.$).toBeDefined();
		});

        it('can select an element', function() {
            var body = Augmented.$("body");
			expect(body).toBeDefined();
            expect(body.tagName.toLowerCase()).toEqual("body");
		});

        it('can select multiple elements', function() {
            var divs = Augmented.$("div");
			expect(divs).toBeDefined();
            expect(divs instanceof NodeList).toBeTruthy();
		});

	});
});
