define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented AJAX', function() {
		it('is defined', function() {
			expect(Augmented.ajax).toBeDefined();
		});

        describe('can fetch', function() {
    		var uri = window.location.protocol + "//" + window.location.host + window.location.pathname;
    		var success = null;

    		beforeEach(function(done) {
    			Augmented.ajax({
    				url: uri,
    				contentType: 'text/plain',
    				dataType: 'text',
    				async: true,
                    headers: { "custom": "something" },
    				success: function (data, status) { success = true; done(); },
    				failure: function (data, status) { success = false; done(); }
    			});
    		});

    		it('can fetch a file via simple ajax', function() {
    		    expect(success).toBeTruthy();
    		});
        });
        describe('can mock a fetch', function() {
    		var uri = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
    		var success = null;

    		beforeEach(function(done) {
    			Augmented.ajax({
    				url: uri,
    				contentType: 'text/plain',
    				dataType: 'text',
    				async: true,
                    mock: true,
                    headers: { "custom": "something" },
    				success: function (data, status) { success = true; done(); },
    				failure: function (data, status) { success = false; done(); }
    			});
    		});

    		it('can fetch a file via simple ajax', function() {
    		    expect(success).toBeTruthy();
    		});
        });
	});
});
