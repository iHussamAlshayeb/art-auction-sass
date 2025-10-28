import { useState, useEffect } from "react";
import { fetchAllStudents } from "../services/api";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";
import { motion } from "framer-motion";
import { Users, Paintbrush, School, Heart } from "lucide-react";
import toast from "react-hot-toast";

function ArtistsPage() {
    const [artists, setArtists] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [following, setFollowing] = useState({});

    useEffect(() => {
        const getArtists = async () => {
            try {
                setLoading(true);
                const response = await fetchAllStudents({ page: currentPage });
                const students = response.data.students || [];
                setArtists(students);
                setPagination(response.data.pagination || null);
                setError(null);
            } catch (err) {
                console.error("❌ Failed to fetch artists:", err);
                setError("فشل في تحميل قائمة الفنانين.");
            } finally {
                setLoading(false);
            }
        };
        getArtists();
    }, [currentPage]);

    const handlePageChange = (page) => setCurrentPage(page);

    const toggleFollow = (artistId) => {
        setFollowing((prev) => ({
            ...prev,
            [artistId]: !prev[artistId],
        }));

        toast.success(
            following[artistId]
                ? "تم إلغاء المتابعة 👋"
                : "بدأت متابعة الفنان 🎨"
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-16 px-4 py-8">
            {/* ===== العنوان الرئيسي ===== */}
            <div className="text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-extrabold text-primary-dark"
                >
                    الفنـانـون
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-neutral-600 text-lg max-w-2xl mx-auto"
                >
                    اكتشف المبدعين الشباب من مختلف المدارس، وتعرّف على قصصهم وأعمالهم التي تُلهم الجيل القادم من الفنانين.
                </motion.p>
            </div>

            {/* ===== إحصائيات سريعة ===== */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <Users className="mx-auto text-primary mb-3" size={28} />
                    <h3 className="font-bold text-lg">عدد الفنانين</h3>
                    <p className="text-primary-dark text-2xl">{artists.length}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <Paintbrush className="mx-auto text-secondary mb-3" size={28} />
                    <h3 className="font-bold text-lg">الأعمال الفنية</h3>
                    <p className="text-secondary text-2xl">
                        {artists.reduce(
                            (acc, a) => acc + (a.artworksCount || a._count?.artworks || 0),
                            0
                        )}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                    <School className="mx-auto text-amber-600 mb-3" size={28} />
                    <h3 className="font-bold text-lg">المدارس المشاركة</h3>
                    <p className="text-amber-700 text-2xl">
                        {[...new Set(artists.map((a) => a.schoolName))].length}
                    </p>
                </div>
            </motion.div>

            {/* ===== حالة التحميل / الخطأ ===== */}
            {loading && <Spinner />}
            {error && !loading && (
                <p className="text-center text-red-500 font-semibold">{error}</p>
            )}

            {/* ===== شبكة الفنانين ===== */}
            {!loading && !error && (
                <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8"
                >
                    {artists.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 text-lg">
                            لا يوجد فنانين في الوقت الحالي.
                        </p>
                    )}

                    {artists.map((artist) => {
                        const artistId = artist._id || artist.id;
                        const isFollowing = following[artistId];

                        return (
                            <motion.div
                                key={artistId}
                                whileHover={{ scale: 1.04 }}
                                transition={{ type: "spring", stiffness: 150 }}
                            >
                                <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-neutral-100 hover:border-primary/30 transition-all duration-300">
                                    {/* الصورة */}
                                    <Link to={`/students/${artistId}`}>
                                        <div className="relative">
                                            <img
                                                src={
                                                    artist.profileImageUrl ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        artist.name || "فنان"
                                                    )}&background=f5f5f5&color=00796B&size=256`
                                                }
                                                alt={artist.name}
                                                className="w-full aspect-square object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>

                                    {/* النص والأزرار */}
                                    <div className="p-4 text-center">
                                        <h3 className="font-bold text-neutral-900 text-lg group-hover:text-primary transition-colors">
                                            {artist.name || "فنان مجهول"}
                                        </h3>
                                        {artist.schoolName && (
                                            <p className="text-sm text-neutral-600 mt-1">
                                                {artist.schoolName}
                                            </p>
                                        )}
                                        <p className="text-sm text-neutral-500 mt-1 mb-3">
                                            {artist.artworksCount || artist._count?.artworks || 0} عمل فني
                                        </p>

                                        {/* الأزرار */}
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                to={`/students/${artistId}`}
                                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                            >
                                                عرض الأعمال
                                            </Link>
                                            <button
                                                onClick={() => toggleFollow(artistId)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${isFollowing
                                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                    : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                                                    }`}
                                            >
                                                <Heart
                                                    size={14}
                                                    className={isFollowing ? "fill-red-600" : ""}
                                                />
                                                {isFollowing ? "إلغاء" : "متابعة"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

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

export default ArtistsPage;
