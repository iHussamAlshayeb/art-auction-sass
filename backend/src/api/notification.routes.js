import express from "express";
import { getNotifications } from "./notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// حماية المسار، فقط المستخدم المسجل يمكنه رؤية إشعاراته
router.get("/", protect, getNotifications);

export default router;
