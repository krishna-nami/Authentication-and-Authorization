import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(3),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  twoFactorCode: z.string().optional(),
});
export const forgetPasswordSchema = z.object({
  email: z.email({ message: "Invalid Email Format" }),
});
export const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must have 6 charactors" }),
  token: z.string().min(1, { message: "Token is missing" }),
});
