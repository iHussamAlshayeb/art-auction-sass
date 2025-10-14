import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// تعديل الدالة لتستقبل io و userSocketMap
export const processFinishedAuctions = async (io, userSocketMap) => {
  console.log("Running job: Checking for finished auctions...");

  const artworksInAuction = await prisma.artwork.findMany({
    where: {
      status: "IN_AUCTION",
      auction: {
        endTime: {
          lt: new Date(), // البحث عن المزادات التي انتهى وقتها
        },
      },
    },
    include: {
      auction: true,
      student: { select: { name: true, email: true } },
    },
  });

  for (const artwork of artworksInAuction) {
    let finalStatus;
    const winnerId = artwork.auction.highestBidderId;

    if (winnerId) {
      finalStatus = "SOLD";
      console.log(
        `Auction for artwork "${artwork.title}" has ended. Winner found. Status set to SOLD.`
      );

      const winner = await prisma.user.findUnique({ where: { id: winnerId } });
      if (winner) {
        // 2. إرسال الإشعار عبر البريد الإلكتروني
        await sendAuctionWonEmail(winner, artwork, artwork.auction);
      }

      // ## الخطوة الجديدة: إرسال إشعار للفائز ##
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
        `Auction for artwork "${artwork.title}" has ended. No bids placed. Status set to ENDED.`
      );
    }

    await prisma.artwork.update({
      where: { id: artwork.id },
      data: { status: finalStatus },
    });
  }
};
