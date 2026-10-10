import { Router } from "express";
import { client } from "../monitoring/metrics.js";
import redisClient from "../config/redis.config.js";
import prisma from "../config/prisma.config.js";

const router = Router();

// Liveness probe: verifies the node process is alive and responsive
router.get("/health/live", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Readiness probe: verifies connections to critical backends (PostgreSQL & Redis)
router.get("/health/ready", async (req, res) => {
    const checks = {
        database: { status: "unknown" },
        redis: { status: "unknown" }
    };
    let isReady = true;

    // Check Database connection
    try {
        const start = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        checks.database = {
            status: "healthy",
            latencyMs: Math.round(performance.now() - start)
        };
    } catch (err) {
        isReady = false;
        checks.database = {
            status: "unhealthy",
            error: err.message
        };
    }

    // Check Redis connection
    try {
        const start = performance.now();
        const pingResponse = await redisClient.ping();
        if (pingResponse === "PONG") {
            checks.redis = {
                status: "healthy",
                latencyMs: Math.round(performance.now() - start)
            };
        } else {
            isReady = false;
            checks.redis = { status: "unhealthy", response: pingResponse };
        }
    } catch (err) {
        isReady = false;
        checks.redis = {
            status: "unhealthy",
            error: err.message
        };
    }

    const statusCode = isReady ? 200 : 503;
    res.status(statusCode).json({
        status: isReady ? "ready" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        dependencies: checks
    });
});

// Prometheus metrics endpoint
router.get("/metrics", async (req, res) => {
    try {
        res.setHeader("Content-Type", client.register.contentType);
        const metrics = await client.register.metrics();
        res.send(metrics);
    } catch (err) {
        res.status(500).send(`Error collecting metrics: ${err.message}`);
    }
});

export default router;
