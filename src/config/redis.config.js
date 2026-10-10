import { createClient } from "redis";
import "dotenv/config";

import logger from "./logger.js";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  logger.error({ err }, "Redis Client Error");
});

client.on("connect", () => {
  logger.info("Redis connected successfully");
});

await client.connect();

export default client;