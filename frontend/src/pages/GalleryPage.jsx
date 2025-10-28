import { useState, useEffect } from "react";
import { fetchAllArtworks } from "../services/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import Pagination from "../components/Pagination";
import ArtworkStatusBadge from "../components/ArtworkStatusBadge";
import { motion } from "framer-motion";
import { Search, Heart, Palette } from "lucide-react";
import toast from "react-hot-toast";
import ArtworkCard from "../components/ArtworkCard";

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
                        <ArtworkCard key={artwork._id} artwork={artwork} handleLike={handleLike} liked={liked} />
                    ))}
            </motion.div>

            {/* ===== التصفح ===== */}
            {
                !loading && pagination && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                )
            }
        </div >
    );
}

export default GalleryPage;
