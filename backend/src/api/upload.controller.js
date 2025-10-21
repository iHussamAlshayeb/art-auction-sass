import cloudinary from "cloudinary";
import fs from "fs";

// 🔧 إعداد Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// 📸 رفع صورة
export const uploadImage = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ message: "لم يتم رفع أي ملف." });
    }

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "artworks",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    });

    fs.unlinkSync(req.file.path); // حذف الملف المؤقت

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في رفع الصورة", error: error.message });
  }
};
