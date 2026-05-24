"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logoutUser = exports.loginUser = void 0;
const db_1 = require("../../../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../../../utils/generateToken");
const loginUser = async (req, res) => {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        return res.status(400).json({
            message: "Username or email and password are required",
        });
    }
    // Find user by username or email
    const user = await db_1.prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }],
        },
    });
    if (!user || user.deletedAt !== null) {
        return res.status(401).json({ message: "User does not exist" });
    }
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
        return res.status(403).json({ message: "User is inactive" });
    }
    if (!user.isActive) {
        return res.status(403).json({
            message: "User is inactive",
        });
    }
    // Generate JWT token and set it in HTTP-only cookie
    const token = (0, generateToken_1.generateToken)(user.id, res);
    res.status(200).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token,
        },
        message: "Login successful",
    });
};
exports.loginUser = loginUser;
const logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.COOKIE_DOMAIN,
        path: "/",
    });
    res.status(200).json({ status: "success", message: "Logout successful" });
};
exports.logoutUser = logoutUser;
const me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await db_1.prisma.user.findFirst({
        where: { id: req.user.id },
    });
    if (!user || user.deletedAt !== null) {
        return res.status(401).json({ message: "User does not exist" });
    }
    if (!user.isActive) {
        return res.status(403).json({ message: "User is inactive" });
    }
    return res.json({
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
    });
};
exports.me = me;
//# sourceMappingURL=authController.js.map