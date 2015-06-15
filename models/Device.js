var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Device = new Schema({
    registrationId: String
});

mongoose.model('Device', Device);