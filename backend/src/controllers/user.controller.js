import User from "../models/user.model.js";
import Artwork from "../models/artwork.model.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import bcrypt from "bcryptjs";

// ---== دالة جلب بيانات الملف الشخصي (نسخة Mongoose) ==---
export async function getMyProfileData(req, res) {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select("-password"); // .select('-password') لتجنب إرسال كلمة المرور

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود." });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب بيانات الملف الشخصي" });
  }
}

// ---== دالة تحديث الملف الشخصي (نسخة Mongoose) ==---
export async function updateMyProfile(req, res) {
  const userId = req.user.id;
  const { name, email, profileImageUrl, schoolName, gradeLevel, bio } =
    req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "الاسم والبريد الإلكتروني حقول إلزامية." });
  }

  try {
    const user = await User.findById(userId);

    if (user) {
      user.name = name;
      user.email = email;
      user.profileImageUrl = profileImageUrl || user.profileImageUrl;
      user.schoolName = schoolName || user.schoolName;
      user.gradeLevel = gradeLevel || user.gradeLevel;
      user.bio = bio || user.bio;

      await user.save();
      res.status(200).json({ message: "تم تحديث الملف الشخصي بنجاح" });
    } else {
      res.status(404).json({ message: "المستخدم غير موجود." });
    }
  } catch (error) {
    // 11000 هو رمز الخطأ لانتهاك القيد الفريد (بريد إلكتروني مكرر)
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
    }
    res.status(500).json({ message: "فشل في تحديث الملف الشخصي" });
  }
}

// ---== دالة تحديث كلمة المرور (نسخة Mongoose) ==---
export async function updateMyPassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة." });
  }

  try {
    const user = await User.findById(userId);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword; // سيتم التشفير تلقائيًا عند الحفظ
      await user.save();
      res.status(200).json({ message: "تم تحديث كلمة المرور بنجاح." });
    } else {
      res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة." });
    }
  } catch (error) {
    res.status(500).json({ message: "فشل في تحديث كلمة المرور" });
  }
}

// ---== دالة جلب أعمال الطالب (نسخة Mongoose) ==---
export async function getMyArtworks(req, res) {
  const studentId = req.user.id;
  try {
    const artworks = await Artwork.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate("auction", "id"); // جلب ID المزاد المرتبط

    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في تحميل أعمالك الفنية", error: error.message });
  }
}

// ---== دالة جلب العروض النشطة (نسخة Mongoose) ==---
export async function getMyActiveBids(req, res) {
  const userId = req.user.id;
  try {
    // 1. جلب كل المزايدات التي قام بها المستخدم
    const userBids = await Bid.find({ bidder: userId }).select("auction");
    const auctionIds = [...new Set(userBids.map((bid) => bid.auction))]; // الحصول على IDs فريدة للمزادات

    // 2. البحث عن هذه المزادات التي لم تنتهِ بعد
    const auctions = await Auction.find({
      _id: { $in: auctionIds },
      endTime: { $gt: new Date() },
    })
      .populate("artwork")
      .sort({ endTime: "asc" });

    res.status(200).json({ auctions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch active bids", error: error.message });
  }
}

// ---== دالة جلب المزادات الفائزة (نسخة Mongoose) ==---
export async function getMyWonArtworks(req, res) {
  const userId = req.user.id;
  try {
    // 1. جلب المزادات التي فاز بها المستخدم
    const wonAuctions = await Auction.find({ highestBidder: userId })
      .populate("artwork")
      .populate("payment")
      .sort({ endTime: "desc" });

    // 2. فلترة النتائج لتشمل فقط الأعمال المباعة
    const soldAuctions = wonAuctions.filter(
      (auction) => auction.artwork.status === "SOLD"
    );

    res.status(200).json({ wonAuctions: soldAuctions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch won artworks", error: error.message });
  }
}
