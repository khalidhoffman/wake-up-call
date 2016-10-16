var util = require('util'),
    TropoSession = require('../../lib/tropo-session');

describe("TropoSession", function () {
    var testTropoSession = new TropoSession('+13522551735', {
        start: {
            message: "Hello, TADHack",
            getNextAction: function () {
                return false;
            }
        }
    });

    it("returns a properly formatted json", function () {
        testTropoSession._parseSession();
        expect(testTropoSession._instance).not.toBeUndefined();
        expect(testTropoSession._instance.token).not.toBeUndefined();
        expect(testTropoSession._instance.token.length).toEqual(88);
    });

    describe("initialize()", function () {

        it("connects to tropo successfully", function (done) {

            testTropoSession.initialize(function (err, body) {
                if (err) console.log('err: %s', util.inspect(err, {colors: true}));
                expect(body).not.toBeUndefined();
                expect(body.success).toEqual(true);
                expect(testTropoSession.getId()).not.toBeUndefined();
                expect(testTropoSession.getId()).toEqual(body.id);
                done();
            });
        })
    });

    describe("getTestTropoJSONText()", function () {
        var tropoData = testTropoSession.getTestTropoJSONText();
        it("returns a valid object", function () {
            expect(tropoData).not.toBeUndefined();
            expect(Object.keys(tropoData).length > 2).toBe(true, "tropo data should have more than 2 keys")
        })
    });

    describe('buildAction()', function () {
        var tropoData = testTropoSession.buildAction();
        it("returns a valid object", function () {
            expect(tropoData).not.toBeUndefined();
            expect(Object.keys(tropoData).length > 2).toBe(true, "tropo data should have more than 2 keys")
        })
    });

});