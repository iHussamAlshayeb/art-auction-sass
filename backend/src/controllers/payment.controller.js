import axios from "axios";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Auction from "../models/auction.model.js";
import Artwork from "../models/artwork.model.js";

/**
 * ✅ إنشاء فاتورة Moyasar (Invoice)
 */
export async function createMoyasarInvoice(req, res) {
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
}

/**
 * 🧩 التحقق من حالة الدفع (Callback)
 */
export async function verifyMoyasarPayment(req, res) {
  console.log("==========================================");
  console.log("📩 [VERIFY] Callback Received from Moyasar");
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("==========================================");

  const { id, status, amount, currency, metadata } = req.body || {};

  if (!id) {
    console.log("❌ No payment ID received from Moyasar");
    return res.status(400).json({ message: "missing payment id" });
  }

  if (!metadata || !metadata.auctionId || !metadata.userId) {
    console.log("❌ Metadata incomplete:", metadata);
    return res
      .status(400)
      .json({ message: "metadata missing auctionId/userId" });
  }

  try {
    // ✅ Step 1: Log start
    console.log(`💳 Processing Payment [${id}]...`);

    if (status !== "paid") {
      console.log(`⚠️ Payment status is not 'paid':`, status);
      return res.status(400).json({ message: "payment not paid yet" });
    }

    // ✅ Step 2: حفظ الدفع أو تحديثه
    console.log("🧾 Attempting to save payment to MongoDB...");

    const payment = await Payment.findOneAndUpdate(
      { gatewayPaymentId: id },
      {
        gatewayPaymentId: id,
        amount: amount ? amount / 100 : 0,
        currency: currency || "SAR",
        status: "PAID",
        auction: metadata.auctionId,
        user: metadata.userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("✅ Payment saved successfully:", payment);

    // ✅ Step 3: تحديث حالة العمل الفني
    const auction = await Auction.findById(metadata.auctionId).populate(
      "artwork"
    );
    if (auction?.artwork) {
      await Artwork.findByIdAndUpdate(auction.artwork._id, { status: "PAID" });
      console.log(`🎨 Artwork ${auction.artwork._id} marked as PAID`);
    }

    // ✅ Step 4: تحديث المزاد نفسه
    await Auction.findByIdAndUpdate(metadata.auctionId, { status: "PAID" });
    console.log(`🏆 Auction ${metadata.auctionId} marked as PAID`);

    return res.status(200).json({ message: "تم تسجيل الدفع بنجاح ✅" });
  } catch (err) {
    console.error("❌ ERROR SAVING PAYMENT:", err);
    return res
      .status(500)
      .json({ message: "Error saving payment", error: err.message });
  }
}
