import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Artwork",
      unique: true, // يضمن أن العمل الفني له مزاد واحد فقط
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    startPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // يعادل القيمة ? في Prisma
    },
  },
  {
    timestamps: true, // سيضيف createdAt و updatedAt
  }
);

const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;
