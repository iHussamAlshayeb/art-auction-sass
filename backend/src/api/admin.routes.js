import express from "express";
import {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllArtworks,
  deleteArtwork,
} from "./admin.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect, checkRole(["ADMIN"]));

// تعريف المسارات
router.get("/stats", getStats);
router.get("/users", getAllUsers);

router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/artworks", getAllArtworks);
router.delete("/artworks/:id", deleteArtwork);

export default router;
