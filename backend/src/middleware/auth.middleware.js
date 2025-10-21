import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // 1. استيراد نموذج Mongoose

// ---== دالة حماية المسارات (نسخة Mongoose) ==---
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. الحصول على التوكن من الهيدر
      token = req.headers.authorization.split(" ")[1];

      // 2. التحقق من التوكن وفك تشفيره
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. جلب المستخدم من MongoDB باستخدام ID الموجود في التوكن
      // .select('-password') تضمن عدم جلب كلمة المرور
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      next(); // الانتقال إلى الدالة (controller) التالية
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "غير مصرح لك، التوكن غير صالح" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "غير مصرح لك، لا يوجد توكن" });
  }
};

// ---== دالة التحقق من الدور (تبقى كما هي) ==---
// هذه الدالة لا تتفاعل مع قاعدة البيانات، بل تقرأ من req.user
// لذا لا تحتاج إلى أي تعديل.
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have the required role." });
    }
    next();
  };
};
