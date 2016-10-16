var TropoDialer = require('./lib/tropo-dialer'),
    TropoSession = require('./lib/tropo-session'),

    testTropoDialer = new TropoDialer();


/**
 *
 * @param {String} number
 * @param {Function} callback
 * @param {Object} [options]
 * @param {Boolean} [options.keepAlive=false]
 */
module.exports = function (number, callback, options) {

    var testTropoSession = new TropoSession(number, {
        start: {
            question: 'Good morning. Are you awake?',
            options: "yes, no, tired",
            getNextAction: function (result) {
                switch (result.actions.value) {
                    case 'yes':
                        return false;
                    case 'tired':
                        return 'inspirational';
                    case 'no' :
                    default:
                        return 'notAwake';
                        break;
                }
            }
        },
        notAwake: {
            message: 'Then wake up!',
            getNextAction: function () {
                return false
            }
        },
        inspirational: {
            message: "Remember the early bird gets the worm",
            getNextAction: function () {
                return false
            }
        }
    });

    testTropoDialer.pickup(function () {
        testTropoDialer.dial(testTropoSession, function () {
            console.log('session complete');
            callback();
            testTropoDialer.hangup(options);
        })
    });
};
