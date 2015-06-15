//get environment variables
require('dotenv').load();

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(express.static('dist'));

//connect to DB
mongoose.connect('mongodb://localhost/push-notifications');

require('./models');

var routes = require('./routes');

//read service worker id from the push trigger
app.post('/push', routes.push);
app.post('/unsubscribe', routes.unsubscribe);
app.post('/subscribe', routes.subscribe);

app.listen(3000, function() {
    console.log('Express app listening on port 3000');
});