import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createAuction,
  getAllAuctions,
  getAuctionById,
  placeBid,
  getAuctionBids,
  cancelAuction,
} from "../controllers/auction.controller.js";

import { createMoyasarInvoice } from "../controllers/payment.controller.js";
const router = express.Router();

// إنشاء مزاد جديد
router.post("/", protect, createAuction);

// جلب كل المزادات
router.get("/", getAllAuctions);

// جلب مزاد واحد
router.get("/:id", getAuctionById);

// تقديم مزايدة
router.post("/:id/bids", protect, placeBid);

// جلب المزايدات
router.get("/:id/bids", getAuctionBids);

// إلغاء مزاد
router.delete("/:id", protect, cancelAuction);
router.post("/:id/checkout", protect, createMoyasarInvoice);
export default router;
