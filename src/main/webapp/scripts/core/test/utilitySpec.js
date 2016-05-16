define([
	'augmented'
], function(
	Augmented
) {
	describe('Given Utilities', function() {
		it('is defined', function() {
			expect(Augmented.Utility).toBeDefined();
		});

        describe('Given an Array', function() {
            var arr = [5, 7, 10, 400, 234, 4, 12, 55, 663, 34267, 22, 45, 3242, 27, 222, 43, 32, 98, 99, 21, 34, 6547, 3411, 1232];
            var objArr = [
                {
                    "name": "freeForm Design",
                    "image": "images/freeform.png",
                    "title": "freeForm Design - Augmented SPA Designer",
                    "desciption": "A Single Page Application designer built in Augmented.js.  This application can build the structure and source-code for a single page app.",
                    "link": "http://www.augmentedjs.com/freeform/index.html",
                    "patterns": [{ "pName": "Single Page Application"}]
                },
                {
                    "name": "Augmented.Presentation.AutomaticTable",
                    "image": "images/autoTable.png",
                    "title": "Augmented.Presentation: Editable Automatic Table",
                    "desciption": "Demonstrates Augmented.Presentation.AutomaticTable and various functions of the Presentation Module.",
                    "link": "http://www.augmentedjs.com/example/index.html",
                    "patterns": [{ "pName": "Automatic Table"},{ "pName": "Mediator"},{ "pName": "JSON Schema Validation"}]
                },
                {
                    "name": "Augmented Top Model",
                    "image": "images/topModel.png",
                    "title": "Augmented: JSON Schema Validation",
                    "desciption": "Demonstrates Augmented JSON Schema Validation.",
                    "link": "http://www.augmentedjs.com/top-model/index.html",
                    "patterns": [{ "pName": "Event Binding"},{ "pName": "Mediator"},{ "pName": "JSON Schema Validation"}]
                },
                {
                    "name": "Stickies!",
                    "image": "images/stickies.png",
                    "title": "Stickies!",
                    "desciption": "Demonstrates Augmented Decorator View.",
                    "link": "http://www.augmentedjs.com/decorator/index.html",
                    "patterns": [{ "pName": "MVVM"},{ "pName": "Decorator"},{ "pName": "Two-way Binding"}]
                },
                {
                    "name": "Hello",
                    "image": "images/dataPush.png",
                    "title": "Hello",
                    "desciption": "Demonstrates Augmented Decorator View Data Push.",
                    "link": "http://www.augmentedjs.com/data-push/index.html",
                    "patterns": [{ "pName": "MVVM"},{ "pName": "Decorator"},{ "pName": "Two-way Binding"}]
                },
                {
                    "name": "Visual Mediator",
                    "image": "images/mediator.png",
                    "title": "Visual Mediator",
                    "desciption": "Demonstrates Mediator View.",
                    "link": "http://www.augmentedjs.com/mediator/index.html",
                    "patterns": [{ "pName": "Mediator"}]
                }
            ];

            it('can sort number array with QuickSort', function() {
                var sorted = Augmented.Utility.QuickSort(arr);

				expect(sorted).toEqual([4, 5, 7, 10, 12, 21, 22, 27, 32, 34, 43, 45, 55, 98, 99, 222, 234, 400, 663, 1232, 3242, 3411, 6547, 34267]);
			});
            it('can sort object array by property', function() {
                var sorted = Augmented.Utility.Sort(objArr, "name");

				expect(sorted).toEqual([{"name":"Augmented Top Model","image":"images/topModel.png","title":"Augmented: JSON Schema Validation","desciption":"Demonstrates Augmented JSON Schema Validation.","link":"http://www.augmentedjs.com/top-model/index.html","patterns":[{"pName":"Event Binding"},{"pName":"Mediator"},{"pName":"JSON Schema Validation"}]},{"name":"Augmented.Presentation.AutomaticTable","image":"images/autoTable.png","title":"Augmented.Presentation: Editable Automatic Table","desciption":"Demonstrates Augmented.Presentation.AutomaticTable and various functions of the Presentation Module.","link":"http://www.augmentedjs.com/example/index.html","patterns":[{"pName":"Automatic Table"},{"pName":"Mediator"},{"pName":"JSON Schema Validation"}]},{"name":"Hello","image":"images/dataPush.png","title":"Hello","desciption":"Demonstrates Augmented Decorator View Data Push.","link":"http://www.augmentedjs.com/data-push/index.html","patterns":[{"pName":"MVVM"},{"pName":"Decorator"},{"pName":"Two-way Binding"}]},{"name":"Stickies!","image":"images/stickies.png","title":"Stickies!","desciption":"Demonstrates Augmented Decorator View.","link":"http://www.augmentedjs.com/decorator/index.html","patterns":[{"pName":"MVVM"},{"pName":"Decorator"},{"pName":"Two-way Binding"}]},{"name":"Visual Mediator","image":"images/mediator.png","title":"Visual Mediator","desciption":"Demonstrates Mediator View.","link":"http://www.augmentedjs.com/mediator/index.html","patterns":[{"pName":"Mediator"}]},{"name":"freeForm Design","image":"images/freeform.png","title":"freeForm Design - Augmented SPA Designer","desciption":"A Single Page Application designer built in Augmented.js.  This application can build the structure and source-code for a single page app.","link":"http://www.augmentedjs.com/freeform/index.html","patterns":[{"pName":"Single Page Application"}]}]);
			});

            it('can return the index of a item via binary search', function() {
                var sorted = Augmented.Utility.QuickSort(arr);
                var i = Augmented.Utility.BinarySearch(sorted, 32);
                var ii = sorted.indexOf(32);

				expect(i).toEqual(8);
                expect(i).toEqual(ii);
			});

            it('can return the index of a item via binary search with last inedex', function() {
                var sorted = Augmented.Utility.QuickSort(arr);
                var i = Augmented.Utility.BinarySearch(sorted, 34267);
                var ii = sorted.indexOf(34267);

				expect(i).toEqual(23);
                expect(i).toEqual(ii);
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

            it('can produce a string from the map', function() {
                var o = {   p1: "p1",
                            p2: "p2" };

                var success = map.marshall(o);
                expect(success).toBeTruthy();
                expect(map.toString()).toEqual('{"p1":"p1","p2":"p2"}');
            });

            it('can marshall a stringified JSON', function() {
                var success = map.marshall('{"p1":"p1","p2":"p2"}');
                expect(success).toBeTruthy();
                expect(map.toString()).toEqual('{"p1":"p1","p2":"p2"}');
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
