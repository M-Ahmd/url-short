import { httpRequestDuration } from "../monitoring/metrics.js";

export const metricsMiddleware = (req, res, next) => {
    // Avoid tracking the metrics endpoint itself
    if (req.path === "/metrics" || req.path.startsWith("/health")) {
        return next();
    }

    const endTimer = httpRequestDuration.startTimer();

    res.on("finish", () => {
        // Resolve parameterized route path (or fallback to req.path/req.baseUrl)
        const route = req.route ? `${req.baseUrl || ""}${req.route.path}` : (req.baseUrl || req.path);
        endTimer({
            method: req.method,
            route: route || "unknown",
            status_code: res.statusCode
        });
    });

    next();
};
