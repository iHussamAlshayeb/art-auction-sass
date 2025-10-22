import express from "express";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  getUnreadNotificationsCount, // ✅ استدعاء الدالة
} from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔔 جلب الإشعارات للمستخدم الحالي
router.get("/", protect, getNotifications);

// 📖 تحديد كل الإشعارات كمقروءة
router.post("/mark-read", protect, markAllAsRead);

// 🔢 عدد الإشعارات غير المقروءة
router.get("/unread-count", protect, getUnreadNotificationsCount);

// 🗑️ حذف إشعار معين
router.delete("/:id", protect, deleteNotification);

export default router;
