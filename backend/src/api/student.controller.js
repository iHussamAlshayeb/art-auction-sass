import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";

// ============================================================
// 🧍‍♂️ بيانات الطالب الشخصية (محميّة)
// ============================================================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود." });

    res.status(200).json({ user });
  } catch (error) {
    console.error("getMyProfile error:", error);
    res
      .status(500)
      .json({ message: "فشل في جلب الملف الشخصي", error: error.message });
  }
};

// ============================================================
// ✏️ تحديث الملف الشخصي (محميّة)
// ============================================================
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
    console.error("updateMyProfile error:", error);
    res
      .status(500)
      .json({ message: "فشل في تحديث الملف الشخصي", error: error.message });
  }
};

// ============================================================
// 📊 بيانات لوحة تحكم الطالب (الأعمال + المزادات)
// ============================================================
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
    console.error("getMyDashboardData error:", error);
    res
      .status(500)
      .json({ message: "فشل في جلب بيانات لوحة التحكم", error: error.message });
  }
};

// ============================================================
// 🌍 جلب جميع الطلاب (عام — لصفحة الفنانون)
// ============================================================
export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const totalStudents = await User.countDocuments({ role: "STUDENT" });

    const students = await User.find({ role: "STUDENT" })
      .select("name profileImageUrl schoolName gradeLevel")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // ✅ حساب عدد الأعمال لكل طالب
    const studentsWithCounts = await Promise.all(
      students.map(async (student) => {
        const artworksCount = await Artwork.countDocuments({
          student: student._id,
        });
        return { ...student, artworksCount };
      })
    );

    res.status(200).json({
      students: studentsWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents,
      },
    });
  } catch (error) {
    console.error("getAllStudents error:", error);
    res
      .status(500)
      .json({ message: "فشل في جلب قائمة الطلاب", error: error.message });
  }
};

// ============================================================
// 🌍 جلب طالب محدد مع أعماله (عام — لصفحة ملف فنان معين)
// ============================================================
export const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select("name profileImageUrl schoolName gradeLevel bio")
      .lean();

    if (!student) return res.status(404).json({ message: "الطالب غير موجود." });

    const artworks = await Artwork.find({ student: student._id })
      .select("title imageUrl status")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ student, artworks });
  } catch (error) {
    console.error("getStudentById error:", error);
    res
      .status(500)
      .json({
        message: "حدث خطأ أثناء جلب بيانات الطالب",
        error: error.message,
      });
  }
};
