define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented AsynchronousQueue', function() {
		it('is defined', function() {
			expect(Augmented.Utility.AsynchronousQueue).toBeDefined();
		});

		it('can define a queue with a timeout', function() {
			var q = new Augmented.Utility.AsynchronousQueue(1000);
			expect(q.getTimeout()).toEqual(1000);
		});

		it('can queue a few functions', function() {
			var q = new Augmented.Utility.AsynchronousQueue(500);
            var count = 0;

			var s = q.process(
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; }
			);
            expect(s).toBeTruthy();
		});

        it('can add a few functions to the queue', function() {
			var q = new Augmented.Utility.AsynchronousQueue(500);
            var count = 0;

			q.add(
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; }
			);
			expect(Object.keys(q.getQueue()).length).toEqual(5);
		});

        it('can add a few functions to the queue then run them', function() {
			var q = new Augmented.Utility.AsynchronousQueue(500);
            var count = 0;

			q.add(
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; },
				function(count) { count++; }
			);
            var s = q.process();

            expect(s).toBeTruthy();
		});
	});
});
