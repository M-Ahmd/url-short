import pinoHttp from "pino-http";
import crypto from "crypto";
import logger from "../config/logger.js";

export const httpLogger = pinoHttp({
    logger,
    genReqId: (req) => {
        const existingId = req.headers["x-request-id"];
        if (existingId) return existingId;
        const newId = crypto.randomUUID();
        return newId;
    },
    customProps: (req) => {
        return {
            userId: req.user?.id || undefined,
            requestId: req.id
        };
    },
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    }
});

// Middleware to ensure X-Request-Id header is added to the HTTP response
export const requestIdMiddleware = (req, res, next) => {
    if (req.id) {
        res.setHeader("X-Request-Id", req.id);
    }
    next();
};
