import { Queue, Worker } from "bullmq";
import "dotenv/config";
import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import { queueJobsTotal, queueJobDuration } from "../monitoring/metrics.js";

const connection = {
    url: process.env.REDIS_URL
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

export const emailQueue = new Queue('email-queue', { connection });

const emailWorker = new Worker('email-queue', async (job) => {
    const { email } = job.data;
    const startTimer = queueJobDuration.startTimer({ queue: 'email-queue', job_name: job.name });
    logger.info({ jobId: job.id, email, jobName: job.name }, "Processing welcome email job");

    const mailOptions = {
        from: 'url short service',
        to: email,
        subject: 'مرحباً بك في URL Shortener! 🚀',
        text: `أهلاً بك، شكراً لتسجيلك في خدمتنا. نورتنا!`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        startTimer();
        queueJobsTotal.inc({ queue: 'email-queue', status: 'completed' });
        logger.info({ jobId: job.id, email, messageId: info.messageId }, "Welcome email sent successfully");
        return info;
    } catch (err) {
        startTimer();
        queueJobsTotal.inc({ queue: 'email-queue', status: 'failed' });
        logger.error({ err, jobId: job.id, email }, "Error occurred while sending welcome email");
        throw err;
    }
}, { connection });

emailWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id, jobName: job?.name }, "BullMQ worker job failed");
});

emailWorker.on('error', (err) => {
    logger.error({ err }, "BullMQ worker connection error");
});