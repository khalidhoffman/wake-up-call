var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter');

var jrunner = new Jasmine();
jrunner.addReporter(new SpecReporter({
    displayStacktrace: true
}));
jrunner.loadConfigFile("spec/support/jasmine.json");    // load jasmine.json configuration
jrunner.execute();
