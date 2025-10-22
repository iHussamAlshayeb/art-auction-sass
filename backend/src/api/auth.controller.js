import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// 🧩 دالة إنشاء التوكن (JWT)
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d", // صلاحية التوكن أسبوع
  });
};

// ===============================
// 🧑‍🎓 دالة التسجيل (Register)
// ===============================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ التحقق من الحقول المطلوبة
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة.",
      });
    }

    // ✅ التحقق من عدم وجود مستخدم بنفس البريد
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "البريد الإلكتروني مستخدم بالفعل." });
    }

    // ✅ إنشاء المستخدم الجديد
    // (كلمة المرور ستُشفّر تلقائيًا بفضل pre('save') في user.model.js)
    const user = await User.create({
      name,
      email,
      password,
      role: "STUDENT", // الافتراضي
    });

    // ✅ إنشاء JWT token
    const token = generateToken(user._id, user.role);

    // ✅ الاستجابة
    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء إنشاء الحساب",
      error: error.message,
    });
  }
};

// ===============================
// 🔑 دالة تسجيل الدخول (Login)
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ تحقق من وجود الحقول
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان." });
    }

    // ✅ العثور على المستخدم
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "المستخدم غير موجود." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة." });
    }

    // ✅ إنشاء JWT
    const token = generateToken(user._id, user.role);

    // ✅ إرسال الاستجابة
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
    console.error("Login Error:", error);
    res.status(500).json({
      message: "حدث خطأ أثناء تسجيل الدخول",
      error: error.message,
    });
  }
};

// ===============================
// 🚪 تسجيل الخروج (Logout)
// ===============================
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
