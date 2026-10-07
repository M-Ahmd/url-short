import urlController from "../controllers/url.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { Router } from "express";

const urlRouter = Router();

urlRouter.post('/shorten', authMiddleware.verify ,urlController.shortenController);
urlRouter.get('/shorten/:shortCode', urlController.getUrlController)
export default urlRouter;