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
			var s = q.process(
				function() { console.log("one"); },
				function() { console.log("two"); },
				function() { console.log("three"); },
				function() { console.log("four"); },
				function() { console.log("five"); }
			);
			expect(s).toBeTruthy();
		});
	});
});
