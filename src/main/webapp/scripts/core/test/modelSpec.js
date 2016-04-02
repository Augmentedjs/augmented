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

        it('with mock can return something', function() {
            var model = new Augmented.Model();
            model.mock = true;
            model.url = "/info";
            expect(model.fetch()).toBeDefined();
        });

        it('can reset with data', function() {
            var model = new Augmented.Model();
            model.set({ "y": "y" });
            model.reset({ "x": "x" });

            expect(model.get("x")).toEqual("x");
            expect(model.get("y")).not.toBeDefined();
        });

        it('can set with data', function() {
            var model = new Augmented.Model();
            model.set({ "x": "x" });
            expect(model.get("x")).toEqual("x");
        });
    });
});
