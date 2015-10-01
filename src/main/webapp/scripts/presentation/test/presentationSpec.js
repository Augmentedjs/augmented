define([
	'augmentedPresentation'
], function(
	presentation
) {
	describe('Given Augmented Presentation', function() {
		it('is defined', function() {
			expect(Augmented.Presentation).toBeDefined();
		});

		it('has a version defined', function() {
			expect(Augmented.Presentation.VERSION).toBeDefined();
		});

		describe('Given a Mediation of Views', function() {
			it('Augmented.Presentation.Mediator is defined', function() {
				expect(Augmented.Presentation.Mediator).toBeDefined();
			});

			it('Augmented.Presentation.Colleague is defined', function() {
				expect(Augmented.Presentation.Colleague).toBeDefined();
			});

			describe('Given a Mediator Views and Colleague View', function() {
				var m, c;

				beforeEach(function() {
					m = new Augmented.Presentation.Mediator();
					c = new Augmented.Presentation.Colleague();
					c.setName("monkey");
				});

				afterEach(function() {
					m = null;
					c = null;
				});

				it('can create an instance that is a mediator', function() {
					expect(m instanceof Augmented.Presentation.Mediator).toBeTruthy();
				});

				it('can create an instance that is a colleague', function() {
					expect(c instanceof Augmented.Presentation.Colleague).toBeTruthy();
				});

				it('the mediator can subscribe a colleague', function() {
					m.observeColleague(c, function() { return "EEAK!";});

					var channels = m.getDefaultChannel();

					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
				});

				it('the mediator can subscribe a colleague in the channel "monkey"', function() {
					m.observeColleague(c, function() { return "EEAK!";}, "monkey");

					var channels = m.getChannel("monkey");

					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
				});

				xit('the mediator can add subscriptions to the channel "monkey"', function() {
					m.observeColleague(c, function() { return "EEAK!";}, "monkey");

					var channels = m.getChannel("monkey");

					var sub = m.getChannel("monkey");

					m.setSubscriptions(sub);

					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
				});
			});
		});

		describe('Given an Application', function() {
			var app = null;
			beforeEach(function() {
				app = new Augmented.Presentation.Application("Random-" + Math.random());
			});
			afterEach(function() {
				app = null;
			});

			it('has a ramdom name', function() {
				expect(app.getName()).not.toEqual("untitled");
			});

			it('has a Mediator Registry', function() {
				expect(app.Mediators instanceof Array).toBeTruthy();
			});

			it('can register a Mediator View', function() {
				var view = new Augmented.Presentation.Mediator();
				app.registerMediator(view);
				expect(app.getMediators().length > 0).toBeTruthy();
			});

			it('can register an extended Mediator View', function() {
				var view = Augmented.Presentation.Mediator.extend({ });
				app.registerMediator(view);
				expect(app.getMediators().length > 0).toBeTruthy();
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
    		    app.setCurrentBreadcrumb("www.augmentedjs.org");
    			expect(app.getCurrentBreadcrumb()).toBeDefined();
    		});

			it('stores only 2 breadcrumbs', function() {
    		    app.setCurrentBreadcrumb("www.augmentedjs.org");
				app.setCurrentBreadcrumb("www.augmentedjs1.org");
				app.setCurrentBreadcrumb("www.augmentedjs2.org");
    			expect(app.getBreadcrumbs().length).toEqual(2);
    		});

			it('can get the breadcrumbs', function() {
    		    app.setCurrentBreadcrumb("www.augmentedjs.org");
				app.setCurrentBreadcrumb("www.augmentedjs1.org");
				app.setCurrentBreadcrumb("www.augmentedjs2.org");
    			expect(app.getBreadcrumbs()).toBeDefined();
    		});

		});
	});
});
