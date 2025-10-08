import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();
import axios from 'axios'; // استيراد axios


export const createAuction = async (req, res) => {
  const { artworkId, startPrice, endTime } = req.body;
  const studentId = req.user.id; // هوية الطالب المسجل دخوله

  // التحقق من المدخلات
  if (!artworkId || !startPrice || !endTime) {
    return res.status(400).json({ message: 'Artwork ID, start price, and end time are required.' });
  }

  try {
    // الخطوة 1: العثور على العمل الفني والتأكد من ملكيته
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }

    if (artwork.studentId !== studentId) {
      return res.status(403).json({ message: 'Forbidden: You can only create auctions for your own artwork.' });
    }

    if (artwork.status !== 'DRAFT') {
      return res.status(400).json({ message: 'This artwork is already in an auction or has been sold.' });
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
        data: { status: 'IN_AUCTION' },
      });

      return auction;
    });

    res.status(201).json({ message: 'Auction created successfully', auction: newAuction });
  } catch (error) {
    // خطأ في حال كان هناك مزاد قائم بالفعل على هذا العمل الفني
    if (error.code === 'P2002') {
       return res.status(409).json({ message: 'An auction for this artwork already exists.' });
    }
    res.status(500).json({ message: 'Failed to create auction', error: error.message });
  }
};

// دالة لجلب كل المزادات النشطة
export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        // جلب المزادات التي لم تنتهِ بعد
        endTime: {
          gt: new Date(),
        },
      },
      orderBy: {
        startTime: 'desc', // عرض أحدث المزادات أولاً
      },
      include: {
        // تضمين معلومات العمل الفني وصاحبه
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
    res.status(200).json({ auctions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auctions', error: error.message });
  }
};

// دالة لجلب مزاد واحد عبر الـ ID الخاص به
export const getAuctionById = async (req, res) => {
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
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.status(200).json({ auction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auction details', error: error.message });
  }
};



export const placeBid = async (req, res) => {
  const { id: auctionId } = req.params;
  const { amount } = req.body;
  const bidderId = req.user.id; // المزايد الجديد

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId }, include: {
          artwork: { // تضمين معلومات العمل الفني
            select: {
              title: true, // تحديد العنوان فقط
            },
          },
        },
      });

      if (!auction) throw new Error('Auction not found.');
      if (new Date() > auction.endTime) throw new Error('This auction has already ended.');
      if (amount <= auction.currentPrice) throw new Error('Your bid must be higher than the current price.');
      
      const previousHighestBidderId = auction.highestBidderId; // نحتفظ بهوية المزايد القديم

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
      
      return { bid, updatedAuction, previousHighestBidderId, artworkTitle: auction.artwork.title };
    });

    const io = req.app.get('io');
    const userSocketMap = req.app.get('userSocketMap');
    const roomName = `auction-${auctionId}`;
    
    // 1. بث السعر الجديد للجميع في الغرفة (كما كان)
    io.to(roomName).emit('priceUpdate', {
      auctionId: auctionId,
      newPrice: transactionResult.updatedAuction.currentPrice,
      bidderName: req.user.name, // يمكننا إضافة اسم المزايد الجديد
    });
    console.log(`Emitted priceUpdate to room ${roomName}`);
    
    // 2. إرسال إشعار خاص للمزايد القديم (إذا كان موجودًا ومتصلاً)
    const { previousHighestBidderId } = transactionResult;
    if (previousHighestBidderId && previousHighestBidderId !== bidderId) {
      const oldBidderSocketId = userSocketMap.get(previousHighestBidderId);
      if (oldBidderSocketId) {
        io.to(oldBidderSocketId).emit('outbid', {
          auctionId: auctionId,
          message: `لقد تمت المزايدة بسعر أعلى منك في مزاد "${artworkTitle}"!`
        });
        console.log(`Sent 'outbid' notification to user ${previousHighestBidderId}`);
      }
    }
    
    res.status(201).json({ message: 'Bid placed successfully!', bid: transactionResult.bid });

  } catch (error) {
    // ... معالجة الأخطاء كما هي
    if (error.message.includes('Auction not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('auction has already ended') || error.message.includes('must be higher')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to place bid', error: error.message });
  }
};

// دالة لإنشاء جلسة دفع للفائز
export const createMoyasarPayment = async (req, res) => {
  const { id: auctionId } = req.params;
  const userId = req.user.id;
  const moyasarApiKey = process.env.MOYASAR_SECRET_KEY;

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { artwork: true },
    });

    if (!auction || auction.highestBidderId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not the winner of this auction.' });
    }

    if (auction.artwork.status !== 'SOLD') {
      return res.status(400).json({ message: 'Payment is not yet available for this auction.' });
    }

    // ## تعديل: سنقوم بإنشاء "فاتورة" بدلاً من "دفعة" ##
    const response = await axios.post('https://api.moyasar.com/v1/invoices', {
      amount: Math.round(auction.currentPrice * 100),
      currency: 'SAR',
      description: `Invoice for artwork: ${auction.artwork.title}`,
      callback_url: `http://your-frontend-website.com/payment/callback?auction_id=${auction.id}`,
      // يمكنك إضافة metadata هنا إذا احتجت
    }, {
      auth: {
        username: moyasarApiKey,
        password: ''
      }
    });

    // رابط صفحة الدفع للفاتورة موجود في 'url' مباشرة
    const paymentUrl = response.data.url;
    res.status(200).json({ url: paymentUrl });

  } catch (error) {
    console.error("Moyasar API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to create Moyasar payment', error: error.response ? error.response.data : error.message });
  }
};