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
                var list = Augmented.Presentation.Widget.List(arr, false);
    			expect(list.tagName.toLowerCase()).toEqual("ul");
                expect(list.childNodes.length).toEqual(2);
                expect(list.childNodes[0].tagName.toLowerCase()).toEqual("li");
    		});

            it('can create an ordered list', function() {
                var list = Augmented.Presentation.Widget.List(arr, true);
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
                var list = Augmented.Presentation.Widget.DescriptionList(o);
    			expect(list.tagName.toLowerCase()).toEqual("dl");
                expect(list.childNodes.length).toEqual(4);
                expect(list.childNodes[0].tagName.toLowerCase()).toEqual("dt");
    		});
        });
	});
});
