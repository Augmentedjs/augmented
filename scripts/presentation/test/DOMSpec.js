define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation DOM', function() {
		it('is defined', function() {
			expect(Augmented.Presentation.Dom).toBeDefined();
		});

        it('has short name Augmented.D', function() {
			expect(Augmented.D).toBeDefined();
		});

        it('can get the viewport height', function() {
            var i = Augmented.D.getViewportHeight();
			expect(i).toBeGreaterThan(0);
		});

        it('can get the viewport width', function() {
            var i = Augmented.D.getViewportWidth();
			expect(i).toBeGreaterThan(0);
		});

        describe('Given and element', function() {
            var el = document.createElement("div"),
                body = document.querySelector("body");
            el.setAttribute("id", "sandbox");
            body.appendChild(el);

            /*
            beforeEach(function() {
            });
            */

            afterEach(function() {
                Augmented.D.empty("#sandbox");
            });

            it('can set the value of a div', function() {
                Augmented.D.setValue("#sandbox", "augmented");
                var e = document.querySelector("#sandbox");
    			expect(e.textContent).toEqual("augmented");
    		});

            it('can get the value of a div', function() {
                var e = document.querySelector("#sandbox");
                e.textContent = "augmented";
                var v = Augmented.D.getValue("#sandbox");
    			expect(v).toEqual("augmented");
    		});

            it('can get an element', function() {
                var e1 = document.querySelector("#sandbox");
                var e2 = Augmented.D.selector("#sandbox");
                expect(e1).toEqual(e2);
            });

            it('can get an element list', function() {
                var e1 = document.querySelector("#sandbox");
                var e2 = Augmented.D.selectors("#sandbox")[0];
                expect(e1).toEqual(e2);
            });

            it('can get an element list', function() {
                var e1 = document.querySelector("#sandbox");
                var e2 = Augmented.D.selectors("#sandbox")[0];
                expect(e1).toEqual(e2);
            });

            it('can hide an element', function() {
                Augmented.D.hide("#sandbox");
                var e = document.querySelector("#sandbox");
                expect(e.style.display).toEqual("none");
            });

            it('can show an element', function() {
                Augmented.D.show("#sandbox");
                var e = document.querySelector("#sandbox");
                expect(e.style.display).toEqual("block");
            });

            it('can set the class attribute', function() {
                Augmented.D.setClass("#sandbox", "monkey");
                var e = document.querySelector("#sandbox");
                var c = e.getAttribute("class");
                expect(c).toEqual("monkey");
            });

            it('can add the class attribute', function() {
                Augmented.D.addClass("#sandbox", "bubba");
                var e = document.querySelector("#sandbox");
                var c = e.getAttribute("class");
                expect(c).toContain("bubba");
            });

            it('can remove the class attribute', function() {
                Augmented.D.addClass("#sandbox", "bubba");
                Augmented.D.removeClass("#sandbox", "bubba");
                var e = document.querySelector("#sandbox");
                var c = e.getAttribute("class");
                expect(c).not.toContain("bubba");
            });

            it('can empty an element', function() {
                Augmented.D.empty("#sandbox");
                var e = document.querySelector("#sandbox");
                var v = Augmented.D.getValue("#sandbox");
    			expect(v).toEqual("");
            });
        });
	});
});
