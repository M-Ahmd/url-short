import urlRepository from "../repository/url.repository.js";
import crypto from 'crypto';
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
        const result = await urlRepository.getRealUrl(shortCode);
        return result.orignal;
    }
    async getUserUrls(userId) {
        const result = await urlRepository.getUrlsByUserId(userId);
        return result;
    }
}
export default new UrlSerivce();