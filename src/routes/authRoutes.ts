import { Router } from "express";
import { login, register, refreshToken, logout } from "../controllers/authController";
import authMiddleware from "../middlewares/auth";
import { registerValidation, loginValidation, refreshTokenValidation } from "../middlewares/validate";

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refreshToken", refreshTokenValidation, refreshToken);
router.post("/logout", authMiddleware, logout);

export default router;
