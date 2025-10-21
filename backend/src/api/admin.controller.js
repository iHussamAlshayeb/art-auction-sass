import mongoose from "mongoose";
import User from "../models/user.model.js";
import Auction from "../models/auction.model.js";
import Payment from "../models/payment.model.js";
import Artwork from "../models/artwork.model.js";
import Bid from "../models/bid.model.js";

// ---== دالة جلب الإحصائيات (نسخة Mongoose) ==---
export const getStats = async (req, res) => {
  try {
    // 1. حساب المستخدمين والمزادات النشطة بالتوازي
    const [userCount, activeAuctionsCount] = await Promise.all([
      User.countDocuments(),
      Auction.countDocuments({ endTime: { $gt: new Date() } }),
    ]);

    // 2. حساب إجمالي الإيرادات (يتطلب Aggregation)
    const totalSalesPipeline = await Payment.aggregate([
      { $match: { status: "paid" } }, // مطابقة المدفوعات الناجحة
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }, // جمع المبالغ
    ]);

    const totalRevenue =
      totalSalesPipeline.length > 0 ? totalSalesPipeline[0].totalAmount : 0;

    res.status(200).json({
      users: userCount,
      activeAuctions: activeAuctionsCount,
      totalRevenue: totalRevenue,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch stats", error: error.message });
  }
};

// ---== دالة جلب كل المستخدمين (نسخة Mongoose) ==---
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt") // تحديد الحقول
      .sort({ createdAt: -1 }); // -1 تعادل 'desc'

    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// ---== دالة تغيير دور المستخدم (نسخة Mongoose) ==---
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["STUDENT", "ADMIN"].includes(role)) {
    // تم تحديث الأدوار
    return res.status(400).json({ message: "Invalid role provided." });
  }

  try {
    // 3. استخدام Mongoose للبحث والتحديث
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true } // لإرجاع المستند المحدث
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User role updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user role", error: error.message });
  }
};

// ---== دالة حذف مستخدم (نسخة Mongoose مع الحذف المتتالي) ==---
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession(); // بدء جلسة (Transaction)

  try {
    await session.withTransaction(async () => {
      // 1. ابحث عن المستخدم أولاً
      const user = await User.findById(id).session(session);
      if (!user) {
        throw new Error("User not found.");
      }

      // 2. ابحث عن كل الأعمال الفنية لهذا المستخدم
      const artworks = await Artwork.find({ student: id })
        .session(session)
        .select("_id");
      const artworkIds = artworks.map((a) => a._id);

      // 3. ابحث عن كل المزادات المرتبطة بهذه الأعمال
      const auctions = await Auction.find({ artwork: { $in: artworkIds } })
        .session(session)
        .select("_id");
      const auctionIds = auctions.map((a) => a._id);

      // 4. حذف كل البيانات المرتبطة (المزايدات، الدفعات، إلخ)
      await Bid.deleteMany({ auction: { $in: auctionIds } }, { session });
      await Payment.deleteMany({ auction: { $in: auctionIds } }, { session });
      await Auction.deleteMany({ _id: { $in: auctionIds } }, { session });
      await Artwork.deleteMany({ _id: { $in: artworkIds } }, { session });

      // 5. حذف المزايدات والدفعات الخاصة بالمستخدم (كمزايد)
      await Bid.deleteMany({ bidder: id }, { session });
      await Payment.deleteMany({ user: id }, { session });

      // 6. تحديث المزادات التي فاز بها (جعل الفائز null)
      await Auction.updateMany(
        { highestBidder: id },
        { $set: { highestBidder: null } },
        { session }
      );

      // 7. أخيرًا، حذف المستخدم نفسه
      await User.findByIdAndDelete(id, { session });
    });

    res
      .status(200)
      .json({ message: "User and all associated data deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete user" });
  } finally {
    session.endSession();
  }
};

// ---== دالة جلب كل الأعمال الفنية (نسخة Mongoose) ==---
export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate("student", "name") // .populate تعادل 'include'
      .sort({ createdAt: -1 });

    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch artworks", error: error.message });
  }
};

// ---== دالة حذف عمل فني (نسخة Mongoose مع الحذف المتتالي) ==---
export const deleteArtwork = async (req, res) => {
  const { id } = req.params; // هذا هو artworkId

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. ابحث عن المزاد المرتبط (إن وجد)
      const auction = await Auction.findOne({ artwork: id })
        .session(session)
        .select("_id");

      if (auction) {
        const auctionId = auction._id;
        // 2. احذف كل البيانات المرتبطة بالمزاد
        await Bid.deleteMany({ auction: auctionId }, { session });
        await Payment.deleteMany({ auction: auctionId }, { session });
        // 3. احذف المزاد
        await Auction.findByIdAndDelete(auctionId, { session });
      }

      // 4. احذف العمل الفني نفسه
      await Artwork.findByIdAndDelete(id, { session });
    });

    res.status(200).json({
      message: "Artwork and associated auction data deleted successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to delete artwork" });
  } finally {
    session.endSession();
  }
};
