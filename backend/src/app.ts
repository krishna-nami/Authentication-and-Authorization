import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.auth.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.json({ stauts: "This is our system is OK" });
});

export default app;
