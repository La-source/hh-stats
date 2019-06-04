
(function() {
    function getCookieValue(a) {
        const b = document.cookie.match("(^|[^;]+)\\s*" + a + "\\s*=\\s*([^;]+)");
        return b ? b.pop() : "";
    }

    async function getWorkerActive(workerRegistration) {
        while ( !workerRegistration.active ) {
            await new Promise(resolve => setTimeout(resolve, 5));
        }

        return workerRegistration.active;
    }

    function requestNotification() {
        if ( Notification.permission === "default" ) {
            window.Notification.requestPermission()
                .then(permission => {
                    if ( permission !== "granted" ) {
                        return;
                    }

                    navigator.serviceWorker.register("sw.js")
                        .then(getWorkerActive)
                        .then(worker => {
                            worker.postMessage({
                                type: "register",
                                memberGuid: getCookieValue("member_guid"),
                            });
                        })
                        .catch(e => console.error("Error when register service worker", e))
                    ;
                })
                .catch(e => console.error("Error when request permission notification", e))
            ;
        }
    }

    if ( !("serviceWorker" in navigator && "PushManager" in window) ) {
        console.error("Unable use push notification");
    } else {
        $("#personal_forms select.notif").on("selectric-change", function() {
            requestNotification();
        });
    }
})();
