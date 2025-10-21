import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    gatewayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Auction",
      unique: true, // يضمن أن المزاد له دفعة واحدة فقط
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
