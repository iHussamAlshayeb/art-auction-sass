import sgMail from "@sendgrid/mail";

// إعداد مفتاح SendGrid API من البيئة
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// عنوان المرسل الافتراضي
const FROM_EMAIL =
  process.env.EMAIL_FROM || "Fanan Auctions <no-reply@fanan3.com>";

// --- دالة أساسية لإرسال البريد ---
export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) throw new Error("البريد الإلكتروني المستلم مفقود.");

    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`📤 Email sent successfully to ${to}`);
  } catch (error) {
    console.error(
      "❌ SendGrid Email Error:",
      error.response?.body || error.message
    );
  }
};

// --- بريد فوز المستخدم بالمزاد ---
export const sendAuctionWonEmail = async (user, artwork, auction) => {
  if (!user?.email) return;

  const subject = `🎉 تهانينا ${user.name || ""}! لقد فزت بمزاد "${
    artwork.title
  }"`;

  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h2 style="color:#008080;">🎉 مبروك الفوز!</h2>
      <p>مرحبًا <strong>${user.name}</strong>،</p>
      <p>لقد فزت بمزاد العمل الفني <strong>"${artwork.title}"</strong> بسعر نهائي قدره <strong>${auction.currentPrice} ر.س</strong>.</p>
      <p>يمكنك إتمام الدفع عبر لوحة التحكم الخاصة بك:</p>
      <a href="http://app.fanan3.com/dashboard/won-auctions"
         style="display:inline-block; background:#008080; color:#fff; padding:10px 20px; text-decoration:none; border-radius:8px;">
         الانتقال إلى لوحة التحكم
      </a>
      <hr style="margin:20px 0;">
      <small>فنّان — نُقدّر دعمك للمواهب الطلابية 🎨</small>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

// --- بريد إعلام المالك ببيع عمله ---
export const sendArtworkSoldEmail = async (owner, artwork, auction) => {
  if (!owner?.email) return;

  const subject = `💰 تم بيع عملك الفني "${artwork.title}" بنجاح!`;

  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h2 style="color:#f97316;">💰 تهانينا!</h2>
      <p>مرحبًا <strong>${owner.name}</strong>،</p>
      <p>تم بيع عملك الفني <strong>"${artwork.title}"</strong> عبر المزاد بسعر نهائي قدره <strong>${auction.currentPrice} ر.س</strong>.</p>
      <p>سيتم التواصل معك قريبًا بخصوص تفاصيل التسليم.</p>
      <hr style="margin:20px 0;">
      <small>فنّان — نُقدّر إبداعك 💫</small>
    </div>
  `;

  await sendEmail({ to: owner.email, subject, html });
};

// --- بريد تأكيد الدفع ---
export const sendPaymentConfirmationEmail = async (user, auction) => {
  if (!user?.email) return;

  const subject = `✅ تم استلام دفعتك بنجاح لمزاد "${auction.artwork?.title}"`;

  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h2 style="color:#16a34a;">✅ تم الدفع بنجاح</h2>
      <p>مرحبًا <strong>${user.name}</strong>،</p>
      <p>تم استلام دفعتك بنجاح بمبلغ <strong>${auction.currentPrice} ر.س</strong> لمزاد <strong>"${auction.artwork?.title}"</strong>.</p>
      <p>شكرًا لدعمك للفن والمواهب!</p>
      <hr style="margin:20px 0;">
      <small>فنّان — معًا نرتقي بالإبداع 🎨</small>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

// --- بريد فشل الدفع ---
export const sendPaymentFailedEmail = async (user, auction) => {
  if (!user?.email) return;

  const subject = `⚠️ فشل في معالجة الدفع لمزاد "${auction.artwork?.title}"`;

  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h2 style="color:#dc2626;">⚠️ فشل الدفع</h2>
      <p>مرحبًا <strong>${user.name}</strong>،</p>
      <p>يبدو أن هناك مشكلة أثناء محاولة معالجة الدفع لمزاد <strong>"${auction.artwork?.title}"</strong>.</p>
      <p>يمكنك المحاولة مرة أخرى من لوحة التحكم.</p>
      <a href="http://app.fanan3.com/dashboard/won-auctions"
         style="display:inline-block; background:#dc2626; color:#fff; padding:10px 20px; text-decoration:none; border-radius:8px;">
         إعادة المحاولة
      </a>
      <hr style="margin:20px 0;">
      <small>فنّان — معك دائمًا ✨</small>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });
};

// --- بريد عام (احتياطي) ---
export const sendGenericEmail = async (to, subject, message) => {
  const html = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; text-align:right;">
      <h3>${subject}</h3>
      <p>${message}</p>
      <hr>
      <small>فنّان — منصة المزادات التعليمية 🎨</small>
    </div>
  `;
  await sendEmail({ to, subject, html });
};
