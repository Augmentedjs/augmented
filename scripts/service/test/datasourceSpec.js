define(["augmented", "augmentedService"], function(Augmented) {
    describe("Given an Augmented Service DataSourceFactory", function() {
        it("a factory is defined", function() {
            expect(Augmented.Service.DataSourceFactory).toBeDefined();
        });

        describe("Given a DataSource instance", function() {
            it("is defined", function() {
                expect(Augmented.Service.DataSource).toBeDefined();
            });
        });

        describe("Given a MongoDB DataSource", function() {
            it("can get a MongoDB DataSource instance", function() {
                var ds = Augmented.Service.DataSourceFactory.getDatasource(
                    Augmented.Service.DataSourceFactory.Type.MongoDB, {});

                expect(ds).toBeDefined();
                expect(ds instanceof Augmented.Service.DataSource).toBeTruthy();
            });
        });

        describe("Given a SOLR DataSource", function() {
            it("can get a SOLR DataSource instance", function() {
                var ds = Augmented.Service.DataSourceFactory.getDatasource(
                    Augmented.Service.DataSourceFactory.Type.SOLR, {});

                expect(ds).toBeDefined();
                expect(ds instanceof Augmented.Service.DataSource).toBeTruthy();
            });
        });
    });
});
