// src/api/admin.routes.js
import express from "express";
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllArtworks,
  deleteArtworkByAdmin,
  getAllAuctions,
  endAuctionManually,
  getAllNotifications,
  deleteNotification,
} from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

/* 📊 الإحصائيات */
router.get("/stats", protect, adminOnly, getAdminStats);

/* 👥 المستخدمون */
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

/* 🎨 الأعمال الفنية */
router.get("/artworks", protect, adminOnly, getAllArtworks);
router.delete("/artworks/:id", protect, adminOnly, deleteArtworkByAdmin);

/* 🔨 المزادات */
router.get("/auctions", protect, adminOnly, getAllAuctions);
router.post("/auctions/:id/end", protect, adminOnly, endAuctionManually);

/* 🔔 الإشعارات */
router.get("/notifications", protect, adminOnly, getAllNotifications);
router.delete("/notifications/:id", protect, adminOnly, deleteNotification);

export default router;
