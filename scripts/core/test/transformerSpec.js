define([
	'augmented'
], function(
	Augmented
) {
	describe('Given a transformer', function() {
        describe('Given a number (100)', function() {
            var source;
            var out;
            beforeEach(function() {
                source = 100;
                out = null;
            });

    		it('can transform to a string', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xString);
                expect(typeof out === "string").toBeTruthy();
    			expect(out).toEqual("100");
    		});

            it('can transform to a integer', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xInteger);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(100);
    		});

            it('can transform to a number', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xNumber);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(100);
    		});

            it('can transform to a boolean', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xBoolean);
                expect(typeof out === "boolean").toBeTruthy();
    			expect(out).toEqual(true);
    		});

            it('can transform to an array', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xArray);
                expect(Array.isArray(out)).toBeTruthy();
                expect(out).toEqual([100]);
    		});

            it('can transform to an object', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xObject);
                expect(typeof out === "object").toBeTruthy();
                expect(out).toEqual({100: 100});
    		});
        });

        describe('Given a number (1024.55)', function() {
            var source;
            var out;
            beforeEach(function() {
                source = 1024.55;
                out = null;
            });

    		it('can transform to a string', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xString);
                expect(typeof out === "string").toBeTruthy();
    			expect(out).toEqual("1024.55");
    		});

            it('can transform to a integer', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xInteger);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(1024);
    		});

            it('can transform to a number', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xNumber);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(1024.55);
    		});

            it('can transform to a boolean', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xBoolean);
                expect(typeof out === "boolean").toBeTruthy();
    			expect(out).toEqual(true);
    		});

            it('can transform to an array', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xArray);
                expect(Array.isArray(out)).toBeTruthy();
                expect(out).toEqual([1024.55]);
    		});

            it('can transform to an object', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xObject);
                expect(typeof out === "object").toBeTruthy();
                expect(out).toEqual({1024.55: 1024.55});
    		});
        });

        describe('Given a string ("12345.80")', function() {
            var source;
            var out;
            beforeEach(function() {
                source = "12345.80";
                out = null;
            });

    		it('can transform to a string', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xString);
                expect(typeof out === "string").toBeTruthy();
    			expect(out).toEqual("12345.80");
    		});

            it('can transform to a integer', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xInteger);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(12345);
    		});

            it('can transform to a number', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xNumber);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(12345.80);
    		});

            it('can transform to a boolean', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xBoolean);
                expect(typeof out === "boolean").toBeTruthy();
    			expect(out).toEqual(true);
    		});

            it('can transform to an array', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xArray);
                expect(Array.isArray(out)).toBeTruthy();
                expect(out).toEqual(["12345.80"]);
    		});

            it('can transform to an object', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xObject);
                expect(typeof out === "object").toBeTruthy();
                expect(out).toEqual({"12345.80": "12345.80"});
    		});
        });

        describe('Given a boolean (false)', function() {
            var source;
            var out;
            beforeEach(function() {
                source = false;
                out = null;
            });

    		it('can transform to a string', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xString);
                expect(typeof out === "string").toBeTruthy();
    			expect(out).toEqual("false");
    		});

            it('will transform to a integer (NaN)', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xInteger);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(NaN);
    		});

            it('can transform to a number', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xNumber);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(0);
    		});

            it('can transform to a boolean', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xBoolean);
                expect(typeof out === "boolean").toBeTruthy();
    			expect(out).toEqual(false);
    		});

            it('can transform to an array', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xArray);
                expect(Array.isArray(out)).toBeTruthy();
                expect(out).toEqual([false]);
    		});

            it('can transform to an object', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xObject);
                expect(typeof out === "object").toBeTruthy();
                expect(out).toEqual({false: false});
    		});
        });

        describe('Given an array ([1,2,3])', function() {
            var source;
            var out;
            beforeEach(function() {
                source = [1,2,3];
                out = null;
            });

    		it('can transform to a string', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xString);
                expect(typeof out === "string").toBeTruthy();
    			expect(out).toEqual("[1,2,3]");
    		});

            it('will transform to a integer (first in array)', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xInteger);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(1);
    		});

            it('can transform to a number (NaN)', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xNumber);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(NaN);
    		});

            it('can transform to a boolean', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xBoolean);
                expect(typeof out === "boolean").toBeTruthy();
                expect(out).toEqual(true);
    		});

            it('can transform to an array', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xArray);
                expect(Array.isArray(out)).toBeTruthy();
                expect(out).toEqual([1,2,3]);
    		});

            it('can transform to an object', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xObject);
                expect(typeof out === "object").toBeTruthy();
                expect(out).toEqual([1,2,3]);
    		});
        });

        describe('Given an object ({"a": "a"})', function() {
            var source;
            var out;
            beforeEach(function() {
                source = {"a": "a"};
                out = null;
            });

    		it('can transform to a string', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xString);
                expect(typeof out === "string").toBeTruthy();
    			expect(out).toEqual('{"a":"a"}');
    		});

            it('will transform to a integer (NaN)', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xInteger);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(NaN);
    		});

            it('can transform to a number (NaN)', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xNumber);
                expect(typeof out === "number").toBeTruthy();
    			expect(out).toEqual(NaN);
    		});

            it('can transform to a boolean', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xBoolean);
                expect(typeof out === "boolean").toBeTruthy();
                expect(out).toEqual(true);
    		});

            it('can transform to an array', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xArray);
                expect(Array.isArray(out)).toBeTruthy();
    		});

            it('can transform to an object', function() {
                out = Augmented.Utility.Transformer.transform(source, Augmented.Utility.Transformer.type.xObject);
                expect(typeof out === "object").toBeTruthy();
                expect(out).toEqual(source);
    		});
        });
	});
});
