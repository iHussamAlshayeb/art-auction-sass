import PrismaClientPkg from "@prisma/client";
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
        status: "paid", // أو 'succeeded' حسب ما تم حفظه
      },
    });

    res.status(200).json({
      users: userCount,
      activeAuctions: activeAuctionsCount,
      totalRevenue: totalSales._sum.amount || 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch stats", error: error.message });
  }
};

// دالة لجلب قائمة بكل المستخدمين
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        // تحديد حقول معينة لتجنب إرسال كلمة المرور
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// دالة لتغيير دور المستخدم
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // التحقق من أن الدور المرسل صالح
  if (!["STUDENT", "BUYER", "ADMIN"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided." });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { role },
    });
    res.status(200).json({ message: "User role updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user role", error: error.message });
  }
};

// دالة لحذف مستخدم
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Prisma سيقوم تلقائيًا بحذف كل السجلات المرتبطة (مثل المزايدات والأعمال الفنية)
    // إذا قمت بإعداد علاقات الحذف المتتالي (cascading deletes) في schema.prisma
    // للتبسيط، سنقوم بالحذف المباشر الآن.
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await prisma.artwork.findMany({
      include: {
        student: {
          // تضمين اسم الطالب صاحب العمل
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch artworks", error: error.message });
  }
};

// دالة لحذف عمل فني (سيتم حذف المزاد المرتبط به تلقائيًا)
export const deleteArtwork = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.artwork.delete({
      where: { id },
    });
    res.status(200).json({ message: "Artwork deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete artwork", error: error.message });
  }
};
