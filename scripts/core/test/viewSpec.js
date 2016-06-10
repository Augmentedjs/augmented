define([
	'augmented',
    'jasmineajax'
], function(
	Augmented
) {

    describe('Given an Augmented View', function() {
        describe('creating a standard instance of Augmented View', function() {
            var view = null;
            var fired  = false;

            beforeEach(function() {
                fired = false;
                view = new Augmented.View();
            });

            afterEach(function() {
                fired  = false;
                view.remove();
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

            it('supports correct \'this\' when overriding a render', function() {
                view.monkey = "monkey";
                view.render = function() {
                    fired = ((this !== window) && (this.monkey === "monkey"));
                };
                view.render();
                expect(fired).toBeTruthy();
            });
        });
        describe('extending my own instance of Augmented View', function() {
            var baseView = Augmented.View.extend({
                monkey: "monkey"
            });
            var view = null;
            var fired  = false;

            beforeEach(function() {
                fired = false;
                view = new baseView();
            });

            afterEach(function() {
                fired  = false;
                view.remove();
                view = null;
            });

            it('has an baseView that extends Augmented.View', function() {
                expect(baseView).toBeDefined();
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

            // defect fixs
            it('supports correct \'this\' when overriding a render', function() {
                view.render = function() {
                    fired = ((this !== window) && (this.monkey === "monkey"));
                };
                view.render();
                expect(fired).toBeTruthy();
            });

            it('supports beforeRender, render, then afterRender when attempting a render', function() {
                var r = 0;
                view.beforeRender = function() { r++; };
                view.render = function() {
                    r++;
                    fired = true;
                };
                view.afterRender = function() { r++; };
                view.initialize();
                view.render();
                expect(r).toEqual(3);
                expect(fired).toBeTruthy();
            });

            it('calls render only once', function() {
                var r = 0;
                view.beforeRender = function() { fired = true; };
                view.render = function() {
                    r++;
                    console.debug("render");
                };
                view.initialize();
                view.render();
                expect(r).toEqual(1);
                expect(fired).toBeTruthy();
            });
        });
    });
});
