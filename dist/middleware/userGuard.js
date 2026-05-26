"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardSuperAdminLimit = exports.guardDeleteUser = exports.guardUpdateRole = exports.guardRegisterRole = void 0;
const db_1 = require("../config/db");
const SUPER_ADMIN_ONLY_ROLES = ["SUPER_ADMIN"];
const guardRegisterRole = (req, res, next) => {
    const { role } = req.body;
    const requesterRole = req.user.role;
    if (!role)
        return next();
    if (requesterRole === "ADMIN" &&
        SUPER_ADMIN_ONLY_ROLES.includes(role)) {
        return res.status(403).json({
            message: "Forbidden: Admin cannot create a Super Admin account",
        });
    }
    next();
};
exports.guardRegisterRole = guardRegisterRole;
const guardUpdateRole = async (req, res, next) => {
    const { role } = req.body;
    const requesterRole = req.user.role;
    const requesterId = req.user.id;
    const { id } = req.params;
    if (requesterRole === "ADMIN") {
        const targetUser = await db_1.prisma.user.findUnique({
            where: { id: id },
            select: { role: true },
        });
        if (targetUser?.role === "SUPER_ADMIN") {
            return res.status(403).json({
                message: "Forbidden: Admin cannot modify a Super Admin account",
            });
        }
        if (targetUser?.role === "ADMIN" && requesterId !== id) {
            return res.status(403).json({
                message: "Forbidden: Admin cannot modify another Admin account",
            });
        }
        if (role && SUPER_ADMIN_ONLY_ROLES.includes(role)) {
            return res.status(403).json({
                message: "Forbidden: Admin cannot assign Super Admin role",
            });
        }
        return next();
    }
    if (requesterRole === "SUPER_ADMIN" && role === "SUPER_ADMIN") {
        if (requesterId === id) {
            return next();
        }
        try {
            await db_1.prisma.user.update({
                where: { id: requesterId },
                data: { role: "ADMIN" },
            });
            return next();
        }
        catch (error) {
            console.error("Error transferring Super Admin role:", error);
            return res
                .status(500)
                .json({ message: "Failed to transfer Super Admin role" });
        }
    }
    next();
};
exports.guardUpdateRole = guardUpdateRole;
const guardDeleteUser = async (req, res, next) => {
    const { id } = req.params;
    const requesterRole = req.user.role;
    const requesterId = req.user.id;
    try {
        const targetUser = await db_1.prisma.user.findUnique({
            where: { id: id },
            select: { id: true, role: true, deletedAt: true },
        });
        if (!targetUser || targetUser.deletedAt) {
            return res.status(404).json({ message: "User not found" });
        }
        if (targetUser.role === "SUPER_ADMIN") {
            return res.status(403).json({
                message: "Forbidden: Super Admin account cannot be deleted",
            });
        }
        if (requesterRole === "ADMIN" && targetUser.role === "ADMIN") {
            return res.status(403).json({
                message: "Forbidden: Admin cannot delete another Admin account",
            });
        }
        next();
    }
    catch (error) {
        console.error("Error in guardDeleteUser:", error);
        res.status(500).json({ message: "Failed to verify delete permission" });
    }
};
exports.guardDeleteUser = guardDeleteUser;
const guardSuperAdminLimit = async (req, res, next) => {
    const { role } = req.body;
    if (role !== "SUPER_ADMIN")
        return next();
    const existingSuperAdmin = await db_1.prisma.user.findFirst({
        where: { role: "SUPER_ADMIN", deletedAt: null },
    });
    if (existingSuperAdmin) {
        return res.status(409).json({
            message: "A Super Admin already exists",
        });
    }
    next();
};
exports.guardSuperAdminLimit = guardSuperAdminLimit;
//# sourceMappingURL=userGuard.js.map