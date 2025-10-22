import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";
import Notification from "../models/notification.model.js";

// ---== جلب كل المستخدمين ==---
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب المستخدمين", error: error.message });
  }
};

// ---== حذف مستخدم ==---
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.status(200).json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في حذف المستخدم", error: error.message });
  }
};

// ---== جلب كل المزادات ==---
export const getAllAuctions = async (req, res) => {
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

// ---== إنهاء مزاد يدويًا ==---
export const endAuctionManually = async (req, res) => {
  const { id } = req.params;
  try {
    const auction = await Auction.findById(id).populate("artwork");
    if (!auction) return res.status(404).json({ message: "المزاد غير موجود" });

    auction.endTime = new Date(); // إنهاء الآن
    auction.status = "ENDED";
    await auction.save();

    await Artwork.findByIdAndUpdate(auction.artwork._id, { status: "ENDED" });

    res.status(200).json({ message: "تم إنهاء المزاد يدويًا بنجاح." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في إنهاء المزاد", error: error.message });
  }
};

// ---== جلب كل الإشعارات ==---
export const getAllNotifications = async (req, res) => {
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

// ---== حذف إشعار ==---
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await Notification.findByIdAndDelete(id);
    if (!notif) return res.status(404).json({ message: "الإشعار غير موجود" });
    res.status(200).json({ message: "تم حذف الإشعار بنجاح" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في حذف الإشعار", error: error.message });
  }
};

// ---== إحصائيات لوحة التحكم (Admin Stats) ==---
export const getAdminStats = async (req, res) => {
  try {
    // 📊 احسب كل القيم دفعة واحدة
    const [usersCount, artworksCount, auctionsCount] = await Promise.all([
      User.countDocuments(),
      Artwork.countDocuments(),
      Auction.countDocuments(),
    ]);

    // 🎨 عدد الأعمال المباعة فقط
    const soldArtworks = await Artwork.countDocuments({ status: "SOLD" });

    // 🔔 عدد الإشعارات الكلية
    const notificationsCount = await Notification.countDocuments();

    res.status(200).json({
      message: "تم جلب الإحصائيات بنجاح",
      stats: {
        users: usersCount,
        artworks: artworksCount,
        auctions: auctionsCount,
        soldArtworks,
        notifications: notificationsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      message: "فشل في جلب الإحصائيات",
      error: error.message,
    });
  }
};

// ---== جلب كل الأعمال الفنية (للمشرف) ==---
export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate("student", "name email schoolName")
      .sort({ createdAt: -1 });

    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب الأعمال الفنية",
      error: error.message,
    });
  }
};

// ---== حذف عمل فني (للمشرف) ==---
export const deleteArtworkByAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    // 🔹 ابحث عن العمل الفني
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: "العمل الفني غير موجود." });
    }

    // 🔹 حذف أي مزاد مرتبط بنفس العمل الفني
    await Auction.deleteMany({ artwork: artwork._id });

    // 🔹 حذف العمل نفسه
    await Artwork.findByIdAndDelete(id);

    res.status(200).json({ message: "تم حذف العمل الفني بنجاح." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف العمل الفني.",
      error: error.message,
    });
  }
};
