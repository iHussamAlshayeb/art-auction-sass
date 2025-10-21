// هذه الدالة لا تحتاج إلى استيراد أي نماذج (Models) لأنها لا تتفاعل مع قاعدة البيانات

export const uploadImage = (req, res) => {
  // 1. هذه الدالة تعتمد على middleware (مثل multer) لمعالجة عملية رفع الملف الفعلية.
  // يقوم الـ middleware بمعالجة الملف الوارد وإرفاق تفاصيله في كائن `req.file`.

  // 2. التحقق مما إذا كان الـ middleware قد نجح في رفع ملف.
  if (!req.file) {
    return res.status(400).json({ message: "لم يتم رفع أي ملف." });
  }

  // 3. حزمة `multer-storage-cloudinary` تقوم تلقائيًا بتوفير الرابط الآمن
  // للصورة المرفوعة في خاصية `path` لكائن `req.file`.
  // نحن ببساطة نقوم بإعادة إرسال هذا الرابط إلى الواجهة الأمامية.
  res.status(200).json({ imageUrl: req.file.path });
};
