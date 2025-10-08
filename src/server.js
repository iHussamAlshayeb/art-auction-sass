import 'dotenv/config';
import app from './app.js';
import cron from 'node-cron';
import { processFinishedAuctions } from './services/auction.service.js';
import { createServer } from 'http'; // استيراد http من Node
import { Server } from 'socket.io'; // استيراد Server من socket.io

const PORT = process.env.PORT || 3000;

// إنشاء خادم http وتمرير تطبيق express له
const httpServer = createServer(app);

// ربط Socket.IO بخادم http
const io = new Server(httpServer, {
  cors: {
    origin: "*", // في بيئة الإنتاج، يجب تحديد رابط الواجهة الأمامية
    methods: ["GET", "POST"]
  }
});

// وضع io في كائن app ليكون متاحًا في المتحكمات (Controllers)
app.set('io', io);

// الاستماع للأحداث القادمة من المتصفحات
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // الانضمام لغرفة مزاد
 socket.on('joinAuctionRoom', (auctionId) => {
    const roomName = `auction-${auctionId}`; // استخدم نفس الصيغة هنا
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);
});

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  cron.schedule('* * * * *', () => {
    processFinishedAuctions();
  });
  console.log('Cron job and Socket.IO are active.');
});