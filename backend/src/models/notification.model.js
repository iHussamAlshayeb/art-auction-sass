import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ⚡ لتحسين سرعة البحث حسب المستخدم
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true, // ⚡ لتحسين أداء عمليات countDocuments
    },
    type: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ERROR"],
      default: "INFO",
    },
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
  }
);

/* ======================================================
   🕒 حذف تلقائي للإشعارات القديمة (بعد 30 يومًا)
   يستخدم TTL Index من MongoDB
====================================================== */
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
); // 30 يوم

/* ======================================================
   🧠 إعدادات افتراضية لعرض نظيف
====================================================== */
notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
