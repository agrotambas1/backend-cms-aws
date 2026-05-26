import express from "express";
import {
  loginUser,
  logoutUser,
  me,
  updateMe,
} from "../../../controllers/cms/auth/authController";
import { authMiddleware } from "../../../middleware/authMiddleware";

const router = express.Router();

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
router.post("/login", loginUser);

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
router.post("/logout", logoutUser);

router.get("/me", authMiddleware, me);

router.put("/me", authMiddleware, updateMe);

export default router;
