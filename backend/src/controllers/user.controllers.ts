import type { Request, Response } from "express";

export const userInformation = (req: Request, res: Response) => {
  const authReq = req as any;
  const authUser = authReq.user;
  return res.status(200).json({ user: authUser });
};
