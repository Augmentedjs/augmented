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
            q = null;
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
            q = null;
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

			expect(Object.keys(q.getQueue()).length).toBeGreaterThan(0);
            q = null;
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
            q = null;
		});

        it('can add a few functions to the queue then run them in sync', function() {
			var q = new Augmented.Utility.AsynchronousQueue(500);
			q.add(
				function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("1: " + count()); },
				function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("2: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("3: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("4: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("5: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("6: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("7: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("8: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("9: " + count()); },
                function() { var count = function() { var x = 0; for(var i=0;i<10000;i++){ x++; } return x;}; console.info("10: " + count()); }
			);
            var s = q.process();

            expect(s).toBeTruthy();
            q = null;
		});
	});
});
