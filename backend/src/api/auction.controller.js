import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();
import axios from "axios"; // استيراد axios

export async function createAuction(req, res) {
  const { artworkId, startPrice, endTime } = req.body;
  const studentId = req.user.id; // هوية الطالب المسجل دخوله

  // التحقق من المدخلات
  if (!artworkId || !startPrice || !endTime) {
    return res
      .status(400)
      .json({ message: "Artwork ID, start price, and end time are required." });
  }

  try {
    // الخطوة 1: العثور على العمل الفني والتأكد من ملكيته
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found." });
    }

    if (artwork.studentId !== studentId) {
      return res.status(403).json({
        message:
          "Forbidden: You can only create auctions for your own artwork.",
      });
    }

    if (artwork.status !== "DRAFT") {
      return res.status(400).json({
        message: "This artwork is already in an auction or has been sold.",
      });
    }

    // الخطوة 2: استخدام معاملة (transaction) لضمان تنفيذ العمليتين معًا
    const newAuction = await prisma.$transaction(async (tx) => {
      // 2a: إنشاء المزاد الجديد
      const auction = await tx.auction.create({
        data: {
          artworkId: artworkId,
          startPrice: parseFloat(startPrice),
          currentPrice: parseFloat(startPrice), // السعر الحالي يبدأ بنفس السعر الابتدائي
          startTime: new Date(),
          endTime: new Date(endTime), // تحويل النص إلى تاريخ
        },
      });

      // 2b: تحديث حالة العمل الفني إلى "في مزاد"
      await tx.artwork.update({
        where: { id: artworkId },
        data: { status: "IN_AUCTION" },
      });

      return auction;
    });

    res
      .status(201)
      .json({ message: "Auction created successfully", auction: newAuction });
  } catch (error) {
    // خطأ في حال كان هناك مزاد قائم بالفعل على هذا العمل الفني
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "An auction for this artwork already exists." });
    }
    res
      .status(500)
      .json({ message: "Failed to create auction", error: error.message });
  }
}

// دالة لجلب كل المزادات النشطة
export async function getAllAuctions(req, res) {
  const { search, sortBy, page = 1, limit = 12 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const whereClause = { endTime: { gt: new Date() } };
    if (search) {
      whereClause.artwork = {
        title: { contains: search, mode: "insensitive" },
      };
    }

    let orderByClause = { startTime: "desc" };
    if (sortBy === "ending_soon") orderByClause = { endTime: "asc" };
    else if (sortBy === "price_asc") orderByClause = { currentPrice: "asc" };
    else if (sortBy === "price_desc") orderByClause = { currentPrice: "desc" };

    // جلب المزادات للصفحة الحالية
    const auctions = await prisma.auction.findMany({
      where: whereClause,
      skip: skip,
      take: limitNum,
      orderBy: orderByClause,
      include: {
        artwork: { include: { student: { select: { name: true } } } },
      },
    });

    // حساب العدد الإجمالي للمزادات لإرساله للمتصفح
    const totalAuctions = await prisma.auction.count({ where: whereClause });
    const totalPages = Math.ceil(totalAuctions / limitNum);

    // إرسال البيانات مع معلومات ترقيم الصفحات
    res.status(200).json({
      auctions,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalAuctions: totalAuctions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch auctions", error: error.message });
  }
}

// دالة لجلب مزاد واحد عبر الـ ID الخاص به
export async function getAuctionById(req, res) {
  const { id } = req.params; // الحصول على الـ ID من الرابط

  try {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        artwork: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.status(200).json({ auction });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch auction details",
      error: error.message,
    });
  }
}

export async function placeBid(req, res) {
  const { id: auctionId } = req.params;
  const { amount } = req.body;
  const bidderId = req.user.id;

  if (!amount) {
    return res.status(400).json({ message: "Bid amount is required." });
  }

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // ## الخطوة 1: جلب المزاد مع تضمين عنوان العمل الفني ##
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          artwork: {
            // تضمين معلومات العمل الفني
            select: {
              title: true, // تحديد العنوان فقط
            },
          },
        },
      });

      if (!auction) throw new Error("Auction not found.");
      if (new Date() > auction.endTime)
        throw new Error("This auction has already ended.");
      if (amount <= auction.currentPrice)
        throw new Error("Your bid must be higher than the current price.");

      const previousHighestBidderId = auction.highestBidderId;

      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: parseFloat(amount),
          highestBidderId: bidderId,
        },
      });

      const bid = await tx.bid.create({
        data: {
          amount: parseFloat(amount),
          auctionId: auctionId,
          bidderId: bidderId,
        },
      });

      // ## الخطوة 2: إرجاع عنوان العمل الفني من الـ transaction ##
      return {
        bid,
        updatedAuction,
        previousHighestBidderId,
        artworkTitle: auction.artwork.title,
      };
    });

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const roomName = `auction-${auctionId}`;

    // ... (بث السعر الجديد يبقى كما هو)
    io.to(roomName).emit("priceUpdate", {
      auctionId: auctionId,
      newPrice: transactionResult.updatedAuction.currentPrice,
      bidderName: req.user.name,
    });

    // ## الخطوة 3: استخدام المتغير الذي تم إرجاعه ##
    const { previousHighestBidderId, artworkTitle } = transactionResult;
    if (previousHighestBidderId && previousHighestBidderId !== bidderId) {
      const oldBidderSocketId = userSocketMap.get(previousHighestBidderId);
      if (oldBidderSocketId) {
        io.to(oldBidderSocketId).emit("outbid", {
          auctionId: auctionId,
          message: `لقد تمت المزايدة بسعر أعلى منك في مزاد "${artworkTitle}"!`,
        });
        console.log(
          `Sent 'outbid' notification to user ${previousHighestBidderId}`
        );
      }
    }

    res.status(201).json({
      message: "Bid placed successfully!",
      bid: transactionResult.bid,
    });
  } catch (error) {
    // إرجاع الخطأ الفعلي إذا حدث
    res
      .status(500)
      .json({ message: "Failed to place bid", error: error.message });
  }
}

// دالة لإنشاء جلسة دفع للفائز
export async function createMoyasarPayment(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user.id;
  const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { artwork: true },
    });

    if (!auction || auction.highestBidderId !== userId) {
      return res.status(403).json({
        message: "Forbidden: You are not the winner of this auction.",
      });
    }

    if (auction.artwork.status !== "SOLD") {
      return res
        .status(400)
        .json({ message: "Payment is not yet available for this auction." });
    }

    // ## تعديل: سنقوم بإنشاء "فاتورة" بدلاً من "دفعة" ##
    const response = await axios.post(
      "https://api.moyasar.com/v1/invoices",
      {
        amount: Math.round(auction.currentPrice * 100),
        currency: "SAR",
        description: `Invoice for artwork: ${auction.artwork.title}`,
        callback_url: `http://fanan3.com/payment/callback?auction_id=${auction.id}`,
        // يمكنك إضافة metadata هنا إذا احتجت
      },
      {
        auth: {
          username: moyasarApiKey,
          password: "",
        },
      }
    );

    // رابط صفحة الدفع للفاتورة موجود في 'url' مباشرة
    const paymentUrl = response.data.url;
    res.status(200).json({ url: paymentUrl });
  } catch (error) {
    console.error(
      "Moyasar API Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      message: "Failed to create Moyasar payment",
      error: error.response ? error.response.data : error.message,
    });
  }
}

export async function getAuctionBids(req, res) {
  const { id: auctionId } = req.params;

  try {
    const bids = await prisma.bid.findMany({
      where: { auctionId },
      orderBy: {
        createdAt: "desc", // ترتيب المزايدات من الأحدث للأقدم
      },
      include: {
        bidder: {
          // تضمين معلومات المزايد
          select: {
            name: true, // جلب الاسم فقط لحماية الخصوصية
          },
        },
      },
    });
    res.status(200).json({ bids });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch bids", error: error.message });
  }
}

export async function cancelAuction(req, res) {
  const { id: auctionId } = req.params;
  const userId = req.user.id; // هوية الطالب من الـ token

  try {
    const result = await prisma.$transaction(async (tx) => {
      // الخطوة 1: العثور على المزاد وتضمين العمل الفني للتحقق من الملكية
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: { artwork: true },
      });

      if (!auction) {
        throw new Error("Auction not found.");
      }

      // الخطوة 2: التحقق من أن المستخدم هو مالك العمل الفني
      if (auction.artwork.studentId !== userId) {
        throw new Error("Forbidden: You can only cancel your own auctions.");
      }

      // الخطوة 3 (الأهم): التحقق من عدم وجود أي مزايدات
      const bidCount = await tx.bid.count({
        where: { auctionId: auctionId },
      });

      if (bidCount > 0) {
        throw new Error("Cannot cancel an auction that already has bids.");
      }

      // الخطوة 4: تحديث حالة العمل الفني إلى "مسودة"
      await tx.artwork.update({
        where: { id: auction.artworkId },
        data: { status: "DRAFT" },
      });

      // الخطوة 5: حذف المزاد بالكامل
      await tx.auction.delete({
        where: { id: auctionId },
      });

      return { success: true };
    });

    res.status(200).json({ message: "Auction cancelled successfully." });
  } catch (error) {
    if (error.message.includes("Forbidden")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("has bids")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Failed to cancel auction", error: error.message });
  }
}
