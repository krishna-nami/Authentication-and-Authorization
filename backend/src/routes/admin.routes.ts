import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getUsers } from "../controllers/admin.controllers.js";

const adminRouter = Router();

adminRouter.get("/users", requireAuth, requireRole("admin"), getUsers);

export default adminRouter;
