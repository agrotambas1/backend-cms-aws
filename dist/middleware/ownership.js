"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserOwnership = void 0;
// Generic ownership check
const checkOwnership = (resourceName, findFunction) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json({ message: `${resourceName} ID is required` });
            }
            const resource = await findFunction(id);
            if (!resource || resource.deletedAt) {
                return res.status(404).json({ message: `${resourceName} not found` });
            }
            if (req.user.role === "ADMIN") {
                req[resourceName.toLowerCase()] = resource;
                return next();
            }
            if (resource.createdBy !== req.user.id) {
                return res.status(403).json({
                    message: `Forbidden: You can only manage your own ${resourceName.toLowerCase()}`,
                });
            }
            req[resourceName.toLowerCase()] = resource;
            next();
        }
        catch (error) {
            console.error(`Error checking ${resourceName} ownership:`, error);
            res.status(500).json({ message: "Failed to verify ownership" });
        }
    };
};
const checkUserOwnership = (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }
    if (req.user.role === "ADMIN") {
        return next();
    }
    if (req.user.id !== id) {
        return res.status(403).json({
            message: "Forbidden: You can only manage your own account",
        });
    }
    if ("role" in req.body) {
        delete req.body.role;
    }
    next();
};
exports.checkUserOwnership = checkUserOwnership;
//# sourceMappingURL=ownership.js.map