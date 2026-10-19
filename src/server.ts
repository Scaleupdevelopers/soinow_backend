import "reflect-metadata";
import "dotenv/config";
import app from "./app";
import { AppDataSource, validateDatabaseEnvironment } from "./config/db";

async function startServer(): Promise<void> {
  validateDatabaseEnvironment();
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  await AppDataSource.initialize().catch(() => {
    throw new Error("Database connection failed. Check your database settings, network, and SSL certificate.");
  });
  console.log("PostgreSQL Connected.");

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}. Health: /api/v1/health`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    console.error(`HTTP server failed (${error.code ?? "unknown error"}).`);
    process.exit(1);
  });
}

void startServer().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Server startup failed.");
  process.exit(1);
});
