import type { Response } from "express";

export const sendError = (res: Response, code: number, message: string) => {
  return res.status(code).json({
    message: message,
    success: false,
  });
};
export const sendSuccess = (
  res: Response,
  code: number,
  data: unknown,
  message: string,
  token?: string,
) => {
  return res.status(code).json({
    success: true,
    data,
    message,
    ...(token && { token }),
  });
};
