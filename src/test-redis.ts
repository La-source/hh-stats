import {createClient} from "redis";

const testRedis = createClient(process.env.REDIS);

testRedis.set("key", "value!", "EX", 3, () => {
    testRedis.get("key", (_err, val) => console.log(val));

    setTimeout(() => {
        testRedis.get("key", (_err, val) => console.log(val));
    }, 5000);
});
