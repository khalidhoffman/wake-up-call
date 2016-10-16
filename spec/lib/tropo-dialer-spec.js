var TropoDialer = require('../../lib/tropo-dialer');

describe("tropo-dialer", function () {

    var testTropoDialer = new TropoDialer();

    describe('pickup()', function () {

        it('runs a callback when session start', function (done) {
            testTropoDialer.pickup(function () {
                done();
            })
        });
    });

});