"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.registerUser = exports.getUser = void 0;
const db_1 = require("../../../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_1 = require("../../../utils/queryBuilder/cms/users/users");
const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { page = "1", limit = "10", search, isActive, role, sortBy, order, } = req.query;
        const where = (0, users_1.buildCMSUserWhereCondition)({
            search: search,
            isActive: isActive,
            role: role,
        });
        const pagination = (0, users_1.buildCMSUserPaginationParams)(page, limit);
        const orderBy = (0, users_1.buildCMSUserSortParams)(sortBy, order);
        const [users, total] = await Promise.all([
            db_1.prisma.user.findMany({
                where,
                orderBy,
                ...pagination,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            db_1.prisma.user.count({ where }),
        ]);
        return res.status(200).json({
            data: users,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch users"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.getUser = getUser;
const registerUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { name, username, email, password, role } = req.body;
        // check if user already exists
        // const userExists = await prisma.user.findFirst({
        //   where: {
        //     OR: [{ username }, { email }],
        //   },
        // });
        // if (userExists) {
        //   return res.status(400).json({ message: "User already exists" });
        // }
        const [usernameExists, emailExists] = await Promise.all([
            db_1.prisma.user.findFirst({ where: { username, deletedAt: null } }),
            db_1.prisma.user.findFirst({ where: { email, deletedAt: null } }),
        ]);
        if (usernameExists) {
            return res.status(400).json({ message: "Username already exists" });
        }
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }
        //   Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await db_1.prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
                role,
            },
        });
        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        const message = process.env.NODE_ENV === "production"
            ? "Failed to fetch user"
            : error.message;
        res.status(500).json({ message });
    }
};
exports.registerUser = registerUser;
const updateUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const { name, username, email, password, role, isActive } = req.body;
        // Check if user exists
        const userExists = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if username or email is already taken by another user
        // if (username || email) {
        //   const duplicateUser = await prisma.user.findFirst({
        //     where: {
        //       AND: [
        //         { id: { not: id } },
        //         {
        //           OR: [username ? { username } : {}, email ? { email } : {}].filter(
        //             (obj) => Object.keys(obj).length > 0,
        //           ),
        //         },
        //       ],
        //     },
        //   });
        //   if (duplicateUser) {
        //     return res.status(400).json({
        //       message: "Username or email already taken by another user",
        //     });
        //   }
        // }
        if (username) {
            const duplicateUsername = await db_1.prisma.user.findFirst({
                where: { username, id: { not: id }, deletedAt: null },
            });
            if (duplicateUsername) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }
        if (email) {
            const duplicateEmail = await db_1.prisma.user.findFirst({
                where: { email, id: { not: id }, deletedAt: null },
            });
            if (duplicateEmail) {
                return res.status(400).json({ message: "Email already taken" });
            }
        }
        // Prepare update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (username)
            updateData.username = username;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        if (typeof isActive === "boolean")
            updateData.isActive = isActive;
        // Hash new password if provided
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            updateData.password = await bcryptjs_1.default.hash(password, salt);
        }
        const user = await db_1.prisma.user.update({
            where: { id },
            data: updateData,
        });
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            status: "success",
            data: {
                user: userWithoutPassword,
            },
        });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const userExists = await db_1.prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.user?.id === id) {
            return res.status(400).json({ message: "You cannot delete yourself" });
        }
        // await prisma.user.delete({
        //   where: { id },
        // });
        await db_1.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        res.json({
            status: "success",
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map