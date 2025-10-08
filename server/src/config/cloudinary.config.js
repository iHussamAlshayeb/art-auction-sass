import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// تهيئة Cloudinary بمعلومات حسابك
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد مساحة التخزين في Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'artworks', // اسم المجلد الذي ستُحفظ فيه الصور
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export default storage;