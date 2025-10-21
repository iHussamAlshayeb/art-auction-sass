import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Auction",
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // يضيف createdAt فقط
  }
);

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
