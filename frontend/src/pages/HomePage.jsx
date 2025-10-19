import { useState, useEffect, useCallback } from 'react';
import { fetchAllAuctions } from '../services/api';
import { Link } from 'react-router-dom';
import AuctionCardTimer from '../components/AuctionCardTimer';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالات البحث والترتيب
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // دالة موحدة لجلب البيانات
  const getAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { sortBy, search: searchTerm, page: currentPage };
      const response = await fetchAllAuctions(params);
      setAuctions(response.data.auctions);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('الخادم يستغرق وقتًا طويلاً في الاستجابة. الرجاء الانتظار وإعادة المحاولة.');
      } else {
        setError('فشل في تحميل المزادات.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, currentPage, searchTerm]);

  useEffect(() => {
    getAuctions();
  }, [getAuctions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // العودة للصفحة الأولى عند كل بحث جديد
    // سيتم إعادة تشغيل useEffect تلقائيًا لأن searchTerm تغير
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-12">
      {/* رأس الصفحة */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4 tracking-tight">
          المزادات الفنية
        </h1>
        <p className="text-neutral-700 text-lg md:text-xl">
          استكشف أعمال الطلاب الموهوبين وشارك في دعم الفن الراقي
        </p>
      </div>

      {/* البحث والفلاتر */}
      <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto border border-neutral-200">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="ابحث بعنوان العمل الفني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-white shadow-sm"
            />
          </form>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-white shadow-sm"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="ending_soon">ستنتهي قريبًا</option>
            <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
            <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
          </select>
        </div>
      </div>

      {/* حالات التحميل والخطأ */}
      {loading && <Spinner />}
      {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

      {/* شبكة عرض الكروت */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {!loading && auctions.map((auction) => (
          <Link key={auction.id} to={`/auctions/${auction.id}`}>
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative">
                <img
                  src={auction.artwork.imageUrl}
                  alt={auction.artwork.title}
                  className="w-full h-60 object-contain bg-white"
                />
              </div>
              <div className="p-5 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  {auction.artwork.student.gradeLevel && (
                    <span className="bg-primary/10 text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
                      {auction.artwork.student.gradeLevel}
                    </span>
                  )}
                  <span className="text-lg font-bold text-secondary">{auction.currentPrice} ر.س</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 truncate mb-1">
                  {auction.artwork.title}
                </h3>
                <Link to={`/students/${auction.artwork.studentId}`} className="text-sm text-neutral-700 hover:text-primary transition-colors">
                  بواسطة {auction.artwork.student.name}
                </Link>
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <AuctionCardTimer endTime={auction.endTime} />
                  <span className="bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                    المزايدة الآن
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {!loading && auctions.length === 0 && !error && (
        <div className="text-center text-neutral-700 mt-20">
          <p className="text-2xl font-semibold">لم يتم العثور على مزادات.</p>
          <p>حاول تعديل البحث أو عد لاحقًا!</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;

