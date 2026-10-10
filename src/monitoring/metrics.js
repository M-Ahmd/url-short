import client from "prom-client";

// Collect standard Node.js runtime and OS metrics (heap, event loop lag, CPU, etc.)
client.collectDefaultMetrics({
    prefix: "url_short_",
    timeout: 5000
});

// HTTP Request Duration Histogram (RED Method: Rate, Errors, Duration)
export const httpRequestDuration = new client.Histogram({
    name: "url_short_http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

// Cache Performance Counter (Hit vs Miss)
export const cacheOperations = new client.Counter({
    name: "url_short_cache_operations_total",
    help: "Total count of cache hits and misses",
    labelNames: ["operation", "result"] // result: "hit" | "miss"
});

// URL Shortening Business Metrics
export const urlsCreatedTotal = new client.Counter({
    name: "url_short_urls_created_total",
    help: "Total number of shortened URLs generated"
});

export const urlClicksTotal = new client.Counter({
    name: "url_short_url_clicks_total",
    help: "Total number of shortened URL redirections"
});

// BullMQ Queue & Worker Metrics
export const queueJobsTotal = new client.Counter({
    name: "url_short_queue_jobs_total",
    help: "Total number of BullMQ background jobs processed",
    labelNames: ["queue", "status"] // status: "completed" | "failed"
});

export const queueJobDuration = new client.Histogram({
    name: "url_short_queue_job_duration_seconds",
    help: "Duration of BullMQ background jobs in seconds",
    labelNames: ["queue", "job_name"],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10]
});

export { client };
