import type { NextFunction, Request, Response } from "express";
import { success } from "zod";
import { fa } from "zod/locales";

export const requireRole = (role: "user" | "admin") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as any;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "unauthorized",
      });
    }

    if (authReq.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "You are Forbidden to access this permission",
      });
    }
    next();
  };
};
