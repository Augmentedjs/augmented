define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented Router', function() {
		it('is defined', function() {
			expect(Augmented.Router).toBeDefined();
		});

        var MyRouter = Augmented.Router.extend({
            routes: {
                "test": "test"
            },

            test: function() {
                return true;
            },
        });
        var router = null;

        beforeEach(function() {
            router = new MyRouter();
        });

        afterEach(function() {
            router = null;
        });

        /*
        loadView
        */
        describe('Given an instance of router', function() {
            it('is defined', function() {
    			expect(router).toBeDefined();
    		});

            it('is a router', function() {
    			expect(router instanceof Augmented.Router).toBeTruthy();
    		});

            it('can "navigate" to a route', function() {
    			expect(router.navigate("test")).toBeTruthy();
    		});

            describe('Given a test view', function() {
                var TestView = Augmented.View.extend({
                    render: function() {
                        return true;
                    }
                }), view;
                beforeEach(function() {
                    view = new TestView();
                });

                afterEach(function() {
                    view.remove();
                    view = null;
                });

                it('can load a view', function() {
                    router.loadView(view);
                    expect(router._view).toBeDefined();
                    router._view = null;
                });

                it('can cleanup a view', function() {
                    router._view = view;
                    expect(router._view).toBeDefined();
                    router.cleanup();
                    expect(router._view).toBeNull();
                });
            });
        });
	});
});
