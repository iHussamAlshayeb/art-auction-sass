import express from "express";
import {
  createAuction,
  getAllAuctions,
  getAuctionById,
  placeBid,
  createMoyasarPayment,
  getAuctionBids,
  cancelAuction,
} from "./auction.controller.js";
import {
  protect,
  studentOnly,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// 👨‍🎓 إنشاء مزاد — الطلاب فقط
router.post("/", protect, studentOnly, createAuction);

// 🟢 جلب كل المزادات (متاح للجميع)
router.get("/", getAllAuctions);

// 🔍 تفاصيل مزاد
router.get("/:id", getAuctionById);

// 💰 المزايدات — الطلاب فقط
router.post("/:id/bids", protect, studentOnly, placeBid);
router.get("/:id/bids", getAuctionBids);

// 💳 إنشاء عملية الدفع (للفائز فقط)
router.post("/:id/checkout", protect, studentOnly, createMoyasarPayment);

// ❌ إلغاء مزاد — للطالب المالك فقط
router.delete("/:id", protect, studentOnly, cancelAuction);

export default router;
