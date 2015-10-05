define([
	'augmented'
], function(
	Augmented
) {
	describe('Given a logger factory', function() {
		it('is defined', function() {
			expect(Augmented.Logger.LoggerFactory).toBeDefined();
		});

		describe('Given a console logger', function() {
			var logger = null;
			beforeEach(function() {
				logger = Augmented.Logger.LoggerFactory.getLogger("console", Augmented.Logger.Level.debug);
			});

			afterEach(function() {
				logger = null;
			});

			it('can request a console logger', function() {
				expect(logger).toBeDefined();
			});

			it('can log info', function() {
				logger.info("xx");
				expect(logger).toBeDefined();
			});

			it('can log debug', function() {
				logger.debug("xx");
				expect(logger).toBeDefined();
			});

			it('can log warn', function() {
				logger.warn("xx");
				expect(logger).toBeDefined();
			});
		});
	});
});
