import { Router, type Request, type Response } from "express";
import {
  userRegister,
  loginHander,
  verifyEmailHandler,
  refreshHandler,
  logoutHandler,
  forgetPasswordHandler,
  resetPasswordHandler,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", userRegister);
authRoutes.post("/login", loginHander);
authRoutes.get("/verify-email", verifyEmailHandler);

authRoutes.post("/refresh", refreshHandler);
authRoutes.post("/logout", logoutHandler);
authRoutes.post("/forgetPassword", forgetPasswordHandler);
authRoutes.post("/resetPassword", resetPasswordHandler);
export default authRoutes;
