import prisma from "../config/prisma.config.js";

export class AuthRepository {
    async createEmail(email, hashed){
        return await prisma.user.create({data : {
            email : email,
            password : hashed
        }});
    }
    async findEmail(email)
    {
        return await prisma.user.findUnique({
            where : {email : email},
        });
    }
}

export default new AuthRepository();