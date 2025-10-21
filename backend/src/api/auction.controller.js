import mongoose from "mongoose";
import axios from "axios";
import Auction from "../models/auction.model.js";
import Artwork from "../models/artwork.model.js";
import Bid from "../models/bid.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// helper: تحويل رقم
const toAmount = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
};

// helper: تحقق وقتي
const ensureFutureDate = (dt) => {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

// ---== دالة إنشاء مزاد ==---
export const createAuction = async (req, res) => {
  const { artworkId, startPrice, endTime } = req.body;
  const studentId = req.user?.id;

  if (!artworkId || startPrice == null || !endTime) {
    return res.status(400).json({ message: "كل الحقول مطلوبة." });
  }
  if (!mongoose.Types.ObjectId.isValid(artworkId)) {
    return res.status(400).json({ message: "artworkId غير صالح." });
  }

  const startAmount = toAmount(startPrice);
  if (startAmount == null) {
    return res.status(400).json({ message: "قيمة السعر الابتدائي غير صالحة." });
  }

  const endAt = ensureFutureDate(endTime);
  if (!endAt) {
    return res.status(400).json({ message: "تاريخ الانتهاء غير صالح." });
  }
  if (endAt <= new Date()) {
    return res
      .status(400)
      .json({ message: "وقت الانتهاء يجب أن يكون في المستقبل." });
  }

  const session = await mongoose.startSession();

  try {
    let newAuction;

    await session.withTransaction(async () => {
      // 1) التحقق من العمل الفني وملكيته
      const artwork = await Artwork.findById(artworkId).session(session);
      if (!artwork) {
        throw new Error("العمل الفني غير موجود.");
      }
      if (artwork.student?.toString() !== studentId) {
        throw new Error("يمكنك بدء مزاد لأعمالك الخاصة فقط.");
      }
      // السماح فقط إذا كان العمل في وضع المسودة أو مزاده منتهي/غير نشط
      if (!["DRAFT", "ENDED"].includes(artwork.status)) {
        throw new Error("هذا العمل الفني موجود بالفعل في مزاد نشط أو تم بيعه.");
      }

      // 2) حذف أي مزادات قديمة مرتبطة بهذا العمل
      await Auction.deleteMany({ artwork: artworkId }, { session });

      // 3) إنشاء المزاد
      const result = await Auction.create(
        [
          {
            artwork: artworkId,
            startPrice: startAmount,
            currentPrice: startAmount,
            startTime: new Date(),
            endTime: endAt,
            highestBidder: null,
          },
        ],
        { session }
      );
      newAuction = result[0];

      // 4) تحديث حالة العمل الفني
      await Artwork.findByIdAndUpdate(
        artworkId,
        { status: "IN_AUCTION" },
        { session }
      );
    });

    return res
      .status(201)
      .json({ message: "تم إنشاء المزاد بنجاح", auction: newAuction });
  } catch (error) {
    // 11000 => فهرس فريد (مثلاً unique على artwork في Auction)
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "يوجد مزاد لهذا العمل الفني بالفعل." });
    }
    return res
      .status(500)
      .json({ message: error?.message || "فشل في إنشاء المزاد" });
  } finally {
    session.endSession();
  }
};

// ---== دالة جلب كل المزادات ==---
export async function getAllAuctions(req, res) {
  const { search, sortBy, page = 1, limit = 12 } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = {
      endTime: { $gt: new Date() },
    };

    if (search) {
      // استعلام مرحلتين: البحث عن الأعمال ثم استخدام IDs في المزادات
      const artworks = await Artwork.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");
      const ids = artworks.map((a) => a._id);
      if (ids.length === 0) {
        return res.status(200).json({
          auctions: [],
          pagination: {
            currentPage: pageNum,
            totalPages: 0,
            totalAuctions: 0,
          },
        });
      }
      where.artwork = { $in: ids };
    }

    let sortOptions = { startTime: -1 }; // desc
    if (sortBy === "ending_soon") sortOptions = { endTime: 1 }; // asc
    else if (sortBy === "price_asc") sortOptions = { currentPrice: 1 };
    else if (sortBy === "price_desc") sortOptions = { currentPrice: -1 };

    const [auctions, totalAuctions] = await Promise.all([
      Auction.find(where)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: "artwork",
          populate: {
            path: "student",
            select: "_id name schoolName gradeLevel",
          },
        }),
      Auction.countDocuments(where),
    ]);

    const totalPages = Math.ceil(totalAuctions / limitNum);

    return res.status(200).json({
      auctions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalAuctions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch auctions",
      error: error?.message,
    });
  }
}

// ---== دالة جلب مزاد واحد ==---
export async function getAuctionById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Auction not found (Invalid ID)" });
  }

  try {
    const auction = await Auction.findById(id).populate({
      path: "artwork",
      populate: { path: "student", select: "_id name" },
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    return res.status(200).json({ auction });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch auction details",
      error: error?.message,
    });
  }
}

// ---== دالة تقديم مزايدة ==---
export async function placeBid(req, res) {
  const { id: auctionId } = req.params;
  const { amount } = req.body;
  const bidderId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({ message: "رقم المزاد غير صالح." });
  }

  const bidAmount = toAmount(amount);
  if (bidAmount == null) {
    return res
      .status(400)
      .json({ message: "مبلغ المزايدة مطلوب وقيمة صالحة." });
  }

  const session = await mongoose.startSession();
  let txn = null;

  try {
    await session.withTransaction(async () => {
      const auction = await Auction.findById(auctionId)
        .session(session)
        .populate("artwork");

      if (!auction) throw new Error("المزاد غير موجود.");
      if (new Date() > auction.endTime)
        throw new Error("هذا المزاد قد انتهى بالفعل.");
      if (bidAmount <= auction.currentPrice)
        throw new Error("يجب أن تكون مزايدتك أعلى من السعر الحالي.");

      // منع الطالب مالك العمل من المزايدة
      if (auction.artwork?.student?.toString() === bidderId) {
        throw new Error("لا يمكنك المزايدة على عملك الفني الخاص.");
      }

      const previousHighestBidderId = auction.highestBidder;

      // تحديث المزاد
      const updatedAuction = await Auction.findByIdAndUpdate(
        auctionId,
        { currentPrice: bidAmount, highestBidder: bidderId },
        { new: true, session }
      );

      // إنشاء سجل المزايدة
      const [createdBid] = await Bid.create(
        [
          {
            amount: bidAmount,
            auction: auctionId,
            bidder: bidderId,
          },
        ],
        { session }
      );

      txn = {
        bid: createdBid,
        updatedAuction,
        previousHighestBidderId,
        artworkTitle: auction.artwork?.title || "",
      };
    });

    // === الإشعارات والبث اللحظي بعد نجاح المعاملة ===
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const roomName = `auction-${auctionId}`;

    if (io) {
      io.to(roomName).emit("priceUpdate", {
        auctionId,
        newPrice: txn.updatedAuction.currentPrice,
        bidderName: req.user?.name || "مستخدم",
      });
    }

    const { previousHighestBidderId, artworkTitle } = txn || {};
    if (
      previousHighestBidderId &&
      previousHighestBidderId.toString() !== bidderId
    ) {
      const key = previousHighestBidderId.toString();
      const oldBidderSocketId = userSocketMap?.get
        ? userSocketMap.get(key)
        : null;

      if (io && oldBidderSocketId) {
        io.to(oldBidderSocketId).emit("outbid", {
          auctionId,
          message: `لقد تمت المزايدة بسعر أعلى منك في مزاد "${artworkTitle}"!`,
        });
      }

      // حفظ إشعار في MongoDB (حقل المستخدم اسمه "user" وليس "userId")
      await Notification.create({
        user: previousHighestBidderId,
        message: `تم التفوق على مزايدتك في مزاد "${artworkTitle}".`,
        link: `/auctions/${auctionId}`,
        isRead: false,
      });
    }

    return res.status(201).json({
      message: "تم تقديم المزايدة بنجاح!",
      bid: txn?.bid,
    });
  } catch (error) {
    const msg = error?.message || "فشل في تقديم المزايدة";
    if (msg.includes("لا يمكنك المزايدة")) {
      return res.status(403).json({ message: msg }); // Forbidden
    }
    if (msg.includes("المزاد غير موجود")) {
      return res.status(404).json({ message: msg }); // Not Found
    }
    if (msg.includes("انتهى بالفعل") || msg.includes("أعلى من السعر الحالي")) {
      return res.status(400).json({ message: msg }); // Bad Request
    }
    return res.status(500).json({ message: msg });
  } finally {
    session.endSession();
  }
}

// ---== دالة إنشاء الدفع (Moyasar) ==---
export async function createMoyasarPayment(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user?.id;
  const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;

  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({ message: "رقم المزاد غير صالح." });
  }
  if (!moyasarApiKey) {
    return res
      .status(500)
      .json({ message: "مفتاح Moyasar غير مهيأ في الخادم." });
  }

  try {
    const auction = await Auction.findById(auctionId).populate("artwork");
    if (!auction) {
      return res.status(404).json({ message: "Auction not found." });
    }

    // يجب أن يكون المستخدم هو المزايد الأعلى
    if (!auction.highestBidder || auction.highestBidder.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the winner." });
    }

    // السماح بالدفع فقط بعد تغيير حالة العمل إلى SOLD (أو بعد معالجة الانتهاء)
    if (auction.artwork?.status !== "SOLD") {
      return res.status(400).json({ message: "Payment is not yet available." });
    }

    const response = await axios.post(
      "https://api.moyasar.com/v1/invoices",
      {
        amount: Math.round(auction.currentPrice * 100), // بالهللات
        currency: "SAR",
        description: `Invoice for artwork: ${auction.artwork?.title || ""}`,
        callback_url: `http://app.fanan3.com/payment/callback?auction_id=${auctionId}`,
        // يمكن إضافة metadata عند الحاجة
      },
      {
        auth: { username: moyasarApiKey, password: "" },
      }
    );

    return res.status(200).json({ url: response?.data?.url });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create Moyasar payment",
      error: error?.response ? error.response.data : error?.message,
    });
  }
}

// ---== دالة جلب المزايدات ==---
export async function getAuctionBids(req, res) {
  const { id: auctionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({ message: "رقم المزاد غير صالح." });
  }

  try {
    const bids = await Bid.find({ auction: auctionId })
      .sort({ createdAt: -1 }) // الأحدث أولاً
      .populate("bidder", "name");

    return res.status(200).json({ bids });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch bids",
      error: error?.message,
    });
  }
}

// ---== دالة إلغاء المزاد ==---
export async function cancelAuction(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({ message: "رقم المزاد غير صالح." });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const auction = await Auction.findById(auctionId)
        .session(session)
        .populate("artwork");

      if (!auction) {
        throw new Error("Auction not found.");
      }
      if (auction.artwork?.student?.toString() !== userId) {
        throw new Error("Forbidden: You can only cancel your own auctions.");
      }

      const bidCount = await Bid.countDocuments({ auction: auctionId }).session(
        session
      );
      if (bidCount > 0) {
        throw new Error("Cannot cancel an auction that already has bids.");
      }

      await Artwork.findByIdAndUpdate(
        auction.artwork._id,
        { status: "DRAFT" },
        { session }
      );

      await Auction.findByIdAndDelete(auctionId, { session });
    });

    return res.status(200).json({ message: "Auction cancelled successfully." });
  } catch (error) {
    const msg = error?.message || "Failed to cancel auction";
    if (msg.includes("Forbidden")) {
      return res.status(403).json({ message: msg });
    }
    if (msg.includes("not found")) {
      return res.status(404).json({ message: msg });
    }
    if (msg.includes("has bids")) {
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: msg });
  } finally {
    session.endSession();
  }
}
