'use strict';

self.addEventListener('push', function(event) {
    console.log('Received a push event', event);

    var title = 'Push it real good';
    var body = 'Ooh baby baby, baby, baby...';
    var icon = '/img/icon.png';
    var tag = 'plumbot';

    self.registration.showNotification(title, {
        body: body,
        icon: icon,
        tag: tag
    });
});

self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event);

    event.waitUntil(clients.openWindow('https://www.youtube.com/watch?v=vCadcBR95oU'));
});