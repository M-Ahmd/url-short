import express from 'express';
import auth from './src/routes/auth.routes.js';
import urlRouter from './src/routes/url.routes.js';
import monitoringRouter from './src/routes/monitoring.routes.js';
import redisClient from './src/config/redis.config.js';
import prisma from './src/config/prisma.config.js';
import logger from './src/config/logger.js';
import { httpLogger, requestIdMiddleware } from './src/middleware/logger.middleware.js';
import { metricsMiddleware } from './src/middleware/metrics.middleware.js';
import { closeEmailWorker } from './src/jobs/email.job.js';

const app = express();

// 1. Correlation ID & HTTP Logging Middleware
app.use(requestIdMiddleware);
app.use(httpLogger);

// 2. Metrics Tracking Middleware
app.use(metricsMiddleware);

// 3. Body Parser
app.use(express.json());

// 4. Monitoring & Health Endpoints (/health/live, /health/ready, /metrics)
app.use('/', monitoringRouter);

// 5. Business Domain Routes
app.use('/auth', auth);
app.use('/url', urlRouter);

// 6. Centralized Error Handler with Structured Logging
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const reqLogger = req.log || logger;

    reqLogger.error(
        {
            err,
            statusCode,
            requestId: req.id,
            userId: req.user?.id,
            url: req.originalUrl,
            method: req.method
        },
        err.message || 'Unhandled request error'
    );

    res.status(statusCode).json({
        message: 'failed',
        error: err.message || 'Internal Server Error',
        requestId: req.id
    });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, `Application started and listening on port ${PORT}`);
});

let isShuttingDown = false;
const SHUTDOWN_TIMEOUT_MS = 10000;

const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
        logger.warn({ signal }, 'Shutdown already in progress. Ignoring duplicate signal.');
        return;
    }
    isShuttingDown = true;
    logger.info({ signal }, `Received ${signal}. Starting graceful shutdown sequence...`);

    // Force exit timer if graceful termination hangs beyond threshold
    const forceExitTimer = setTimeout(() => {
        logger.fatal(`Graceful shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms. Forcing process exit.`);
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimer.unref();

    try {
        // 1. Stop accepting new HTTP requests and close idle keep-alive connections
        await new Promise((resolve) => {
            if (typeof server.closeIdleConnections === 'function') {
                server.closeIdleConnections();
            }
            server.close((err) => {
                if (err) {
                    logger.error({ err }, 'Error closing HTTP server');
                } else {
                    logger.info('HTTP server closed. In-flight requests completed.');
                }
                resolve();
            });
        });

        // 2. Gracefully stop BullMQ worker and queue (finish active jobs, stop polling)
        await closeEmailWorker();

        // 3. Gracefully close Redis client
        try {
            await redisClient.quit();
            logger.info('Redis client disconnected gracefully.');
        } catch (err) {
            logger.warn({ err }, 'Error while quitting Redis client, calling disconnect');
            try {
                await redisClient.disconnect();
            } catch (disconnectErr) {
                logger.error({ err: disconnectErr }, 'Error forcing Redis disconnect');
            }
        }

        // 4. Disconnect Prisma connection pool
        try {
            await prisma.$disconnect();
            logger.info('Prisma database client disconnected.');
        } catch (err) {
            logger.error({ err }, 'Error disconnecting Prisma database client');
        }

        clearTimeout(forceExitTimer);
        logger.info('Graceful shutdown completed successfully.');

        if (signal === 'SIGUSR2') {
            process.kill(process.pid, 'SIGUSR2');
        } else {
            process.exit(0);
        }
    } catch (err) {
        clearTimeout(forceExitTimer);
        logger.fatal({ err }, 'Error during graceful shutdown sequence. Forcing process exit.');
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception detected');
    process.exit(1);
});

