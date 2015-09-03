define([
	"augmented",
	"augmentedService",
	"jquery"
], function(
	Augmented,
	AugmentedService,
	$
) {
	describe("Given the Augmented mock service", function() {

		it("is defined", function() {
			expect(Augmented.Service.Mock).toBeDefined();
		});

		describe("when I register a concrete URL with a mocked text response and status, " +
				 "then make an AJAX call to that URL", function () {

			var testUrl = "/tests/1",
				testMethod = "GET",
				testText = "Hello World",
				testStatus = 200,
				testHeaders = {ContentType: "text/plain", User: "Mufasa"},
				mockedResponse = null;

			beforeEach(function(done) {
				Augmented.Service.Mock.clear();
				Augmented.Service.Mock.at(testUrl)
									 .on(testMethod)
									 .respondWithText(testText)
									 .respondWithStatus(testStatus)
									 .respondWithHeaders(testHeaders)
									 .register();

				$.ajax({url: testUrl,
					    type: testMethod})
				.done(function(data, statusText, response) {
					mockedResponse = response;
					done();
				});
				
			});

			it("responds with the mocked text response", function() {
				expect(mockedResponse.responseText).toBe(testText);
			});

			it("responds with the mocked status", function() {
				expect(mockedResponse.status).toBe(testStatus);
			});

			it("responds with the mocked headers", function() {
				expect(mockedResponse.getResponseHeader("ContentType")).toBe("text/plain");
				expect(mockedResponse.getResponseHeader("User")).toBe("Mufasa");
			});
			
		});

		describe("when I register a concrete URL with a mocked failure response " +
				 "then make an AJAX call to that URL", function () {
			
			var testUrl =  "/tests/gone",
				testMethod = "DELETE",
				testText = "Could not be found!",
				testStatus = 404,
				mockedResponse = null;

			beforeEach(function(done) {
				Augmented.Service.Mock.clear();
				Augmented.Service.Mock.at(testUrl)
									 .on(testMethod)
									 .respondWithText(testText)
									 .respondWithStatus(testStatus)
									 .register();

				$.ajax({url: testUrl,
					    type: testMethod})
				.fail(function(response) {
					mockedResponse = response;
					done();
				});			
			});

			it("responds with the mocked text response", function() {
				expect(mockedResponse.responseText).toBe(testText);
			});

			it("responds with the mocked status", function() {
				expect(mockedResponse.status).toBe(testStatus);
			});
		});

		describe("when I register a wildcard URL with a mocked text response, " +
				 "then make an AJAX call to a URL that matches the wildcard", function () {
			
			var testUrl = "/tests/*"
				testMethod = "POST",
				testText = "Hola Mundo",
				testStatus = 201,
				testHeaders = {ContentType: "text/plain", User: "Nala"},
				mockedResponse = null;

			beforeEach(function(done) {
				Augmented.Service.Mock.clear();
				Augmented.Service.Mock.at(testUrl)
									 .on(testMethod)
									 .respondWithText(testText)
									 .respondWithStatus(testStatus)
									 .respondWithHeaders(testHeaders)
									 .register();

				$.ajax({url: "/tests/729",
					    type: testMethod})
				.done(function(data, statusText, response) {
					mockedResponse = response;
					done();
				});
				
			});

			it("responds with the mocked text response", function() {
				expect(mockedResponse.responseText).toBe(testText);
			});

			it("responds with the mocked status", function() {
				expect(mockedResponse.status).toBe(testStatus);
			});

			it("responds with the mocked headers", function() {
				expect(mockedResponse.getResponseHeader("ContentType")).toBe("text/plain");
				expect(mockedResponse.getResponseHeader("User")).toBe("Nala");
			});
		});

		describe("when I register a regex URL with a mocked text response, " +
				 "then make an AJAX call to a URL that matches the regex", function () {
			Augmented.Service.Mock.clear();
			var testUrl =  /^\/tests\/(red|blue)$/i,
				testMethod = "PATCH",
				testText = "Bonjour Monde",
				testStatus = 202,
				testHeaders = {ContentType: "text/plain", User: "Scar"},
				mockedResponse = null;

			beforeEach(function(done) {
				Augmented.Service.Mock.clear()
				Augmented.Service.Mock.at(testUrl)
									 .on(testMethod)
									 .respondWithText(testText)
									 .respondWithStatus(testStatus)
									 .respondWithHeaders(testHeaders)
									 .register();

				$.ajax({url: "/tests/red",
					    type: testMethod})
				.done(function(data, statusText, response) {
					mockedResponse = response;
					done();
				});			
			});

			it("responds with the mocked text response", function() {
				expect(mockedResponse.responseText).toBe(testText);
			});

			it("responds with the mocked status", function() {
				expect(mockedResponse.status).toBe(testStatus);
			});

			it("responds with the mocked headers", function() {
				expect(mockedResponse.getResponseHeader("ContentType")).toBe("text/plain");
				expect(mockedResponse.getResponseHeader("User")).toBe("Scar");
			});
		});

	});
});