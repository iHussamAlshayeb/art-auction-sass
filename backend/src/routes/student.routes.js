import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getMyDashboardData,
  getAllStudents, // ✅ جديد
  getStudentById, // ✅ جديد
} from "../controllers/student.controller.js";
import { protect, studentOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ عام: عرض قائمة الطلاب (لصفحة "الفنانون")
router.get("/", getAllStudents);

// ✅ عام: عرض طالب محدد
router.get("/:id", getStudentById);

// 📄 عرض الملف الشخصي للطالب (للطالب نفسه)
router.get("/me", protect, studentOnly, getMyProfile);

// ✏️ تعديل الملف الشخصي
router.put("/me", protect, studentOnly, updateMyProfile);

// 📊 بيانات لوحة تحكم الطالب (الأعمال + المزادات)
router.get("/dashboard", protect, studentOnly, getMyDashboardData);

export default router;
