import { Prisma, PrismaClient } from "@prisma/client";
const connect = new PrismaClient();

export class UrlRepository {
    async createUrl(originalUrl, shortCode, userId) {
        return await connect.url.create({
            data: { orignal: originalUrl, shorted: shortCode, userid: userId }
        });
    }
    async getRealUrl(shortCode)
    {
        return await connect.url.update({
            data : {clicks : {increment : 1}},
            where : {shorted : shortCode}
        })
    }
    async getUrlsByUserId(userId) {
        return await connect.url.findMany({
            where: { userid: userId }
        });
    }
    async getUrlByDiscription(discription, userId) {
        return await connect.$queryRaw`
            SELECT * FROM "Url"
            WHERE userid = ${userId}
              AND to_tsvector('english', COALESCE(discription, '')) @@ websearch_to_tsquery('english', ${discription})
        `;
    }
}
export default new UrlRepository();