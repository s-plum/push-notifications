'use strict';

var ui = require('./ui-switch'),
    request = require('browser-request');

var onPushSubscription = function(pushSubscription) {
    console.log('push subscription endpoint = ' + pushSubscription.endpoint);

    ui.enable();
    ui.button.disabled = false;

    //enable the button that will send trigger to server to send push subscription
    ui.button.onclick = function(e) {
        e.preventDefault();

        var endpoint = pushSubscription.endpoint;

        //handle legacy push subscription
        if ('subscriptionId' in pushSubscription) {
            if (!endpoint.includes(pushSubscription.subscriptionId)) {
                endpoint += '/' + pushSubscription.subscriptionId;
            }
        }

        request({
            url: '/push',
            body: {
                endpoint: endpoint
            },
            json: true,
            method: 'POST'
        }, function(error, response, body) {
            if (error) {
                console.warn('Error when sending push trigger ' + error);
            }
            else {
                console.log(body);
            }
        });
    }
};

module.exports = {
    onPushSubscription: onPushSubscription,
    subscribe: function() {
        console.log('subscribing...');

        //disable switch while permissions are processed
        ui.toggle.disabled = true;

        //get the service worker registration so we can access the push manager
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
                .then(onPushSubscription)
                .catch(function(e) {
                    console.log('Error in onPushSubscription');
                    //check for a permission prompt issue
                    if ('permissions' in navigator) {
                        navigator.permissions.query({name: 'push', userVisibleOnly: true})
                            .then(function(permissionStatus) {
                                console.log('Subscribe error: push permission status is ' + permissionStatus.status);
                                ui.uncheck();
                                if (permissionStatus.status === 'denied') {
                                    //the user has blocked the permission prompt
                                    console.warn('Push notifications are blocked');
                                }
                                else if (permissionStatus === 'prompt') {
                                    //the user didn't accept the permission prompt
                                    console.log('User did not accept permission status prompt');
                                    ui.enable();
                                    return;
                                }
                                else {
                                    console.warn('Push could not register. Error message: ' + e.message);
                                    ui.uncheck();
                                    ui.enable();
                                }
                            })
                            .catch(function(err) {
                                console.warn('Push could not register. Error message: ' + err.message);
                                    ui.uncheck();
                                    ui.enable();
                            })
                    }
                    else {
                        if (Notification.permission === 'denied') {
                            console.warn('Notifications are blocked');
                            ui.disable();
                        }
                        else {
                            console.warn('Push could not register. Error message: ' + e.message);
                        }
                        ui.uncheck();
                    }
                });
        });
    },
    unsubscribe: function() {
        console.log('unsubscribing...');

        //disable switch while we process permissions

        ui.toggle.diabled = true;

        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.getSubscription().then(
                function(pushSubscription) {
                    //check we have everything we need to subscribe
                    if (!pushSubscription) {
                        //no subscription
                        console.log('No push subscription to unsubscribe');
                        ui.enable();
                        ui.uncheck();
                        return;
                    }

                    //TODO - remove device details from server
                    pushSubscription.unsubscribe().then(function(successful) {
                        console.log('unsubscribed from push: ' + successful);
                        if (!successful) {
                            console.error('unable to unregister from push');
                        }
                        ui.enable();
                    })
                    .catch(function(e) {
                        console.log('Unsubscription error: ' + e);
                        ui.enable();
                        ui.check();
                    });
                }.bind(this)).catch(function(e) {
                    console.error('Error thrown while revoking push notifications: ' + e);
                });
        })
    }
};