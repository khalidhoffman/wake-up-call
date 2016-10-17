var util = require('util'),
    _ = require('lodash'),

    request = require('request'),
    express = require('express'),
    bodyParser = require('body-parser');
/**
 *
 * @param {Object} [options]
 * @constructor
 */
function TropoDialer(options) {

    this._config = _.defaults(options, {
        port: 4000,
        maxAttempts: 10
    });

    this._conversations = {};

    this._express = express();

    this._express.use(bodyParser.json()); // for parsing application/json
    this._express.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

    this._express.get('/', function (req, res, next) {
        console.log('request received');
        res.send('Server running.');
    });

    return this;
}

TropoDialer.prototype = {
    sendError: function (req, res) {
        res.status(500);
        res.json({err: "statusId not found"});
    },

    /**
     *
     * @param req
     * @param res
     */
    wait: function (req, res) {
        var self = this;

        res.locals.attempts = 0;

        res.locals.waitId = setInterval(function () {
            console.log('waiting...');
            if (res.locals.attempts == self._config.maxAttempts) {
                clearInterval(res.locals.waitId);
                self.sendError(req, res);
            } else {
                _.forEach(self._conversations, function (conversation, sessionId) {
                    if (req.body.session.id == sessionId) {
                        res.send(conversation.tropoSession.buildAction());
                        if (conversation.onStart) conversation.onStart();
                        clearInterval(res.locals.waitId);
                    }
                });
                res.locals.attempts++;
            }
        }, 200)
    },

    /**
     *
     * @param callback
     */
    pickup: function (callback) {
        var self = this;

        this._express.use(function (req, res, next) {
            res.header('Accept', 'application/json');
            next();
        });

        this._express.get('/', function (req, res){
            res.send("Server running.");
        });

        this._express.post('/', function (req, res) {

            var conversation = self._conversations[req.body.session.id];
            if (conversation) {

                res.send(conversation.tropoSession.buildAction());
                if (conversation.onStart) conversation.onStart();
                console.log('session started');

            } else {
                self.wait(req, res);
            }
        });

        this._express.post('/action/:actionName', function (req, res) {
            console.log('req: %s', util.inspect(req.body, {colors: true}));
            var conversation = self._conversations[req.body.result.sessionId];
            if (conversation) {
                if (conversation.tropoSession.handleResponse(req.body.result)) {
                    res.send(conversation.tropoSession.buildAction());
                } else {
                    res.send({result: "All done here."});
                    conversation.onEnd();
                }
            } else {
                self.sendError(req, res);
            }
        });

        this._server = this._express.listen(this._config.port, function () {
            console.log('listening to %s', self._config.port);
            callback();
        });
    },

    hangup: function(options){
        console.log('stopping all sessions');
        this._server.close();
        if (!(options && options.keepAlive)) process.exit(0);
    },

    /**
     *
     * @param {TropoSession} tropoSession
     * @param {Function} callback
     * @param {Object} [options]
     * @param {Function} options.onStart
     */
    dial: function (tropoSession, callback, options) {
        var self = this,
            _options = _.defaults(options, {});
        tropoSession.initialize(function () {
            console.log('waiting for session (%s)', tropoSession.getId());
            self._conversations[tropoSession.getId()] = {
                onStart: _options.onStart,
                onEnd: callback,
                tropoSession: tropoSession
            }
        })
    }
};

module.exports = TropoDialer;
