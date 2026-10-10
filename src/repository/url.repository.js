import prisma from "../config/prisma.config.js";


export class UrlRepository {
    async createUrl(originalUrl, shortCode, userId) {
        return await prisma.url.create({
            data: { orignal: originalUrl, shorted: shortCode, userid: userId }
        });
    }
    async getRealUrl(shortCode)
    {
        return await prisma.url.update({
            data : {clicks : {increment : 1}},
            where : {shorted : shortCode}
        })
    }
    async getUrlsByUserId(userId) {
        return await prisma.url.findMany({
            where: { userid: userId }
        });
    }
    async getUrlByDiscription(discription, userId) {
        return await prisma.$queryRaw`
            SELECT * FROM "Url"
            WHERE userid = ${userId}
              AND to_tsvector('english', COALESCE(discription, '')) @@ websearch_to_tsquery('english', ${discription})
        `;
    }
}
export default new UrlRepository();