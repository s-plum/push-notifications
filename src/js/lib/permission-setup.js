'use strict';

var ui = require('./ui-switch'),
    register = require('./register');

function permissionStatusChange(permissionStatus) {
    console.log('permission status change');
    console.log('current permission status: ' + permissionStatus.status);
    switch(permissionStatus.status) {
        case 'denied':
            console.warn('User has permanently blocked push');
            ui.disable();
            ui.uncheck();
            break;
        case 'granted':
            ui.enable();
            break;
        case 'prompt':
            ui.enable();
            ui.uncheck();
            break;
    }
}

module.exports = {
    push: function() {
        console.log('setting up push permission');
        navigator.permissions.query({name: 'push', userVisibleOnly: true})
            .then(function(permissionStatus) {
                //set the initial state
                permissionStatusChange(permissionStatus);

                permissionStatus.onchange = function() {
                    permissionStatusChange(this);
                };

                //check if push is supported and what the current state is
                navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                    //check if we already have a push subscription
                    serviceWorkerRegistration.pushManager.getSubscription()
                        .then(function(subscription) {
                            if (!subscription) {
                                console.log('No subscription.');
                                return;
                            }

                            //set the initial state of the push switch
                            ui.check();

                            //update current state with the subscriptionid and endpoint
                            register.onPushSubscription(subscription);
                        })
                        .catch(function(e) {
                            console.log('An error occurred while calling getSubscription()', e);
                        });
                })
            })
            .catch(function(err) {
                console.error(err);
                console.warn('Permissions for push notifications could not be checked');
            });
    },
    notification: function() {
        console.log('setting up notification permission');

        if (Notification.permission === 'denied') {
            console.warn('Notifications are blocked');
            return;
        }
        else if (Notification.permission === 'default') {
            ui.uncheck();
            ui.enable();
            return;
        }

        // check if push is supported and what the current state is
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            //check if we have a subscription already
            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function(subscription) {
                    if (!subscription) {
                        console.log('No subscription');
                        ui.uncheck();
                        ui.enable();
                        return;
                    }

                    ui.check();

                    register.onPushSubscription(subscription);
                })
                .catch(function(e) {
                    console.log('An error occurred while calling getSubscription()', e);
                });

        })
    }
};