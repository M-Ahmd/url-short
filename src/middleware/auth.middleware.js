import jwt from 'jsonwebtoken'
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

}
export default new AuthMiddleware;