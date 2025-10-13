import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// دالة لجلب إحصائيات المنصة
export const getStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const activeAuctionsCount = await prisma.auction.count({
      where: { endTime: { gt: new Date() } },
    });
    const totalSales = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'paid', // أو 'succeeded' حسب ما تم حفظه
      },
    });

    res.status(200).json({
      users: userCount,
      activeAuctions: activeAuctionsCount,
      totalRevenue: totalSales._sum.amount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

// دالة لجلب قائمة بكل المستخدمين
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { // تحديد حقول معينة لتجنب إرسال كلمة المرور
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};