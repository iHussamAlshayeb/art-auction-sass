import express from "express";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  getUnreadNotificationsCount,
} from "../controllers/notification.controller.js"; // ← تأكد من المسار الصحيح
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔔 جلب الإشعارات (مع pagination)
router.get("/", protect, getNotifications);

// 🔢 عدد الإشعارات غير المقروءة (تستخدمها الواجهة في شارة الجرس)
router.get("/unread-count", protect, getUnreadNotificationsCount);

// 📖 تعليم جميع الإشعارات كمقروءة
router.post("/mark-read", protect, markAllAsRead);

// 🗑️ حذف إشعار واحد
router.delete("/:id", protect, deleteNotification);

export default router;
