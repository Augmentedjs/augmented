define([
        'augmented'
        ], function(
        		Augmented
        ) {
	describe('Given Utilities', function() {
		it('is defined', function() {
			expect(Augmented.Utility).toBeDefined();
		});

		describe('Given AugmentedMap', function() {
			it('is defined', function() {
				expect(Augmented.Utility.AugmentedMap).toBeDefined();
			});

			it('can create an instance', function() {
				var map = new Augmented.Utility.AugmentedMap();

				expect(map instanceof Augmented.Utility.AugmentedMap).toBeTruthy();
			});

			it('can add a string to the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");

				expect(map.size()).toEqual(1);
			});

			it('can get a string from the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");

				expect(map.get("name")).toEqual("bubba");
			});

			it('can get an array from the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("names", ["bubba", "bob"]);

				expect(map.get("names").length).toEqual(2);
			});

			it('can get an map from the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("map", new Augmented.Utility.AugmentedMap());

				var m = map.get("map");

				expect(m instanceof Augmented.Utility.AugmentedMap).toBeTruthy();
			});

			it('can get an object to the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("object", { "x": "y" });

				expect(map.get("object")).toEqual({ "x": "y" });
			});

			it('can remove a string to the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");
				map.remove("name");
				expect(map.size()).toEqual(0);
			});

			it('has a string in the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");

				expect(map.has("name")).toBeTruthy();
			});

			it('does not have a string in the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");

				expect(map.has("x")).toBeFalsy();
			});

			it('has a string key in the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");

				expect(map.key(0)).toEqual("name");
			});

			it('has a entries in the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");
				map.set("age", "32");
				map.set("height", "6.0");

				expect(map.entries().length).toEqual(3);
			});

			it('has a values in the map', function() {
				var map = new Augmented.Utility.AugmentedMap();
				map.set("name", "bubba");
				map.set("age", "32");
				map.set("height", "6.0");

				expect(map.values().length).toEqual(3);
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
