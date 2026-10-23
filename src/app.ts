import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(helmet());
app.use(cors({ origin: "https://dev.soiinow.com" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);

app.get("/api/v1/health", (_req, res) => {
  const healthy = mongoose.connection.readyState === 1;
  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "unavailable", database: healthy ? "connected" : "disconnected" });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("Unhandled request error", error);
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;
