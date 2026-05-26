"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../../../controllers/cms/users/userController");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const permission_1 = require("../../../middleware/permission");
const userGuard_1 = require("../../../middleware/userGuard");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.get("/users", permission_1.adminOnly, userController_1.getUser);
router.post("/users", permission_1.adminOnly, userGuard_1.guardRegisterRole, userGuard_1.guardSuperAdminLimit, userController_1.registerUser);
router.put("/users/:id", permission_1.adminOnly, userGuard_1.guardUpdateRole, userController_1.updateUser);
router.delete("/users/:id", permission_1.adminOnly, userGuard_1.guardDeleteUser, userController_1.deleteUser);
exports.default = router;
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
//# sourceMappingURL=users.js.map