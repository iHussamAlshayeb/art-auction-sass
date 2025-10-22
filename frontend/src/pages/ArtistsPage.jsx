import { useState, useEffect } from "react";
import { fetchAllStudents } from "../services/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import Pagination from "../components/Pagination";

function ArtistsPage() {
    const [artists, setArtists] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getArtists = async () => {
            try {
                setLoading(true);

                // ✅ تمرير الكائن الصحيح (params)
                const response = await fetchAllStudents({ page: currentPage });

                // ✅ استخدم fallback آمن حتى لا يتسبب في خطأ إذا لم تكن القيمة موجودة
                const students = response.data.students || response.data.artists || [];
                const paginationData = response.data.pagination || null;

                setArtists(students);
                setPagination(paginationData);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-12">
            {/* ===== العنوان الرئيسي ===== */}
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4 tracking-tight">
                    الفنانون
                </h1>
                <p className="text-neutral-700 text-lg md:text-xl">
                    اكتشف المواهب الطلابية في منصتنا
                </p>
            </div>

            {/* ===== حالة التحميل / الخطأ ===== */}
            {loading && <Spinner />}
            {error && !loading && (
                <p className="text-center text-red-500 font-semibold">{error}</p>
            )}

            {/* ===== شبكة الفنانين ===== */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {artists.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 text-lg">
                            لا يوجد فنانين في الوقت الحالي.
                        </p>
                    )}

                    {artists
                        .filter((artist) => artist && (artist._id || artist.id))
                        .map((artist) => {
                            const artistId = artist._id || artist.id;
                            return (
                                <Link
                                    key={artistId}
                                    to={`/students/${artistId}`}
                                    className="group flex flex-col items-center text-center space-y-3"
                                >
                                    <img
                                        src={
                                            artist.profileImageUrl ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                artist.name || "مجهول"
                                            )}&background=E0F2F1&color=00796B&size=128`
                                        }
                                        alt={artist.name || "فنان"}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-primary/20 transition-all duration-300"
                                    />
                                    <div>
                                        <h3 className="font-bold text-neutral-900 group-hover:text-primary transition-colors">
                                            {artist.name || "فنان غير معروف"}
                                        </h3>
                                        {artist.schoolName && (
                                            <p className="text-xs text-neutral-700">
                                                {artist.schoolName}
                                            </p>
                                        )}
                                        <p className="text-xs text-neutral-700">
                                            {artist.artworksCount || artist._count?.artworks || 0} عمل فني
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                </div>
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
