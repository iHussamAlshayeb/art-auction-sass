import express from "express";
import {
  createMoyasarInvoice,
  verifyMoyasarPayment,
} from "./payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/auctions/:id/checkout", protect, createMoyasarInvoice);
router.post("/verify", verifyMoyasarPayment);

export default router;
