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

  if (!mongoose.Types.ObjectId.isValid(artworkId)) {
    return res.status(400).json({ message: "Invalid artwork ID." });
  }

  const session = await mongoose.startSession();

  try {
    let newAuction;
    await session.withTransaction(async () => {
      const artwork = await Artwork.findById(artworkId).session(session);
      if (!artwork) throw new Error("العمل الفني غير موجود.");
      if (artwork.student.toString() !== studentId) {
        throw new Error("يمكنك بدء مزاد لأعمالك الخاصة فقط.");
      }
      if (!["DRAFT", "ENDED"].includes(artwork.status)) {
        throw new Error("هذا العمل الفني موجود بالفعل في مزاد نشط أو تم بيعه.");
      }

      await Auction.deleteMany({ artwork: artworkId }, { session });

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

      await Artwork.findByIdAndUpdate(
        artworkId,
        { status: "IN_AUCTION" },
        { session }
      );
    });

    // ✅ توحيد الـ id
    const auctionData = {
      ...newAuction.toObject(),
      id: newAuction._id,
    };

    res
      .status(201)
      .json({ message: "تم إنشاء المزاد بنجاح", auction: auctionData });
  } catch (error) {
    console.error("Error creating auction:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "يوجد مزاد لهذا العمل الفني بالفعل." });
    }
    res.status(500).json({ message: error.message || "فشل في إنشاء المزاد" });
  } finally {
    session.endSession();
  }
};

// ---== دالة جلب كل المزادات ==---
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
          select: "_id name schoolName gradeLevel",
        },
      })
      .lean();

    const formattedAuctions = auctions.map((a) => ({
      ...a,
      id: a._id,
      artwork: a.artwork
        ? {
            ...a.artwork,
            id: a.artwork._id,
            student: a.artwork.student
              ? {
                  ...a.artwork.student,
                  id: a.artwork.student._id,
                }
              : null,
          }
        : null,
    }));

    const totalAuctions = await Auction.countDocuments(mongoWhere);

    res.status(200).json({
      auctions: formattedAuctions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalAuctions / limitNum),
        totalAuctions,
      },
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch auctions", error: error.message });
  }
}

// ---== دالة جلب مزاد واحد ==---
export async function getAuctionById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid auction ID" });
  }

  try {
    const auction = await Auction.findById(id)
      .populate({
        path: "artwork",
        populate: {
          path: "student",
          select: "_id name schoolName gradeLevel",
        },
      })
      .lean();

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const formattedAuction = {
      ...auction,
      id: auction._id,
      artwork: auction.artwork
        ? {
            ...auction.artwork,
            id: auction.artwork._id,
            student: auction.artwork.student
              ? { ...auction.artwork.student, id: auction.artwork.student._id }
              : null,
          }
        : null,
    };

    res.status(200).json({ auction: formattedAuction });
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({
      message: "Failed to fetch auction details",
      error: error.message,
    });
  }
}

// ---== دالة المزايدة ==---
export async function placeBid(req, res) {
  const { id: auctionId } = req.params;
  const { amount } = req.body;
  const bidderId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return res.status(400).json({ message: "Invalid auction ID" });
  }

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
      if (auction.artwork.student.toString() === bidderId)
        throw new Error("لا يمكنك المزايدة على عملك الفني الخاص.");

      const previousHighestBidderId = auction.highestBidder;

      const updatedAuction = await Auction.findByIdAndUpdate(
        auctionId,
        { currentPrice: parseFloat(amount), highestBidder: bidderId },
        { new: true, session }
      );

      const bid = await Bid.create(
        [{ amount: parseFloat(amount), auction: auctionId, bidder: bidderId }],
        { session }
      );

      transactionResult = {
        bid: bid[0],
        updatedAuction,
        previousHighestBidderId,
        artworkTitle: auction.artwork.title,
      };
    });

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const roomName = `auction-${auctionId}`;

    io.to(roomName).emit("priceUpdate", {
      auctionId,
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
          auctionId,
          message: `لقد تمت المزايدة بسعر أعلى منك في مزاد "${artworkTitle}"!`,
        });
      }

      await Notification.create({
        userId: previousHighestBidderId,
        message: `تم التفوق على مزايدتك في مزاد "${artworkTitle}".`,
        link: `/auctions/${auctionId}`,
      });
    }

    res.status(201).json({
      message: "تم تقديم المزايدة بنجاح!",
      bid: {
        ...transactionResult.bid.toObject(),
        id: transactionResult.bid._id,
      },
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    const msg = error.message;
    if (msg.includes("لا يمكنك المزايدة"))
      return res.status(403).json({ message: msg });
    if (msg.includes("المزاد غير موجود"))
      return res.status(404).json({ message: msg });
    if (msg.includes("انتهى بالفعل") || msg.includes("أعلى من السعر الحالي"))
      return res.status(400).json({ message: msg });
    res.status(500).json({ message: msg || "فشل في تقديم المزايدة" });
  } finally {
    session.endSession();
  }
}
