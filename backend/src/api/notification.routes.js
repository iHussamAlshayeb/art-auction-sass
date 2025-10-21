import express from "express";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
} from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔔 عرض إشعارات المستخدم الحالي
router.get("/", protect, getNotifications);

// ✅ تحديث حالة إشعار إلى "مقروء"
router.put("/:id/read", protect, markAllAsRead);

// 🧹 حذف إشعار
router.delete("/:id", protect, deleteNotification);

export default router;
