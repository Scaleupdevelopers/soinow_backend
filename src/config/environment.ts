import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const MAIL_FROM = process.env.MAIL_FROM;
