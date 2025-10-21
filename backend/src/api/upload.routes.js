import express from "express";
import multer from "multer";
import { uploadImage } from "./upload.controller.js";
import { protect, studentOnly } from "../middleware/auth.middleware.js";

// حفظ مؤقت في مجلد "uploads/"
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// 📸 رفع صورة جديدة للعمل الفني
router.post("/", protect, studentOnly, upload.single("image"), uploadImage);

export default router;
