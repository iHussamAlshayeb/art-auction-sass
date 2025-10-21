import nodemailer from "nodemailer";

// --- إعداد النقل (Transport) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // استخدم true فقط للبورت 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- فحص الاتصال بخادم البريد ---
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails.");
  }
});

// --- دالة أساسية لإرسال البريد ---
export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) throw new Error("Missing recipient email address.");

    const fromEmail =
      process.env.EMAIL_FROM || `"Fanan3 Auctions" <no-reply@fanan3.com>`;

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });

    console.log(`📤 Email sent to ${to} (ID: ${info.messageId})`);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
};

// --- قالب فوز المستخدم بالمزاد ---
export const sendAuctionWonEmail = async (user, artwork, auction) => {
  const subject = `🎉 تهانينا ${user.name || ""}! لقد فزت بمزاد "${
    artwork.title
  }"`;

  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h2 style="color:#008080;">🎉 مبروك الفوز!</h2>
      <p>مرحبًا <strong>${user.name}</strong>،</p>
      <p>لقد فزت بمزاد العمل الفني <strong>"${artwork.title}"</strong> بسعر نهائي قدره <strong>${auction.currentPrice} ر.س</strong>.</p>
      <p>يمكنك إتمام الدفع عبر لوحة التحكم الخاصة بك.</p>
      <a href="http://app.fanan3.com/dashboard/won-auctions" 
         style="display:inline-block; background:#008080; color:#fff; padding:10px 20px; text-decoration:none; border-radius:8px; margin-top:15px;">
         الانتقال إلى لوحة التحكم
      </a>
      <hr style="margin:20px 0;">
      <small>شكراً لاستخدامك منصة فنّان لدعم المواهب الطلابية 🎨</small>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

// --- إشعار المالك ببيع عمله ---
export const sendArtworkSoldEmail = async (owner, artwork, auction) => {
  const subject = `💰 تم بيع عملك الفني "${artwork.title}" بنجاح!`;

  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h2 style="color:#f97316;">💰 تهانينا!</h2>
      <p>مرحبًا <strong>${owner.name}</strong>،</p>
      <p>تم بيع عملك الفني <strong>"${artwork.title}"</strong> عبر المزاد بسعر نهائي قدره <strong>${auction.currentPrice} ر.س</strong>.</p>
      <p>سيتم التواصل معك قريبًا حول تفاصيل التسليم.</p>
      <hr style="margin:20px 0;">
      <small>فنّان — نُقدّر إبداعك 💫</small>
    </div>
  `;

  await sendEmail({ to: owner.email, subject, html });
};

// --- إشعار عام (قابل لإعادة الاستخدام) ---
export const sendGenericEmail = async (to, title, message) => {
  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h3>${title}</h3>
      <p>${message}</p>
      <hr>
      <small>فنّان — منصة المزادات التعليمية 🎨</small>
    </div>
  `;
  await sendEmail({ to, subject: title, html });
};
