import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Artwork",
      unique: true, // كل عمل فني له مزاد واحد فقط
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: true,
    },
    startPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // ✅ هذا الحقل هو المفتاح لحل مشكلة الإشعارات المتكررة
    status: {
      type: String,
      enum: ["ACTIVE", "ENDED", "SOLD", "PROCESSED"],
      default: "ACTIVE",
      index: true,
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  {
    timestamps: true,
  }
);

const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;
