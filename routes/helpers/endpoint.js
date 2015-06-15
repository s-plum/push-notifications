/*
 * Parse device registration ID from the endpoint sent from the browser
 */

module.exports = {
    getRegistrationId: function(endpoint) {
        var registrationId = null;
        if (endpoint && endpoint.indexOf(process.env.GCM_URL) >= 0) {
            endpointParts = endpoint.split('/');
            registrationId = endpointParts[endpointParts.length - 1];
        }
        return registrationId;
    }
};