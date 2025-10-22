import { useState, useEffect } from "react";
import { fetchAllArtworks } from "../services/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import Pagination from "../components/Pagination";
import ArtworkStatusBadge from "../components/ArtworkStatusBadge";
import { motion } from "framer-motion";
import { Search, Heart, Palette } from "lucide-react";
import toast from "react-hot-toast";

function GalleryPage() {
    const [artworks, setArtworks] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [liked, setLiked] = useState({});

    useEffect(() => {
        const getArtworks = async () => {
            try {
                setLoading(true);
                const response = await fetchAllArtworks({
                    page: currentPage,
                    search: searchTerm || undefined,
                });
                const artworksData = response.data.artworks || [];
                const paginationData = response.data.pagination || null;

                setArtworks(artworksData);
                setPagination(paginationData);
                setError(null);
            } catch (err) {
                console.error("❌ Failed to fetch artworks:", err);
                setError("فشل في تحميل المعرض الفني.");
            } finally {
                setLoading(false);
            }
        };

        getArtworks();
    }, [currentPage, searchTerm]);

    const handlePageChange = (page) => setCurrentPage(page);

    const handleLike = (id) => {
        setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
        toast.success(
            liked[id] ? "تم إزالة الإعجاب 💔" : "تم الإعجاب بالعمل ❤️"
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-16 px-4 py-8">
            {/* ===== العنوان ===== */}
            <div className="text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-extrabold text-primary-dark"
                >
                    المعـرض الفني
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-neutral-600 text-lg max-w-2xl mx-auto"
                >
                    تصفح أجمل الأعمال الفنية التي أبدعها طلابنا، واستمتع بجمال الفن من مختلف المدارس والمواهب.
                </motion.p>
            </div>

            {/* ===== شريط البحث ===== */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-md mx-auto flex items-center bg-white rounded-full shadow-sm border border-neutral-200 px-4 py-2 focus-within:ring-2 focus-within:ring-primary/40 transition-all"
            >
                <Search className="text-neutral-400" size={18} />
                <input
                    type="text"
                    placeholder="ابحث عن عمل فني أو فنان..."
                    className="flex-grow px-3 text-sm focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>

            {/* ===== حالة التحميل / الخطأ ===== */}
            {loading && <Spinner />}
            {error && (
                <p className="text-center text-red-500 font-semibold">{error}</p>
            )}

            {!loading && artworks.length === 0 && !error && (
                <p className="text-center text-neutral-500 text-lg">
                    لا توجد أعمال فنية متاحة حاليًا.
                </p>
            )}

            {/* ===== شبكة الأعمال الفنية ===== */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
            >
                {!loading &&
                    artworks.map((artwork) => (
                        <motion.div
                            key={artwork._id}
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 150 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-neutral-100 transition-all duration-300 group"
                        >
                            <div className="relative">
                                <img
                                    src={artwork.imageUrl}
                                    alt={artwork.title}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* زر الإعجاب */}
                                <button
                                    onClick={() => handleLike(artwork._id)}
                                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm border ${liked[artwork._id]
                                            ? "bg-red-500 text-white border-red-500"
                                            : "bg-white/80 text-neutral-700 border-neutral-200"
                                        } hover:scale-110 transition-all`}
                                    title={liked[artwork._id] ? "إزالة الإعجاب" : "إعجاب"}
                                >
                                    <Heart
                                        size={18}
                                        className={liked[artwork._id] ? "fill-white" : ""}
                                    />
                                </button>
                            </div>

                            <div className="p-5 flex flex-col">
                                <h3 className="text-lg font-bold text-neutral-900 truncate mb-1">
                                    {artwork.title}
                                </h3>

                                {artwork.student && (
                                    <Link
                                        to={`/students/${artwork.student._id}`}
                                        className="text-sm text-neutral-700 hover:text-primary transition-colors"
                                    >
                                        بواسطة {artwork.student.name}
                                    </Link>
                                )}

                                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                                    {artwork.description?.slice(0, 100) || "عمل فني مميز"}
                                </p>

                                <div className="mt-auto pt-3">
                                    <ArtworkStatusBadge artwork={artwork} />
                                </div>

                                {/* الأزرار */}
                                <div className="mt-4 flex justify-between items-center">
                                    <Link
                                        to={`/artworks/${artwork._id}`}
                                        className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                    >
                                        عرض التفاصيل
                                    </Link>
                                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                                        <Palette size={14} />
                                        <span>
                                            {artwork.viewsCount || 0} مشاهدة
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </motion.div>

            {/* ===== التصفح ===== */}
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

export default GalleryPage;
