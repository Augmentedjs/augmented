define([
	'augmentedPresentation'
], function(
	Presentation
) {
	describe('Given Augmented Presentation Decorator View', function() {

		describe('Given a Decorator View', function() {
			it('Augmented.Presentation.DecoratorView is defined', function() {
				expect(Augmented.Presentation.DecoratorView).toBeDefined();
			});

			describe('Given a DecoratorView instance', function() {
                var el = document.getElementById("monkey"),
                    body = document.getElementsByTagName("body")[0],
                    MyDecorator = Augmented.Presentation.DecoratorView.extend({
                        el: "#monkey",
                        name: "monkey"
                    }),
                    d;

                if (!el) {
                    el = document.createElement("div");
                    el.id = "monkey";
                    body.appendChild(el);
                }

				beforeEach(function() {
					d = new MyDecorator();
				});

				afterEach(function() {
                    d.remove();
					d = null;
				});

                it('DecoratorView is a Colleague', function() {
                    expect(d instanceof Augmented.Presentation.Colleague).toBeTruthy();
                });

				it('can create an instance that is a DecoratorView', function() {
					expect(d instanceof Augmented.Presentation.DecoratorView).toBeTruthy();
				});

				it('the DecoratorView has a bound element', function() {
					expect(d.el).toBeDefined();
					expect(d.el.tagName).toEqual(el.tagName);
				});

                it('can return the binding attribute name', function() {
                    var name = d.bindingAttribute();
					expect(name).toEqual("data-monkey");
				});

                it('can inject a template', function() {
                    d.injectTemplate("<span></span>", el);
                    var s = el.querySelector("span");
					expect(s).toBeDefined();
				});

                it('can remove an injected template', function() {
                    d.injectTemplate("<span></span>", el);
                    d.removeTemplate(el);
                    var s = el.querySelector("span");
					expect(s).toBeNull();
				});

                it('can return a bound element', function() {
                    d.injectTemplate("<span data-monkey=\"me\"></span>", el);
                    var s = el.querySelector("span");
                    var e = d.boundElement("me");
					expect(s).toBeDefined();
                    expect(e).toBeDefined();
				});
			});
		});
	});
});
