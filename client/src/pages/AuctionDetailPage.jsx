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

  // ... (كل منطق جلب البيانات و useEffect يبقى كما هو)

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
            <p className="text-lg text-gray-500 mt-1">للفنان: {auction.artwork.student.name}</p>
          </div>

          {/* السعر */}
          <div className="flex justify-between items-center border-t border-orange-100 pt-4">
            <span className="text-gray-600 text-base">السعر الحالي</span>
            <span className="text-3xl font-bold text-orange-500">{auction.currentPrice.toFixed(2)} ريال</span>
          </div>
          
          {/* مؤقت العد التنازلي */}
          <CountdownTimer endTime={auction.endTime} />
          
          {/* نموذج المزايدة أو رسالة تسجيل الدخول */}
          {user && user.role === 'BUYER' ? (
            <BiddingForm auctionId={id} currentPrice={auction.currentPrice} />
          ) : (
            <div className="text-center text-gray-600 bg-orange-50 p-4 rounded-lg">
              <p>الرجاء <Link to="/login" className="font-bold text-orange-600">تسجيل الدخول</Link> كمشتري لتقديم عرض.</p>
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