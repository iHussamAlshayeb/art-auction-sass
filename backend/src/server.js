import "dotenv/config";
import app from "./app.js";
import cron from "node-cron";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import { processFinishedAuctions } from "./services/auction.service.js";

const PORT = process.env.PORT || 3000;

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
      const role = decoded.role || "STUDENT";

      userSocketMap.set(userId.toString(), socket.id);
      console.log(`🔗 Mapped user ${userId} → socket ${socket.id}`);

      // انضم لغرفة المستخدم الشخصية للإشعارات
      socket.join(`user-${userId}`);
      console.log(`🔔 Joined room user-${userId}`);

      if (role === "ADMIN") socket.join("admins");
    } catch (err) {
      console.log("❌ Socket Auth Error:", err.message);
    }
  }

  /* ======================================
     🔔 إشعارات لحظية
  ====================================== */
  socket.on("notifications:update", ({ userId }) => {
    if (userId) {
      io.to(`user-${userId}`).emit("notifications:refresh");
      console.log(`🔄 إشعارات المستخدم ${userId} تم تحديثها لحظيًا`);
    }
  });

  /* ======================================
     🏷️ نظام غرف المزادات
  ====================================== */
  socket.on("joinAuctionRoom", (auctionId) => {
    const roomName = `auction-${auctionId}`;
    socket.join(roomName);
    console.log(`🏷️ User ${socket.id} joined room ${roomName}`);
  });

  socket.on("leaveAuctionRoom", (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`🚪 User ${socket.id} left auction-${auctionId}`);
  });

  /* ✅ بث المزايدات الجديدة */
  socket.on("bid:placed", ({ auctionId, bid }) => {
    const roomName = `auction-${auctionId}`;
    io.to(roomName).emit("bid:update", bid);
    console.log(`📢 مزايدة جديدة في ${roomName}: ${bid.amount}`);
  });

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
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
});
