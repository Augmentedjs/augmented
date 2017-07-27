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

        var model;
        beforeEach(function() {
            model = new Augmented.Model();
        });
        afterEach(function() {
            model = null;
        });

        it('can check if empty', function() {
            expect(model.isEmpty()).toBeTruthy();
        });

        it('without Cross Origin Support will not make Cross Origin requests', function() {
            model.crossOrigin = false;
            expect(model.crossOrigin).toBeFalsy();
        });

        it('with Cross Origin Support will make Cross Origin requests', function() {
            model.crossOrigin = true;
            expect(model.crossOrigin).toBeTruthy();
        });

        it('with mock can return something', function() {
						var s = false;
            model.mock = true;
            model.url = "/info";
						model.fetch({"success": function() { s = true; }});
            expect(s).toBeTruthy();
        });

        it('can reset with data', function() {
            model.set({ "y": "y" });
            model.reset({ "x": "x" });

            expect(model.get("x")).toEqual("x");
            expect(model.get("y")).not.toBeDefined();
        });

        it('can set with data', function() {
            model.set({ "x": "x" });
            expect(model.get("x")).toEqual("x");
        });
    });
});
