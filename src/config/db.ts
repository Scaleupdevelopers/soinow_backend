import "reflect-metadata";
import "dotenv/config";
import path from "node:path";
import { DataSource } from "typeorm";

const requiredVariables = [
  "DB_HOST", "DB_PORT", "DB_USERNAME", "DB_PASSWORD", "DB_DATABASE", "DB_SSL",
] as const;

export function validateDatabaseEnvironment(): void {
  const missing = requiredVariables.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Trust Node's CA store, optionally extended by NODE_EXTRA_CA_CERTS at startup.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false,
  entities: [path.join(__dirname, "../models/**/*{.ts,.js}")],
  synchronize: process.env.NODE_ENV === "development",
  connectTimeoutMS: 10_000,
});
