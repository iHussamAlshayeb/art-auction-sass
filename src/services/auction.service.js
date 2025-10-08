import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

export const processFinishedAuctions = async () => {
  console.log('Running job: Checking for finished auctions...');

  // الخطوة 1: العثور على كل الأعمال الفنية التي في مزاد حاليًا
  const artworksInAuction = await prisma.artwork.findMany({
    where: {
      status: 'IN_AUCTION',
    },
    include: {
      auction: true, // جلب المزاد المرتبط بها
    },
  });

  // الخطوة 2: المرور على كل عمل فني والتحقق من مزاده
  for (const artwork of artworksInAuction) {
    // التأكد من وجود مزاد وأن وقته قد انتهى
    if (artwork.auction && new Date() > artwork.auction.endTime) {

      let finalStatus;

      // إذا كان هناك فائز (أعلى مزايد)، تكون الحالة "مُباع"
      if (artwork.auction.highestBidderId) {
        finalStatus = 'SOLD';
        console.log(`Auction for artwork "${artwork.title}" has ended. Winner found. Status set to SOLD.`);
      } else {
        // إذا لم يكن هناك مزايد، تكون الحالة "منتهي"
        finalStatus = 'ENDED';
        console.log(`Auction for artwork "${artwork.title}" has ended. No bids placed. Status set to ENDED.`);
      }

      // الخطوة 3: تحديث حالة العمل الفني
      await prisma.artwork.update({
        where: { id: artwork.id },
        data: { status: finalStatus },
      });
    }
  }
};