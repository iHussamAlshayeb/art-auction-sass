import express from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔔 عرض إشعارات المستخدم الحالي
router.get("/", protect, getMyNotifications);

// ✅ تحديث حالة إشعار إلى "مقروء"
router.put("/:id/read", protect, markNotificationAsRead);

// 🧹 حذف إشعار
router.delete("/:id", protect, deleteNotification);

export default router;
