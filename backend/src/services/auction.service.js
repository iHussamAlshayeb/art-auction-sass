import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendAuctionWonEmail, sendArtworkSoldEmail } from "./email.service.js";

/**
 * 🕒 دالة تُنفّذ دوريًا (عبر Cron job)
 * تقوم بمعالجة المزادات المنتهية، إرسال الإشعارات،
 * وتحديث حالات الأعمال الفنية والمزادات.
 */
export const processFinishedAuctions = async (io, userSocketMap) => {
  console.log(`Running auction job at ${new Date().toISOString()}`);

  try {
    const finishedAuctions = await Auction.find({
      endTime: { $lte: new Date() },
      status: { $ne: "PROCESSED" },
    }).populate("artwork");

    for (const auction of finishedAuctions) {
      let finalStatus;
      const winnerId = auction.highestBidder;

      if (winnerId) {
        finalStatus = "SOLD";

        console.log(
          `✅ Auction "${auction.artwork.title}" has a winner (${winnerId}).`
        );

        const winner = await User.findById(winnerId);
        const artist = await User.findById(auction.artwork.student);

        // 🧩 تحديث حالة العمل الفني
        await Artwork.findByIdAndUpdate(auction.artwork._id, {
          status: finalStatus,
        });

        // 🧩 إشعار الفائز
        if (winner) {
          await Notification.create({
            user: winnerId,
            message: `🎉 تهانينا! لقد فزت بمزاد "${auction.artwork.title}"`,
            link: `/dashboard/won-auctions`,
          });

          if (winner.email) {
            await sendAuctionWonEmail(winner, auction.artwork, auction);
          }

          const socketId = userSocketMap.get(winnerId.toString());
          if (socketId) {
            io.to(socketId).emit("auctionWon", {
              message: `🎉 لقد فزت بمزاد "${auction.artwork.title}"!`,
              auctionId: auction._id,
              finalPrice: auction.currentPrice,
            });
          }
        }

        // 🧩 إشعار صاحب العمل الفني (الطالب)
        if (artist) {
          await Notification.create({
            user: artist._id,
            message: `💰 تم بيع عملك الفني "${auction.artwork.title}" بنجاح بسعر ${auction.currentPrice} ر.س`,
            link: `/dashboard/sold-artworks`,
          });

          // ✉️ إرسال بريد إلكتروني لصاحب العمل
          if (artist.email) {
            await sendArtworkSoldEmail(artist, auction.artwork, auction);
          }

          // 💬 إرسال إشعار Socket مباشر للطالب
          const artistSocketId = userSocketMap.get(artist._id.toString());
          if (artistSocketId) {
            io.to(artistSocketId).emit("artworkSold", {
              message: `🎨 تم بيع عملك "${auction.artwork.title}" بمبلغ ${auction.currentPrice} ر.س`,
              artworkId: auction.artwork._id,
              auctionId: auction._id,
            });
          }
        }
      } else {
        // ❌ في حالة عدم وجود مزايدات
        finalStatus = "ENDED";
        console.log(
          `⚪ Auction "${auction.artwork.title}" ended without bids.`
        );

        await Artwork.findByIdAndUpdate(auction.artwork._id, {
          status: finalStatus,
        });
      }

      // ✅ تعليم المزاد بأنه تمت معالجته
      await Auction.findByIdAndUpdate(auction._id, { status: "PROCESSED" });
    }
  } catch (error) {
    console.error("❌ Error in processFinishedAuctions:", error);
  }
};
