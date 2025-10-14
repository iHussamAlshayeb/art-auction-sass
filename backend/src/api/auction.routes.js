import express from "express";
// استيراد الدوال الجديدة
import {
  createAuction,
  getAllAuctions,
  getAuctionById,
  placeBid,
  createMoyasarPayment,
  getAuctionBids,
  cancelAuction,
} from "./auction.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, checkRole(["STUDENT"]), createAuction);
router.get("/", getAllAuctions);
router.get("/:id", getAuctionById);

router.get("/:id/bids", getAuctionBids);

router.post("/:id/bids", protect, checkRole(["BUYER"]), placeBid);

router.post("/:id/checkout", protect, createMoyasarPayment);

router.delete("/:id", protect, checkRole(["STUDENT"]), cancelAuction);

export default router;
