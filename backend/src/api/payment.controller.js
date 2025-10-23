import axios from "axios";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Auction from "../models/auction.model.js";
import Artwork from "../models/artwork.model.js";
import Notification from "../models/notification.model.js";

// 🧾 إنشاء فاتورة Moyasar
export async function createMoyasarPayment(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user?.id;
  const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;

  if (!mongoose.Types.ObjectId.isValid(auctionId))
    return res.status(400).json({ message: "رقم المزاد غير صالح." });

  if (!moyasarApiKey)
    return res
      .status(500)
      .json({ message: "مفتاح Moyasar غير مهيأ في الخادم." });

  try {
    const auction = await Auction.findById(auctionId).populate("artwork");
    if (!auction) return res.status(404).json({ message: "المزاد غير موجود." });

    if (!auction.highestBidder || auction.highestBidder.toString() !== userId)
      return res.status(403).json({ message: "ليس لديك صلاحية الدفع." });

    if (auction.artwork?.status !== "SOLD")
      return res.status(400).json({ message: "الدفع غير متاح حالياً." });

    const response = await axios.post(
      "https://api.moyasar.com/v1/invoices",
      {
        amount: Math.round(auction.currentPrice * 100),
        currency: "SAR",
        description: `فاتورة للعمل الفني: ${auction.artwork.title}`,
        callback_url: `https://api.fanan3.com/api/v1/payments/verify`,
        metadata: { auctionId, userId },
      },
      { auth: { username: moyasarApiKey, password: "" } }
    );

    // 🧾 حفظ سجل الدفع
    await Payment.create({
      amount: auction.currentPrice,
      currency: "SAR",
      status: "PENDING",
      gatewayPaymentId: response.data.id,
      auction: auction._id,
      user: userId,
    });

    res.status(200).json({ url: response.data.url });
  } catch (error) {
    res.status(500).json({
      message: "فشل إنشاء الفاتورة",
      error: error.response?.data || error.message,
    });
  }
}

// 🔁 Webhook / Callback من Moyasar بعد الدفع
export async function verifyMoyasarPayment(req, res) {
  try {
    const { id, status, amount, metadata } = req.body;
    const { auctionId, userId } = metadata || {};

    const payment = await Payment.findOne({ gatewayPaymentId: id }).populate({
      path: "auction",
      populate: { path: "artwork" },
    });

    if (!payment)
      return res.status(404).json({ message: "الدفعة غير موجودة." });

    payment.status = status === "paid" ? "SUCCESS" : "FAILED";
    await payment.save();

    // ✅ إذا تم الدفع بنجاح
    if (status === "paid") {
      const auction = await Auction.findById(payment.auction._id).populate({
        path: "artwork",
        populate: { path: "student" },
      });

      if (auction) {
        // تحديث المزاد والعمل الفني
        auction.status = "COMPLETED";
        await auction.save();

        await Artwork.findByIdAndUpdate(auction.artwork._id, {
          status: "SOLD",
        });

        // إشعارات الطرفين
        const buyerId = userId;
        const sellerId = auction.artwork.student._id;
        const artworkTitle = auction.artwork.title;

        await Notification.insertMany([
          {
            user: buyerId,
            message: `✅ تم تأكيد عملية الدفع لمزاد "${artworkTitle}" بنجاح!`,
            link: `/auctions/${auctionId}`,
            isRead: false,
          },
          {
            user: sellerId,
            message: `🎉 تم بيع عملك الفني "${artworkTitle}" بنجاح.`,
            link: `/auctions/${auctionId}`,
            isRead: false,
          },
        ]);

        // بث إشعار لحظي عبر Socket.io
        const io = req.app.get("io");
        if (io) {
          io.to(`user-${buyerId}`).emit("notification:new", {
            message: `✅ تم تأكيد عملية الدفع لمزاد "${artworkTitle}" بنجاح!`,
          });
          io.to(`user-${sellerId}`).emit("notification:new", {
            message: `🎉 تم بيع عملك الفني "${artworkTitle}" بنجاح.`,
          });
        }
      }
    }

    res.status(200).json({ message: "تم تحديث حالة الدفع بنجاح." });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res
      .status(500)
      .json({ message: "خطأ أثناء التحقق من الدفع.", error: error.message });
  }
}

// 📜 جلب مدفوعات المستخدم
export async function getMyPayments(req, res) {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ user: userId })
      .populate({
        path: "auction",
        populate: { path: "artwork", select: "title" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ payments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب المدفوعات", error: error.message });
  }
}

// ---== معالجة الكولباك من Moyasar ==---
export async function handleMoyasarCallback(req, res) {
  const { id, status } = req.query;
  const auctionId = req.query.auction_id;

  if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).send("Invalid auction ID");
  }

  try {
    // 🔹 التحقق من الدفع عبر API Moyasar
    const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;
    const response = await axios.get(
      `https://api.moyasar.com/v1/payments/${id}`,
      {
        auth: { username: moyasarApiKey, password: "" },
      }
    );

    const paymentData = response.data;
    if (paymentData.status !== "paid") {
      return res.status(400).send("Payment not completed.");
    }

    // 🔹 تحديث أو إنشاء سجل الدفع في قاعدة البيانات
    await Payment.findOneAndUpdate(
      { gatewayPaymentId: id },
      {
        gatewayPaymentId: id,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        status: "PAID",
        auction: auctionId,
        user: paymentData.metadata?.userId || null,
      },
      { upsert: true, new: true }
    );

    // 🔹 تحديث حالة العمل الفني إلى "PAID"
    const auction = await Auction.findById(auctionId).populate("artwork");
    if (auction && auction.artwork) {
      await Artwork.findByIdAndUpdate(auction.artwork._id, {
        status: "PAID",
      });
    }

    // 🔹 إشعار الطالب (صاحب العمل)
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    if (auction && io && userSocketMap) {
      const artistId = auction.artwork?.student?.toString();
      const socketId = userSocketMap.get(artistId);
      if (socketId) {
        io.to(socketId).emit("notification:new", {
          title: "🎉 تم بيع عملك الفني!",
          message: `تم دفع مبلغ ${paymentData.amount / 100} ر.س لعملك "${
            auction.artwork.title
          }"`,
          link: `/auctions/${auctionId}`,
        });
      }
    }

    return res.redirect(
      `https://app.fanan3.com/dashboard/won-auctions?status=paid`
    );
  } catch (error) {
    console.error("❌ Moyasar callback error:", error.message);
    return res.status(500).send("Error processing payment callback.");
  }
}
