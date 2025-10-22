import sgMail from "@sendgrid/mail";

// 🧩 تعيين مفتاح SendGrid API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 💌 البريد الافتراضي الذي تُرسل منه الرسائل
const FROM_EMAIL =
  process.env.EMAIL_FROM || "Fanan Auctions <no-reply@fanan3.com>";

/**
 * 📨 دالة عامة لإرسال بريد إلكتروني
 * @param {Object} options - إعدادات البريد
 * @param {string} options.to - البريد المرسل إليه
 * @param {string} options.subject - عنوان الرسالة
 * @param {string} options.html - محتوى HTML
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    console.warn(
      "⚠️ محاولة إرسال بريد بدون عنوان مستقبل (to). تم تجاهل الطلب."
    );
    return;
  }

  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`📧 Email sent successfully to ${to} (${subject})`);
  } catch (error) {
    console.error(
      "❌ Failed to send email:",
      error.response?.body || error.message
    );
  }
};

/**
 * 🎉 إرسال بريد للفائز بالمزاد
 * @param {Object} winner - كائن المستخدم الفائز
 * @param {Object} artwork - كائن العمل الفني
 * @param {Object} auction - كائن المزاد
 */
export const sendAuctionWonEmail = async (winner, artwork, auction) => {
  if (!winner?.email) return;

  const subject = `🎉 تهانينا! لقد فزت بمزاد "${artwork.title}"`;
  const html = `
    <div style="font-family:'Cairo',sans-serif;direction:rtl;text-align:right;">
      <h2 style="color:#10b981;">🎉 تهانينا!</h2>
      <p>مرحبًا <strong>${winner.name}</strong>،</p>
      <p>لقد فزت بالمزاد على العمل الفني <strong>"${artwork.title}"</strong>.</p>
      <p>السعر النهائي: <strong>${auction.currentPrice} ر.س</strong></p>
      <p>سيتم التواصل معك قريبًا بخصوص الدفع والتسليم.</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
      <p style="font-size:14px;color:#555;">فنّان — نُقدّر إبداعك 💫</p>
    </div>
  `;

  await sendEmail({ to: winner.email, subject, html });
};

/**
 * 💰 إرسال بريد لصاحب العمل (الطالب) عند بيع عمله الفني
 * @param {Object} artist - كائن الطالب
 * @param {Object} artwork - كائن العمل الفني
 * @param {Object} auction - كائن المزاد
 */
export const sendArtworkSoldEmail = async (artist, artwork, auction) => {
  if (!artist?.email) return;

  const subject = `💰 تم بيع عملك الفني "${artwork.title}" بنجاح!`;
  const html = `
    <div style="font-family:'Cairo',sans-serif;direction:rtl;text-align:right;">
      <h2 style="color:#f97316;">💰 تهانينا!</h2>
      <p>مرحبًا <strong>${artist.name}</strong>،</p>
      <p>تم بيع عملك الفني <strong>"${artwork.title}"</strong> في المزاد بسعر نهائي قدره <strong>${auction.currentPrice} ر.س</strong>.</p>
      <p>سيتم التواصل معك قريبًا بخصوص تفاصيل التسليم أو عرض العمل القادم.</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
      <p style="font-size:14px;color:#555;">فنّان — نُقدّر إبداعك 💫</p>
    </div>
  `;

  await sendEmail({ to: artist.email, subject, html });
};

/**
 * 🧾 إرسال بريد إشعار عام (يمكن استخدامه لأي تنبيه إداري)
 * @param {string} to - البريد المرسل إليه
 * @param {string} title - عنوان الإشعار
 * @param {string} message - نص الإشعار
 */
export const sendGenericNotificationEmail = async (to, title, message) => {
  const subject = title;
  const html = `
    <div style="font-family:'Cairo',sans-serif;direction:rtl;text-align:right;">
      <h2 style="color:#0ea5e9;">${title}</h2>
      <p>${message}</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
      <p style="font-size:14px;color:#555;">فنّان — منصة المزادات الفنية</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
};
