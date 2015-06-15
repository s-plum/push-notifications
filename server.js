//get environment variables
require('dotenv').load();

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    request = require('request');

app.use(bodyParser.json());
app.use(express.static('dist'));

//read service worker id from the push trigger
app.post('/push', function(req, res) {
    console.log(req.body);
    var registrationId = req.body.endpoint;

    if (!registrationId) {
        console.log('no endpoint received');
        res.sendStatus(500);
    }
    if (registrationId.indexOf(process.env.GCM_URL) >= 0) {
        endpointParts = registrationId.split('/');
        registrationId = endpointParts[endpointParts.length - 1];
    }

    request.post(process.env.GCM_URL, {
        json: {
            registration_ids: [registrationId]
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=' + process.env.API_KEY
        }
    }, function(error, response, body) {
        console.log('error ' + error);
        console.log(response);
        console.log(body);
    });

});

app.listen(3000, function() {
    console.log('Express app listening on port 3000');
});