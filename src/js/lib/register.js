'use strict';

var ui = require('./ui-switch'),
    request = require('browser-request');


/*
 * @function getEndpoint -> returns endpoint for sending back to web service, with handling for legacy implementations of the push API
 * @param pushSubscription {object} -> the push subscription object
 */
var getEndpoint = function(pushSubscription) {
    //get the endpoint with subscription ID to send back to the service
    var endpoint = pushSubscription.endpoint;

    //handle legacy push subscription
    if ('subscriptionId' in pushSubscription) {
        if (!endpoint.includes(pushSubscription.subscriptionId)) {
            endpoint += '/' + pushSubscription.subscriptionId;
        }
    }
    return endpoint;
}

var onPushSubscription = function(pushSubscription) {
    console.log('push subscription endpoint = ' + pushSubscription.endpoint);

    var endpoint = getEndpoint(pushSubscription);

    //register the device with the subscription service
    request({ 
        url: '/subscribe',
        body: {
            endpoint: endpoint
        },
        json: true,
        method: 'POST'
    }, function(error, response, body) {
        if (error) {
            console.error('Error when registering device ', error);
        }
    })

    ui.enable();
    ui.button.disabled = false;

    //enable the button that will send trigger to server to send push subscription for the demo
    ui.button.onclick = function(e) {
        e.preventDefault();

        request({
            url: '/push',
            method: 'POST'
        }, function(error, response, body) {
            if (error) {
                console.warn('Error when sending push trigger ' + error);
            }
            else {
                console.log('Request to send push notification has been sent successfully');
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

                    //remove device from server
                    request({
                        url: '/unsubscribe',
                        body: {
                            endpoint: getEndpoint(pushSubscription)
                        },
                        json: true,
                        method: 'POST'
                    }, function(error, response, body) {
                        if (error) {
                            console.error('Error unsubscribing from server ', error);
                            ui.enable();
                            ui.check();
                        }
                        else {
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
                        }
                    });
                }.bind(this)).catch(function(e) {
                    console.error('Error thrown while revoking push notifications: ' + e);
                });
        })
    }
};