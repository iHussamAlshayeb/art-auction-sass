import express from "express";
import cors from "cors";

// 🧩 استيراد كل المسارات
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import artworkRoutes from "./routes/artwork.routes.js";
import auctionRoutes from "./routes/auction.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import rateLimiter from "./middleware/rateLimiter.js";
import paymentRoutes from "./routes/payment.routes.js";
// import webhookRoutes from "./routes/webhook.routes.js"; // في حال أضفت الدفع لاحقًا

const app = express();

// 🔧 إعداد الـ Middleware
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(rateLimiter);

app.use(express.urlencoded({ extended: true }));

// 🛣️ ربط المسارات مع الإصدارة v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/artworks", artworkRoutes);
app.use("/api/v1/auctions", auctionRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/webhooks", webhookRoutes);

// 🌐 نقطة فحص أساسية
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Art Auction API (MongoDB Edition) 🚀",
    version: "1.0.0",
  });
});

// ❌ معالجة المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ message: "الصفحة غير موجودة." });
});

export default app;
