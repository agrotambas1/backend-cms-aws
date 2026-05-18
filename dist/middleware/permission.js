"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedOnly = exports.technicalEditorAccess = exports.marketingEditorAccess = exports.editorsOnly = exports.adminOnly = exports.checkRole = exports.hasRole = void 0;
const hasRole = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};
exports.hasRole = hasRole;
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!(0, exports.hasRole)(req.user.role, allowedRoles)) {
            return res.status(403).json({
                message: "Forbidden: You don't have permission to access this resource",
            });
        }
        next();
    };
};
exports.checkRole = checkRole;
// Admin only - Full access
exports.adminOnly = (0, exports.checkRole)("ADMIN");
// All editors (Marketing + Technical) - Can create/edit content
exports.editorsOnly = (0, exports.checkRole)("ADMIN", "MARKETING_EDITOR", "TECHNICAL_EDITOR");
// Marketing Editor - Can create/edit/publish
exports.marketingEditorAccess = (0, exports.checkRole)("ADMIN", "MARKETING_EDITOR");
// Technical Editor - Can edit/approve
exports.technicalEditorAccess = (0, exports.checkRole)("ADMIN", "TECHNICAL_EDITOR");
// All authenticated users (including viewers)
exports.authenticatedOnly = (0, exports.checkRole)("ADMIN", "MARKETING_EDITOR", "TECHNICAL_EDITOR", "VIEWER");
//# sourceMappingURL=permission.js.map