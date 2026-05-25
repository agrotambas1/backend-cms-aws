import express from "express";
import {
  deleteUser,
  getUser,
  registerUser,
  updateUser,
} from "../../../controllers/cms/users/userController";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { adminOnly } from "../../../middleware/permission";
import { protectAdminAccount } from "../../../middleware/protectedAdmin";
import {
  guardDeleteUser,
  guardRegisterRole,
  guardSuperAdminLimit,
  guardUpdateRole,
} from "../../../middleware/userGuard";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", adminOnly, getUser);

router.post(
  "/users",
  adminOnly,
  guardRegisterRole,
  guardSuperAdminLimit,
  registerUser,
);

router.put("/users/:id", adminOnly, guardUpdateRole, updateUser);

router.delete("/users/:id", adminOnly, guardDeleteUser, deleteUser);

export default router;

/** @swagger
 * /api/cms/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 */

/** @swagger
 * /api/cms/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username or email already taken
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cms/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Username or email already taken
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cms/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
