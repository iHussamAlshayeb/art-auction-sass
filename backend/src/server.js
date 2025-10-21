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
    methods: ["GET", "POST"],
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
      const userId = decoded.id || decoded.userId;
      if (userId) {
        userSocketMap.set(userId.toString(), socket.id);
        console.log(`✅ User ${userId} authenticated via socket ${socket.id}`);
      }
    } catch (err) {
      console.warn("⚠️ Invalid token on socket connection:", err.message);
    }
  }

  // انضمام المستخدم لغرفة مزاد معينة
  socket.on("joinAuctionRoom", (auctionId) => {
    const roomName = `auction-${auctionId}`;
    socket.join(roomName);
    console.log(`📦 Socket ${socket.id} joined room ${roomName}`);
  });

  // مغادرة المستخدم
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`❎ User ${userId} removed from socket map.`);
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
