import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "You are not authorized user to login",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res
        .status(401)
        .json({ message: "Invalid Token, you are unauthorized" });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        message: "Token Invalidated",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token has expired, please login again",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      // 👈 add this
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
