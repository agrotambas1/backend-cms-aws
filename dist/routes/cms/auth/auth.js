"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../../controllers/cms/auth/authController");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/cms/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", authController_1.loginUser);
/**
 * @swagger
 * /api/cms/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", authController_1.logoutUser);
router.get("/me", authMiddleware_1.authMiddleware, authController_1.me);
router.put("/me", authMiddleware_1.authMiddleware, authController_1.updateMe);
exports.default = router;
//# sourceMappingURL=auth.js.map