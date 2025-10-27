import express from "express";
import {
  getMyProfileData, // <-- تم تصحيح الاسم هنا
  updateMyProfile,
  updateMyPassword,
  getMyArtworks,
  getMyActiveBids,
  getMyWonArtworks,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// كل المسارات هنا محمية
router.use(protect);

router.get("/me", getMyProfileData); // <-- تم تصحيح الاستخدام هنا
router.put("/me", updateMyProfile);
router.put("/me/password", updateMyPassword);

router.get("/me/artworks", getMyArtworks);
router.get("/me/bids", getMyActiveBids);
router.get("/me/wins", getMyWonArtworks);

export default router;
