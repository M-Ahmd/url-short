import authRepository from "../repository/auth.repository.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
export class AuthService {
    async registerService(data) {
        const email = data['email'];
        const password = data['password'];
        const hashed = await bcrypt.hash(password, 10);
        const result = await authRepository.createEmail(email, hashed);
        const token = jwt.sign({id : result.id, email : result.email}, 'secret', { expiresIn: '1d' })

        return token;
    }
    async loginService(data) {
        const email = data['email'];
        const password = data['password'];
        const result = await authRepository.findEmail(email);

        if (!result) throw new Error("the email is not correct or password");

        const isMatch = await bcrypt.compare(password, result.password);
        if (!isMatch) throw new Error("the email is not correct or password");
        const token = jwt.sign({id : result.id, email : result.email}, 'secret', { expiresIn: '1d' })
        return token;
    }
}

export default new AuthService()