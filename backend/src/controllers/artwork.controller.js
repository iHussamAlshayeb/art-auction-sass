import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";

// 🖼️ إنشاء عمل فني جديد
export async function createArtwork(req, res) {
  try {
    const { title, description, imageUrl } = req.body;
    const studentId = req.user.id; // ✅ تم التعديل هنا

    if (!title || !description || !imageUrl) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة." });
    }

    const artwork = await Artwork.create({
      title,
      description,
      imageUrl,
      student: studentId, // ✅ سيرسل معرف الطالب الصحيح الآن
      status: "DRAFT",
    });

    res.status(201).json({
      message: "تم إنشاء العمل الفني بنجاح",
      artwork,
    });
  } catch (error) {
    console.error("❌ Artwork Error:", error.message);
    res.status(500).json({
      message: "فشل في إنشاء العمل الفني",
      error: error.message,
    });
  }
}

// 🖋️ تعديل عمل فني
export async function updateArtwork(req, res) {
  const { id } = req.params;
  const { title, description, imageUrl } = req.body;
  const studentId = req.user.id; // ✅ تم التعديل هنا

  try {
    const artwork = await Artwork.findById(id);
    if (!artwork)
      return res.status(404).json({ message: "العمل الفني غير موجود" });

    if (artwork.student.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "غير مصرح بتعديل هذا العمل." });
    }

    artwork.title = title || artwork.title;
    artwork.description = description || artwork.description;
    artwork.imageUrl = imageUrl || artwork.imageUrl;
    await artwork.save();

    res.status(200).json({ message: "تم تحديث العمل الفني بنجاح", artwork });
  } catch (error) {
    res.status(500).json({
      message: "فشل في تحديث العمل الفني",
      error: error.message,
    });
  }
}

// 🗑️ حذف عمل فني (إن لم يكن في مزاد)
export async function deleteArtwork(req, res) {
  const { id } = req.params;
  const studentId = req.user.id; // ✅ تم التعديل هنا

  try {
    const artwork = await Artwork.findById(id);
    if (!artwork)
      return res.status(404).json({ message: "العمل الفني غير موجود" });

    if (artwork.student.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "غير مصرح بحذف هذا العمل." });
    }

    const existingAuction = await Auction.findOne({ artwork: id });
    if (existingAuction) {
      return res.status(400).json({ message: "لا يمكن حذف عمل مرتبط بمزاد." });
    }

    await artwork.deleteOne();
    res.status(200).json({ message: "تم حذف العمل الفني بنجاح." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف العمل الفني",
      error: error.message,
    });
  }
}

// 📚 جلب جميع الأعمال العامة (للعرض)
export async function getAllPublicArtworks(req, res) {
  try {
    const artworks = await Artwork.find({
      status: { $in: ["IN_AUCTION", "SOLD"] },
    })
      .populate("student", "name schoolName gradeLevel")
      .sort({ createdAt: -1 });

    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب الأعمال الفنية",
      error: error.message,
    });
  }
}

// 👨‍🎓 جلب أعمال طالب محدد
export async function getStudentArtworks(req, res) {
  const { id } = req.params;
  try {
    const artworks = await Artwork.find({ student: id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب أعمال الطالب",
      error: error.message,
    });
  }
}
