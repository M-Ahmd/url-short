import jwt from 'jsonwebtoken'
import { authSchema } from '../validation/auth.validation.js';
export class AuthMiddleware {
    async verify(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) throw new Error("the token is not exist");

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, 'secret');
            req.user = decoded;
            next();
        }catch(error)
        {
            res.status(403).json({ error: error.message });
        }
    }

    async validateEmail(req, res, next)
    {
        const email = req.body.email;
        const password = req.body.password;

        try {
            authSchema.parse({email, password});
            next();
        }catch(error)
        {
            res.status(403).json({error : error.message});
        }
    }

}
export default new AuthMiddleware;