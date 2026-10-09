import urlRepository from "../repository/url.repository.js";
import crypto from 'crypto';
import redisClient from '../config/redis.config.js';
export class UrlSerivce {
    async createUrl(originalUrl, userId) {
        if(!originalUrl) throw new Error("the url is empty");
        const shortCode = crypto.randomBytes(3).toString('hex');
        const result = await urlRepository.createUrl(originalUrl, shortCode, userId);
        return result;
    }
    async getUrl(shortCode)
    {
        if(!shortCode) throw new Error("the short code should be provided");
        const cacheKey = `url:${shortCode}`;

        const cachedUrl = await redisClient.get(cacheKey);
        if(cachedUrl)
        {
            console.log("🚀 Cache Hit: URL loaded from Redis");
            urlRepository.getRealUrl(shortCode).catch(err => console.log(err));

            return cachedUrl;
        }
        console.log("🐌 Cache Miss: Fetching from Postgres");

        const result = await urlRepository.getRealUrl(shortCode);
        await redisClient.setEx(cacheKey, 3600, result.orignal);
        return result.orignal;
    }
    async getUserUrls(userId) {
        const result = await urlRepository.getUrlsByUserId(userId);
        return result;
    }
}
export default new UrlSerivce();