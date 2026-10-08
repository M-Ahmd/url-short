import { PrismaClient } from "@prisma/client";
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
}
export default new UrlRepository();