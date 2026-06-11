import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: "user" | "admin";
        isEmailVerified: boolean;
      };
    }
  }
}
