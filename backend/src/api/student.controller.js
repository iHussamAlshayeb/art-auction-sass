import mongoose from "mongoose";
import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js"; // لجلب بيانات المزادات

// ---== جلب كل الطلاب (مع عدد الأعمال) ==---
export const getAllStudents = async (req, res) => {
  const { page = 1, limit = 16 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const studentsPipeline = [
      { $match: { role: "STUDENT" } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: "artworks",
          localField: "_id",
          foreignField: "student",
          as: "artworksData",
        },
      },
      {
        $project: {
          _id: 1, // ✅ نحتفظ بالـ _id الأصلي
          id: "$_id", // ✅ للتوافق مع الواجهة الأمامية
          name: 1,
          profileImageUrl: 1,
          schoolName: 1,
          gradeLevel: 1,
          _count: {
            artworks: { $size: "$artworksData" },
          },
        },
      },
    ];

    const [students, totalStudents] = await Promise.all([
      User.aggregate(studentsPipeline),
      User.countDocuments({ role: "STUDENT" }),
    ]);

    res.status(200).json({
      students,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalStudents / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// ---== جلب الملف الشخصي العام للطالب ==---
export const getStudentPublicProfile = async (req, res) => {
  const { id } = req.params;

  // ✅ تحقق أولي لتفادي CastError
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  try {
    // 1️⃣ جلب بيانات الطالب
    const student = await User.findOne({ _id: id, role: "STUDENT" }).select(
      "_id name schoolName gradeLevel bio profileImageUrl"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 2️⃣ جلب أعمال الطالب مع بيانات المزاد المرتبطة
    const artworks = await Artwork.find({ student: id })
      .sort({ createdAt: -1 })
      .populate({
        path: "auction",
        select: "_id currentPrice endTime", // ✅ استخدم _id لتوحيد البنية
      })
      .lean();

    // 3️⃣ تحويل الأعمال بحيث تحتوي دائمًا على id واضح
    const artworksWithId = artworks.map((art) => ({
      ...art,
      id: art._id,
      auction: art.auction
        ? {
            ...art.auction,
            id: art.auction._id,
          }
        : null,
    }));

    // 4️⃣ بناء الملف الشخصي النهائي
    const studentProfile = {
      ...student.toObject(),
      id: student._id, // ✅ توحيد المعرف
      artworks: artworksWithId,
    };

    res.status(200).json({ student: studentProfile });
  } catch (error) {
    console.error("Error in getStudentPublicProfile:", error);
    res.status(500).json({
      message: "Failed to fetch student profile",
      error: error.message,
    });
  }
};
