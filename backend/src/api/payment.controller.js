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
  console.log(
    "📩 [VERIFY] Callback Received from Moyasar ======================="
  );
  console.log("📦 Payload:", JSON.stringify(req.body, null, 2));
  console.log(
    "================================================================="
  );

  const { id, status, metadata, amount, currency } = req.body || {};

  if (!id) {
    console.log("❌ Missing payment ID in payload");
    return res
      .status(400)
      .json({ message: "بيانات الدفع غير صالحة (id مفقود)." });
  }

  if (!metadata || !metadata.auctionId) {
    console.log("❌ Missing metadata.auctionId in payload");
    return res
      .status(400)
      .json({ message: "بيانات الدفع غير صالحة (auctionId مفقود)." });
  }

  try {
    console.log(`🧩 Processing payment ID: ${id} | Status: ${status}`);

    if (status?.toLowerCase() !== "paid") {
      console.log("⚠️ Payment not marked as 'paid'. Skipping update.");
      return res.status(400).json({ message: "عملية الدفع لم تكتمل بعد." });
    }

    const { auctionId, userId } = metadata;

    // 1️⃣ حفظ أو تحديث الدفع
    const payment = await Payment.findOneAndUpdate(
      { gatewayPaymentId: id },
      {
        gatewayPaymentId: id,
        amount: amount ? amount / 100 : 0,
        currency: currency || "SAR",
        status: "PAID",
        auction: auctionId,
        user: userId,
      },
      { upsert: true, new: true }
    );

    console.log("💾 Payment record updated/created:", payment?._id);

    // 2️⃣ تحديث حالة العمل الفني
    const auction = await Auction.findById(auctionId).populate("artwork");
    if (auction?.artwork) {
      await Artwork.findByIdAndUpdate(auction.artwork._id, { status: "PAID" });
      console.log(`🎨 Artwork ${auction.artwork._id} → status: PAID`);
    } else {
      console.log("⚠️ Artwork not found for this auction.");
    }

    // 3️⃣ تحديث حالة المزاد
    const updatedAuction = await Auction.findByIdAndUpdate(
      auctionId,
      { status: "PAID" },
      { new: true }
    );

    if (updatedAuction) {
      console.log(
        `🏆 Auction ${auctionId} → status updated to: ${updatedAuction.status}`
      );
    } else {
      console.log("⚠️ Auction not found during update.");
    }

    // 4️⃣ تأكيد الرد لمويصر
    console.log("✅ Payment verification completed successfully.");

    return res.status(200).json({
      message: "تم تأكيد الدفع وتحديث البيانات بنجاح ✅",
      payment,
      updatedAuction,
    });
  } catch (err) {
    console.error("❌ Error verifying payment:", err);
    return res.status(500).json({ message: "فشل في معالجة التحقق من الدفع." });
  }
};
