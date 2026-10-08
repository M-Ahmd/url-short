import urlService from "../services/url.service.js"
import { asyncHandler } from "../utils/asyncHander.js";
export class UrlController {
    shortenController = asyncHandler(async (req, res) =>
        {
            const info = req.body;
            const userId = req.user.id;

            const result = await urlService.createUrl(info['url'], userId);
            res.status(201).json({
                message: "success",
                data: result
            });


        });
    async getUrlController(req, res) {
        const shortCode = req.params.shortCode;
        try {
            const result = await urlService.getUrl(shortCode);
            res.redirect(result);
        } catch (error) {
            res.status(400).json({
                message: "failed",
                error: error.message
            })
        }
    }
    async getUserUrlsController(req, res) {
        try {
            const userId = req.user.id;
            const result = await urlService.getUserUrls(userId);
            res.status(200).json({
                message: "success",
                data: result
            });
        } catch (error) {
            res.status(400).json({
                message: "failed",
                error: error.message
            });
        }
    }
}

export default new UrlController()