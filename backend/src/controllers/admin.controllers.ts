import type { Request, Response } from "express";
import { User } from "../models/user.model.js";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(
      {},
      {
        email: 1,
        role: 1,
        isEmailVerified: 1,
        createdAt: 1,
      },
    ).sort({ createdAt: -1 });

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      isEmailVerified: u.isEmailVerified,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({ success: true, users: result });
  } catch (error) {
    console.error("get USers error:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
