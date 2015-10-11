define([
	'augmented',
    'jasmineajax'
], function(
	Augmented
) {
    
    describe('Given an Augmented View', function() {
        var view = new Augmented.View();

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
    });
});
