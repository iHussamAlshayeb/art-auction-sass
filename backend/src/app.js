import express from "express";
import cors from "cors";

// 🧩 استيراد كل المسارات
import authRoutes from "./api/auth.routes.js";
import userRoutes from "./api/user.routes.js";
import artworkRoutes from "./api/artwork.routes.js";
import auctionRoutes from "./api/auction.routes.js";
import uploadRoutes from "./api/upload.routes.js";
import adminRoutes from "./api/admin.routes.js";
import studentRoutes from "./api/student.routes.js";
import notificationRoutes from "./api/notification.routes.js";
// import webhookRoutes from "./api/webhook.routes.js"; // في حال أضفت الدفع لاحقًا

const app = express();

// 🔧 إعداد الـ Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://app.fanan3.com",
      "https://www.fanan3.com",
      "https://fanan3.com",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // زيادة الحد لتقبل صور base64
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
