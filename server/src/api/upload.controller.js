export const uploadImage = (req, res) => {
  // إذا نجح الرفع، ستكون معلومات الملف موجودة في req.file
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // أعد الرابط الآمن للصورة
  res.status(200).json({ imageUrl: req.file.path });
};