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
      required: true,
    },
    role: {
      type: String,
      enum: ["STUDENT", "ADMIN"], // الأدوار المتاحة
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

// تشفير كلمة المرور قبل الحفظ (لتعويض منطق Prisma)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
