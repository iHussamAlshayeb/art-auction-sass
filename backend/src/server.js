import "dotenv/config";
import app from "./app.js";
import cron from "node-cron";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import { processFinishedAuctions } from "./services/auction.service.js";

const PORT = process.env.PORT || 3000;

// 🧩 الاتصال بقاعدة البيانات
await connectDB();

// 🔌 إعداد HTTP + Socket.io
const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingInterval: 20000,
  pingTimeout: 30000,
  cors: {
    origin: [
      "http://localhost:5173",
      "https://app.fanan3.com",
      "https://www.fanan3.com",
      "https://fanan3.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 🧠 خريطة المستخدمين المتصلين
const userSocketMap = new Map();
app.set("io", io);
app.set("userSocketMap", userSocketMap);

// 🎧 إعداد Socket.io
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  const token = socket.handshake.auth?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      userSocketMap.set(userId.toString(), socket.id);
      console.log(`🔗 Mapped user ${userId} → socket ${socket.id}`);

      if (decoded.role === "ADMIN") socket.join("admins");

      /* ======================================
         📡 NEW: مزامنة حالة الإشعارات لحظيًا
         --------------------------------------
         - عندما يقرأ المستخدم إشعارًا
         - أو يتم حذف إشعار
         - أو يتم حذف الكل
         يتم بث التغيير لبقية الأجهزة
      ====================================== */
      socket.on("notifications:update", (data) => {
        const { userId } = data;
        if (userId) {
          // إرسال التحديث لجميع أجهزة المستخدم نفسه
          io.to(userSocketMap.get(userId.toString())).emit(
            "notifications:refresh"
          );
          console.log(`🔄 إشعارات المستخدم ${userId} تم تحديثها لحظيًا`);
        }
      });
    } catch (err) {
      console.log("❌ Socket Auth Error:", err.message);
    }
  }

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// 🕒 وظيفة كرون: فحص المزادات المنتهية كل دقيقة
cron.schedule("* * * * *", async () => {
  try {
    await processFinishedAuctions(io, userSocketMap);
  } catch (error) {
    console.error("❌ Error during cron job:", error);
  }
});

// 🚀 تشغيل السيرفر
httpServer.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
