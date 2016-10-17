var util = require('util'),
    fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    request = require('request'),
    Tropo = require('tropo-webapi'),
    TropoBase = require('tropo-webapi/lib/base'),

    Choices = TropoBase.Choices,
    Say = TropoBase.Say;

/**
 *
 * @class TropoSession
 * @param {String} callNumber
 * @param {Object} actionMap
 * @param {Object} [options]
 * @param {Object} [options.token]
 * @param {Object} [options.fromNumber]
 * @returns {TropoSession}
 * @constructor
 */
function TropoSession(callNumber, actionMap, options) {
    var _local = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'wakeup.config.json')));
    this._instance = _.defaults(options, {
        token: _local.token,
        numberToDial: callNumber,
        fromNumber : _local.fromNumber
    });

    this._state = {
        currentAction: 'start'
    };

    this._session = false;

    this._actionMap = actionMap || {};

    this.tropo = new Tropo.TropoWebAPI();

    return this;
}

TropoSession.prototype = {

    _parseSession: function (sessionData) {
        this._session = sessionData;
    },

    /**
     *
     * @param index
     */
    getAction: function (index) {
        return this._actionMap[index];
    },

    /**
     *
     * @returns {{question: String, options: String, getNextAction: Function}|{message: String, getNextAction: Function}}
     */
    getCurrentAction : function(){
        return this.getAction(this.getCurrentActionName());
    },

    /**
     *
     * @returns {String}
     */
    getCurrentActionName : function(){
        return this._state.currentAction;
    },


    /**
     *
     * @param actionIndex
     */
    setCurrentActionTo : function(actionIndex){
        this._state.currentAction = actionIndex;
    },

    /**
     *
     * @param result
     * @returns {String|Boolean}
     */
    handleResponse : function(result){
        var currentAction = this.getCurrentAction();
        if(currentAction.getNextAction){
            var nextActionName = currentAction.getNextAction(result);
            this.setCurrentActionTo(nextActionName);
            return nextActionName;
        } else {
            return false;
        }
    },

    /**
     *
     * @returns {String} A Tropo Request String
     */
    buildAction: function () {

        var currentAction = this.getCurrentAction(),
            tropo = new Tropo.TropoWebAPI();

        if(this.getCurrentActionName() == "start") {
            // make call
            tropo.call(this._instance.numberToDial, null, null, this._instance.fromNumber);
            tropo.wait(2000);
        }

        if (currentAction.question) {
            // build question
            var options = new Choices(currentAction.options),
                question = new Say(currentAction.question);
            tropo.ask(options, null, null, 40, "awake", null, null, question, null);
        } else if (currentAction.message) {
            // build message
            tropo.say(currentAction.message)
        }

        tropo.on("continue", null, util.format("/action/%s", this.getCurrentActionName()), true);
        return Tropo.TropoJSON(tropo);
    },

    /**
     *
     * @param {Function} callback
     */
    initialize: function (callback) {
        var self = this;

        request.post({
            url: 'https://api.tropo.com/1.0/sessions',
            json: true,
            body: {
                token: this._instance.token,
                numberToDial: this._instance.numberToDial,
            }
        }, function (err, res, body) {
            // console.log('session request response: %s', util.inspect(body, {colors: true}));
            if (!err) {
                self._parseSession(body);
            }
            callback(err, body)
        });
    },

    /**
     *
     * @returns {String} A Tropo Request String
     */
    getTestTropoJSONText: function () {
        this.tropo.call(this._instance.numberToDial);
        this.tropo.say('Hello, Houston');
        return Tropo.TropoJSON(this.tropo);
    },

    /**
     *
     * @returns {String|}
     */
    getId: function () {
        return this._session.id;
    }
};

module.exports = TropoSession;
