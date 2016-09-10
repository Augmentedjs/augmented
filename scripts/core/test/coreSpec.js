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

        describe('Given an Augmented exec', function() {
            var object = {stuff: function() { return true; } };

			it('is defined', function() {
				expect(Augmented.exec).toBeDefined();
			});

            it('can exec a function by name', function() {
				expect(Augmented.exec("stuff", object)).toBeTruthy();
			});

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
            var o = {}, p = 123, f = function() { return true; };

            it('is defined', function() {
				expect(Augmented.isFunction).toBeDefined();
			});

            it('checks if object is an function', function() {
                expect(Augmented.isFunction(o)).toBeFalsy();
            });
            it('checks if number is not an function', function() {
                expect(Augmented.isFunction(p)).toBeFalsy();
            });
            it('checks if function is not an function', function() {
                expect(Augmented.isFunction(f)).toBeTruthy();
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
			describe('Given Array.includes', function() {
				it('can check if a string is included', function() {
					var arr = ['x','y','z'];
					expect(arr.includes('z')).toBeTruthy();
				});
				it('can check if a number is included', function() {
					var arr = [1,2,3];
					expect(arr.includes(2)).toBeTruthy();
				});
	            it('can check if a number is not included', function() {
					var arr = [1,2,3];
					expect(arr.includes(5)).toBeFalsy();
				});
			});
			describe('Given Array.has', function() {
				it('can check if it has a string', function() {
					var arr = ['x','y','z'];
					expect(arr.has('z')).toBeTruthy();
				});
				it('can check if it has a number', function() {
					var arr = [1,2,3];
					expect(arr.has(2)).toBeTruthy();
				});
	            it('can check if it does not have a number', function() {
					var arr = [1,2,3];
					expect(arr.has(5)).toBeFalsy();
				});
			});
			describe('Given Array.find', function() {
				var a = [{ "name": "Bubba", "id": 1 }, { "name": "Bill", "id": 2 }, { "name": "MonkeyBone", "id": 3 }], r = null, p = function(aa) { return (aa.id === 2); };
				it('checks if property is in an array', function() {
					r = a.find(p);
	                expect(r).toEqual({ "name": "Bill", "id": 2 });
	            });

				it('checks if property is not in an array', function() {
					r = a.find(p);
	                expect(r).not.toEqual({ "name": "x", "id": 9 });
	            });
			});
		});

        describe('Given Augmented has', function() {
            var o;
            beforeEach(function() {
                o = { x: "", y: function() { return true; } };
            });
            afterEach(function() {
                o = null;
            });
            it('checks if an object has a key', function() {
                expect(Augmented.has(o, "x")).toBeTruthy();
            });
            it('checks if an object does not have a key', function() {
                expect(Augmented.has(o, "xx")).toBeFalsy();
            });
            it('checks if an object has a function key', function() {
                expect(Augmented.has(o, "y")).toBeTruthy();
            });
        });

        describe('Given Augmented isObject', function() {
            var o = {}, p = 123, f = function() { return true; };

            it('checks if object is an object', function() {
                expect(Augmented.isObject(o)).toBeTruthy();
            });
            it('checks if number is not an object', function() {
                expect(Augmented.isObject(p)).toBeFalsy();
            });
            it('checks if function is an object', function() {
                expect(Augmented.isObject(f)).toBeTruthy();
            });
        });

        describe('Given Augmented isString', function() {
            var o = {}, n = 123, p = "123", f = function() { return true; };

            it('checks if object is a string', function() {
                expect(Augmented.isString(o)).toBeFalsy();
            });
            it('checks if number is not a string', function() {
                expect(Augmented.isFunction(p)).toBeFalsy();
            });
            it('checks if string is a string', function() {
                expect(Augmented.isString(p)).toBeTruthy();
            });
            it('checks if function is not a string', function() {
                expect(Augmented.isString(f)).toBeFalsy();
            });
			it('checks if a string ends with a set of characters', function() {
				var file = "test.json";
				expect(file.endsWith(".json")).toBeTruthy();
			});

        });


	});
});
