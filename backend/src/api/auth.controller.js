import User from "../models/user.model.js"; // 1. استيراد نموذج Mongoose
import jwt from "jsonwebtoken";

// دالة مساعدة لإنشاء التوكن
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d", // استخدام نفس مدة الصلاحية
  });
};

// --- دالة التسجيل (النسخة الجديدة) ---
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // --- التحقق من صحة كلمة المرور (يبقى كما هو) ---
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وأن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل.",
    });
  }

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "الاسم والبريد الإلكتروني حقول إلزامية." });
  }

  try {
    // 2. التحقق من وجود المستخدم (بطريقة Mongoose)
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(409) // 409 Conflict
        .json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
    }

    // 3. إنشاء مستخدم جديد (بطريقة Mongoose)
    // سيتم تشفير كلمة المرور تلقائيًا بفضل user.model.js
    const user = await User.create({
      name,
      email,
      password,
      role: role || "STUDENT", // الافتراضي
      // سيتم تعيين الدور الافتراضي 'STUDENT' تلقائيًا
    });

    if (user) {
      res.status(201).json({
        message: "تم إنشاء المستخدم بنجاح",
        user: {
          id: user._id, // MongoDB تستخدم _id
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ message: "بيانات المستخدم غير صالحة." });
    }
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ ما", error: error.message });
  }
};

// --- دالة تسجيل الدخول (النسخة الجديدة) ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان." });
  }

  try {
    // 4. البحث عن المستخدم (بطريقة Mongoose)
    const user = await User.findOne({ email });

    // 5. التحقق من كلمة المرور (باستخدام الدالة المساعدة في النموذج)
    if (user && (await user.matchPassword(password))) {
      // 6. إنشاء التوكن
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
    } else {
      // رسالة موحدة لأسباب أمنية
      res
        .status(401)
        .json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    }
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ ما", error: error.message });
  }
};

// 🚪 تسجيل الخروج (إزالة الكوكي / إنهاء الجلسة)
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
