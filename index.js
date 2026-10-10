import express from 'express';
import auth from './src/routes/auth.routes.js';
import urlRouter from './src/routes/url.routes.js';
import monitoringRouter from './src/routes/monitoring.routes.js';
import redisClient from './src/config/redis.config.js';
import prisma from './src/config/prisma.config.js';
import logger from './src/config/logger.js';
import { httpLogger, requestIdMiddleware } from './src/middleware/logger.middleware.js';
import { metricsMiddleware } from './src/middleware/metrics.middleware.js';
import './src/jobs/email.job.js';

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

const gracefulShutdown = async (signal) => {
    logger.info({ signal }, 'Received shutdown signal. Closing application gracefully...');
    server.close(async () => {
        try {
            await redisClient.disconnect();
            logger.info('Redis client disconnected.');
        } catch (err) {
            logger.error({ err }, 'Error disconnecting Redis client');
        }

        try {
            await prisma.$disconnect();
            logger.info('Prisma database client disconnected.');
        } catch (err) {
            logger.error({ err }, 'Error disconnecting Prisma client');
        }

        process.exit(0);
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception detected');
    process.exit(1);
});
