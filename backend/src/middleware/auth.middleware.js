import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ✅ حماية المسارات (JWT)
export const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "غير مصرح: لم يتم توفير التوكن" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ هنا التعديل الحقيقي
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "المستخدم غير موجود." });
    }

    // ✅ ضمان وجود كل القيم بشكل متناسق
    req.user = {
      ...user.toObject(),
      id: user._id.toString(), // لتفادي أخطاء المقارنة مستقبلاً
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ message: "رمز الدخول غير صالح أو منتهي." });
  }
};

// ✅ التحقق من الدور (ADMIN فقط)
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "صلاحيات الإدارة مطلوبة." });
  }
  next();
};

// ✅ التحقق من الطالب (الافتراضي)
export const studentOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "STUDENT") {
    return res.status(403).json({ message: "هذه العملية متاحة للطلاب فقط." });
  }
  next();
};
