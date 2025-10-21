import mongoose from "mongoose";
import axios from "axios";
import Auction from "../models/auction.model.js";
import Artwork from "../models/artwork.model.js";
import Bid from "../models/bid.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// ---== دالة إنشاء مزاد ==---
export const createAuction = async (req, res) => {
  const { artworkId, startPrice, endTime } = req.body;
  const studentId = req.user.id;

  if (!artworkId || !startPrice || !endTime) {
    return res.status(400).json({ message: "كل الحقول مطلوبة." });
  }

  const session = await mongoose.startSession(); // بدء جلسة (Transaction)

  try {
    let newAuction;
    await session.withTransaction(async () => {
      // 1. التحقق من ملكية العمل الفني وحالته
      const artwork = await Artwork.findById(artworkId).session(session);

      if (!artwork) {
        throw new Error("العمل الفني غير موجود.");
      }
      if (artwork.student.toString() !== studentId) {
        throw new Error("يمكنك بدء مزاد لأعمالك الخاصة فقط.");
      }
      if (!["DRAFT", "ENDED"].includes(artwork.status)) {
        throw new Error("هذا العمل الفني موجود بالفعل في مزاد نشط أو تم بيعه.");
      }

      // 2. حذف أي مزادات قديمة مرتبطة بهذا العمل
      await Auction.deleteMany({ artwork: artworkId }, { session });

      // 3. إنشاء المزاد الجديد
      const auctionResult = await Auction.create(
        [
          {
            artwork: artworkId,
            startPrice: parseFloat(startPrice),
            currentPrice: parseFloat(startPrice),
            startTime: new Date(),
            endTime: new Date(endTime),
          },
        ],
        { session }
      );

      newAuction = auctionResult[0];

      // 4. تحديث حالة العمل الفني
      await Artwork.findByIdAndUpdate(
        artworkId,
        { status: "IN_AUCTION" },
        { session }
      );
    });

    res
      .status(201)
      .json({ message: "تم إنشاء المزاد بنجاح", auction: newAuction });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "يوجد مزاد لهذا العمل الفني بالفعل." });
    }
    res.status(500).json({ message: error.message || "فشل في إنشاء المزاد" });
  } finally {
    session.endSession(); // إنهاء الجلسة
  }
};

export async function getAllAuctions(req, res) {
  const { search, sortBy, page = 1, limit = 12 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const mongoWhere = { endTime: { $gt: new Date() } };

    if (search) {
      const artworks = await Artwork.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");
      const artworkIds = artworks.map((a) => a._id);
      mongoWhere.artwork = { $in: artworkIds };
    }

    let sortOptions = { startTime: "desc" };
    if (sortBy === "ending_soon") sortOptions = { endTime: "asc" };
    else if (sortBy === "price_asc") sortOptions = { currentPrice: "asc" };
    else if (sortBy === "price_desc") sortOptions = { currentPrice: "desc" };

    const auctions = await Auction.find(mongoWhere)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: "artwork",
        populate: {
          path: "student",
          // === الحل هنا: إضافة _id ===
          select: "_id name schoolName gradeLevel",
        },
      });

    const totalAuctions = await Auction.countDocuments(mongoWhere);
    const totalPages = Math.ceil(totalAuctions / limitNum);

    res.status(200).json({
      auctions,
      pagination: {
        /* ... */
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch auctions", error: error.message });
  }
}

// ---== دالة جلب مزاد واحد (تم تعديلها) ==---
export async function getAuctionById(req, res) {
  const { id } = req.params;

  // فحص صلاحية الـ ID (مهم جدًا)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Auction not found (Invalid ID)" });
  }

  try {
    const auction = await Auction.findById(id).populate({
      path: "artwork",
      populate: {
        path: "student",
        // === الحل هنا: إضافة _id ===
        select: "_id name",
      },
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    res.status(200).json({ auction });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch auction details",
        error: error.message,
      });
  }
}

// ---== دالة تقديم مزايدة ==---
export async function placeBid(req, res) {
  const { id: auctionId } = req.params;
  const { amount } = req.body;
  const bidderId = req.user.id;

  if (!amount) {
    return res.status(400).json({ message: "مبلغ المزايدة مطلوب." });
  }

  const session = await mongoose.startSession();
  let transactionResult = {};

  try {
    await session.withTransaction(async () => {
      const auction = await Auction.findById(auctionId)
        .session(session)
        .populate("artwork");

      if (!auction) throw new Error("المزاد غير موجود.");
      if (new Date() > auction.endTime)
        throw new Error("هذا المزاد قد انتهى بالفعل.");
      if (amount <= auction.currentPrice)
        throw new Error("يجب أن تكون مزايدتك أعلى من السعر الحالي.");

      // Mongoose IDs هي objects، لذا نستخدم .toString() للمقارنة
      if (auction.artwork.student.toString() === bidderId) {
        throw new Error("لا يمكنك المزايدة على عملك الفني الخاص.");
      }

      const previousHighestBidderId = auction.highestBidder;

      const updatedAuction = await Auction.findByIdAndUpdate(
        auctionId,
        {
          currentPrice: parseFloat(amount),
          highestBidder: bidderId,
        },
        { new: true, session }
      ); // new: true لإرجاع المستند المحدث

      const bid = await Bid.create(
        [
          {
            amount: parseFloat(amount),
            auction: auctionId,
            bidder: bidderId,
          },
        ],
        { session }
      );

      transactionResult = {
        bid: bid[0],
        updatedAuction,
        previousHighestBidderId,
        artworkTitle: auction.artwork.title,
      };
    });

    // --- منطق الإشعارات (خارج الـ transaction) ---
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const roomName = `auction-${auctionId}`;

    io.to(roomName).emit("priceUpdate", {
      auctionId: auctionId,
      newPrice: transactionResult.updatedAuction.currentPrice,
      bidderName: req.user.name,
    });

    const { previousHighestBidderId, artworkTitle } = transactionResult;
    if (
      previousHighestBidderId &&
      previousHighestBidderId.toString() !== bidderId
    ) {
      const oldBidderSocketId = userSocketMap.get(previousHighestBidderId);
      if (oldBidderSocketId) {
        io.to(oldBidderSocketId).emit("outbid", {
          auctionId: auctionId,
          message: `لقد تمت المزايدة بسعر أعلى منك في مزاد "${artworkTitle}"!`,
        });
      }
      // حفظ الإشعار في MongoDB
      await Notification.create({
        userId: previousHighestBidderId,
        message: `تم التفوق على مزايدتك في مزاد "${artworkTitle}".`,
        link: `/auctions/${auctionId}`,
      });
    }

    res.status(201).json({
      message: "تم تقديم المزايدة بنجاح!",
      bid: transactionResult.bid,
    });
  } catch (error) {
    if (error.message.includes("لا يمكنك المزايدة")) {
      return res.status(403).json({ message: error.message }); // 403 Forbidden
    }
    if (error.message.includes("المزاد غير موجود")) {
      return res.status(404).json({ message: error.message }); // 404 Not Found
    }
    if (
      error.message.includes("انتهى بالفعل") ||
      error.message.includes("أعلى من السعر الحالي")
    ) {
      return res.status(400).json({ message: error.message }); // 400 Bad Request
    }
    res.status(500).json({ message: error.message || "فشل في تقديم المزايدة" });
  } finally {
    session.endSession();
  }
}

// ---== دالة إنشاء الدفع ==---
export async function createMoyasarPayment(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user.id;
  const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;

  try {
    const auction = await Auction.findById(auctionId).populate("artwork");

    if (!auction || auction.highestBidder.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the winner." });
    }
    if (auction.artwork.status !== "SOLD") {
      return res.status(400).json({ message: "Payment is not yet available." });
    }

    const response = await axios.post(
      "https://api.moyasar.com/v1/invoices",
      {
        amount: Math.round(auction.currentPrice * 100),
        currency: "SAR",
        description: `Invoice for artwork: ${auction.artwork.title}`,
        callback_url: `http://app.fanan3.com/payment/callback?auction_id=${auction.id}`,
        // يمكنك إضافة metadata هنا إذا احتجت
      },
      {
        auth: {
          username: moyasarApiKey,
          password: "",
        },
      }
    );
    res.status(200).json({ url: response.data.url });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Moyasar payment",
      error: error.response ? error.response.data : error.message,
    });
  }
}

// ---== دالة جلب المزايدات ==---
export async function getAuctionBids(req, res) {
  const { id: auctionId } = req.params;
  try {
    const bids = await Bid.find({ auction: auctionId })
      .sort({ createdAt: "desc" })
      .populate("bidder", "name"); // جلب الاسم فقط من موديل User

    res.status(200).json({ bids });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch bids", error: error.message });
  }
}

// ---== دالة إلغاء المزاد ==---
export async function cancelAuction(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user.id;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const auction = await Auction.findById(auctionId)
        .session(session)
        .populate("artwork");
      if (!auction) throw new Error("Auction not found.");
      if (auction.artwork.student.toString() !== userId)
        throw new Error("Forbidden: You can only cancel your own auctions.");

      const bidCount = await Bid.countDocuments({ auction: auctionId }).session(
        session
      );
      if (bidCount > 0)
        throw new Error("Cannot cancel an auction that already has bids.");

      await Artwork.findByIdAndUpdate(
        auction.artwork._id,
        { status: "DRAFT" },
        { session }
      );
      await Auction.findByIdAndDelete(auctionId, { session });
    });

    res.status(200).json({ message: "Auction cancelled successfully." });
  } catch (error) {
    if (error.message.includes("Forbidden")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("has bids")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: error.message || "Failed to cancel auction" });
  } finally {
    session.endSession();
  }
}
