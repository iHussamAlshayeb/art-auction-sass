import Artwork from "../models/artwork.model.js"; // 1. استيراد نموذج Mongoose

// ---== دالة إنشاء عمل فني (نسخة Mongoose) ==---
export const createArtwork = async (req, res) => {
  const { title, description, imageUrl } = req.body;
  const studentId = req.user.id; // من 'protect' middleware

  if (!title || !description || !imageUrl) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 2. إنشاء المستند الجديد
    const newArtwork = await Artwork.create({
      title,
      description,
      imageUrl,
      student: studentId, // Mongoose يتعامل مع الربط عبر ObjectId
    });
    res
      .status(201)
      .json({ message: "Artwork created successfully", artwork: newArtwork });
  } catch (error) {
    // معالجة أخطاء Mongoose
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", error: error.message });
    }
    res
      .status(500)
      .json({ message: "Failed to create artwork", error: error.message });
  }
};

// ---== دالة جلب كل الأعمال الفنية (نسخة Mongoose) ==---
export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .sort({ createdAt: -1 }) // -1 تعادل 'desc'
      .populate("student", "name"); // .populate تعادل 'include'، 'name' لتحديد الحقول

    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch artworks", error: error.message });
  }
};

// ---== دالة جلب الأعمال الفنية للمعرض (نسخة Mongoose) ==---
export const getPublicArtworks = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    // جلب الأعمال الفنية للصفحة الحالية
    const artworks = await Artwork.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum) // .limit تعادل 'take'
      .populate("student", "id name") // جلب الطالب
      .populate("auction", "id"); // جلب المزاد

    // حساب العدد الإجمالي للأعمال الفنية
    const totalArtworks = await Artwork.countDocuments();
    const totalPages = Math.ceil(totalArtworks / limitNum);

    res.status(200).json({
      artworks,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch artworks", error: error.message });
  }
};
