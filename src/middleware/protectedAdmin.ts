import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

export const protectAdminAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const targetUser = await prisma.user.findUnique({
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
