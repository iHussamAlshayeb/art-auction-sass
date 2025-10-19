import { useState, useEffect } from 'react';
import { fetchAllAuctions } from '../services/api';
import { Link } from 'react-router-dom';
import AuctionCardTimer from '../components/AuctionCardTimer';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const getAuctions = async () => {
      try {
        setLoading(true);
        const params = { sortBy, search: searchTerm, page: currentPage };
        const response = await fetchAllAuctions(params);
        setAuctions(response.data.auctions);
        setPagination(response.data.pagination);
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
    getAuctions();
  }, [sortBy, currentPage, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="pt-28 pb-20 px-6 sm:px-10 bg-gradient-to-b from-primary-50 via-white to-primary-50 min-h-screen font-sans text-neutral-900">
      {/* رأس الصفحة */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-primary-700 mb-3 tracking-tight">
          المزادات الفنية
        </h1>
        <p className="text-neutral-700 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          استكشف أعمال الطلاب الموهوبين وشارك في دعم الفن الراقي عبر المزايدات المفتوحة
        </p>
      </div>

      {/* البحث والفلاتر */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg mb-14 max-w-5xl mx-auto border border-neutral-200">
        <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-5 text-center">
          ابحث عن عملك الفني المفضل
        </h2>

        <div className="bg-primary-500 text-white p-4">
          اختبار الألوان
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="ابحث بعنوان العمل الفني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition bg-white shadow-sm text-neutral-900 placeholder-neutral-500"
            />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto p-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition bg-white shadow-sm text-neutral-900"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="ending_soon">ستنتهي قريبًا</option>
            <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
            <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
          </select>
        </div>
      </div>

      {/* الحالات */}
      {loading && <Spinner />}
      {error && <p className="text-center text-secondary-700 font-semibold">{error}</p>}

      {/* الشبكة */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
        {!loading && auctions.map((auction) => (
          <Link key={auction.id} to={`/auctions/${auction.id}`}>
            <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">

              {/* الصورة */}
              <div className="relative bg-neutral-100">
                <img
                  src={auction.artwork.imageUrl}
                  alt={auction.artwork.title}
                  className="w-full h-60 object-contain"
                />
              </div>

              {/* المحتوى */}
              <div className="p-5 flex flex-col h-full">
                {/* الصف العلوي */}
                <div className="flex justify-between items-center mb-2">
                  {auction.artwork.student.gradeLevel ? (
                    <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {auction.artwork.student.gradeLevel}
                    </span>
                  ) : (
                    <div></div>
                  )}
                  <span className="text-lg font-bold text-secondary-700">
                    {auction.currentPrice} ر.س
                  </span>
                </div>

                {/* العنوان والفنان */}
                <h3 className="text-xl font-heading font-bold text-neutral-900 truncate mb-1">
                  {auction.artwork.title}
                </h3>
                <Link
                  to={`/students/${auction.artwork.studentId}`}
                  className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  بواسطة {auction.artwork.student.name}
                </Link>

                {/* الصف السفلي */}
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <AuctionCardTimer endTime={auction.endTime} />
                  <span className="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-600 transition">
                    المزايدة الآن
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* الترقيم */}
      {!loading && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* لا توجد نتائج */}
      {!loading && auctions.length === 0 && !error && (
        <div className="text-center text-neutral-600 mt-20">
          <p className="text-2xl font-semibold font-heading">لم يتم العثور على مزادات.</p>
          <p>حاول تعديل البحث أو عد لاحقًا!</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
