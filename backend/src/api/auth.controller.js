import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// 🎟️ دالة إنشاء التوكن
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d", // مدة الصلاحية أسبوع
  });
};

// 🧍‍♂️ دالة التسجيل
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة." });
    }

    // تنظيف البريد الإلكتروني (حل أخطاء الحروف الكبيرة)
    const cleanEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res
        .status(409)
        .json({ message: "البريد الإلكتروني مستخدم مسبقًا." });
    }

    // إنشاء المستخدم (بشكل افتراضي طالب)
    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: "STUDENT",
    });

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء إنشاء الحساب",
      error: error.message,
    });
  }
};

// 🔑 دالة تسجيل الدخول
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان." });
    }

    // تنظيف البريد الإلكتروني لتطابق التخزين
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة." });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تسجيل الدخول", error: error.message });
  }
};

// 🚪 تسجيل الخروج
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "تم تسجيل الخروج بنجاح." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في تسجيل الخروج", error: error.message });
  }
};
