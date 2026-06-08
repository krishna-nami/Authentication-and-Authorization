import { Router } from "express";
import { userInformation } from "../controllers/user.controllers.js";
import { requireAuth } from "../middleware/requireAuth.js";
const userRoutes = Router();

userRoutes.get("/me", requireAuth, userInformation);

export default userRoutes;
