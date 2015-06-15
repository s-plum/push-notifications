'use strict';

var register = require('./lib/register');
var permissionSetup = require('./lib/permission-setup');
var ui = require('./lib/ui-switch');

ui.toggle.addEventListener('change', function(e) {
    if (e.target.checked) {
        register.subscribe();
    }
    else {
        register.unsubscribe();
        ui.button.disabled = true;
    }
});

// check that service workers are supported
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('plum-service-worker.js', {
        scope: '/'
    })
    .then(function() {
        //check if push messaging is supported
        if (!('PushManager' in window)) {
            console.warn('Push is not supported.');
            return;
        }

        //check if Permissions API is supported
        if ('permissions' in navigator) {
            permissionSetup.push();
        }
        else {
            permissionSetup.notification();
        }
    });
}
else {
    console.warn('Service workers are not supported in this browser');
}