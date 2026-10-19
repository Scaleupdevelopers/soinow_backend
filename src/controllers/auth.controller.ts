import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { User } from "../models/user";
import MSG from "../utils/msgResponse";

const userModel = AppDataSource.getRepository(User);

/* ------------------ REGISTER ------------------ */

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const exists = await userModel.findOneBy({ email });
    if (exists) return res.status(409).json({ success: false, message: MSG.AUTH.EMAIL_EXISTS });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = userModel.create({ name, email, passwordHash });
    await userModel.save(user);

    return res.status(201).json({
      success: true,
      message: MSG.AUTH.USER_CREATED,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if ((error as { code?: string } | null)?.code === "23505") {
      return res.status(409).json({ success: false, message: MSG.AUTH.EMAIL_EXISTS });
    }
    return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
  }
}

/* ------------------ LOGIN ------------------ */

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true, tokenVersion: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_CREDENTIALS });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_CREDENTIALS });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim().length < 32) {
      return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
    }

    await userModel.update(user.id, { isLogout: false });
    const accessToken = jwt.sign(
      { id: user.id, type: "access", tokenVersion: user.tokenVersion },
      secret, { algorithm: "HS256", expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: user.id, type: "refresh", tokenVersion: user.tokenVersion },
      secret, { algorithm: "HS256", expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: MSG.AUTH.LOGIN_SUCCESS,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
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

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim().length < 32) {
      return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
    }

    const decoded = jwt.verify(refreshToken, secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || decoded.type !== "refresh" || typeof decoded.id !== "string") {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }
    const user = await userModel.findOneBy({ id: decoded.id });
    if (!user || user.isLogout || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: MSG.AUTH.INVALID_TOKEN });
    }
    const accessToken = jwt.sign(
      { id: user.id, type: "access", tokenVersion: user.tokenVersion },
      secret, { algorithm: "HS256", expiresIn: "15m" },
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
    await userModel.update(req.user!.id, {
      isLogout: true,
      tokenVersion: () => '"tokenVersion" + 1',
    });
    return res.status(200).json({ success: true, message: MSG.AUTH.LOGOUT_SUCCESS });
  } catch {
    return res.status(500).json({ success: false, message: MSG.COMMON.SERVER_ERROR });
  }
}
