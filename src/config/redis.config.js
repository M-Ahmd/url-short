import { createClient } from "redis";
import "dotenv/config";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("connect", () => {
  console.log("Redis connected successfully");
});

await client.connect();

export default client;