import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getMyDashboardData,
} from "./student.controller.js";
import { protect, studentOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// 📄 عرض الملف الشخصي للطالب
router.get("/me", protect, studentOnly, getMyProfile);

// ✏️ تعديل الملف الشخصي
router.put("/me", protect, studentOnly, updateMyProfile);

// 📊 بيانات لوحة تحكم الطالب (الأعمال + المزادات)
router.get("/dashboard", protect, studentOnly, getMyDashboardData);

export default router;
