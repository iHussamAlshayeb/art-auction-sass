import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";

// إعداد الناقل باستخدام مفتاح SendGrid
const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

/**
 * دالة لإرسال بريد إلكتروني للفائز بالمزاد
 * @param {object} winner - كائن المستخدم الفائز (يحتوي على email و name)
 * @param {object} artwork - كائن العمل الفني (يحتوي على title)
 * @param {object} auction - كائن المزاد (يحتوي على id و currentPrice)
 */
export const sendAuctionWonEmail = async (winner, artwork, auction) => {
  const mailOptions = {
    from: "no-reply@fanan3.com", // ❗️ يمكنك تغيير هذا البريد
    to: winner.email,
    subject: `🎉 تهانينا! لقد فزت بمزاد "${artwork.title}"`,
    html: `
      <h1>مرحبًا ${winner.name},</h1>
      <p>يسعدنا إخبارك بأنك الفائز في مزاد العمل الفني <strong>"${
        artwork.title
      }"</strong>.</p>
      <p>السعر النهائي هو: <strong>${auction.currentPrice.toFixed(
        2
      )} ريال</strong>.</p>
      <p>لإتمام عملية الدفع وتأكيد الشراء، الرجاء الضغط على الرابط التالي:</p>
      <a href="https://app.fanan3.com/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px;">
        اذهب إلى لوحة التحكم للدفع
      </a>
      <p>شكرًا لمشاركتك!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Auction won email sent to ${winner.email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
