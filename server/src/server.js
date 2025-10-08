import "dotenv/config";
import app from "./app.js";
import cron from "node-cron";
import { processFinishedAuctions } from "./services/auction.service.js";
import { createServer } from "http"; // استيراد http من Node
import { Server } from "socket.io"; // استيراد Server من socket.io
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 3000;

// إنشاء خادم http وتمرير تطبيق express له
const httpServer = createServer(app);

// ربط Socket.IO بخادم http
// ربط Socket.IO بخادم http
const io = new Server(httpServer, {
  pingInterval: 20000, // إرسال ping كل 20 ثانية
  pingTimeout: 30000,  // اعتبار الاتصال منقطعًا بعد 30 ثانية من عدم الرد
  cors: {
    origin: [
      "http://localhost:5173",
      // أضف هنا رابط الواجهة الأمامية بعد نشرها
    ],
    methods: ["GET", "POST"]
  }
});

// وضع io في كائن app ليكون متاحًا في المتحكمات (Controllers)
app.set("io", io);

// خريطة لتخزين كل مستخدم متصل والـ socket.id الخاص به
const userSocketMap = new Map();
app.set("userSocketMap", userSocketMap);

// الاستماع للأحداث القادمة من المتصفحات
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  const token = socket.handshake.auth.token; // الحصول على التوكن من طلب الاتصال

  // التحقق من التوكن وتسجيل المستخدم
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      userSocketMap.set(userId, socket.id);
      console.log(
        `User ${userId} authenticated and mapped to socket ${socket.id}`
      );
    } catch (err) {
      console.log("Authentication error with socket token:", err.message);
    }
  }

  // الانضمام لغرفة مزاد
  socket.on("joinAuctionRoom", (auctionId) => {
    const roomName = `auction-${auctionId}`; // استخدم نفس الصيغة هنا
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // حذف المستخدم من الخريطة عند تسجيل الخروج
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
  // في server.js
  cron.schedule("* * * * *", () => {
    // تمرير الكائنات المطلوبة إلى الدالة
    processFinishedAuctions(io, userSocketMap);
  });
  console.log("Cron job and Socket.IO are active.");
});
