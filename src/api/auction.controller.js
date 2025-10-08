import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();
import stripe from 'stripe'; // استيراد Stripe


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
  const { id: auctionId } = req.params; // ID المزاد من الرابط
  const { amount } = req.body; // مبلغ المزايدة من الجسم
  const bidderId = req.user.id; // هوية المزايد من الـ token

  if (!amount) {
    return res.status(400).json({ message: 'Bid amount is required.' });
  }

  try {
    const newBid = await prisma.$transaction(async (tx) => {
      // الخطوة 1: جلب المزاد الحالي للتأكد من حالته
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });

      // التحقق من وجود المزاد
      if (!auction) {
        throw new Error('Auction not found.');
      }
      
      // التحقق من أن المزاد لم ينتهِ بعد
      if (new Date() > auction.endTime) {
        throw new Error('This auction has already ended.');
      }
      
      // التحقق من أن المزايدة الجديدة أعلى من السعر الحالي
      if (amount <= auction.currentPrice) {
        throw new Error('Your bid must be higher than the current price.');
      }

      // الخطوة 2: تحديث المزاد بالسعر الجديد وهوية أعلى مزايد
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: parseFloat(amount),
          highestBidderId: bidderId,
        },
      });

      // الخطوة 3: تسجيل المزايدة الجديدة في جدول المزايدات (Bids)
      const bid = await tx.bid.create({
        data: {
          amount: parseFloat(amount),
          auctionId: auctionId,
          bidderId: bidderId,
        },
      });

      return bid;
    });

    res.status(201).json({ message: 'Bid placed successfully!', bid: newBid });

  } catch (error) {
    // إرجاع رسائل خطأ واضحة بناءً على نوع الخطأ
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
export const createCheckoutSession = async (req, res) => {
  const { id: auctionId } = req.params;
  const userId = req.user.id; // هوية المستخدم من الـ token

  try {
    // الخطوة 1: جلب المزاد والتحقق من الشروط
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { artwork: true }, // جلب معلومات العمل الفني
    });

    // التحقق من أن المزاد موجود وأن المستخدم هو الفائز
    if (!auction || auction.highestBidderId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not the winner of this auction.' });
    }

    // التحقق من أن المزاد قد انتهى فعلاً
    if (new Date() < auction.endTime) {
      return res.status(400).json({ message: 'This auction has not ended yet.' });
    }
    
    // التحقق من أن حالة العمل "مُباع" (للتأكد أن المهمة الخلفية قد عملت)
    if (auction.artwork.status !== 'SOLD') {
        return res.status(400).json({ message: 'Payment cannot be processed for this artwork.'});
    }

    // الخطوة 2: تهيئة Stripe وإنشاء جلسة الدفع
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'sar', // يمكنك تغيير العملة حسب الحاجة
          product_data: {
            name: auction.artwork.title,
            description: auction.artwork.description,
          },
          unit_amount: Math.round(auction.currentPrice * 100), // يجب أن يكون المبلغ بأصغر وحدة (هللة)
        },
        quantity: 1,
      }],
      // روابط لإعادة توجيه المستخدم بعد إتمام الدفع أو إلغائه
      success_url: `http://your-frontend-website.com/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://your-frontend-website.com/payment/cancel`,
      // معلومات إضافية لربط جلسة الدفع بالمزاد في نظامنا
      metadata: {
        auctionId: auction.id,
        artworkId: auction.artworkId,
      }
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};