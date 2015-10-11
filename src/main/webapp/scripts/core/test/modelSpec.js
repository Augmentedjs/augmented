define([
	'augmented',
    'jasmineajax'
], function(
	Augmented
) {
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
});
