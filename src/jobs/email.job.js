import { Queue, Worker } from "bullmq";//import queue and worker
import  "dotenv/config";
import nodemailer from "nodemailer";

const connection = {
    url: process.env.REDIS_URL
};//the connection defination

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

//emailQueue that will put data into it in service  (name, connectionObject)
export const emailQueue = new Queue('email-queue', { connection });

//emailworker the worker that pop from queue (name, processor function, {connection object})
const emailWorker = new Worker('email-queue', async (job) => {
    const { email} = job.data;
    console.log(`sending welcome email to ${email} `);


    const mailOptions = {
        from: 'url short service',
        to: email,
        subject: 'مرحباً بك في URL Shortener! 🚀',
        text: `أهلاً يا ، شكراً لتسجيلك في خدمتنا. نورتنا!`,
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`[Worker] ✅ تم إرسال الإيميل بنجاح لـ !`);
}, { connection });
emailWorker.on('failed', (job, err) => {
    console.log(`[Worker] ❌ فشل إرسال الإيميل: ${err.message}`);
})