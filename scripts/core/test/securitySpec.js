define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Augmented Security', function() {
		it('is defined', function() {
			expect(Augmented.Security).toBeDefined();
		});

		describe('Given Augmented Security Factory', function() {
			var client = null;

			afterEach(function() {
				client = null;
			});

			it('is defined', function() {
				expect(Augmented.Security.AuthenticationFactory).toBeDefined();
			});

			it('can return an OAUTH2 Client', function() {
				client = Augmented.Security.AuthenticationFactory.getSecurityClient(Augmented.Security.ClientType.OAUTH2);
				expect(client.type).toEqual(Augmented.Security.ClientType.OAUTH2);
			});

			it('can return an ACL Client', function() {
				client = Augmented.Security.AuthenticationFactory.getSecurityClient(Augmented.Security.ClientType.ACL);
				expect(client.type).toEqual(Augmented.Security.ClientType.ACL);
			});

			it('does not return a Fake Client', function() {
				client = Augmented.Security.AuthenticationFactory.getSecurityClient("fake");
				expect(client).toEqual(null);
			});
		});
	});
});
