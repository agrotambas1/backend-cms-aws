import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { UserRole } from "./permission";

const SUPER_ADMIN_ONLY_ROLES: UserRole[] = ["SUPER_ADMIN"];

export const guardRegisterRole = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role } = req.body;
  const requesterRole = req.user!.role as UserRole;

  if (!role) return next();

  if (
    requesterRole === "ADMIN" &&
    SUPER_ADMIN_ONLY_ROLES.includes(role as UserRole)
  ) {
    return res.status(403).json({
      message: "Forbidden: Admin cannot create a Super Admin account",
    });
  }

  next();
};

export const guardUpdateRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role } = req.body;
  const requesterRole = req.user!.role as UserRole;
  const requesterId = req.user!.id;
  const { id } = req.params;

  if (requesterRole === "ADMIN") {
    const targetUser = await prisma.user.findUnique({
      where: { id: id as string },
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

    if (role && SUPER_ADMIN_ONLY_ROLES.includes(role as UserRole)) {
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
      await prisma.user.update({
        where: { id: requesterId },
        data: { role: "ADMIN" },
      });

      return next();
    } catch (error) {
      console.error("Error transferring Super Admin role:", error);
      return res
        .status(500)
        .json({ message: "Failed to transfer Super Admin role" });
    }
  }

  next();
};

export const guardDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const requesterRole = req.user!.role as UserRole;
  const requesterId = req.user!.id;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: id as string },
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
  } catch (error) {
    console.error("Error in guardDeleteUser:", error);
    res.status(500).json({ message: "Failed to verify delete permission" });
  }
};

export const guardSuperAdminLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role } = req.body;

  if (role !== "SUPER_ADMIN") return next();

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN", deletedAt: null },
  });

  if (existingSuperAdmin) {
    return res.status(409).json({
      message: "A Super Admin already exists",
    });
  }

  next();
};
