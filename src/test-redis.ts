import {createClient} from "redis";

const client = createClient(process.env.REDIS);

client.set("key", "value!", "EX", 3, () => {
    client.get("key", (_err, val) => console.log(val));

    setTimeout(() => {
        client.get("key", (_err, val) => console.log(val));
    }, 5000);
});

client.send_command("config", ["set", "notify-keyspace-events", "Ex", (_err, _event) => {
    console.log(_err, _event);
    const sub = createClient(process.env.REDIS);

    sub.subscribe("__keyevent@0__:expired", () => {
        console.log("subscribe");

        sub.on("message", (_channel, msg) => {
            console.log("event", msg);
        });

        client.set("a", "b");
        client.expire("a", 1);
    });
}]);
