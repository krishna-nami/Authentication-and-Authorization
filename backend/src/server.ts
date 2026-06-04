import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5002;
const MODE = process.env.NODE_ENV || "Developement";

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(
      `The application is processing in the ${PORT} address and is in @ ${MODE} mode`,
    );
  });

  //Handle Server Error
  server.on("error", (error) => {
    console.error("Server error:", error.message);
    process.exit(1);
  });
  //Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM recceived, sutting down gracefully");
    server.close(() => {
      console.log("server closed");
      process.exit(0);
    });
  });
};

// handle server errors

startServer().catch((error) => {
  console.error("Failed to start server", error.message);
  process.exit(1);
});
