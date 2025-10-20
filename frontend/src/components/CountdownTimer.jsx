import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchAuctionById, fetchAuctionBids } from '../services/api';
import { useAuth } from '../context/AuthContext';

// استيراد المكونات
import BiddingForm from '../components/BiddingForm';
import CountdownTimer from '../components/CountdownTimer'; // <-- استيراد المؤقت الجديد
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const auctionRes = await fetchAuctionById(id);
        setAuction(auctionRes.data.auction);
        const bidsRes = await fetchAuctionBids(id);
        setBids(bidsRes.data.bids);
      } catch (err) {
        setError("فشل في تحميل تفاصيل المزاد.");
        console.error("Failed to load auction page", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling'],
    });

    socket.on('connect', () => socket.emit('joinAuctionRoom', id));
    socket.on('priceUpdate', (data) => {
      setAuction(prev => ({ ...prev, currentPrice: data.newPrice }));
      fetchAuctionBids(id).then(res => setBids(res.data.bids)); // تحديث سجل المزايدات
    });
    // ... (باقي مستمعي Socket.IO)

    return () => socket.disconnect();
  }, [id, token]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 font-semibold p-10">{error}</p>;
  if (!auction) return <p className="text-center p-10 text-xl">لم يتم العثور على المزاد.</p>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
      {/* العمود الأيسر: الصورة */}
      <div className="w-full lg:col-span-3">
        <img
          src={auction.artwork.imageUrl}
          alt={auction.artwork.title}
          className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg border border-neutral-200"
        />
      </div>

      {/* العمود الأيمن: التفاصيل */}
      <div className="w-full lg:col-span-2">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-neutral-200 space-y-6">
          {/* العنوان والفنان */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-dark tracking-tight">{auction.artwork.title}</h1>
            <Link to={`/students/${auction.artwork.studentId}`}>
              <p className="text-lg text-neutral-700 mt-1 hover:text-primary transition-colors">
                للفنان: {auction.artwork.student.name}
              </p>
            </Link>
          </div>

          {/* الوصف */}
          <p className="text-neutral-700 leading-relaxed">{auction.artwork.description}</p>

          {/* السعر */}
          <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
            <span className="text-neutral-700 text-base">السعر الحالي</span>
            <span className="text-3xl font-bold text-secondary">{auction.currentPrice.toFixed(2)} ريال</span>
          </div>

          {/* المؤقت الجديد */}
          <CountdownTimer endTime={auction.endTime} />

          {/* نموذج المزايدة أو رسالة تسجيل الدخول */}
          {user ? (
            <BiddingForm auctionId={id} currentPrice={auction.currentPrice} />
          ) : (
            <div className="text-center text-neutral-700 bg-primary/5 p-4 rounded-lg">
              <p>الرجاء <Link to="/login" className="font-bold text-primary">تسجيل الدخول</Link> لتقديم عرض.</p>
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