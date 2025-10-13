import { useState, useEffect } from 'react';
import { fetchAllAuctions } from '../services/api';
import { Link } from 'react-router-dom';

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
            <div className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative">
                <img
                  src={auction.artwork.imageUrl}
                  alt={auction.artwork.title}
                  className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/10 transition-all duration-500"></div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                  {auction.artwork.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">بواسطة {auction.artwork.student.name}</p>
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500">السعر الحالي</p>
                  <p className="text-2xl font-extrabold text-orange-600">{auction.currentPrice} ر.س</p>
                </div>
              </div>
            </div>
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
