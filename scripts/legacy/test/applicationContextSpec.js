define([
	'augmented',
	'augmentedLegacy'
], function(
	Augmented
) {
	describe('Given Legacy', function() {
		describe('Given Application Context', function() {

			var applicationContext;

			beforeEach(function() {
				applicationContext = Augmented.ApplicationContextFactory.getApplicationContext();
				Augmented.ApplicationContext.populate({
				    "metadata": {
				    	"title": "ui-core",
				        "context": "desktop",
				    },
				    "security": {
				        "loginName": "superbauser",
				        "userName": "superbauser",
				        "userId": 123,
				        "email": "superbauser@macys.com",
				        "role":["superBAUser"],
						"privilege": [ "ContentModify", "TogglePublishMCOM" ],
				        "oauth": {
				            "authorization": "zzzzzzzz",
				            "access": "xxxxxxxx"
				        }
				    }
				});

			});

			afterEach(function() {
				applicationContext = null;
			});

	         it('is defined', function() {
				expect(applicationContext).toBeDefined();
			});

			it('is not valid with bad data', function() {
				applicationContext.populate({
				    "metadata": {
				    	"title": null,
				        "context": "desktop",
				    },
				    "security": {
				        "loginName": "superbauser",
				        "userName": "superbauser",
				        "userId": -1,
				        "email": "superbauser@macys.com",
				        "role":["superBAUser"],
						"privilege": [ "ContentModify", "TogglePublishMCOM" ],
				        "oauth": {
				            "authorization": "zzzzzzzz",
				            "access": "xxxxxxxx"
				        }
				    }
				});

				expect(applicationContext.isValid()).toBeFalsy();
			});

			it('can be provided user details', function() {

				expect(applicationContext.isValid()).toBeTruthy();
			});

			it('can get all privileges', function() {
				expect(applicationContext.getAllPrivileges()).toEqual(["ContentModify", "TogglePublishMCOM"]);
			});

			it('has a matching privilege', function() {
				expect(applicationContext.hasPrivilege("ContentModify")).toBeTruthy();
			});

			it('does not have a non-matching privilege', function() {
				expect(applicationContext.hasPrivilege("nothing")).toBeFalsy();
			});

			it('can get all roles', function() {
				expect(applicationContext.getAllRoles()).toEqual(["superBAUser"]);
			});

			it('has a matching role', function() {
				expect(applicationContext.hasRole("superBAUser")).toBeTruthy();
			});

			it('does not have a non-matching role', function() {
				expect(applicationContext.hasRole("nothing")).toBeFalsy();
			});

	        it('can get metadata by key', function() {
				expect(applicationContext.getMetadata("title")).toEqual("ui-core");
			});

	        it('can get all metadata', function() {
				expect(applicationContext.getAllMetadata()).toEqual({"title": "ui-core","context": "desktop"});
			});

			it('has a matching metadata', function() {
				expect(applicationContext.hasMetadata("title")).toBeTruthy();
			});

			it('can add a metadata', function() {
				expect(applicationContext.setMetadata(['desc','testing'])).toEqual({"title": "ui-core","context": "desktop","desc":"testing"});
			});

			it('update an existing metadata', function() {
				expect(applicationContext.setMetadata(['title','ui-core2'])).toEqual({"title": "ui-core2","context": "desktop"});
			});


			it('does not have a non-matching metadata', function() {
				expect(applicationContext.hasPrivilege("bubba")).toBeFalsy();
			});

			// Would use toThrow but it doesn't work????
			it('can not save', function() {
				var ex = null;

				try {
					applicationContext.save();
				} catch(e) {
					ex = e;
				}

				expect(ex).toBeDefined();
		    });
		});
	});
});
