define([
    'augmented'
    ], function(
    	Augmented
) {
	describe('Given Augmented Local Storage', function() {
		describe('Given non persistent Local Storage', function() {
			var nameSpacedLocalStorage = Augmented.LocalStorageFactory.getStorage(false,'testingNamespacedLocalStorage');

			var globalLocalStorage = Augmented.LocalStorageFactory.getStorage(false);


			it('Can support namespaced local storage', function() {
				expect(nameSpacedLocalStorage).toBeDefined();
			});

			it('Can support global local storage', function() {
				expect(globalLocalStorage).toBeDefined();
			});

			describe('Given Namespaced Local Storage', function() {

				it('Can add an Item', function() {
					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", "bonobo");
                    console.debug("nameSpacedLocalStorage debug: " + nameSpacedLocalStorage.getItem("monkey") );

					expect(nameSpacedLocalStorage.getItem("monkey")).toEqual("bonobo");
					expect(nameSpacedLocalStorage.length()).toEqual(1);
				});

                it('Can add a complex Item', function() {
					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", { color: "brown", age: 1, name: "Lance Link" });
                    console.debug("nameSpacedLocalStorage debug: " + nameSpacedLocalStorage.getItem("monkey") );

					expect(nameSpacedLocalStorage.getItem("monkey")).toEqual({ color: "brown", age: 1, name: "Lance Link" });
					expect(nameSpacedLocalStorage.length()).toEqual(1);
				});

				it('Can get an Item', function() {
					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", "bonobo");
					expect(nameSpacedLocalStorage.getItem("monkey")).toEqual("bonobo");
				});

				it('Can remove an Item', function() {
					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", "bonobo");
					nameSpacedLocalStorage.removeItem("monkey");
					expect(nameSpacedLocalStorage.getItem("monkey")).toEqual(null);
					expect(nameSpacedLocalStorage.length()).toEqual(0);
				});

				it('Can add an Item as Array', function() {
					var array = [ "bonobo", "chimpanzee", "howler" ];
					nameSpacedLocalStorage.setItem("monkeys", array);
					expect(nameSpacedLocalStorage.getItem("monkeys")).toEqual(array);
				});

				it('Can get an Item Array', function() {
					var array = [ "bonobo", "chimpanzee", "howler" ];
					nameSpacedLocalStorage.setItem("monkeys", array);
					var item = nameSpacedLocalStorage.getItem("monkeys");
					console.debug("Array: " + item );
					expect(item.length).toEqual(3);
				});
			});


			describe('Given Global Local Storage', function() {

				it('Can add an Item', function() {

					globalLocalStorage.setItem("donkey", "bonobo");
					expect(globalLocalStorage.getItem("donkey")).toBeDefined();
					globalLocalStorage.removeItem("donkey");

				});
				it('Can get an Item', function() {

					globalLocalStorage.setItem("donkey", "bonobo");
					expect(globalLocalStorage.getItem("donkey")).toBeDefined();
					globalLocalStorage.removeItem("donkey");

				});
				it('Can remove an Item', function() {

					globalLocalStorage.setItem("donkey", "bonobo");
					globalLocalStorage.removeItem("donkey");
					expect(globalLocalStorage.getItem("donkey")).toEqual(null);

				});

				it('Can add an Item as Array', function() {

					var array = [ "bonobo", "chimpanzee", "howler" ];

					globalLocalStorage.setItem("donkeys", array);

					expect(globalLocalStorage.getItem("donkeys")).toBeDefined();
					globalLocalStorage.removeItem("donkeys");

				});

				it('Can get an Item Array', function() {

					var array = [ "bonobo", "chimpanzee", "howler" ];

					globalLocalStorage.setItem("donkeys", array);

					var item = globalLocalStorage.getItem("donkeys");

					console.log("Array: " + item );

					expect(item.length).toEqual(3);
					globalLocalStorage.removeItem("donkeys");
				});

                it('Can add an Item as Map', function() {
                    var map = new Augmented.Utility.AugmentedMap();
                    map.set("name", "Bob");
                    map.set("age", 36);
                    map.set("height", "6.0\"");

					globalLocalStorage.setItem("myMap", map);
                    var otherMap = new Augmented.Utility.AugmentedMap();
                    otherMap.marshall(globalLocalStorage.getItem("myMap"));
					expect(globalLocalStorage.getItem("myMap")).toEqual(map.toJSON());
                    expect(otherMap.toJSON()).toEqual(map.toJSON());
					globalLocalStorage.removeItem("myMap");

				});
			});

		});
		describe('Given persistent Local Storage', function() {
			var nameSpacedLocalStorage = Augmented.LocalStorageFactory.getStorage(true,'testingPersistentNamespacedLocalStorage');

			var globalLocalStorage = Augmented.LocalStorageFactory.getStorage(true);


			it('Can support persistent namespaced local storage', function() {
				expect(nameSpacedLocalStorage).toBeDefined();
			});

			it('Can support persistent global local storage', function() {
				expect(globalLocalStorage).toBeDefined();
			});

			describe('Given persistent Namespaced Local Storage', function() {

				it('Can add an Item', function() {

					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", "bonobo");
					expect(nameSpacedLocalStorage.getItem("monkey")).toBeDefined();
					expect(nameSpacedLocalStorage.length()).toEqual(1);
				});

				it('Can get an Item', function() {

					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", "bonobo");
					expect(nameSpacedLocalStorage.getItem("monkey")).toBeDefined();

				});

				it('Can remove an Item', function() {

					nameSpacedLocalStorage.clear();
					nameSpacedLocalStorage.setItem("monkey", "bonobo");
					nameSpacedLocalStorage.removeItem("monkey");
					expect(nameSpacedLocalStorage.getItem("monkey")).toEqual(null);
					expect(nameSpacedLocalStorage.length()).toEqual(0);
				});

				it('Can add an Item as Array', function() {

					var array = [ "bonobo", "chimpanzee", "howler" ];

					nameSpacedLocalStorage.setItem("monkeys", array);

					expect(nameSpacedLocalStorage.getItem("monkeys")).toBeDefined();
				});

				it('Can get an Item Array', function() {

					var array = [ "bonobo", "chimpanzee", "howler" ];

					nameSpacedLocalStorage.setItem("monkeys", array);

					var item = nameSpacedLocalStorage.getItem("monkeys");

					console.log("Array: " + item );

					expect(item.length).toEqual(3);
					nameSpacedLocalStorage.removeItem("monkeys");
				});


			});


			describe('Given persistent Global Local Storage', function() {

				it('Can add an Item', function() {

					globalLocalStorage.setItem("donkey", "bonobo");
					expect(globalLocalStorage.getItem("donkey")).toBeDefined();
					globalLocalStorage.removeItem("donkey");

				});
				it('Can get an Item', function() {
					globalLocalStorage.setItem("donkey", "bonobo");
					expect(globalLocalStorage.getItem("donkey")).toBeDefined();
					globalLocalStorage.removeItem("donkey");
				});
				it('Can remove an Item', function() {
					globalLocalStorage.setItem("donkey", "bonobo");
					globalLocalStorage.removeItem("donkey");
					expect(globalLocalStorage.getItem("donkey")).toEqual(null);
				});

				it('Can add an Item as Array', function() {
					var array = [ "bonobo", "chimpanzee", "howler" ];

					globalLocalStorage.setItem("donkeys", array);

					expect(globalLocalStorage.getItem("donkeys")).toBeDefined();
					globalLocalStorage.removeItem("donkeys");
				});

				it('Can get an Item Array', function() {
					var array = [ "bonobo", "chimpanzee", "howler" ];

					globalLocalStorage.setItem("donkeys", array);

					var item = globalLocalStorage.getItem("donkeys");

					console.log("Array: " + item );

					expect(item.length).toEqual(3);
					globalLocalStorage.removeItem("donkeys");
					globalLocalStorage.clear();
				});
			});
		});
	});
});
