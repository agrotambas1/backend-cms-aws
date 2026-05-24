"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId, res) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const payload = { id: userId };
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    };
    const token = jsonwebtoken_1.default.sign(payload, secret, options);
    // Set token in HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.COOKIE_DOMAIN,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
    });
    return token;
};
exports.generateToken = generateToken;
//# sourceMappingURL=generateToken.js.map