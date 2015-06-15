var mongoose = require('mongoose'),
    Device = mongoose.model('Device'),
    endpoint = require('./helpers/endpoint');

module.exports = function(req, res) {
    if (!req.body.endpoint) {
        console.log('no endpoint received');
        return res.status(500).send({ error: 'No endpoint received.' });
    }

    var registrationId = endpoint.getRegistrationId(req.body.endpoint);

    //see if this device is already subscribed
    Device.findOne({ registrationId: registrationId }, function(err, device) {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: err });
        }

        //device is already subscribed
        if (device) {
            return res.send({ error: null });
        }

        //device is not subscribed, create new entry
        else {
            var newDevice = new Device({
                registrationId: registrationId
            });

            newDevice.save(function(err, d) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ error: err });
                }
                return res.send({ error: null });
            });
        }
    });
};