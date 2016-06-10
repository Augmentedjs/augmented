define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation View Controller', function() {
		it('is defined', function() {
			expect(Augmented.Presentation.ViewController).toBeDefined();
		});

        describe('Given a View Controller and a test view', function() {
            var TestView = Augmented.View.extend({
                render: function() {
                    return true;
                }
            }),
            MyController = Augmented.Presentation.ViewController.extend({
                initialize: function() {
                    return true;
                },
                render: function() {
                    return true;
                },
                remove: function() {
                    return true;
                }
            });

            beforeEach(function() {
                this.c = new MyController();
            });

            afterEach(function() {
                this.c.removeAllViews();
                this.c = null;
            });

            /*
            initialize
            render
            remove
            manageView
            removeAllViews
            getViews
            */

            it('can create an instance', function() {
    			expect(this.c).toBeDefined();
    		});

            it('it is a controller', function() {
    			expect(this.c instanceof Augmented.Presentation.ViewController).toBeTruthy();
    		});

            it('can initialize', function() {
    			expect(this.c.initialize()).toBeTruthy();
    		});
            it('can render', function() {
    			expect(this.c.render()).toBeTruthy();
    		});
            it('can remove', function() {
    			expect(this.c.remove()).toBeTruthy();
    		});

            it('can manage a view', function() {
                this.c.manageView(new TestView());
    			expect(this.c._views.length).toEqual(1);
    		});

            it('can remove all managed views', function() {
                this.c.manageView(new TestView());
    			expect(this.c._views.length).toEqual(1);
                this.c.removeAllViews();
    			expect(this.c._views.length).toEqual(0);
    		});

            it('can get managed views', function() {
                this.c.manageView(new TestView());
                var i = this.c.getViews();
    			expect(i.length).toEqual(1);
    		});
        });
	});
});
