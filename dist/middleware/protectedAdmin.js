"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectAdminAccount = void 0;
const db_1 = require("../config/db");
const protectAdminAccount = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const targetUser = await db_1.prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true },
    });
    if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
    }
    // if (req.user!.role === "ADMIN" && targetUser.role === "ADMIN") {
    //   return res.status(403).json({
    //     message: "Forbidden: Admin accounts cannot be modified",
    //   });
    // }
    next();
};
exports.protectAdminAccount = protectAdminAccount;
//# sourceMappingURL=protectedAdmin.js.map