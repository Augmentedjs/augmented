define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation Dialog View', function() {
		it('is defined', function() {
			expect(Augmented.Presentation.DialogView).toBeDefined();
		});

        /*
        dialogView
        */

        describe('Given an instance of DialogView', function() {
            var MyDialog = Augmented.Presentation.DialogView.extend({
                name: "sample",
                el: "#sandbox"
            });
            var view = null;

            beforeEach(function() {
                view = new MyDialog();
            });

            afterEach(function() {
                view.remove();
                view = null;
            });

            it('has a view that extends DialogView', function() {
                expect(MyDialog).toBeDefined();
            });

            it('instance is an instance of DialogView', function() {
                expect(view instanceof Augmented.Presentation.DialogView).toBeTruthy();
            });

            it('dialog can open', function() {
                view.open();
                expect(view.el.childNodes.length).toBeGreaterThan(0);
            });

            it('dialog can close', function() {
                view.close();
                expect(view.el.childNodes.length).toEqual(0);
            });
        });
	});
});
