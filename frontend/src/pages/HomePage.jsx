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

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ دالة جلب المزادات
  const getAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { sortBy, search: searchTerm, page: currentPage };
      const response = await fetchAllAuctions(params);

      setAuctions(response.data.auctions || []);
      setPagination(response.data.pagination || null);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch auctions:", err);
      if (err.code === 'ECONNABORTED') {
        setError('الخادم يستغرق وقتًا طويلاً في الاستجابة.');
      } else {
        setError('فشل في تحميل المزادات.');
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, currentPage, searchTerm]);

  useEffect(() => {
    getAuctions();
  }, [getAuctions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      getAuctions();
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="space-y-12">
      {/* ===== العنوان الرئيسي ===== */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4 tracking-tight">
          المزادات الفنية
        </h1>
        <p className="text-neutral-700 text-lg md:text-xl">
          استكشف أعمال الطلاب الموهوبين وشارك في دعم الفن الراقي
        </p>
      </div>

      {/* ===== مربع البحث والفلاتر ===== */}
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

      {/* ===== حالات التحميل / الخطأ ===== */}
      {loading && <Spinner />}
      {error && !loading && (
        <p className="text-center text-red-500 font-semibold">{error}</p>
      )}

      {/* ===== شبكة المزادات ===== */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {auctions.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg">
              لا توجد مزادات متاحة حالياً.
            </div>
          ) : (
            auctions
              .filter((a) => a && (a._id || a.id))
              .map((auction) => {
                const auctionId = auction._id || auction.id;
                const artwork = auction.artwork || {};
                const student = artwork.student || {};
                const studentId = student._id || student.id || student.studentId;

                return (
                  <Link key={auctionId} to={`/auctions/${auctionId}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                      <div className="relative">
                        <img
                          src={
                            artwork.imageUrl ||
                            "https://via.placeholder.com/400x300?text=No+Image"
                          }
                          alt={artwork.title || "عمل فني"}
                          className="w-full h-60 object-cover bg-white"
                        />
                      </div>

                      <div className="p-5 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          {student.gradeLevel && (
                            <span className="bg-primary/10 text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
                              {student.gradeLevel}
                            </span>
                          )}
                          <span className="text-lg font-bold text-secondary">
                            {auction.currentPrice} ر.س
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-neutral-900 truncate mb-1">
                          {artwork.title || "عمل فني بدون عنوان"}
                        </h3>

                        {studentId ? (
                          <Link
                            to={`/students/${studentId}`}
                            className="text-sm text-neutral-700 hover:text-primary transition-colors"
                          >
                            بواسطة {student.name || "فنان غير معروف"}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">
                            فنان غير معروف
                          </span>
                        )}

                        <div className="mt-auto pt-4 flex justify-between items-center">
                          <AuctionCardTimer endTime={auction.endTime} />
                          <span className="bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                            المزايدة الآن
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
          )}
        </div>
      )}

      {/* ===== صفحات التصفح ===== */}
      {!loading && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* ===== في حال لا توجد نتائج ===== */}
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
