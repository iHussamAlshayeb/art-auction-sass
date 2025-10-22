import express from "express";
import {
  getAllUsers,
  deleteUser,
  getAllAuctions,
  endAuctionManually,
  getAllNotifications,
  deleteNotification,
  getAdminStats, // ✅ أضف هذا
} from "./admin.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// 📊 إحصائيات لوحة التحكم
router.get("/stats", protect, adminOnly, getAdminStats); // ✅ المسار الجديد

// 👥 إدارة المستخدمين
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// 🎨 إدارة المزادات
router.get("/auctions", protect, adminOnly, getAllAuctions);
router.post("/auctions/:id/end", protect, adminOnly, endAuctionManually);

// 🔔 إدارة الإشعارات
router.get("/notifications", protect, adminOnly, getAllNotifications);
router.delete("/notifications/:id", protect, adminOnly, deleteNotification);

export default router;
