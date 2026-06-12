import type { NextFunction, Request, Response } from "express";

export const requireRole = (role: "user" | "admin") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You are unauthorized User",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "You are Forbidden to access this permission",
      });
    }
    next();
  };
};
