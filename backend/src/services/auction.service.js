import { sendAuctionWonEmail } from "./email.service.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const processFinishedAuctions = async (io, userSocketMap) => {
  console.log(`Running job at server time: ${new Date().toISOString()}`);

  try {
    // 1. ابحث عن كل المزادات النشطة التي انتهى وقتها
    const finishedAuctions = await Auction.find({
      endTime: { $lte: new Date() }, // $lte تعادل 'less than or equal'
      status: { $ne: "PROCESSED" }, // حالة جديدة لمنع المعالجة المزدوجة
    }).populate("artwork"); // .populate تعادل 'include: { artwork: true }'

    for (const auction of finishedAuctions) {
      let finalStatus;
      const winnerId = auction.highestBidder; // في Mongoose، هذا هو ID الفائز

      if (winnerId) {
        finalStatus = "SOLD";
        console.log(
          `Auction for artwork "${auction.artwork.title}" (ID: ${auction.artwork._id}) has ended. Winner found. Status changed to SOLD.`
        );

        // 2. جلب بيانات الفائز لإرسال البريد الإلكتروني والإشعار
        const winner = await User.findById(winnerId);

        if (winner) {
          // 3. حفظ الإشعار في MongoDB
          await Notification.create({
            user: winnerId,
            message: `🎉 تهانينا! لقد فزت بمزاد "${auction.artwork.title}"`,
            link: `/dashboard/won-auctions`,
          });

          // 4. إرسال البريد الإلكتروني (إذا كان لديه بريد)
          if (winner.email) {
            await sendAuctionWonEmail(winner, auction.artwork, auction);
          }

          // 5. إرسال الإشعار الفوري
          const winnerSocketId = userSocketMap.get(winnerId.toString());
          if (winnerSocketId) {
            io.to(winnerSocketId).emit("auctionWon", {
              message: `🎉 تهانينا! لقد فزت بمزاد "${auction.artwork.title}"`,
              auctionId: auction._id,
              finalPrice: auction.currentPrice,
            });
            console.log(`Sent 'auctionWon' notification to user ${winnerId}`);
          }
        }
      } else {
        finalStatus = "ENDED";
        console.log(
          `Auction for artwork "${auction.artwork.title}" (ID: ${auction.artwork._id}) has ended. No bids placed. Status changed to ENDED.`
        );
      }

      // 6. تحديث حالة العمل الفني
      await Artwork.findByIdAndUpdate(auction.artwork._id, {
        status: finalStatus,
      });

      // 7. تحديث حالة المزاد لمنع معالجته مرة أخرى
      await Auction.findByIdAndUpdate(auction._id, { status: "PROCESSED" });
    }
  } catch (error) {
    console.error("Error processing finished auctions:", error);
  }
};
