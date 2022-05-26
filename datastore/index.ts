import { promisify } from "util";
import redis from "redis";

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
});

export const get = promisify(client.get).bind(client);
export const set = promisify(client.set).bind(client);
export const del = promisify(client.del).bind(client);

client.on("error", (err) => console.error(err));
client.on("reconnecting", (_) => console.log("datastore reconnecting..."));
client.on("end", (_) => console.log("datastore killed."));
