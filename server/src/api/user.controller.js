import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// This is the getMyProfile function we already have
export const getMyProfile = (req, res) => {
  res.status(200).json({
    message: 'Profile fetched successfully',
    user: req.user,
  });
};

// Add this new function to user.controller.js
export const getMyArtworks = async (req, res) => {
  const studentId = req.user.id; // From the 'protect' middleware

  try {
    const artworks = await prisma.artwork.findMany({
      where: {
        studentId: studentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your artworks', error: error.message });
  }
};

export const getMyActiveBids = async (req, res) => {
  const userId = req.user.id;
  try {
    // نبحث عن المزادات التي تحتوي على مزايدة واحدة على الأقل من المستخدم ولم تنتهِ بعد
    const auctions = await prisma.auction.findMany({
      where: {
        endTime: { gt: new Date() }, // المزاد لم ينتهِ
        bids: {
          some: { bidderId: userId }, // يوجد مزايدة من المستخدم
        },
      },
      include: { artwork: true },
      orderBy: { endTime: 'asc' },
    });
    res.status(200).json({ auctions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active bids', error: error.message });
  }
};

// دالة لجلب الأعمال الفنية التي فاز بها المستخدم
export const getMyWonArtworks = async (req, res) => {
  const userId = req.user.id;
  try {
    const wonAuctions = await prisma.auction.findMany({
      where: {
        highestBidderId: userId,
        artwork: {
          status: 'SOLD',
        },
      },
      include: { 
        artwork: true,
        payment: true, // جلب معلومات الدفع للتأكد إذا تم الدفع أم لا
      },
      orderBy: { endTime: 'desc' },
    });
    res.status(200).json({ wonAuctions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch won artworks', error: error.message });
  }
};