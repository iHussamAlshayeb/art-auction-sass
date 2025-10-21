import express from "express";
import { register, login, logout } from "./auth.controller.js";

const router = express.Router();

// تسجيل مستخدم جديد (طالب افتراضي)
router.post("/register", register);

// تسجيل الدخول
router.post("/login", login);

// تسجيل الخروج
router.post("/logout", logout);

export default router;
