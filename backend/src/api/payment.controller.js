import axios from "axios";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Auction from "../models/auction.model.js";
import Artwork from "../models/artwork.model.js";

/**
 * ✅ إنشاء فاتورة Moyasar (Invoice)
 */
export const createMoyasarInvoice = async (req, res) => {
  const { id: auctionId } = req.params;
  const userId = req.user?.id;
  const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;

  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({ message: "رقم المزاد غير صالح." });
  }

  try {
    const auction = await Auction.findById(auctionId).populate("artwork");
    if (!auction) return res.status(404).json({ message: "المزاد غير موجود." });

    if (!auction.highestBidder || auction.highestBidder.toString() !== userId) {
      return res.status(403).json({ message: "لا يمكنك الدفع لهذا المزاد." });
    }

    if (auction.artwork?.status !== "SOLD") {
      return res
        .status(400)
        .json({ message: "لا يمكن الدفع إلا بعد تأكيد البيع." });
    }

    const invoiceResponse = await axios.post(
      "https://api.moyasar.com/v1/invoices",
      {
        amount: Math.round(auction.currentPrice * 100), // بالهللات
        currency: "SAR",
        description: `فاتورة لشراء العمل الفني: ${
          auction.artwork?.title || ""
        }`,
        callback_url: "https://api.fanan3.com/api/v1/payments/verify",
        success_url: `https://app.fanan3.com/payment/success?auction=${auctionId}`,
        back_url: "https://app.fanan3.com/dashboard/won-auctions",
        metadata: {
          auctionId: auctionId,
          userId: userId,
        },
      },
      {
        auth: { username: moyasarApiKey, password: "" },
      }
    );

    return res.status(200).json({ url: invoiceResponse.data.url });
  } catch (err) {
    console.error(
      "❌ Moyasar Invoice Error:",
      err.response?.data || err.message
    );
    return res.status(500).json({ message: "فشل إنشاء الفاتورة." });
  }
};

/**
 * 🧩 التحقق من حالة الدفع (Callback)
 */
export const verifyMoyasarPayment = async (req, res) => {
  const { id, status, metadata } = req.body;

  if (!id || !metadata?.auctionId) {
    return res.status(400).json({ message: "بيانات الدفع غير صالحة." });
  }

  try {
    if (status !== "paid") {
      return res.status(400).json({ message: "عملية الدفع لم تكتمل." });
    }

    const { auctionId, userId } = metadata;

    // ✅ 1. حفظ أو تحديث سجل الدفع
    const payment = await Payment.findOneAndUpdate(
      { gatewayPaymentId: id },
      {
        gatewayPaymentId: id,
        amount: req.body.amount / 100,
        currency: req.body.currency,
        status: "PAID",
        auction: auctionId,
        user: userId,
      },
      { upsert: true, new: true }
    );

    // ✅ 2. تحديث حالة العمل الفني
    const auction = await Auction.findById(auctionId).populate("artwork");
    if (auction?.artwork) {
      await Artwork.findByIdAndUpdate(auction.artwork._id, { status: "PAID" });
    }

    // ✅ 3. تحديث حالة المزاد نفسه
    await Auction.findByIdAndUpdate(auctionId, { status: "PAID" });

    // ✅ 4. إشعار المستخدم في حال أردت (اختياري)
    // const io = req.app.get("io");
    // const userSocketMap = req.app.get("userSocketMap");
    // if (io && userSocketMap.has(userId.toString())) {
    //   io.to(userSocketMap.get(userId.toString())).emit("notifications:refresh");
    // }

    return res.status(200).json({
      message: "تم تأكيد الدفع وتحديث المزاد والبيانات بنجاح ✅",
      payment,
    });
  } catch (err) {
    console.error("❌ Moyasar Callback Error:", err.message);
    return res.status(500).json({ message: "فشل في التحقق من الدفع." });
  }
};
