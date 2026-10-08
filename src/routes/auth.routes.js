import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const auth = Router()


auth.post('/register', authMiddleware.validateEmail ,authController.resisterController)

auth.post('/login', authController.loginController)

export default auth;