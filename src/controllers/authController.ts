import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user";
import MSG from "../utils/msgResponse";
import { JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, JWT_SECRET } from "../config/environment";

/* ------------------ REGISTER ------------------ */

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.exists({ email });
    if (exists) return res.status(409).json({ success: false, message: MSG.AUTH.EMAIL_EXISTS });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      success: true,
      message: MSG.AUTH.USER_CREATED,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      return res.status(409).json({ success: false, message: MSG.AUTH.EMAIL_EXISTS });
    }
    return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
  }
}

/* ------------------ LOGIN ------------------ */

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_CREDENTIALS });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_CREDENTIALS });
    }

    await User.updateOne({ _id: user._id }, { $set: { isLogout: false } });
    const accessToken = jwt.sign(
      { id: user._id, type: "access", tokenVersion: user.tokenVersion },
      JWT_SECRET, { algorithm: "HS256", expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] },
    );
    const refreshToken = jwt.sign(
      { id: user._id, type: "refresh", tokenVersion: user.tokenVersion },
      JWT_SECRET, { algorithm: "HS256", expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] },
    );

    return res.status(200).json({
      success: true,
      message: MSG.AUTH.LOGIN_SUCCESS,
      data: {
        user: { id: user._id, name: user.name, email: user.email },
        accessToken,
        refreshToken,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
  }
}

/* ------------------ REFRESH TOKEN ------------------ */

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || decoded.type !== "refresh" || typeof decoded.id !== "string") {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }
    const user = await User.findById(decoded.id);
    if (!user || user.isLogout || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }
    const accessToken = jwt.sign(
      { id: user._id, type: "access", tokenVersion: user.tokenVersion },
      JWT_SECRET, { algorithm: "HS256", expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] },
    );
    return res.status(200).json({ success: true, data: { accessToken } });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }
    return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
  }
}

/* ------------------ LOGOUT ------------------ */

export async function logout(req: Request, res: Response) {
  try {
    // One atomic update invalidates every existing token for this user.
    await User.updateOne({ _id: req.user!.id }, {
      $set: { isLogout: true },
      $inc: { tokenVersion: 1 },
    });
    return res.status(200).json({ success: true, message: MSG.AUTH.LOGOUT_SUCCESS });
  } catch {
    return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
  }
}
