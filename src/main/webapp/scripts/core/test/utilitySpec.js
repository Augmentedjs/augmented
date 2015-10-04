define([
        'augmented'
        ], function(
        Augmented
        ) {
	describe('Given Utilities', function() {
		it('is defined', function() {
			expect(Augmented.Utility).toBeDefined();
		});

        describe('Given an Array Utility', function() {
          var arr = [ 'x', 'y', 'z'];
          it('can check if an Array has an item', function() {
            var au = new Augmented.Utility.Array(arr);
            expect(au.has('z')).toBeTruthy();
          });
        });

		describe('Given AugmentedMap', function() {
            var map;

            beforeEach(function() {
                map = new Augmented.Utility.AugmentedMap();
            });

            afterEach(function() {
                map = null;
            });

			it('is defined', function() {
				expect(Augmented.Utility.AugmentedMap).toBeDefined();
			});

			it('can create an instance', function() {
				expect(map instanceof Augmented.Utility.AugmentedMap).toBeTruthy();
			});

			it('can add a string to the map', function() {
				map.set("name", "bubba");

				expect(map.size()).toEqual(1);
			});

			it('can get a string from the map', function() {
				map.set("name", "bubba");

				expect(map.get("name")).toEqual("bubba");
			});

			it('can get an array from the map', function() {
				map.set("names", ["bubba", "bob"]);

				expect(map.get("names").length).toEqual(2);
			});

			it('can get an map from the map', function() {
				map.set("map", new Augmented.Utility.AugmentedMap());

				var m = map.get("map");

				expect(m instanceof Augmented.Utility.AugmentedMap).toBeTruthy();
			});

			it('can get an object to the map', function() {
				map.set("object", { "x": "y" });

				expect(map.get("object")).toEqual({ "x": "y" });
			});

			it('can remove a string to the map', function() {
				map.set("name", "bubba");
				map.remove("name");
				expect(map.size()).toEqual(0);
			});

			it('has a string in the map', function() {
				map.set("name", "bubba");

				expect(map.has("name")).toBeTruthy();
			});

			it('does not have a string in the map', function() {
				map.set("name", "bubba");

				expect(map.has("x")).toBeFalsy();
			});

			it('has a string key in the map', function() {
				map.set("name", "bubba");

				expect(map.key(0)).toEqual("name");
			});

			it('has a entries in the map', function() {
                map.set("name", "Bob");
                map.set("age", 36);
                map.set("height", "6.0\"");

				expect(map.entries().length).toEqual(3);
			});

			it('has a values in the map', function() {
                map.set("name", "Bob");
                map.set("age", 36);
                map.set("height", "6.0\"");

				expect(map.values().length).toEqual(3);
			});

            it('can marshall a map via constructor', function() {
                map.set("name", "Bob");
                map.set("age", 36);
                map.set("height", "6.0\"");

                var map2 = new Augmented.Utility.AugmentedMap(map);
                expect(map.values()).toEqual(map2.values());
            });

            it('can marshall a map', function() {
                var map2 = new Augmented.Utility.AugmentedMap();
                map2.set("name", "Bob");
                map2.set("age", 36);
                map2.set("height", "6.0\"");

                var success = map.marshall(map2);
                expect(map.values()).toEqual(map2.values());
            });

            it('can marshall a JSON object value pair', function() {
                var o = {   p1: "p1",
                            p2: "p2" };

                var success = map.marshall(o);
                expect(success);
                expect(map.toJSON()).toEqual(o);
            });

            it('does not marshall a string', function() {
                var success = map.marshall("junk");
                expect(success).toBeFalsy();
            });

            it('does not marshall a number', function() {
                var success = map.marshall(50);
                expect(success).toBeFalsy();
            });

            it('does not marshall an empty object', function() {
                var success = map.marshall({});
                expect(success).toBeFalsy();
            });

            it('does marshall an array as a numbered map', function() {
                var success = map.marshall(["x", "y", "z"]);
                expect(success).toBeTruthy();
            });

            it('can set an item with a number as a key', function() {
                map.set(16, "sixteen");
                expect(map.get(16)).toEqual("sixteen");
            });

            it('can set an item with an object as a key', function() {
                map.set({ name: "Bob", age: 36 }, { data: "xxxxxxx" });
                expect(map.get({ name: "Bob", age: 36 })).toEqual({ data: "xxxxxxx" });
            });
		});

        describe('Given Augmented Stack', function() {
            var s;
            beforeEach(function() {
                s = new Augmented.Utility.Stack();
            });
            afterEach(function() {
                s = null;
            });

			it('can create a stack', function() {
				expect(s instanceof Augmented.Utility.Stack).toBeTruthy();
			});

            it('can check for empty', function() {
				expect(s.empty()).toBeTruthy();
			});

            it('can push data to a stack', function() {
                s.push("monkey");
				expect(s.size()).not.toEqual(0);
			});

            it('can peek data in a stack', function() {
                s.push("monkey");
                var d = s.peek();
				expect(s.size()).not.toEqual(0);
                expect(d).toEqual("monkey");
			});

            it('can pop data in a stack', function() {
                s.push("monkey");
                s.pop();
				expect(s.size()).toEqual(0);
			});

            it('can search for data in a stack', function() {
                s.push("monkey");
                s.push("bonobo");
                s.push("chungito");
				expect(s.search("bonobo")).toEqual(1);
			});

            it('can check the size for data in a stack', function() {
                s.push("monkey");
                s.push("bonobo");
                s.push("chungito");
				expect(s.size()).toEqual(3);
			});

            it('can clear a stack', function() {
                s.push("monkey");
                s.clear();
				expect(s.empty()).toBeTruthy();
			});
		});

		describe('Given Augmented Object Extend', function() {
			it('Extends an object with data', function() {
				expect(Augmented.Utility.extend({}, {"A": "B"})).toEqual({"A": "B"});
			});
		});

		describe('Given Resource Bundle Support and Message Utilities', function() {
			Augmented.Utility.ResourceBundle.getBundle({
				name: 'scripts/bundle/Messages',
				mode: 'both',
				cache: true
			});

			describe('Given ResourceBundle', function() {
				it('returns the correct message for a given key', function() {
					expect(Augmented.Utility.ResourceBundle.getString("testMessage")).toBe("This is a test message");
				});
			});

			describe('Given MessageReader', function() {
				var keyTitle = "testError.testKind.testRule.foo",
				keyTitleNotThere = "testError.testKind.testRule.bar",
				keyRule = "testError.testKind.testRule",
				keyRuleNotThere = "testError.testKind.barRule",
				keyKind = "testError.testKind",
				keyKindNotThere = "testError.barKind",
				keyLevel = "testError",
				keyLevelNotThere = "barLevel",
				messageTitle = "This is a title message.",
				messageRule = "This is a rule message.",
				messageKind = "This is a kind message.",
				messageLevel = "This is a level message.";

				it('is defined', function() {
					expect(Augmented.Utility.MessageReader).toBeDefined();
				});

				it('returns the correct message for a given key', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyTitle)).toBe(messageTitle);
				});

				it('falls back to rule attribute when title is not in bundle', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyTitleNotThere)).toBe(messageRule);
				});

				it('returns the rule message when key only specifies up to rule attribute', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyRule)).toBe(messageRule);
				});

				it('falls back to kind attribute when rule is not in bundle', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyRuleNotThere)).toBe(messageKind);
				});

				it('returns the kind message when key only specifies up to kind attribute', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyKind)).toBe(messageKind);
				});

				it('falls back to level attribute when kind is not in bundle', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyKindNotThere)).toBe(messageLevel);
				});

				it('returns the level message when key only specifies up to level attribute', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyLevel)).toBe(messageLevel);
				});

				it('falls back to jquery.i18n plugin default of returning the key when level is not in bundle', function() {
					expect(Augmented.Utility.MessageReader.getMessage(keyLevelNotThere)).toBe("[" + keyLevelNotThere + "]");
				});
			});

			describe('Given a Message Key Formatter', function() {
				var keyComplete = "error.field.required.name",
				errorComplete = {level: "error", kind: "field", rule: "required", values: {title: "name"}},
				keyPartial = "error.field",
				errorPartial = {level: "error", kind: "field", values: {title: null}},
				emptyError = {};

				it('the formatter is defined', function() {
					expect(Augmented.Utility.MessageKeyFormatter).toBeDefined();
				});

				it('returns an empty string for an empty error object', function() {
					expect(Augmented.Utility.MessageKeyFormatter.format(emptyError)).toBeDefined();
				});

				it('returns the correct string for a complete error model', function() {
					expect(Augmented.Utility.MessageKeyFormatter.format(errorComplete)).toBe(keyComplete);
				});

				it('returns the correct string for a partial error model', function() {
					expect(Augmented.Utility.MessageKeyFormatter.format(errorPartial)).toBe(keyPartial);
				});
			});
		});
	});
});
