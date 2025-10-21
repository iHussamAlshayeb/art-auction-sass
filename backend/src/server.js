import "dotenv/config";
import app from "./app.js";
import cron from "node-cron";
import { processFinishedAuctions } from "./services/auction.service.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js"; // 1. استيراد دالة الاتصال بـ MongoDB

const PORT = process.env.PORT || 3000;

// 2. الاتصال بقاعدة بيانات MongoDB أولاً
connectDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingInterval: 20000,
  pingTimeout: 30000,
  cors: {
    origin: [
      "http://localhost:5173",
      "https://app.fanan3.com",
      "https://www.fanan3.com",
      "https://fanan3.com", // إضافة النطاق الأساسي أيضًا
    ],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const userSocketMap = new Map();
app.set("userSocketMap", userSocketMap);

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  const token = socket.handshake.auth.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      userSocketMap.set(userId, socket.id); // Mongoose IDs هي objects، لكن userId من التوكن هو string
      console.log(
        `User ${userId} authenticated and mapped to socket ${socket.id}`
      );
    } catch (err) {
      console.log("Authentication error with socket token:", err.message);
    }
  }

  socket.on("joinAuctionRoom", (auctionId) => {
    const roomName = `auction-${auctionId}`;
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} unmapped.`);
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  cron.schedule("* * * * *", async () => {
    try {
      // 3. هذه الدالة (processFinishedAuctions) تم تحويلها بالفعل
      //    لتستخدم Mongoose، لذا ستعمل بشكل سليم.
      await processFinishedAuctions(io, userSocketMap);
    } catch (error) {
      console.error("An error occurred during the cron job:", error);
    }
  });
});
