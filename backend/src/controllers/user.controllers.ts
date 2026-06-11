import type { Request, Response } from "express";

export const userInformation = (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
};
