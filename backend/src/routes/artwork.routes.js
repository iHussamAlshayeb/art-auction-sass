import express from "express";
import {
  createArtwork,
  updateArtwork,
  deleteArtwork,
  getAllPublicArtworks,
  getStudentArtworks,
  getArtworksById,
} from "../controllers/artwork.controller.js";
import { protect, studentOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// 👨‍🎓 إنشاء عمل فني جديد
router.post("/", protect, studentOnly, createArtwork);

// ✏️ تعديل عمل فني
router.put("/:id", protect, studentOnly, updateArtwork);

// 🗑️ حذف عمل فني
router.delete("/:id", protect, studentOnly, deleteArtwork);

// 🖼️ عرض جميع الأعمال العامة
router.get("/", getAllPublicArtworks);
router.get("/:id", getArtworksById);

// 👨‍🎓 جلب أعمال طالب محدد
router.get("/student/:id", getStudentArtworks);

export default router;
