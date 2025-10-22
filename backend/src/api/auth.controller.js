import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// 🎟️ إنشاء التوكن
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🧍‍♂️ التسجيل
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة." });
    }

    // 🔍 تنظيف البريد الإلكتروني
    const cleanEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res
        .status(409)
        .json({ message: "البريد الإلكتروني مستخدم مسبقًا." });
    }

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
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء إنشاء الحساب", error: error.message });
  }
};

// 🔑 تسجيل الدخول
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان." });
    }

    // 🧼 تنظيف البريد (حل المشكلة الفعلية)
    const cleanEmail = email.trim().toLowerCase();

    // 🧠 تأكد من جلب كلمة المرور
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود." });
    }

    // 🔒 تحقق من كلمة المرور
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
