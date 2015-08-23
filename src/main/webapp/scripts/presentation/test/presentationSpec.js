define([
	'augmentedPresentation'
], function(
	presentation
) {
	describe('Given Augmented.Presentation', function() {
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
					//m.subscribe("monkey", function() { return "EEAK!";}, c, true);
					m.observeColleague(c, function() { return "EEAK!";}, "monkey");
					
					var channels = m.getChannel("monkey");
					
					expect(channels).toBeDefined();
					expect(channels instanceof Array).toBeTruthy();
					expect(channels[0].context).toEqual(c);
				});
				
			});
		});
	});
});