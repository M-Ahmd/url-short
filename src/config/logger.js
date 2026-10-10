import pino from "pino";
import "dotenv/config";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "body.password",
            "password",
            "token"
        ],
        censor: "[REDACTED]"
    },
    transport: isDev
        ? {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
                  ignore: "pid,hostname"
              }
          }
        : undefined,
    base: {
        service: "url-shortener-api",
        env: process.env.NODE_ENV || "development"
    }
});

export default logger;
