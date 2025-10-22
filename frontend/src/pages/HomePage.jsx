import { useState, useEffect, useCallback } from "react";
import { fetchAllAuctions } from "../services/api";
import { Link } from "react-router-dom";
import AuctionCardTimer from "../components/AuctionCardTimer";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import { Search, Heart, TrendingUp, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // 🧠 دالة جلب المزادات
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
      setError("فشل في تحميل المزادات.");
    } finally {
      setLoading(false);
    }
  }, [sortBy, currentPage, searchTerm]);

  useEffect(() => {
    getAuctions();
  }, [getAuctions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (currentPage !== 1) setCurrentPage(1);
    else getAuctions();
  };

  const handleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(
      liked[id] ? "تم إزالة الإعجاب 💔" : "أُعجبْت بالمزاد ❤️"
    );
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-20">
      {/* 🎨 قسم الترحيب (Hero Section) */}
      <motion.section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid md:grid-cols-2 items-center gap-10 p-10">
          {/* النصوص */}
          <div className="space-y-6 text-center md:text-right">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold text-primary-dark leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              اكتشف، ادعم، <br /> وشارك في <span className="text-secondary">المزادات الفنية</span>
            </motion.h1>
            <motion.p
              className="text-neutral-700 text-lg md:text-xl max-w-md mx-auto md:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              منصة تجمع بين الإبداع والدعم، حيث يمكن للطلاب عرض أعمالهم وبيعها
              لعشّاق الفن في جميع أنحاء العالم.
            </motion.p>

            <motion.div
              className="flex justify-center md:justify-start gap-4 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/gallery"
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md"
              >
                تصفح المعرض
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-secondary/10 text-secondary font-semibold rounded-lg hover:bg-secondary/20 transition-all"
              >
                انضم كفنان
              </Link>
            </motion.div>
          </div>

          {/* الصورة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <img
              src="../assets/logo.png"
              alt="Art Showcase"
              className="rounded-3xl shadow-lg object-cover w-full h-[400px]"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* 🔍 شريط البحث والفلاتر */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto border border-neutral-200"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <div className="flex-grow flex items-center gap-2 w-full bg-white rounded-lg border border-neutral-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <Search className="text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن عنوان العمل أو الفنان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto p-3 border border-neutral-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary/40 transition-all"
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="ending_soon">ستنتهي قريبًا</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
          </select>
        </form>
      </motion.div>

      {/* 🔄 حالات التحميل والخطأ */}
      {loading && <Spinner />}
      {error && !loading && (
        <p className="text-center text-red-500 font-semibold">{error}</p>
      )}

      {/* 🖼️ شبكة المزادات */}
      {!loading && !error && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {auctions.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg">
              لا توجد مزادات متاحة حالياً.
            </div>
          ) : (
            auctions.map((auction) => {
              const auctionId = auction._id || auction.id;
              const artwork = auction.artwork || {};
              const student = artwork.student || {};

              return (
                <motion.div
                  key={auctionId}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 150 }}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-md hover:shadow-xl transition-all duration-300 group relative"
                >
                  <div className="relative">
                    <img
                      src={
                        artwork.imageUrl ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={artwork.title || "عمل فني"}
                      className="w-full h-60 object-cover"
                    />
                    <button
                      onClick={() => handleLike(auctionId)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm border ${liked[auctionId]
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white/80 text-neutral-700 border-neutral-200"
                        } hover:scale-110 transition-all`}
                      title={liked[auctionId] ? "إزالة الإعجاب" : "إعجاب"}
                    >
                      <Heart
                        size={18}
                        className={liked[auctionId] ? "fill-white" : ""}
                      />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      {student.gradeLevel && (
                        <span className="bg-primary/10 text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
                          {student.gradeLevel}
                        </span>
                      )}
                      <span className="text-lg font-bold text-secondary">
                        {auction.currentPrice?.toLocaleString() || 0} ر.س
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 truncate mb-1">
                      {artwork.title || "عمل فني"}
                    </h3>

                    {student.name ? (
                      <Link
                        to={`/students/${student._id}`}
                        className="text-sm text-neutral-700 hover:text-primary transition-colors"
                      >
                        بواسطة {student.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">
                        فنان غير معروف
                      </span>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <AuctionCardTimer endTime={auction.endTime} />
                      <Link
                        to={`/auctions/${auctionId}`}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/80 transition-all flex items-center gap-1"
                      >
                        <TrendingUp size={14} />
                        المزايدة الآن
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* 📄 التصفح */}
      {!loading && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default HomePage;
