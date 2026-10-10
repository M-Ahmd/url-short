import urlRepository from "../repository/url.repository.js";
import crypto from 'crypto';
import redisClient from '../config/redis.config.js';
import logger from '../config/logger.js';
import { cacheOperations, urlsCreatedTotal, urlClicksTotal } from '../monitoring/metrics.js';

export class UrlSerivce {
    async createUrl(originalUrl, userId) {
        if(!originalUrl) throw new Error("the url is empty");
        const shortCode = crypto.randomBytes(3).toString('hex');
        const result = await urlRepository.createUrl(originalUrl, shortCode, userId);
        urlsCreatedTotal.inc();
        logger.info({ userId, shortCode }, "Short URL created successfully");
        return result;
    }
    async getUrl(shortCode)
    {
        if(!shortCode) throw new Error("the short code should be provided");
        const cacheKey = `url:${shortCode}`;

        const cachedUrl = await redisClient.get(cacheKey);
        if(cachedUrl)
        {
            cacheOperations.inc({ operation: "url", result: "hit" });
            urlClicksTotal.inc();
            logger.debug({ shortCode, cacheKey }, "Cache Hit: URL loaded from Redis");
            urlRepository.getRealUrl(shortCode).catch(err => logger.error({ err, shortCode }, "Failed to increment clicks asynchronously"));

            return cachedUrl;
        }
        
        cacheOperations.inc({ operation: "url", result: "miss" });
        logger.debug({ shortCode, cacheKey }, "Cache Miss: Fetching URL from Postgres");

        const result = await urlRepository.getRealUrl(shortCode);
        await redisClient.setEx(cacheKey, 3600, result.orignal);
        urlClicksTotal.inc();
        return result.orignal;
    }
    async getUserUrls(userId) {
        const result = await urlRepository.getUrlsByUserId(userId);
        return result;
    }
    async findUrlByDiscrition(discription, userId) {
        logger.debug({ userId, discription }, "Searching URLs by description");
        if (!discription || !userId) throw Error("please provide a discription or user id right");

        const cleanSearch = discription.trim().toLowerCase();
        const cacheKey = `search:${userId}:${cleanSearch}`;

        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
            cacheOperations.inc({ operation: "search", result: "hit" });
            logger.debug({ userId, cacheKey }, "Search Cache Hit from Redis");
            return JSON.parse(cachedResult);
        }

        cacheOperations.inc({ operation: "search", result: "miss" });
        logger.debug({ userId, cacheKey }, "Search Cache Miss: Fetching from Postgres");
        const result = await urlRepository.getUrlByDiscription(discription, userId);

        await redisClient.setEx(cacheKey, 120, JSON.stringify(result));

        return result;
    }
}
export default new UrlSerivce();