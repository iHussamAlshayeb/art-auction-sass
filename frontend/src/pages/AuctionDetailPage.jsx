import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchAuctionById, fetchAuctionBids } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// استيراد المكونات
import BiddingForm from '../components/BiddingForm';
import CountdownTimer from '../components/CountdownTimer';
import BidHistory from '../components/BidHistory';
import Spinner from '../components/Spinner';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

function AuctionDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ دالة مستقرة (لا يعاد تعريفها عند كل render)
  const getBids = useCallback(async (auctionId) => {
    try {
      const response = await fetchAuctionBids(auctionId);
      setBids(response.data.bids);
    } catch (error) {
      console.error("Failed to fetch bids", error);
    }
  }, []);

  // ✅ جلب البيانات الأولية (مرة واحدة عند تحميل الصفحة أو تغيّر id)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const auctionRes = await fetchAuctionById(id);
        setAuction(auctionRes.data.auction);
        await getBids(id);
      } catch (error) {
        console.error("Failed to load auction page", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, getBids]);

  // ✅ إعداد Socket.io بشكل منفصل (لتفادي أي loop)
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling'], // يمكن استبدالها بـ ['websocket'] لتحسين الأداء
    });

    socket.on('connect', () => {
      socket.emit('joinAuctionRoom', id);
    });

    // عند وصول تحديث في السعر
    socket.on('priceUpdate', (data) => {
      setAuction(prev => {
        if (!prev || prev.currentPrice === data.newPrice) return prev;
        return { ...prev, currentPrice: data.newPrice };
      });
      getBids(id); // تحديث سجل المزايدات فقط عند التغيير
    });

    // إشعارات مختلفة
    socket.on('outbid', (data) => {
      toast.error(data.message);
    });

    socket.on('auctionWon', (data) => {
      toast.success(data.message, {
        duration: 6000,
        icon: '🎉',
      });
    });

    // تنظيف الاتصال عند مغادرة الصفحة
    return () => socket.disconnect();
  }, [id, token, getBids]);

  // === واجهة المستخدم ===
  if (loading) return <Spinner />;

  if (!auction) {
    return <p className="text-center p-10 text-xl">لم يتم العثور على المزاد.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
      {/* الصورة */}
      <div className="w-full lg:col-span-3">
        <img
          src={auction.artwork.imageUrl}
          alt={auction.artwork.title}
          className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg border border-orange-100"
        />
      </div>

      {/* التفاصيل */}
      <div className="w-full lg:col-span-2">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 space-y-6">

          {/* العنوان والفنان */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-orange-600 tracking-tight">
              {auction.artwork.title}
            </h1>
            <Link
              to={`/students/${auction.artwork.studentId}`}
              className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
            >
              بواسطة {auction.artwork.student.name}
            </Link>
          </div>

          {/* السعر */}
          <div className="flex justify-between items-center border-t border-orange-100 pt-4">
            <span className="text-gray-600 text-base">السعر الحالي</span>
            <span className="text-3xl font-bold text-orange-500">
              {auction.currentPrice.toFixed(2)} ريال
            </span>
          </div>

          {/* العد التنازلي */}
          <CountdownTimer endTime={auction.endTime} />

          {/* نموذج المزايدة */}
          {user ? (
            <BiddingForm auctionId={id} currentPrice={auction.currentPrice} />
          ) : (
            <div className="text-center text-gray-600 bg-orange-50 p-4 rounded-lg">
              <p>
                الرجاء{' '}
                <Link to="/login" className="font-bold text-orange-600">
                  تسجيل الدخول
                </Link>{' '}
                لتقديم عرض.
              </p>
            </div>
          )}

          {/* سجل المزايدات */}
          <BidHistory bids={bids} />
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;
