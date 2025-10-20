import { useState, useEffect, useCallback } from 'react'; // 1. استيراد useCallback
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchAuctionById, fetchAuctionBids } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const [error, setError] = useState(null);

  // 2. تغليف دالة جلب المزايدات بـ useCallback
  const getBids = useCallback(async () => {
    try {
      const response = await fetchAuctionBids(id);
      setBids(response.data.bids);
    } catch (error) {
      console.error("Failed to fetch bids", error);
    }
  }, [id]); // تعتمد هذه الدالة على id المزاد فقط

  // 3. useEffect لجلب البيانات الأولية مرة واحدة فقط
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const auctionRes = await fetchAuctionById(id);
        setAuction(auctionRes.data.auction);
        await getBids(); // استدعاء الدالة المحفوظة
      } catch (err) {
        setError("فشل في تحميل تفاصيل المزاد.");
        console.error("Failed to load auction page", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, getBids]); // يعتمد على id و getBids (التي أصبحت الآن مستقرة)

  // 4. useEffect منفصل للاتصال الفوري (Socket.IO)
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling'],
    });

    socket.on('connect', () => socket.emit('joinAuctionRoom', id));

    socket.on('priceUpdate', (data) => {
      setAuction(prev => ({ ...prev, currentPrice: data.newPrice }));
      getBids(); // استدعاء الدالة المحفوظة لتحديث السجل
    });

    socket.on('outbid', (data) => {
      // يمكنك استخدام toast هنا بدلاً من alert
      alert(data.message);
    });

    return () => socket.disconnect();
  }, [id, token, getBids]); // يعتمد على getBids (المستقرة)

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 font-semibold p-10">{error}</p>;
  if (!auction) return <p className="text-center p-10 text-xl">لم يتم العثور على المزاد.</p>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
      {/* العمود الأيسر: الصورة (تأخذ 3/5 من المساحة على الشاشات الكبيرة) */}
      <div className="w-full lg:col-span-3">
        <img
          src={auction.artwork.imageUrl}
          alt={auction.artwork.title}
          className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg border border-orange-100"
        />
      </div>

      {/* العمود الأيمن: التفاصيل (تأخذ 2/5 من المساحة على الشاشات الكبيرة) */}
      <div className="w-full lg:col-span-2">
        {/* === الحل هنا: كل التفاصيل الآن داخل بطاقة واحدة === */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 space-y-6">

          {/* العنوان والفنان */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-orange-600 tracking-tight">{auction.artwork.title}</h1>
            <Link to={`/students/${auction.artwork.studentId}`} className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
              بواسطة {auction.artwork.student.name}
            </Link>
          </div>

          {/* السعر */}
          <div className="flex justify-between items-center border-t border-orange-100 pt-4">
            <span className="text-gray-600 text-base">السعر الحالي</span>
            <span className="text-3xl font-bold text-orange-500">{auction.currentPrice.toFixed(2)} ريال</span>
          </div>

          {/* مؤقت العد التنازلي */}
          <CountdownTimer endTime={auction.endTime} />

          {/* نموذج المزايدة أو رسالة تسجيل الدخول */}
          {user ? (
            <BiddingForm auctionId={id} currentPrice={auction.currentPrice} />
          ) : (
            <div className="text-center text-gray-600 bg-orange-50 p-4 rounded-lg">
              <p>الرجاء <Link to="/login" className="font-bold text-orange-600">تسجيل الدخول</Link> لتقديم عرض.</p>
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