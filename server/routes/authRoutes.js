import express from "express";
import { login, logout } from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/login", loginLimiter, login);
// Logout é público e idempotente: só limpa o cookie de sessão.
router.post("/logout", logout);

export default router;
