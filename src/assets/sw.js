
self.addEventListener("install", function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function(event) {
    if ( !event.data ) {
        return;
    }

    const notification = event.data.json();

    event.waitUntil(
        self.registration.showNotification(notification.title, Object.assign({
            badge: "logo_monochrome.png",
            icon: "https://hh.hh-content.com/pictures/design/normal_circular_logo.png",
        }, notification))
    );
});

self.addEventListener("notificationclick", function(event) {
    event.notification.close();

    if ( !event.notification.data ) {
        return;
    }

    event.waitUntil(
        clients
            .matchAll({
                type: "window",
            })
            .then(result => {
                console.log(result);
                const client = result.find(_client => _client.visibilityState === "visible");

                if ( client ) {
                    return client.navigate(event.notification.data.target)
                        .then(() => client.focus());
                } else {
                    return clients.openWindow(event.notification.data.target);
                }
            })
            .catch(() => {})
    );
});
