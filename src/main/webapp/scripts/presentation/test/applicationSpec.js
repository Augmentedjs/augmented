define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation Application', function() {

		describe('Given an Application', function() {
			var app = null;
			beforeEach(function() {
				app = new Augmented.Presentation.Application("Random-" + Math.random());
			});
			afterEach(function() {
				app = null;
			});

			it('has a random name', function() {
				expect(app.getName()).not.toEqual("untitled");
			});

			it('has a Mediator Registry', function() {
				expect(app.Mediators instanceof Array).toBeTruthy();
			});

			it('can register a Mediator View', function() {
				var view = new Augmented.Presentation.Mediator();
				app.registerMediator(view);
				expect(app.getMediators().length > 0).toBeTruthy();
                view.remove();
                view = null;
			});

			it('can register an extended Mediator View', function() {
				var view = Augmented.Presentation.Mediator.extend({ });
				app.registerMediator(view);
				expect(app.getMediators().length > 0).toBeTruthy();
                view = null;
			});

			it('can return a few registered Mediator Views', function() {
				console.log("mediators: " + JSON.stringify(app.getMediators()));
				var view1 = new Augmented.Presentation.Mediator();
				var view2 = new Augmented.Presentation.Mediator();
				var view3 = new Augmented.Presentation.Mediator();

				app.registerMediator(view1);
				app.registerMediator(view2);
				app.registerMediator(view3);

				expect(app.getMediators().length === 3).toBeTruthy();
                view1.remove();
                view1 = null;
                view2.remove();
                view2 = null;
                view3.remove();
                view3 = null;
			});

			it('has a Stylesheet Registry', function() {
				expect(app.Stylesheets instanceof Array).toBeTruthy();
			});

			it('can register a Stylesheet', function() {
				app.registerStylesheet("x");
				expect(app.Stylesheets.length > 0).toBeTruthy();
			});

			it('to be able to add metadata "name"', function() {
    		    app.setMetadataItem("name", "test");
    			expect(app.getMetadataItem("name")).toEqual("test");
    		});

			it('can add a breadcrumb', function() {
    		    app.setCurrentBreadcrumb("www.augmentedjs.org", "main");
    			expect(app.getCurrentBreadcrumb()).toBeDefined();
    		});

			it('stores only 2 breadcrumbs', function() {
    		    app.setCurrentBreadcrumb("www.augmentedjs.org", "main");
				app.setCurrentBreadcrumb("www.augmentedjs1.org", "main2");
				app.setCurrentBreadcrumb("www.augmentedjs2.org", "main3");
    			expect(app.getBreadcrumbs().length).toEqual(2);
    		});

			it('can get the breadcrumbs', function() {
    		    app.setCurrentBreadcrumb("www.augmentedjs.org", "main");
				app.setCurrentBreadcrumb("www.augmentedjs1.org", "main2");
				app.setCurrentBreadcrumb("www.augmentedjs2.org", "main3");
    			expect(app.getBreadcrumbs()).toBeDefined();
    		});

			it('can start', function() {
    		    app.start();
    			expect(app.started).toBeTruthy();
    		});
		});
	});
});
