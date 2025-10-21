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
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// === المسارات العامة ===
router.get("/", getAllAuctions);
router.get("/:id", getAuctionById);
router.get("/:id/bids", getAuctionBids);

// === مسارات محمية للطلاب ===
router.post("/", protect, authorize("STUDENT"), createAuction);
router.post("/:id/bids", protect, authorize("STUDENT"), placeBid);
router.post(
  "/:id/checkout",
  protect,
  authorize("STUDENT"),
  createMoyasarPayment
);
router.delete("/:id", protect, authorize("STUDENT"), cancelAuction);

export default router;
