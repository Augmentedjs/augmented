define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation Mediator', function() {

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
                    c.remove();
                    m.remove();
					m = null;
					c = null;
				});

				it('can create an instance that is a mediator', function() {
					expect(m instanceof Augmented.Presentation.Mediator).toBeTruthy();
				});

				it('can create an instance that is a colleague', function() {
					expect(c instanceof Augmented.Presentation.Colleague).toBeTruthy();
				});

				it('the mediator can observe a colleague', function() {
					m.observeColleague(c, function() { return "EEAK!";});

					var channels = m.getDefaultChannel();

					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
                    m.dismissColleague(c, function() { return "EEAK!";});
				});

				it('the mediator can subscribe a colleague in the channel "monkey"', function() {
					m.observeColleague(c, function() { return "EEAK!";}, "monkey");

					var channels = m.getChannel("monkey");

					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
                    m.dismissColleague(c, function() { return "EEAK!";}, "monkey");
				});

				it('the mediator can add subscriptions to the channel "monkey"', function() {
					m.observeColleague(c, function() { return "EEAK!";}, "monkey");

					m.setSubscriptions({
                		fn: function() {},
                		context: this,
                		once: false,
                        identifier: "i"
            	    });

					expect(m.getSubscriptions()).toBeDefined();
                    m.dismissColleague(c, function() { return "EEAK!";}, "monkey");
				});

                it('the mediator can dismiss colleagues from channel "monkey"', function() {
                    m.observeColleague(c, function() { return "EEAK!";}, "monkey");
                    m.dismissColleague(c, function() { return "EEAK!";}, "monkey");
					var channels = m.getChannel("monkey");

					expect(channels).toEqual([]);
				});

                it('the mediator can observe a colleague once and not leak', function() {
					m.observeColleague(c, function() { return "EEAK!";}, "monkey");
                    var m2 = new Augmented.Presentation.Mediator();
                    m2.observeColleague(c, function() { return "EEAK!";}, "monkey");
					var channels = m2.getChannel("monkey"), c2 = m.getChannel("monkey");

					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
				});

                it('Colleague will not fail to send a message if the mediator is not available', function() {
                    var ee = null;
                    try {
                        c.sendMessage("YouMustNotFail", "fail");
                    } catch(e) {
                        ee = e;
                    }
					expect(ee).toEqual(null);
				});

                it('the mediator can observe a colleague with the same message name as cvhannel and not fail', function() {
                    c.on("monkey", function(d) { this.eeak = d; });
                    m.observeColleagueAndTrigger(c, "monkey", "monkey");
                    m.publish("monkey", "monkey", "EEAK!");
                    m.dismissColleagueTrigger(c, "monkey", "monkey");
					expect(c.eeak).toEqual("EEAK!");
				});
			});
		});
	});
});
