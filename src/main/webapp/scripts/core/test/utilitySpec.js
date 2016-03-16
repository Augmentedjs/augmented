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

        describe('Given Augmented Class Extend', function() {
			xit('Extends a class object', function() {
                var x = Augmented.Model.extend({ x: "", url: "/" });
                var y = Augmented.Utility.classExtend(Augmented.Model, { x: "", url: "/" });
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
	});
});
