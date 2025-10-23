import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createMoyasarPayment,
  verifyMoyasarPayment,
  getMyPayments,
} from "../controllers/payment.controller.js";

const router = express.Router();

// 💳 إنشاء فاتورة دفع
router.post("/auctions/:id/checkout", protect, createMoyasarPayment);

// 🔁 استلام إشعار من Moyasar (Webhook)
router.post("/payments/verify", verifyMoyasarPayment);

// 📜 جلب مدفوعات المستخدم
router.get("/payments/my", protect, getMyPayments);

export default router;
