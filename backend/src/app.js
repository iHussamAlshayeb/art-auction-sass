import express from "express";
import cors from "cors";

// 1. استيراد كل المسارات (أسماؤها لم تتغير)
import authRoutes from "./api/auth.routes.js";
import userRoutes from "./api/user.routes.js";
import artworkRoutes from "./api/artwork.routes.js";
import auctionRoutes from "./api/auction.routes.js";
import uploadRoutes from "./api/upload.routes.js";
import adminRoutes from "./api/admin.routes.js";
import studentRoutes from "./api/student.routes.js";
import notificationRoutes from "./api/notification.routes.js";

const app = express();

// 2. تطبيق الـ Middlewares
app.use(cors()); // السماح بالطلبات من نطاقات مختلفة
app.use(express.json()); // السماح للخادم بفهم بيانات JSON الواردة

// 3. ربط المسارات بنقاط النهاية
// كل مسار الآن يشير إلى متحكم (controller) يستخدم Mongoose
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/artworks", artworkRoutes);
app.use("/api/v1/auctions", auctionRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
// app.use("/api/v1/webhooks", webhookRoutes);

// مسار افتراضي للاختبار
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Welcome to the Art Auction API! (MongoDB Version) 🚀" });
});

export default app;
