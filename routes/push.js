var mongoose = require('mongoose'),
    Device = mongoose.model('Device'),
    request = require('request');

module.exports = function(req, res) {
    //get all devices
    Device.find().exec(function(err, devices) {
        if (err) {
            return res.status(500).send({error: error});
        }
        if (devices.length === 0) {
            return res.send({error: null, status: 'No registered devices'});
        }

        //parse returned documents to return just an array of ids
        var registrationIds = devices.map(function(device) {
            return device.registrationId;
        });

        request.post(process.env.GCM_URL, {
            json: {
                registration_ids: registrationIds
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=' + process.env.API_KEY
            }
        }, function(error, response, body) {
            if (error) {
                return res.status(500).send({error: error});
            }
            return res.send({ error: null });
        });
    });
};