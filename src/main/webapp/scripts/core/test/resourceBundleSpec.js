define([
	'augmented'
], function(
	Augmented
) {
    xdescribe('Given Resource Bundle Support and Message Utilities (DEPRECATED)', function() {
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
