import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// This is the getMyProfile function we already have
export const getMyProfile = (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user,
  });
};

// Add this new function to user.controller.js
export const getMyArtworks = async (req, res) => {
  const studentId = req.user.id; // From the 'protect' middleware

  try {
    const artworks = await prisma.artwork.findMany({
      where: { studentId: studentId },
      orderBy: { createdAt: "desc" },
      include: { auction: { select: { id: true } } },
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch your artworks", error: error.message });
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
      orderBy: { endTime: "asc" },
    });
    res.status(200).json({ auctions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch active bids", error: error.message });
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
          status: "SOLD",
        },
      },
      include: {
        artwork: true,
        payment: true,
      },
      orderBy: { endTime: "desc" },
    });
    res.status(200).json({ wonAuctions });
  } catch (error) {
    console.error("Error fetching won artworks:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch won artworks", error: error.message });
  }
};


// دالة لجلب بيانات الملف الشخصي الكاملة
export const getMyProfileData = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // تحديد الحقول التي نريد إرجاعها فقط (لحماية كلمة المرور)
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile data' });
  }
};

// دالة لتحديث بيانات الملف الشخصي (الاسم والبريد الإلكتروني)
export const updateMyProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// دالة لتغيير كلمة المرور (آمنة)
export const updateMyPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password' });
  }
};