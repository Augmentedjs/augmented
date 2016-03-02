define([
	"augmented",
	"augmentedService"
], function(
	Augmented,
	AugmentedService
) {
    var data = [ { "Name": "Bob", "ID": 123, "Email": "bob@augmentedjs.org" },
                 { "Name": "Jonathan", "ID": 234, "Email": "jonathon@augmentedjs.org" },
                 { "Name": "Corey", "ID": 345, "Email": "corey@augmentedjs.org" },
                 { "Name": "Seema", "ID": 456, "Email": "seema@augmentedjs.org" },
                 { "Name": "Jasmine", "ID": 567, "Email": "jasmine@augmentedjs.org" }
                ];

    describe('Given an Augmented Collection', function() {
        it('has an augmented Collection', function() {
            expect(Augmented.Collection).toBeDefined();
        });

        it('can populate data', function() {
            var c = new Augmented.Collection();
            c.add(data);
            expect(c.size()).toEqual(5);
        });
        it('can sort data', function() {
            var c = new Augmented.Collection();
            c.add(data);
            c.sortBy("Name");
            var first = c.at(1);
            expect(first.get("Name")).toEqual("Corey");
        });
    });

    describe('Given an Augmented Collection Backed by Local Storage', function() {
        var c, myC = Augmented.LocalStorageCollection.extend({
            key: "augmented.localStorage.collection.jasmine"
        });
        beforeEach(function() {
            c = new myC();
        });

        afterEach(function() {
            c.destroy();
            c = null;
        });

        it('has an augmented local storage Collection', function() {
            expect(Augmented.LocalStorageCollection).toBeDefined();
        });

        it('can populate data', function() {
            c.add(data);
            expect(c.size()).toEqual(5);
        });

        it('can save and fetch data', function() {
            c.add(data);
            c.save();

            c.fetch();
            expect(c.size()).toEqual(5);
        });
    });

    describe('Given an Augmented Collection needing pagination', function() {
        describe('Given an Augmented PaginationFactory', function() {
            var c;
            beforeEach(function() {

            });
            afterEach(function() {
                c = null;
            });
            it('has an augmented PaginationFactory', function() {
                expect(Augmented.PaginationFactory).toBeDefined();
            });

            it('can get a "github" API PaginatedCollection', function() {
                c = Augmented.PaginationFactory.getPaginatedCollection(
                    Augmented.PaginationFactory.type.github);
                expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
                expect(c.paginationConfiguration.currentPageParam).toEqual('page');
            });

            it('can get a "solr" API PaginatedCollection', function() {
                c = Augmented.PaginationFactory.getPaginatedCollection(
                    Augmented.PaginationFactory.type.solr);
                expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
                expect(c.paginationConfiguration.currentPageParam).toEqual('start');
            });

            it('can get a "database" API PaginatedCollection', function() {
                c = Augmented.PaginationFactory.getPaginatedCollection(
                    Augmented.PaginationFactory.type.database);
                expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
                expect(c.paginationConfiguration.currentPageParam).toEqual('offset');
            });

            it('will not get a "nothing" API PaginatedCollection', function() {
                c = Augmented.PaginationFactory.getPaginatedCollection(
                    "nothing");
                expect(c instanceof Augmented.PaginatedCollection).toBeFalsy();
            });
        });

        describe('Given an Augmented Collection', function() {
            var c;
            var defConfig = {
                currentPageParam: "p",
                pageSizeParam: "pp"
            };

            var testUrl = "/tests/1",
				testMethod = "GET",
				testText = "Hello World",
				testStatus = 200,
				testHeaders = {ContentType: "text/plain", User: "Mufasa"},
				mockedResponse = null;

            beforeEach(function() {
                c = new Augmented.PaginatedCollection();
				Augmented.Service.MockService.at(testUrl)
									 .on(testMethod)
									 .respondWithText(testText)
									 .respondWithStatus(testStatus)
									 .respondWithHeaders(testHeaders)
									 .register();
            });

            afterEach(function() {
                c = null;
                Augmented.Service.MockService.clear();
            });

            it('has an augmented PaginatedCollection', function() {
                expect(Augmented.PaginatedCollection).toBeDefined();
            });

            it('can create an augmented PaginatedCollection', function() {
                expect(c instanceof Augmented.PaginatedCollection).toBeTruthy();
            });

            it('has a configuration object', function() {
                expect(c.paginationConfiguration).not.toEqual({});
            });

            it('can set a configuration object', function() {
                c.setPaginationConfiguration(defConfig);
                expect(c.paginationConfiguration).toEqual(defConfig);
            });

            //TODO: fix this for the new mock service
            xit('can fetch', function() {
                c.url = "/tests/1";
                var ret = c.fetch();
                expect(ret).toBeDefined();
            });

        });
    });
});
