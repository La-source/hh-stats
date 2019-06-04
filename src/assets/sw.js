
let memberGuid;
let isRegister;
let vapidKey;

/**
 * Convert public VAPID key to buffer
 * @param base64String
 * @returns {Uint8Array}
 */
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function register() {
    if ( !memberGuid || isRegister || !vapidKey ) {
        return Promise.resolve();
    }

    return self.registration.pushManager
        .subscribe({
            applicationServerKey: urlB64ToUint8Array(vapidKey),
            userVisibleOnly: true,
        })
        .then(subscription => fetch(`/_notification?memberGuid=${memberGuid}`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
        }))
        .then(() => isRegister = true)
    ;
}

self.addEventListener("activate", () => {
    register();
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

self.addEventListener("message", message => {
    if ( message.data.type === "register" ) {
        memberGuid = message.data.memberGuid;
        register();
    }
});


fetch("_vapidKey")
    .then(response => response.text())
    .then(response => vapidKey = response)
    .then(() => register())
    .catch(e => console.error("Unable fetch vapidKey", e));
