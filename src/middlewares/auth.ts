import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { User } from "../models/user";
import MSG from "../utils/msgResponse";

const userModel = AppDataSource.getRepository(User);

declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: MSG.AUTH.TOKEN_MISSING });

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "", { algorithms: ["HS256"] });
    if (typeof decoded === "string" || decoded.type !== "access" || typeof decoded.id !== "string") {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }

    const user = await userModel.findOneBy({ id: decoded.id });

    if (!user || user.isLogout || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }

    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
  }
};

export default authMiddleware;
