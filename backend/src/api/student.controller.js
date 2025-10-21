import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";

// 📄 جلب بيانات الطالب الشخصية
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب الملف الشخصي", error: error.message });
  }
};

// ✏️ تحديث الملف الشخصي
export const updateMyProfile = async (req, res) => {
  try {
    const { name, schoolName, gradeLevel, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود." });

    user.name = name || user.name;
    user.schoolName = schoolName || user.schoolName;
    user.gradeLevel = gradeLevel || user.gradeLevel;
    user.avatarUrl = avatarUrl || user.avatarUrl;

    await user.save();
    res.status(200).json({ message: "تم تحديث الملف الشخصي بنجاح", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في تحديث الملف الشخصي", error: error.message });
  }
};

// 🧾 جلب أعمال الطالب + مزاداته
export const getMyDashboardData = async (req, res) => {
  try {
    const artworks = await Artwork.find({ student: req.user._id });
    const auctions = await Auction.find({
      artwork: { $in: artworks.map((a) => a._id) },
    })
      .populate("artwork")
      .sort({ createdAt: -1 });

    res.status(200).json({ artworks, auctions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب بيانات لوحة التحكم", error: error.message });
  }
};
