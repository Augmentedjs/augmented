define([
	'augmented',
    'jasmineajax'
], function(
	Augmented
) {
	describe('Given Augmented', function() {
		it('is defined', function() {
			expect(Augmented).toBeDefined();
		});

		it('has a version defined', function() {
			expect(Augmented.VERSION).toBeDefined();
		});

		it('supports noConflict', function() {
			expect(typeof Augmented.noConflict === 'function').toBeTruthy();
		});

		describe('Given an Augmented Object', function() {
			it('is defined', function() {
				expect(Augmented.Object).toBeDefined();
			});

			it('can be created with options', function() {
				var object = new Augmented.Object({stuff: "stuff"});

				expect(object.options.stuff).toEqual("stuff");
			});

			it('can be extended', function() {
				var exObject = Augmented.Object.extend({stuff: "stuff"});
				var object = new exObject();
				expect(object.stuff).toEqual("stuff");
			});
		});

		describe('Given Augmented.isFunction', function() {
			it('is defined', function() {
				expect(Augmented.isFunction).toBeDefined();
			});

			it('returns true for a function call', function() {
				var t = function() {};
				expect(Augmented.isFunction(t)).toBeTruthy();
			});

			it('returns false for a string value', function() {
				var t = "x";
				expect(Augmented.isFunction(t)).toBeFalsy();
			});

			it('returns false for a property call', function() {
				var t = { stuff: "stuff"};
				expect(Augmented.isFunction(t.stuff)).toBeFalsy();
			});

			it('returns false for an Array', function() {
				var t = [];
				expect(Augmented.isFunction(t)).toBeFalsy();
			});

			it('returns false for an Object', function() {
				var t = {};
				expect(Augmented.isFunction(t)).toBeFalsy();
			});

			it('returns false for an Augmented.Object', function() {
				var t = new Augmented.Object();
				expect(Augmented.isFunction(t)).toBeFalsy();
			});
		});

		describe('Given Augmented.result', function() {
			it('is defined', function() {
				expect(Augmented.result).toBeDefined();
			});

			it('returns the function call', function() {
				var t = { test: function() { return true; } };
				expect(Augmented.result(t, "test")).toBeTruthy();
			});

			it('returns the property', function() {
				var t = { test: true };
				expect(Augmented.result(t, "test")).toBeTruthy();
			});

		});
		describe('Given Augmented Array', function() {
			it('can check if a string is included', function() {
				var arr = ['x','y','z'];
				expect(arr.includes('z')).toBeTruthy();
			});
			it('can check if a number is included', function() {
				var arr = [1,2,3];
				expect(arr.includes(2)).toBeTruthy();
			});
			it('can check if it has a string', function() {
				var arr = ['x','y','z'];
				expect(arr.has('z')).toBeTruthy();
			});
			it('can check if it has a number', function() {
				var arr = [1,2,3];
				expect(arr.has(2)).toBeTruthy();
			});
		});
		// test base function calls, isFunction, result

		describe('Given an Augmented Model', function() {
			it('is defined', function() {
				expect(Augmented.Model).toBeDefined();
			});

			it('without Cross Origin Support will not make Cross Origin requests', function() {
				var model = new Augmented.Model();
				model.crossOrigin = false;
				expect(model.crossOrigin).toBeFalsy();
			});

			it('with Cross Origin Support will make Cross Origin requests', function() {
				var model = new Augmented.Model();
				model.crossOrigin = true;
				expect(model.crossOrigin).toBeTruthy();
			});

		});

		describe('Given an Augmented Collection', function() {
			it('has an augmented Collection', function() {
				expect(Augmented.Collection).toBeDefined();
			});
		});

        describe('Given an Augmented Collection needing pagination', function() {
            describe('Given an Augmented PaginationFactory', function() {
                var c;
                beforeEach(function() {

                });
                afterEach(function() {
                    c = null;
                });
    			it('has an augmented PaginationFactory', function() {
    				expect(Augmented.PaginationFactory).toBeDefined();
    			});

                it('can get a "github" API PaginatedCollection', function() {
                    c = Augmented.PaginationFactory.getPaginatedCollection(
                        Augmented.PaginationFactory.type.github);
                    expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
                    expect(c.paginationConfiguration.currentPageParam).toEqual('page');
    			});

                it('can get a "solr" API PaginatedCollection', function() {
                    c = Augmented.PaginationFactory.getPaginatedCollection(
                        Augmented.PaginationFactory.type.solr);
                    expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
                    expect(c.paginationConfiguration.currentPageParam).toEqual('start');
    			});

                it('can get a "database" API PaginatedCollection', function() {
                    c = Augmented.PaginationFactory.getPaginatedCollection(
                        Augmented.PaginationFactory.type.database);
                    expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
                    expect(c.paginationConfiguration.currentPageParam).toEqual('offset');
    			});

                it('will not get a "nothing" API PaginatedCollection', function() {
                    c = Augmented.PaginationFactory.getPaginatedCollection(
                        "nothing");
                    expect(c instanceof Augmented.PaginatedCollection).toBeFalsy();
    			});
            });

            describe('Given an Augmented Collection', function() {
                var c = new Augmented.PaginatedCollection();
                var defConfig = {
                    currentPageParam: "p",
                    pageSizeParam: "pp"
                };

                it('has an augmented PaginatedCollection', function() {
    				expect(Augmented.PaginatedCollection).toBeDefined();
    			});

                it('can create an augmented PaginatedCollection', function() {
    				expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
    			});

                it('has a configuration object', function() {
    				expect(c.paginationConfiguration).not.toEqual({});
    			});

                it('can set a configuration object', function() {
                    c.setPaginationConfiguration(defConfig);
    				expect(c.paginationConfiguration).toEqual(defConfig);
    			});

                it('can fetch', function() {
                    jasmine.Ajax.install();
                    jasmine.Ajax.stubRequest('/some/url').andReturn({
                        "status": 200,
                        "contentType": 'text/plain',
                        "responseJSON": ['Hello from the world']
                    });
                    c.url = "/some/url";
                    c.fetch();

                    jasmine.Ajax.uninstall();
                    expect(c).toBeDefined();
                });

    		});
        });
		describe('Given an Augmented View', function() {
			var view = new Augmented.View();

			it('has an augmented View', function() {
				expect(Augmented.View).toBeDefined();
			});
			it('can set a name property', function() {
				view.setName("test");
				expect(view.getName()).toEqual("test");
			});
			it('can set permissions', function() {
				view.addPermission('admin');
				expect(view.getPermissions().include).not.toEqual([]);
			});
			it('can match a permission', function() {
				view.setPermissions(['admin', 'bubba']);
				expect(view.matchesPermission('bubba')).toBeTruthy();
			});
			it('does not match a negative permission', function() {
				view.setPermissions(['admin', 'bubba']);
				expect(view.matchesPermission('bubba', true)).toBeFalsy();
			});
			it('contains a overridable canDisplay', function() {
				expect(view.canDisplay()).toBeTruthy();
			});

		});
	});
});
