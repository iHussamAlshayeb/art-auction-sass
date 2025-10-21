import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js"; // نحتاجه لجلب بيانات المزادات

// ---== دالة جلب كل الطلاب (نسخة Mongoose مع Aggregation) ==---
export const getAllStudents = async (req, res) => {
  const { page = 1, limit = 16 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    // نستخدم Aggregation لجلب الطلاب مع عدد أعمالهم بكفاءة
    const studentsPipeline = [
      { $match: { role: "STUDENT" } }, // فلترة الطلاب فقط
      { $sort: { createdAt: -1 } }, // -1 = 'desc'
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          // هذا يعادل 'include'
          from: "artworks", // اسم الـ collection (عادةً يكون بصيغة الجمع)
          localField: "_id",
          foreignField: "student",
          as: "artworksData",
        },
      },
      {
        $project: {
          // هذا يعادل 'select'
          id: "$_id", // إعادة تسمية _id إلى id
          name: 1,
          profileImageUrl: 1,
          schoolName: 1,
          gradeLevel: 1,
          _count: {
            // إنشاء كائن _count
            artworks: { $size: "$artworksData" }, // $size يحسب عدد العناصر في المصفوفة
          },
        },
      },
    ];

    // تنفيذ الـ pipeline وجلب العدد الإجمالي بالتوازي
    const [students, totalStudents] = await Promise.all([
      User.aggregate(studentsPipeline),
      User.countDocuments({ role: "STUDENT" }),
    ]);

    const totalPages = Math.ceil(totalStudents / limitNum);

    res.status(200).json({
      students,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
};

// ---== دالة جلب الملف الشخصي العام للطالب (نسخة Mongoose) ==---
export const getStudentPublicProfile = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. جلب بيانات الطالب الأساسية
    const student = await User.findOne({ _id: id, role: "STUDENT" }).select(
      "name schoolName gradeLevel bio profileImageUrl"
    ); // .select لتحديد الحقول

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 2. جلب أعمال الطالب بشكل منفصل (لأن العلاقة في Artwork)
    const artworks = await Artwork.find({ student: id })
      .sort({ createdAt: -1 })
      .populate("auction", "id currentPrice endTime"); // .populate لجلب بيانات المزاد

    // 3. دمج النتائج معًا
    const studentProfile = {
      ...student.toObject(), // تحويل مستند Mongoose إلى كائن
      artworks: artworks,
    };

    res.status(200).json({ student: studentProfile });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student profile",
      error: error.message,
    });
  }
};
