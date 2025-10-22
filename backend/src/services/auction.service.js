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
  console.log(`[Cron] Running job at ${new Date().toISOString()}`);

  try {
    const finished = await Auction.find({
      endTime: { $lte: new Date() },
      status: { $nin: ["PROCESSED"] },
    }).populate("artwork");

    for (const auction of finished) {
      try {
        console.log(
          `Processing auction ${auction._id}, status=${auction.status}`
        );

        const winnerId = auction.highestBidder;
        const artistId = auction.artwork.student.toString();

        let finalStatus = winnerId ? "SOLD" : "ENDED";

        // تحديث حالة العمل الفني أولًا لضمان الاتساق
        await Artwork.findByIdAndUpdate(auction.artwork._id, {
          status: finalStatus,
        });

        if (winnerId) {
          // إشعار الفائز
          const winner = await User.findById(winnerId);
          if (winner) {
            await Notification.create({
              user: winnerId,
              message: `...`,
              link: `...`,
            });
            if (winner.email)
              await sendAuctionWonEmail(winner, auction.artwork, auction);
            const socketId = userSocketMap.get(winnerId.toString());
            if (socketId)
              io.to(socketId).emit("auctionWon", {
                auctionId: auction._id,
                finalPrice: auction.currentPrice,
              });
          }

          // إشعار صاحب العمل
          const artist = await User.findById(artistId);
          if (artist) {
            await Notification.create({
              user: artistId,
              message: `تم بيع عملك...`,
              link: `/dashboard/sold-artworks`,
            });
            if (artist.email)
              await sendArtworkSoldEmail(artist, auction.artwork, auction);
            const artistSocket = userSocketMap.get(artistId.toString());
            if (artistSocket)
              io.to(artistSocket).emit("artworkSold", {
                artworkId: auction.artwork._id,
                auctionId: auction._id,
                finalPrice: auction.currentPrice,
              });
          }
        } else {
          console.log(`No bids for auction ${auction._id}, marking ENDED.`);
        }

        // أخيرًا: اجعل المزاد مُعالج
        await Auction.findByIdAndUpdate(auction._id, {
          status: "PROCESSED",
        });

        console.log(`Auction ${auction._id} processed successfully.`);
      } catch (innerErr) {
        console.error(`Error processing auction ${auction._id}:`, innerErr);
      }
    }
  } catch (err) {
    console.error("[Cron] Error processing auctions:", err);
  }
};
