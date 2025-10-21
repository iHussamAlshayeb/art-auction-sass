import express from "express";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
} from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/mark-read", protect, markAllAsRead); // <-- مسار جديد
router.delete("/:id", protect, deleteNotification); // <-- مسار جديد

export default router;
