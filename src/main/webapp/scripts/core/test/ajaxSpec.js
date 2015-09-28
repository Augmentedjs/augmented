define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented AJAX', function() {
		it('is defined', function() {
			expect(Augmented.ajax).toBeDefined();
		});

		var uri = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
		var success = null;
		var ajaxObject = {
			url: uri,
			contentType: 'text/plain',
			dataType: 'text',
			async: true,
			success: function (data, status) { success = true; done(); },
			failure: function (data, status) { success = false; done(); }
		};

		beforeEach(function(done) {
			Augmented.ajax(ajaxObject);
		});

		it('can fetch a file via simple ajax', function() {
		    expect(success).toBeTruthy();
		});
	});
});
