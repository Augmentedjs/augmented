define([
	'augmented',
    'jasmineajax'
], function(
	Augmented
) {

    describe('Given an Augmented View', function() {
        var view = null;
        var fired  = false;

        beforeEach(function() {
            fired = false;
            view = new Augmented.View();
        });

        afterEach(function() {
            fired  = false;
            view = null;
        });

        it('has an augmented View', function() {
            expect(Augmented.View).toBeDefined();
        });
        it('can set a name property', function() {
            view.setName("test");
            expect(view.getName()).toEqual("test");
        });
        it('can set permissions', function() {
            view.addPermission('admin');
            expect(view.getPermissions().include).not.toEqual([]);
        });
        it('can match a permission', function() {
            view.setPermissions(['admin', 'bubba']);
            expect(view.matchesPermission('bubba')).toBeTruthy();
        });
        it('does not match a negative permission', function() {
            view.setPermissions(['admin', 'bubba']);
            expect(view.matchesPermission('bubba', true)).toBeFalsy();
        });
        it('contains a overridable canDisplay', function() {
            expect(view.canDisplay()).toBeTruthy();
        });

        it('supports beforeRender when attempting a render', function() {
            view.beforeRender = function() { fired = true; };
            view.render();
            expect(fired).toBeTruthy();
        });

        it('supports afterRender when attempting a render', function() {
            view.afterRender = function() { fired = true; };
            view.render();
            expect(fired).toBeTruthy();
        });

    });
});