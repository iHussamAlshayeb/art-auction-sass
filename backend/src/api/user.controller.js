import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";

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

export const getMyProfileData = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        schoolName: true,
        gradeLevel: true,
        bio: true,
      },
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب بيانات الملف الشخصي" });
  }
};

export const updateMyProfile = async (req, res) => {
  const userId = req.user.id;

  // الدالة جاهزة لاستقبال كل البيانات، بما في ذلك profileImageUrl
  const { name, email, profileImageUrl, schoolName, gradeLevel, bio } =
    req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "الاسم والبريد الإلكتروني حقول إلزامية." });
  }

  try {
    const dataToUpdate = { name, email, schoolName, gradeLevel, bio };

    // أضف رابط الصورة فقط إذا تم إرساله
    if (profileImageUrl) {
      dataToUpdate.profileImageUrl = profileImageUrl;
    }

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({ message: "تم تحديث الملف الشخصي بنجاح" });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
    }
    res.status(500).json({ message: "فشل في تحديث الملف الشخصي" });
  }
};

export const updateMyPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      return res
        .status(401)
        .json({ message: "هذا الحساب لا يملك كلمة مرور مسجلة." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "كلمة المرور الحالية غير صحيحة." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "تم تحديث كلمة المرور بنجاح." });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "فشل في تحديث كلمة المرور." });
  }
};
