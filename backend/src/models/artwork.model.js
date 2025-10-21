import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // يربط بجدول User
    },
    status: {
      type: String,
      enum: ["DRAFT", "IN_AUCTION", "SOLD", "ENDED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
    // === 1. تفعيل الحقول الافتراضية ===
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---== 2. الحل هنا: إضافة حقل افتراضي (virtual field) ==---
// هذا يخبر Mongoose بوجود علاقة "عكسية" مع موديل Auction
artworkSchema.virtual("auction", {
  ref: "Auction", // الموديل الذي نريد الربط معه
  localField: "_id", // الحقل الموجود في هذا الموديل (Artwork)
  foreignField: "artwork", // الحقل المطابق في الموديل الآخر (Auction)
  justOne: true, // لأنها علاقة واحد لواحد
});

const Artwork = mongoose.model("Artwork", artworkSchema);
export default Artwork;
