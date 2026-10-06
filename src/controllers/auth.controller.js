import authService from "../services/auth.service.js";

export class AuthController {
    async resisterController(req, res) {
        try {
            const info = req.body;
            const token = await authService.registerService(info);
            res.status(201).json({
                message: "success",
                token: token
            });
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }

    async loginController(req, res) {
        try {
            const token = await authService.loginService(req.body);
            res.status(200).json({
                message: "success",
                token: token
            });
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }
}

export default new AuthController();