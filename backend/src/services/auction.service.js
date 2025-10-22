import { sendAuctionWonEmail } from "./email.service.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const processFinishedAuctions = async (io, userSocketMap) => {
  console.log(`🔁 Running job at: ${new Date().toISOString()}`);

  try {
    const finishedAuctions = await Auction.find({
      endTime: { $lte: new Date() },
      status: { $ne: "PROCESSED" },
    }).populate("artwork");

    for (const auction of finishedAuctions) {
      let finalStatus;
      const winnerId = auction.highestBidder;

      // ✅ أول شيء نغيّر الحالة إلى "PROCESSED"
      auction.status = "PROCESSED";
      await auction.save();

      if (winnerId) {
        finalStatus = "SOLD";

        const winner = await User.findById(winnerId);
        const artistId = auction.artwork.student;

        // ✅ تحديث حالة العمل الفني
        await Artwork.findByIdAndUpdate(auction.artwork._id, {
          status: finalStatus,
        });

        // 🎉 إشعار الفائز
        if (winner) {
          await Notification.create({
            user: winnerId,
            message: `🎉 تهانينا! لقد فزت بمزاد "${auction.artwork.title}"`,
            link: `/dashboard/won-auctions`,
          });

          // ✅ إشعار الفنان (صاحب العمل)
          if (artistId && artistId.toString() !== winnerId.toString()) {
            await Notification.create({
              user: artistId,
              message: `🎉 تم بيع عملك الفني "${auction.artwork.title}" بنجاح!`,
              link: `/dashboard/sold-artworks`,
            });
          }

          // ✉️ إرسال البريد الإلكتروني مرة واحدة فقط
          if (winner.email) {
            try {
              await sendAuctionWonEmail(winner, auction.artwork, auction);
            } catch (emailErr) {
              console.error("Email sending failed:", emailErr.message);
            }
          }

          // 🔔 إشعار فوري عبر Socket
          const winnerSocketId = userSocketMap.get(winnerId.toString());
          if (winnerSocketId) {
            io.to(winnerSocketId).emit("auctionWon", {
              message: `🎉 لقد فزت بمزاد "${auction.artwork.title}"!`,
              auctionId: auction._id,
              finalPrice: auction.currentPrice,
            });
          }
        }
      } else {
        finalStatus = "ENDED";
        await Artwork.findByIdAndUpdate(auction.artwork._id, {
          status: finalStatus,
        });
      }

      console.log(
        `✅ مزاد "${auction.artwork.title}" تم معالجته (${finalStatus}).`
      );
    }
  } catch (error) {
    console.error("❌ Error processing auctions:", error);
  }
};
