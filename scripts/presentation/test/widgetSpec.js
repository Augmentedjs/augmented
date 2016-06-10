define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation Widgets', function() {
		it('is defined', function() {
			expect(Augmented.Presentation.Widget).toBeDefined();
		});

        describe('Given an array', function() {
            var arr = ["a", "b"];

            it('can create an unordered list', function() {
                var list = Augmented.Presentation.Widget.List("l", arr, false);
    			expect(list.tagName.toLowerCase()).toEqual("ul");
                expect(list.childNodes.length).toEqual(2);
                expect(list.childNodes[0].tagName.toLowerCase()).toEqual("li");
    		});

            it('can create an ordered list', function() {
                var list = Augmented.Presentation.Widget.List("l", arr, true);
    			expect(list.tagName.toLowerCase()).toEqual("ol");
                expect(list.childNodes.length).toEqual(2);
                expect(list.childNodes[0].tagName.toLowerCase()).toEqual("li");
    		});

            it('can create a data list', function() {
                var list = Augmented.Presentation.Widget.DataList("sandbox", arr);
    			expect(list.tagName.toLowerCase()).toEqual("datalist");
                expect(list.childNodes.length).toEqual(2);
                expect(list.childNodes[0].tagName.toLowerCase()).toEqual("option");
    		});
        });

        describe('Given an object', function() {
            var o = { "a": "a", "b": "b" };

            it('can create a description list', function() {
                var list = Augmented.Presentation.Widget.DescriptionList("l", o);
    			expect(list.tagName.toLowerCase()).toEqual("dl");
                expect(list.childNodes.length).toEqual(4);
                expect(list.childNodes[0].tagName.toLowerCase()).toEqual("dt");
    		});
        });

        describe('Given a field property (JSON Schema)', function() {
            var field = {
                    "description": "The unique identifier for a user",
                    "type" : "integer",
                    "minimum": 1
                },
                name = "ID", value = 1, required = [ "ID" ], binding = "x", input, id = "ID";


                beforeEach(function() {
                    input = Augmented.Presentation.Widget.Input(field, name, value, id, required, binding);
                });

                afterEach(function() {
                    input = null;
                });

            it('can create an Input', function() {
    			expect(input.tagName.toLowerCase()).toEqual("input");
    		});

            it('is required', function() {
    			expect(input.getAttribute("required")).toEqual("true");
    		});

            it('has binding', function() {
    			expect(input.getAttribute("data-x")).toEqual(name);
    		});

            it('is type number', function() {
    			expect(input.getAttribute("type")).toEqual("number");
    		});
        });

	});
});
