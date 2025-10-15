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

// دالة لجلب بيانات الملف الشخصي الكاملة
export const getMyProfileData = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // --== الحل هنا: طلب كل الحقول الجديدة ==--
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
    res.status(500).json({ message: "Failed to fetch profile data" });
  }
};

// دالة لتحديث بيانات الملف الشخصي (الاسم والبريد الإلكتروني)
export const updateMyProfile = async (req, res) => {
  const userId = req.user.id;

  // ---== بداية سجلات التشخيص ==---
  console.log("==> Received request to update profile for user:", userId);
  console.log("    Request Body:", req.body);
  // ---== نهاية سجلات التشخيص ==---

  const { name, email, schoolName, gradeLevel, bio } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  try {
    const dataToUpdate = {
      name,
      email,
      schoolName,
      gradeLevel,
      bio,
    };

    // ---== بداية سجلات التشخيص ==---
    console.log("    Data being sent to Prisma for update:", dataToUpdate);
    // ---== نهاية سجلات التشخيص ==---

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    console.log("    Prisma update successful for user:", userId);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    // ---== بداية سجلات التشخيص ==---
    console.error("!!! ERROR during profile update:", error);
    // ---== نهاية سجلات التشخيص ==---

    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "This email is already in use by another account." });
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// دالة لتغيير كلمة المرور (آمنة)
export const updateMyPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // --== الحل هنا: التحقق من وجود المستخدم وكلمة المرور ==--
    if (!user || !user.password) {
      // إذا لم يكن للمستخدم كلمة مرور، فهذا طلب غير صالح
      return res
        .status(401)
        .json({ message: "This account does not have a password set." });
    }

    // الآن نحن متأكدون من وجود user.password، يمكننا المقارنة بأمان
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};
