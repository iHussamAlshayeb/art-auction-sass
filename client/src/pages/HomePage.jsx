import { useState, useEffect } from 'react';
import { fetchAllAuctions } from '../services/api';
import { Link } from 'react-router-dom';
import AuctionCardTimer from '../components/AuctionCardTimer'; // <-- استيراد المكون الجديد
function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const getAuctions = async () => {
    try {
      setLoading(true);
      const params = { sortBy, search: searchTerm };
      const response = await fetchAllAuctions(params);
      setAuctions(response.data.auctions);
      setError(null);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('الخادم يستغرق وقتًا طويلاً في الاستجابة. الرجاء الانتظار قليلًا ثم إعادة المحاولة.');
      } else {
        setError('فشل في تحميل المزادات.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAuctions();
  }, [sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    getAuctions();
  };

  return (
    <div className="pt-28 pb-20 px-6 sm:px-10 bg-gradient-to-b from-orange-50 via-white to-orange-50 min-h-screen">
      {/* رأس الصفحة */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-4 tracking-tight drop-shadow-sm">
          المزادات الفنية
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          استكشف أعمال الطلاب الموهوبين وشارك في دعم الفن الراقي
        </p>
      </div>

      {/* البحث والفلاتر */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg mb-14 max-w-5xl mx-auto border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">
          ابحث عن عملك الفني المفضل
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="ابحث بعنوان العمل الفني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3.5 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white shadow-sm"
            />
          </form>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto p-3.5 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white shadow-sm"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="ending_soon">ستنتهي قريبًا</option>
            <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
            <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
          </select>
        </div>
      </div>

      {/* حالات */}
      {loading && <p className="text-center text-gray-500 text-lg">جارٍ تحميل المزادات...</p>}
      {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

      {/* الشبكة */}
       <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
        {!loading && auctions.map((auction) => (
          <Link key={auction.id} to={`/auctions/${auction.id}`}>
            {/* --== بداية الكرت المُعاد تصميمه ==-- */}
            <div className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              
              {/* الصورة */}
              <div className="relative">
                <img
                  src={auction.artwork.imageUrl}
                  alt={auction.artwork.title}
                  className="w-full h-60 object-cover"
                />
              </div>

              {/* المحتوى */}
              <div className="p-5 flex flex-col h-full">
                {/* الصف العلوي: الصف الدراسي والسعر */}
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                    {/* بيانات الصف الدراسي تضاف هنا مستقبلاً */}
                    طالب
                  </span>
                  <span className="text-lg font-bold text-orange-500">{auction.currentPrice} ر.س</span>
                </div>

                {/* العنوان والفنان */}
                <h3 className="text-xl font-bold text-gray-800 truncate mb-1">
                  {auction.artwork.title}
                </h3>
                <p className="text-sm text-gray-500">
                  بواسطة {auction.artwork.student.name}
                  {/* بيانات المدرسة تضاف هنا مستقبلاً */}
                </p>

                {/* الصف السفلي: الوقت المتبقي والزر */}
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <AuctionCardTimer endTime={auction.endTime} />
                  <span className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                    المزايدة الآن
                  </span>
                </div>
              </div>
            </div>
            {/* --== نهاية الكرت المُعاد تصميمه ==-- */}
          </Link>
        ))}
      </div>

      {/* لا توجد نتائج */}
      {!loading && auctions.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-2xl font-semibold">لم يتم العثور على مزادات.</p>
          <p>حاول تعديل البحث أو عد لاحقًا!</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
