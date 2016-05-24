define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Utilities', function() {
		it('is defined', function() {
			expect(Augmented.Utility).toBeDefined();
		});

		describe('Given Augmented Object Extend', function() {
			it('Extends an object with data', function() {
				expect(Augmented.Utility.extend({}, {"A": "B"})).toEqual({"A": "B"});
			});

            it('Extends an object with more data', function() {
				expect(Augmented.Utility.extend({}, {"A": "B"}, {"C": "D"})).toEqual({"A": "B", "C": "D"});
			});

            it('Extends an object prototype', function() {
                function Shape() {
                    this.x = 0;
                    this.y = 0;
                }

                function Circle() {
                   Shape.call(this);
                }

                Circle.prototype = Augmented.Utility.extend(Shape.prototype, {
                   'constructor': Circle
                });

                var circle = new Circle();
                expect(circle instanceof Circle).toBeTruthy();
                // => true

                expect(circle instanceof Shape).toBeTruthy();
                // => true
            });
		});

        xdescribe('Given Augmented Class Extend', function() {
			it('Extends a class object', function() {
                var x = Augmented.Model.extend({ x: "", url: "/" });
                var y = Augmented.Utility.ClassExtend(Augmented.Model, { x: "", url: "/" });
                var xx = new x();
                var yy = new y();

				expect(x.x).toEqual(y.x);
                expect(x.url).toEqual(y.url);
			});
        });

        describe('Given wrap', function() {
            var f = function () {};
            it('can wrap functions', function() {
                var ff = function() {return true;};
                var x = Augmented.Utility.wrap(f, ff);
                expect(x).toBeTruthy();
            });
        });

        describe('Given an object', function() {
            var o = { "this": "this", "is": "is", "an": "an", "object": "object" };
            it('can pretty print', function() {
                var x = Augmented.Utility.PrettyPrint(o);
                expect(x).not.toEqual("");
            });
        });
	});
});
