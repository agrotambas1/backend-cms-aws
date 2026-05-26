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

export const updateMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, username, email, password } = req.body;

  try {
    if (username) {
      const duplicate = await prisma.user.findFirst({
        where: { username, id: { not: req.user.id }, deletedAt: null },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    if (email) {
      const duplicate = await prisma.user.findFirst({
        where: { email, id: { not: req.user.id }, deletedAt: null },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Email already taken" });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    return res.json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
