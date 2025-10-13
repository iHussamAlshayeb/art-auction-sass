import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchAuctionById, fetchAuctionBids } from '../services/api';
import { useAuth } from '../context/AuthContext';

// استيراد المكونات
import BiddingForm from '../components/BiddingForm';
import CountdownTimer from '../components/CountdownTimer';
import BidHistory from '../components/BidHistory';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

function AuctionDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة لجلب المزايدات
  const getBids = async (auctionId) => {
    try {
      const response = await fetchAuctionBids(auctionId);
      setBids(response.data.bids);
    } catch (error) {
      console.error("Failed to fetch bids", error);
    }
  };

  useEffect(() => {
    // دالة لجلب البيانات الأولية (المزاد والمزايدات)
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

    // إعداد اتصال Socket.IO
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinAuctionRoom', id);
    });

    // الاستماع لتحديثات السعر وتحديث سجل المزايدات
    socket.on('priceUpdate', (data) => {
      setAuction(prevAuction => ({
        ...prevAuction,
        currentPrice: data.newPrice,
      }));
      getBids(id);
    });
    
    // الاستماع للإشعارات
    socket.on('outbid', (data) => {
      alert(data.message); // يمكنك استبدال هذا بنظام إشعارات أفضل لاحقًا
    });

    // تنظيف الاتصال عند مغادرة الصفحة
    return () => socket.disconnect();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg text-gray-500">جاري تحميل تفاصيل المزاد...</p>
      </div>
    );
  }

  if (!auction) {
    return <p className="text-center p-10 text-xl">لم يتم العثور على المزاد.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* العمود الأيسر: الصورة */}
      <div className="w-full">
        <img 
          src={auction.artwork.imageUrl} 
          alt={auction.artwork.title} 
          className="w-full aspect-square object-cover rounded-2xl shadow-lg border border-orange-100" 
        />
      </div>

      {/* العمود الأيمن: التفاصيل */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-orange-600 tracking-tight">{auction.artwork.title}</h1>
          <p className="text-xl text-gray-500 mt-2">للفنان: {auction.artwork.student.name}</p>
        </div>

        <p className="text-gray-700 leading-relaxed text-lg">{auction.artwork.description}</p>
        
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 space-y-6">
          <div className="flex justify-between items-center border-b border-orange-100 pb-4">
            <span className="text-gray-600 text-lg">السعر الحالي</span>
            <span className="text-4xl font-bold text-orange-500">{auction.currentPrice.toFixed(2)} ريال</span>
          </div>
          
          <CountdownTimer endTime={auction.endTime} />
          
          {user && user.role === 'BUYER' ? (
            <BiddingForm auctionId={id} currentPrice={auction.currentPrice} />
          ) : (
            <div className="text-center text-gray-600 bg-orange-50 p-4 rounded-lg">
              <p>الرجاء <Link to="/login" className="font-bold text-orange-600">تسجيل الدخول</Link> كمشتري لتقديم عرض.</p>
            </div>
          )}
          
          <BidHistory bids={bids} />
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;