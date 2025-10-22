import express from "express";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationsCount,
} from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔔 جلب الإشعارات (مع pagination)
router.get("/", protect, getNotifications);

// 🔢 عدد الإشعارات غير المقروءة
router.get("/unread-count", protect, getUnreadNotificationsCount);

// 📖 تعليم جميع الإشعارات كمقروءة
router.post("/mark-read", protect, markAllAsRead);

// 🗑️ حذف إشعار محدد
router.delete("/:id", protect, deleteNotification);

// 🧹 حذف جميع الإشعارات
router.delete("/all", protect, deleteAllNotifications);
export default router;
