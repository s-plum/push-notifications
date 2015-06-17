var request = require('browser-request'),
    pushSubscription, //store push subscription here for unsubscribe
    buttonText = {
      active: 'Push it real good',
      inactive: 'Open a new tab and wait 5 seconds'
    };

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
};

document.addEventListener('WebComponentsReady', function() {
  var ppm = document.querySelector('platinum-push-messaging');
  var toggle = document.getElementById('notification-toggle');
  var button = document.getElementById('push-controls');

  toggle.disabled = !ppm.supported;


  toggle.addEventListener('change', function() {
    if (toggle.checked) {
      ppm.enable();
    } else {
      ppm.disable();
    }
  });


  ppm.addEventListener('enabled-changed', function(event) {
    toggle.checked = ppm.enabled;
    button.disabled = !ppm.enabled;

    //store subscription so we can unsubscribe on change
    if (ppm.subscription) {
      pushSubscription = ppm.subscription;
    }

    var postUrl = ppm.enabled ? '/subscribe' : '/unsubscribe';

    //update database with subscription id
      request({ 
          url: postUrl,
          body: {
              endpoint: getEndpoint(pushSubscription)
          },
          json: true,
          method: 'POST'
      }, function(error, response, body) {
          if (error) {
              console.error('Error when changing device registration ', error);
          }
      });
  });

  button.addEventListener('click', function() {
    this.disabled = true;
    this.textContent = buttonText.inactive;
    this.style.opacity = 1;

    setTimeout(function() {
      request({
            url: '/push',
            method: 'POST'
        }, function(error, response, body) {
            if (error) {
                console.warn('Error when sending push trigger ' + error);
                return;
            }
            else {
                console.log('Request to send push notification has been sent successfully');
            }
            button.disabled = false;
            button.textContent = buttonText.active;
        });
    }, 5000);
  });
});