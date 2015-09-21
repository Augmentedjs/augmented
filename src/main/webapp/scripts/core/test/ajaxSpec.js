define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented AJAX', function() {
		it('is defined', function() {
			expect(Augmented.ajax).toBeDefined();
		});

		var uri;
		var success = null;

		beforeEach(function(done) {
			uri = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;

			Augmented.ajax({
				url: uri, 
				contentType: 'text/plain',
				dataType: 'text',
				async: true,
				success: function (data, status) { success = true; done(); },
			    	failure: function (data, status) { success = false; done(); }
			    });
		});
		it('can fetch a file via simple ajax', function() {
		    expect(success).toBeTruthy();
		});
	});
});
