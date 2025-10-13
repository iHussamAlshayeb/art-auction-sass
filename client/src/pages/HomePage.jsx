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
    <div className="pt-28 pb-12 px-4 sm:px-8 bg-gradient-to-b from-orange-50 via-white to-white min-h-screen">
      {/* رأس الصفحة */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-3">المزادات الفنية</h1>
        <p className="text-gray-600 text-lg">استكشف أعمال الطلاب الموهوبين وشارك في دعم الفن الراقي</p>
      </div>

      {/* قسم البحث والفلاتر */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md mb-10 max-w-4xl mx-auto border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">ابحث عن عملك الفني المفضل</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="ابحث بعنوان العمل الفني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            />
          </form>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="ending_soon">ستنتهي قريبًا</option>
            <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
            <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
          </select>
        </div>
      </div>

      {/* حالات التحميل والخطأ */}
      {loading && <p className="text-center text-gray-500 text-lg">جارٍ تحميل المزادات...</p>}
      {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

      {/* الشبكة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {!loading && auctions.map((auction) => (
          <Link key={auction.id} to={`/auctions/${auction.id}`}>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 group border border-orange-100">
              <div className="relative">
                <img
                  src={auction.artwork.imageUrl}
                  alt={auction.artwork.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {auction.artwork.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">بواسطة {auction.artwork.student.name}</p>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-gray-500">السعر الحالي</p>
                  <p className="text-xl font-bold text-orange-600">{auction.currentPrice} ر.س</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && auctions.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-2xl font-semibold">لم يتم العثور على مزادات.</p>
          <p>حاول تعديل البحث أو عد لاحقًا!</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
