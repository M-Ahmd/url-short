import { Router } from "express";
import authController from "../controllers/auth.controller.js";
const auth = Router()


auth.post('/register', authController.resisterController)

auth.post('/login', authController.loginController)

export default auth;