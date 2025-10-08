import express from 'express';
import multer from 'multer';
import storage from '../config/cloudinary.config.js'; // استيراد إعدادات التخزين
import { uploadImage } from './upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage }); // إنشاء middleware الرفع

// مسار محمي يقوم برفع صورة واحدة اسمها 'image'
router.post('/', protect, upload.single('image'), uploadImage);

export default router;