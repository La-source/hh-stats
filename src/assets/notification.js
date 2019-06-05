
(function() {
    /**
     * Renvoie la valeur d'un cookie
     * @param a
     * @returns {any}
     */
    function getCookieValue(a) {
        const b = document.cookie.match("(^|[^;]+)\\s*" + a + "\\s*=\\s*([^;]+)");
        return b ? b.pop() : "";
    }

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

    /**
     * Enregistre le service worker dans le navigateur
     * @returns {Promise<never>|Promise<ServiceWorkerRegistration>}
     */
    function registerServiceWorker() {
        if ( !("serviceWorker" in navigator) ) {
            return Promise.reject("Service Worker is not supported");
        }

        return navigator.serviceWorker.register("sw.js");
    }

    /**
     * Récupère la clé publique
     * @returns {Promise<T | never>}
     */
    function getVapidKey() {
        return fetch("_vapidKey")
            .then(response => response.text())
    }

    function registerPushManager(vapidKey) {
        return navigator.serviceWorker.ready.then(serviceWorkerRegistration =>
            serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlB64ToUint8Array(vapidKey),
            }));
    }

    function registerSubscription(subscription) {
        return fetch(`/_notification?memberGuid=${getCookieValue("member_guid")}`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
        });
    }

    function requestNotificationPermission() {
        function resultPermission(permission) {
            return permission === "granted" ? Promise.resolve() : Promise.reject("no permission");
        }

        alert(Notification.permission);

        if ( Notification.permission !== "default" ) {
            return resultPermission(Notification.permission);
        }

        return window.Notification.requestPermission().then(resultPermission);
    }

    $("#notification").on("click", function() {
        requestNotificationPermission()
            .then(registerServiceWorker)
            .then(getVapidKey)
            .then(registerPushManager)
            .then(registerSubscription)
            .then(() => console.log("end"))
            .catch(console.error)
        ;
    });
})();
