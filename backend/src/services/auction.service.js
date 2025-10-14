import PrismaClientPkg from "@prisma/client";
import { sendAuctionWonEmail } from "./email.service.js"; // <-- هذا هو السطر المضاف

const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

export const processFinishedAuctions = async (io, userSocketMap) => {
  console.log(`Running job at server time: ${new Date().toISOString()}`);

  const artworksInAuction = await prisma.artwork.findMany({
    where: {
      status: "IN_AUCTION",
    },
    include: {
      auction: true,
    },
  });

  for (const artwork of artworksInAuction) {
    if (artwork.auction && new Date() > new Date(artwork.auction.endTime)) {
      let finalStatus;
      const winnerId = artwork.auction.highestBidderId;

      if (winnerId) {
        finalStatus = "SOLD";
        console.log(
          `Auction for artwork "${artwork.title}" (ID: ${artwork.id}) has ended. Winner found. Status changed to SOLD.`
        );

        // جلب بيانات الفائز لإرسال البريد الإلكتروني
        const winner = await prisma.user.findUnique({
          where: { id: winnerId },
        });
        if (winner && winner.email) {
          // استدعاء دالة إرسال البريد
          await sendAuctionWonEmail(winner, artwork, artwork.auction);
        }

        // إرسال الإشعار الفوري
        const winnerSocketId = userSocketMap.get(winnerId);
        if (winnerSocketId) {
          io.to(winnerSocketId).emit("auctionWon", {
            message: `🎉 تهانينا! لقد فزت بمزاد "${artwork.title}"`,
            auctionId: artwork.auction.id,
            finalPrice: artwork.auction.currentPrice,
          });
          console.log(`Sent 'auctionWon' notification to user ${winnerId}`);
        }
      } else {
        finalStatus = "ENDED";
        console.log(
          `Auction for artwork "${artwork.title}" (ID: ${artwork.id}) has ended. No bids placed. Status changed to ENDED.`
        );
      }

      await prisma.artwork.update({
        where: { id: artwork.id },
        data: { status: finalStatus },
      });
    }
  }
};
