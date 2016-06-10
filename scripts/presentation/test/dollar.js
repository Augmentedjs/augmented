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

        it('can select a specific header element', function() {
            var h1 = Augmented.$("html body article section#header header h1");
			expect(h1).toBeDefined();
            expect(h1 instanceof Node).toBeTruthy();
            expect(h1.innerText).toEqual("Augmented.js Test Suite");
		});

	});
});
