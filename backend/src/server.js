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
  console.log(`🟢 User connected: ${socket.id}`);

  const token = socket.handshake.auth?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id; // دعم كلا المفتاحين
      const role = decoded.role || "STUDENT";

      userSocketMap.set(userId.toString(), socket.id);
      console.log(`✅ User ${userId} authenticated (${role})`);

      // 🧩 إنشاء غرفة خاصة بكل مستخدم للإشعارات
      socket.join(`user-${userId}`);
      console.log(`🔔 User ${userId} joined room user-${userId}`);

      // ✅ إذا كان إداريًا، ضمّه إلى غرفة "admins"
      if (role === "ADMIN") {
        socket.join("admins");
        console.log(`🧑‍💼 Admin ${userId} joined 'admins' room`);
      }
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
    }
  }

  // 📦 الانضمام لغرفة مزاد
  socket.on("joinAuctionRoom", (auctionId) => {
    const roomName = `auction-${auctionId}`;
    socket.join(roomName);
    console.log(`🏷️ User ${socket.id} joined room ${roomName}`);
  });

  // 📴 عند قطع الاتصال
  socket.on("disconnect", () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`❎ User ${userId} removed from map`);
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
