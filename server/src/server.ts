import "dotenv/config";
import express from "express";
import { connectDB } from "./db";
import cors from "cors";
import morgan from "morgan";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { ok } from "./utils/envelope";
import { authRouter } from "./routes/auth/auth.routes";
import { clerkMiddleware } from "@clerk/express";

async function mainEnryFunction() {
  await connectDB();

  const app = express();

  const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(morgan("dev"));
  app.use(clerkMiddleware());

  app.get("/health", (_req, res) => {
    res.status(200).json(ok({ message: "Server is healthy/in running state" }));
  });

  // auth routes
  app.use("/auth", authRouter);

  app.use(notFound);
  app.use(errorHandler);

  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(`Server is now listening to port http://localhost:${port}`);
  });
}

mainEnryFunction().catch((err) => {
  console.error("failed to start", err);
  process.exit(1);
});
