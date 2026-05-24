"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mediaController_1 = require("../../../controllers/cms/media/mediaController");
const upload_1 = require("../../../middleware/upload");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const permission_1 = require("../../../middleware/permission");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.get("/media", mediaController_1.getMedia);
router.get("/media/:id", mediaController_1.getMediaById);
router.get("/media/download/:id", mediaController_1.downloadMedia);
router.post("/media", upload_1.uploadMedia.single("file"), permission_1.editorsOnly, mediaController_1.uploadMedia);
router.put("/media/:id", permission_1.editorsOnly, mediaController_1.updateMedia);
router.delete("/media/:id", permission_1.adminOnly, mediaController_1.deleteMedia);
router.delete("/media", permission_1.adminOnly, mediaController_1.bulkDeleteMedia);
exports.default = router;
/**
 * @swagger
 * /api/cms/media:
 *   get:
 *     summary: Get all media items
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of media items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/cms/media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media details
 *       404:
 *         description: Media not found
 */
/**
 * @swagger
 * /api/cms/media:
 *   post:
 *     summary: Upload media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload (max 10MB)
 *               title:
 *                 type: string
 *                 description: Title for the media
 *               description:
 *                 type: string
 *                 description: Description for the media
 *               alt_text:
 *                 type: string
 *                 description: Alternative text for accessibility
 *               caption:
 *                 type: string
 *                 description: Caption for the media
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       400:
 *         description: File is required or invalid file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/cms/media/{id}:
 *   put:
 *     summary: Update media metadata
 *     description: Update alternative text and caption for existing media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Media ID
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title for the media
 *                 example: Sunset at the beach
 *               description:
 *                 type: string
 *                 description: Description for the media
 *                 example: Captured during our trip to Bali
 *               altText:
 *                 type: string
 *                 description: Alternative text for accessibility
 *                 example: Beautiful sunset at the beach
 *               caption:
 *                 type: string
 *                 description: Caption for the media
 *                 example: Captured during our trip to Bali
 *           examples:
 *             updateBoth:
 *               summary: Update both altText and caption
 *               value:
 *                 altText: Beautiful mountain landscape
 *                 caption: Taken at Mount Bromo, East Java
 *             updateAltTextOnly:
 *               summary: Update altText only
 *               value:
 *                 altText: Team meeting photo
 *             updateCaptionOnly:
 *               summary: Update caption only
 *               value:
 *                 caption: Annual company gathering 2026
 *     responses:
 *       200:
 *         description: Media metadata updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     media:
 *                       $ref: '#/components/schemas/Media'
 *       400:
 *         description: No data to update or invalid media ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No data to update. Provide altText or caption.
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/cms/media/{id}:
 *   delete:
 *     summary: Delete media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/cms/media:
 *   delete:
 *     summary: Bulk delete media
 *     description: Delete multiple media files at once. Only editors or admins can perform this action.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of media IDs to delete
 *                 example:
 *                   - 550e8400-e29b-41d4-a716-446655440000
 *                   - 660e8400-e29b-41d4-a716-446655440111
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 2 media deleted successfully
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Media IDs are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - no permission to delete some media
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
//# sourceMappingURL=media.js.map