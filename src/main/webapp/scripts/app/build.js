({
    baseUrl: ".",
    paths: {
        backbone: "../lib/backbone-min",
        underscore: "../lib/lodash.min",
        jquery: "../lib/jquery.min",
        augmented: "../core/augmented",
        augmentedPresentation: "../presentation/augmentedPresentation",
		//augmentedLegacy: "../legacy/legacy",

		jasmine: "../lib/jasmine-2.x/jasmine",
		jasmine_html: "../lib/jasmine-2.x/jasmine-html",
		boot: "../lib/jasmine-2.x/boot",
        jasmineajax: "../lib/mock-ajax"



    },
    include: ["jasmine", "jasmine_html", "boot", "jasmineajax"],
    //, "augmentedLegacy"],
    name: "augmentedJasmineRequire",
    out: "augmentedJasmineRequire-built.js",
    optimize: "uglify2",
    preserveLicenseComments: false,
    generateSourceMaps: true,
    useStrict: true,
    wrapShim: true
})
