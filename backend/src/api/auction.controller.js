import mongoose from "mongoose";
import Auction from "../models/auction.model.js";
import Artwork from "../models/artwork.model.js";
import Bid from "../models/bid.model.js";
import Notification from "../models/notification.model.js";

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

// ---== إنشاء مزاد جديد ==---
export const createAuction = async (req, res) => {
  const { artworkId, startPrice, endTime } = req.body;
  const studentId = req.user?.id;

  if (!artworkId || startPrice == null || !endTime)
    return res.status(400).json({ message: "كل الحقول مطلوبة." });

  if (!mongoose.Types.ObjectId.isValid(artworkId))
    return res.status(400).json({ message: "artworkId غير صالح." });

  const startAmount = toAmount(startPrice);
  if (startAmount == null)
    return res.status(400).json({ message: "قيمة السعر الابتدائي غير صالحة." });

  const endAt = ensureFutureDate(endTime);
  if (!endAt)
    return res.status(400).json({ message: "تاريخ الانتهاء غير صالح." });
  if (endAt <= new Date())
    return res
      .status(400)
      .json({ message: "وقت الانتهاء يجب أن يكون في المستقبل." });

  const session = await mongoose.startSession();

  try {
    let newAuction;

    await session.withTransaction(async () => {
      const artwork = await Artwork.findById(artworkId).session(session);
      if (!artwork) throw new Error("العمل الفني غير موجود.");
      if (artwork.student?.toString() !== studentId)
        throw new Error("يمكنك بدء مزاد لأعمالك الخاصة فقط.");

      if (!["DRAFT", "ENDED"].includes(artwork.status))
        throw new Error("هذا العمل الفني موجود بالفعل في مزاد نشط أو تم بيعه.");

      await Auction.deleteMany({ artwork: artworkId }, { session });

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
    if (error?.code === 11000)
      return res
        .status(409)
        .json({ message: "يوجد مزاد لهذا العمل الفني بالفعل." });

    return res
      .status(500)
      .json({ message: error?.message || "فشل في إنشاء المزاد" });
  } finally {
    session.endSession();
  }
};

// ---== جلب جميع المزادات ==---
export async function getAllAuctions(req, res) {
  const { search, sortBy, page = 1, limit = 12 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = { endTime: { $gt: new Date() } };

    if (search) {
      const artworks = await Artwork.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");

      const ids = artworks.map((a) => a._id);
      if (ids.length === 0)
        return res.status(200).json({
          auctions: [],
          pagination: { currentPage: pageNum, totalPages: 0, totalAuctions: 0 },
        });

      where.artwork = { $in: ids };
    }

    let sortOptions = { startTime: -1 };
    if (sortBy === "ending_soon") sortOptions = { endTime: 1 };
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
      pagination: { currentPage: pageNum, totalPages, totalAuctions },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch auctions", error: error?.message });
  }
}

// ---== جلب مزاد واحد ==---
export async function getAuctionById(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ message: "Auction not found (Invalid ID)" });

  try {
    const auction = await Auction.findById(id).populate({
      path: "artwork",
      populate: { path: "student", select: "_id name" },
    });

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    return res.status(200).json({ auction });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Failed to fetch auction details",
        error: error?.message,
      });
  }
}

// ---== تقديم مزايدة ==---
export async function placeBid(req, res) {
  const { id: auctionId } = req.params;
  const { amount } = req.body;
  const bidderId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(auctionId))
    return res.status(400).json({ message: "رقم المزاد غير صالح." });

  const bidAmount = toAmount(amount);
  if (bidAmount == null)
    return res
      .status(400)
      .json({ message: "مبلغ المزايدة مطلوب وقيمة صالحة." });

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

      if (auction.artwork?.student?.toString() === bidderId)
        throw new Error("لا يمكنك المزايدة على عملك الفني الخاص.");

      const previousHighestBidderId = auction.highestBidder;

      const updatedAuction = await Auction.findByIdAndUpdate(
        auctionId,
        { currentPrice: bidAmount, highestBidder: bidderId },
        { new: true, session }
      );

      const [createdBid] = await Bid.create(
        [{ amount: bidAmount, auction: auctionId, bidder: bidderId }],
        { session }
      );

      txn = {
        bid: createdBid,
        updatedAuction,
        previousHighestBidderId,
        artworkTitle: auction.artwork?.title || "",
      };
    });

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

      await Notification.create({
        user: previousHighestBidderId,
        message: `تم التفوق على مزايدتك في مزاد "${artworkTitle}".`,
        link: `/auctions/${auctionId}`,
        isRead: false,
      });
    }

    return res
      .status(201)
      .json({ message: "تم تقديم المزايدة بنجاح!", bid: txn?.bid });
  } catch (error) {
    const msg = error?.message || "فشل في تقديم المزايدة";
    if (msg.includes("لا يمكنك المزايدة"))
      return res.status(403).json({ message: msg });
    if (msg.includes("المزاد غير موجود"))
      return res.status(404).json({ message: msg });
    if (msg.includes("انتهى بالفعل") || msg.includes("أعلى من السعر الحالي"))
      return res.status(400).json({ message: msg });
    return res.status(500).json({ message: msg });
  } finally {
    session.endSession();
  }
}

// ---== جلب جميع المزايدات ==---
export async function getAuctionBids(req, res) {
  const { id: auctionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(auctionId))
    return res.status(400).json({ message: "رقم المزاد غير صالح." });

  try {
    const bids = await Bid.find({ auction: auctionId })
      .sort({ createdAt: -1 })
      .populate("bidder", "name");

    return res.status(200).json({ bids });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch bids", error: error?.message });
  }
}

// ---== إلغاء المزاد ==---
export async function cancelAuction(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(auctionId))
    return res.status(400).json({ message: "رقم المزاد غير صالح." });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const auction = await Auction.findById(auctionId)
        .session(session)
        .populate("artwork");

      if (!auction) throw new Error("Auction not found.");
      if (auction.artwork?.student?.toString() !== userId)
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

    return res.status(200).json({ message: "Auction cancelled successfully." });
  } catch (error) {
    const msg = error?.message || "Failed to cancel auction";
    if (msg.includes("Forbidden"))
      return res.status(403).json({ message: msg });
    if (msg.includes("not found"))
      return res.status(404).json({ message: msg });
    if (msg.includes("has bids")) return res.status(400).json({ message: msg });
    return res.status(500).json({ message: msg });
  } finally {
    session.endSession();
  }
}
