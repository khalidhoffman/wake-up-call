# Wake Up Call

## About
This ia a quick project whipped up for [TAD Hackathon](http://tadhack.com/2016/global/Orlando). 
It utilizes [Tropo's Voice API](https://www.tropo.com/) to place phone calls.
The idea is to create automated wake up call alarm service that interacts with the recipient to provide
a more personal and effective method of waking up.

## Installation
1. run `npm install`
2. create a json file named `wakeup.config.json`. This file should resemble:
```
{
  "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```
- `token` being your Tropo voice app key

## Example Usage

```
var TropoDialer = require('./lib/tropo-dialer'),
    TropoSession = require('./lib/tropo-session'),


    testTropoDialer = new TropoDialer(),
    testTropoSession = new TropoSession('+15551230987', {
        // logic can be assigned here with a map like object
        start: {
            question: 'Good morning. Are you awake?',
            options: "yes, no, tired",
            getNextAction: function (result) {
                switch (result.actions.value) {
                    // return values are used to execute the next action
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
            message: 'Then wake up!'
        },
        inspirational: {
            message: "Remember the early bird gets the worm"
        }
    });



testTropoDialer.pickup(function(){
    testTropoDialer.dial(testTropoSession, function(){
        console.log('session complete');
        testTropoDialer.hangup();
    })
});
```

### More
`TropoSession` takes a logic object map which can be used to handle the conversation.
Each root member of the logic map specifies an action.
Actions can either be a question or message. 
Question objects must follow the structure:
```
{
    question: "A string consisting of the question to pose",
    options: "A, string, of, comma, separated, options", // Tropo suggests use of single words
    getNextAction: "A function that accepts the recipients response and returns the name of the next action"
}
```
- Returning false on getNextAction ends the conversation.

Messages must simply have one field: `message`. Ex:
```
{
    message: "A string to read to the recipient"
}
```
