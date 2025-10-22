// src/api/admin.controller.js
import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";
import Notification from "../models/notification.model.js";

/* =========================
 *        الإحصائيات
 * ========================= */
export const getAdminStats = async (req, res) => {
  try {
    const [users, artworks, auctions, soldArtworks, notifications] =
      await Promise.all([
        User.countDocuments(),
        Artwork.countDocuments(),
        Auction.countDocuments(),
        Artwork.countDocuments({ status: "SOLD" }),
        Notification.countDocuments(),
      ]);

    const activeAuctions = await Auction.countDocuments({
      endTime: { $gt: new Date() },
    });

    const revenueAgg = await Auction.aggregate([
      { $match: { highestBidder: { $ne: null } } },
      { $group: { _id: null, total: { $sum: "$currentPrice" } } },
      { $project: { _id: 0, total: 1 } },
    ]);

    res.status(200).json({
      users,
      artworks,
      auctions,
      soldArtworks,
      notifications,
      activeAuctions,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب الإحصائيات", error: error.message });
  }
};

/* =========================
 *     إدارة المستخدمين
 * ========================= */
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب المستخدمين", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "المستخدم غير موجود" });

    // بثّ للمشرفين
    const io = req.app.get("io");
    io.to("admins").emit("admin:update", { type: "USER_DELETED", userId: id });

    res.status(200).json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في حذف المستخدم", error: error.message });
  }
};

/* =========================
 *    إدارة الأعمال الفنية
 * ========================= */
export const getAllArtworks = async (_req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate("student", "name email schoolName")
      .sort({ createdAt: -1 });
    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب الأعمال الفنية", error: error.message });
  }
};

export const deleteArtworkByAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const artwork = await Artwork.findById(id);
    if (!artwork)
      return res.status(404).json({ message: "العمل الفني غير موجود." });

    await Auction.deleteMany({ artwork: artwork._id });
    await Artwork.findByIdAndDelete(id);

    // بثّ للمشرفين
    const io = req.app.get("io");
    io.to("admins").emit("admin:update", {
      type: "ARTWORK_DELETED",
      artworkId: id,
    });

    res.status(200).json({ message: "تم حذف العمل الفني بنجاح." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في حذف العمل الفني.", error: error.message });
  }
};

/* =========================
 *        إدارة المزادات
 * ========================= */
export const getAllAuctions = async (_req, res) => {
  try {
    const auctions = await Auction.find()
      .populate({
        path: "artwork",
        populate: { path: "student", select: "name email schoolName" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ auctions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب المزادات", error: error.message });
  }
};

export const endAuctionManually = async (req, res) => {
  const { id } = req.params;
  try {
    const auction = await Auction.findById(id).populate("artwork");
    if (!auction) return res.status(404).json({ message: "المزاد غير موجود" });

    auction.endTime = new Date();
    auction.status = "ENDED";
    await auction.save();
    await Artwork.findByIdAndUpdate(auction.artwork._id, { status: "ENDED" });

    // بثّ للمشرفين
    const io = req.app.get("io");
    io.to("admins").emit("admin:update", {
      type: "AUCTION_ENDED",
      auctionId: id,
    });

    res.status(200).json({ message: "تم إنهاء المزاد يدويًا بنجاح." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في إنهاء المزاد", error: error.message });
  }
};

/* =========================
 *      إدارة الإشعارات
 * ========================= */
export const getAllNotifications = async (_req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب الإشعارات", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await Notification.findByIdAndDelete(id);
    if (!notif) return res.status(404).json({ message: "الإشعار غير موجود" });

    const io = req.app.get("io");
    io.to("admins").emit("admin:update", {
      type: "NOTIFICATION_DELETED",
      notificationId: id,
    });

    res.status(200).json({ message: "تم حذف الإشعار بنجاح" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في حذف الإشعار", error: error.message });
  }
};
