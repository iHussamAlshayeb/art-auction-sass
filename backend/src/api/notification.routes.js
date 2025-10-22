import express from "express";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  getUnreadNotificationsCount,
} from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔔 جلب الإشعارات
router.get("/", protect, getNotifications);

// ✅ تحديد الكل كمقروء
router.put("/mark-all-read", protect, markAllAsRead);

// ❌ حذف إشعار واحد
router.delete("/:id", protect, deleteNotification);

// 🧹 حذف جميع الإشعارات
router.delete("/", protect, deleteAllNotifications);

// 🔢 عدد الإشعارات غير المقروءة
router.get("/unread-count", protect, getUnreadNotificationsCount);

// 🆕 إنشاء إشعار جديد (للمشرف أو النظام)
router.post("/", protect, createNotification);

export default router;
