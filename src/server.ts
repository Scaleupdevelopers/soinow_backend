import "dotenv/config";
import app from "./app";
import connectDB from "./config/db";

async function startServer(): Promise<void> {
  const port = Number(process.env.PORT) || 3000;
  await connectDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Server startup failed.");
  process.exit(1);
});
