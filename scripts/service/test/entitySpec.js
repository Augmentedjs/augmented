define(["augmented", "augmentedService", "jasmineajax"], function(Augmented) {
    describe("Given an Augmented Service Entity", function() {
        it("is defined", function() {
            expect(Augmented.Service.Entity).toBeDefined();
        });

        var e;
        beforeEach(function() {
            e = new Augmented.Service.Entity();
        });
        afterEach(function() {
            e = null;
        });

        it("can check if empty", function() {
            expect(e.isEmpty()).toBeTruthy();
        });


    });
});
