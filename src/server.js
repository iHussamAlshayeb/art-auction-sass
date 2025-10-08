// الطريقة الحديثة لتفعيل dotenv
import 'dotenv/config';
import app from './app.js'; // لاحظ إضافة .js
import cron from 'node-cron'; // استيراد المكتبة
import { processFinishedAuctions } from './services/auction.service.js'; // استيراد الخدمة


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

 // جدولة المهمة لتعمل مرة كل دقيقة
  // الصيغة '*/1 * * * *' تعني "في الدقيقة 0 من كل ساعة، كل يوم"
  // سنستخدم '* * * * *' لتعمل كل دقيقة
  cron.schedule('* * * * *', () => {
    processFinishedAuctions();
  });

  console.log('Cron job scheduled to check for finished auctions every minute.');