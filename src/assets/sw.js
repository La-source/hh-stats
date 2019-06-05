
self.addEventListener("activate", () => {

});

self.addEventListener("push", function(event) {
    if ( !event.data ) {
        return;
    }

    const data = JSON.parse(event.data.text());

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: "https://hh.hh-content.com/pictures/design/normal_circular_logo.png",
    });
});
