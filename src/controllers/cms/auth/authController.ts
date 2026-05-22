import { Request, Response } from "express";
import { prisma } from "../../../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../utils/generateToken";

export const loginUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    return res.status(400).json({
      message: "Username or email and password are required",
    });
  }

  // Find user by username or email
  const user = await prisma.user.findFirst({
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

  const isPasswordValid = await bcrypt.compare(password, user.password);

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
  const token = generateToken(user.id, res);

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

export const logoutUser = async (req: Request, res: Response) => {
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

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findFirst({
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
