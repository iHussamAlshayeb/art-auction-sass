import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      // "required" غير موجود هنا للسماح بتسجيل الدخول الاجتماعي/الهاتف لاحقًا
    },
    role: {
      type: String,
      enum: ["STUDENT", "ADMIN"],
      default: "STUDENT",
    },
    profileImageUrl: { type: String },
    schoolName: { type: String },
    gradeLevel: { type: String },
    bio: { type: String },
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
  }
);

// === 1. تشفير كلمة المرور قبل الحفظ ===
// هذا الكود يعمل "خلف الكواليس" قبل كل عملية حفظ
userSchema.pre("save", async function (next) {
  // افحص فقط إذا كانت كلمة المرور قد تم تعديلها (أو هي جديدة)
  if (!this.isModified("password")) {
    return next();
  }
  // تأكد من وجود كلمة مرور أصلاً (لتجنب الأخطاء إذا كانت فارغة)
  if (!this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// === 2. الحل هنا: إضافة الدالة المساعدة "matchPassword" ===
// نحن نضيف هذه الوظيفة يدويًا إلى كل مستخدم
userSchema.methods.matchPassword = async function (enteredPassword) {
  // قارن كلمة المرور المدخلة بكلمة المرور المشفرة في قاعدة البيانات
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
