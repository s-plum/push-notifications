var mongoose = require('mongoose'),
    Device = mongoose.model('Device'),
    endpoint = require('./helpers/endpoint');

module.exports = function(req, res) {
    if (!req.body.endpoint) {
        console.log('no endpoint received');
        return res.status(500).send({ error: 'No endpoint received.' });
    }

    var registrationId = endpoint.getRegistrationId(req.body.endpoint);

    Device.findOne({ registrationId: registrationId }).remove(function(error, device) {
        if (error) {
            return res.status(500).send({ error: error });
        }
        return res.send({ error: null });
    });
};