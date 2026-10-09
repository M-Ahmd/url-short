import express from 'express'
import auth from './src/routes/auth.routes.js'
import urlRouter from './src/routes/url.routes.js'
import redisClient from './src/config/redis.config.js'

const app = express()

app.use(express.json())

app.use('/auth', auth)
app.use('/url', urlRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
        message: "failed",
        error: err.message || "Internal Server Error"
    });
})

const PORT = 3000

const server = app.listen(PORT, () => {
    console.log(`the app is listening on the port ${PORT}`)
})

const gracefulShutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close(async () => {
        try {
            await redisClient.disconnect();
            console.log('Redis disconnected.');
        } catch (err) {
            console.error('Error disconnecting Redis:', err);
        }
        process.exit(0);
    });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

