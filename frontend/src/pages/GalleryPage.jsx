import { useState, useEffect } from "react";
import { fetchAllArtworks } from "../services/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import Pagination from "../components/Pagination";
import ArtworkStatusBadge from "../components/ArtworkStatusBadge";

function GalleryPage() {
    const [artworks, setArtworks] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getArtworks = async () => {
            try {
                setLoading(true);

                // ✅ الآن fetchAllArtworks يدعم تمرير params بدل رقم الصفحة فقط
                const response = await fetchAllArtworks({ page: currentPage });

                // ⚙️ تأكد من أن البيانات صحيحة
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
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4 tracking-tight">
                    المعرض الفني
                </h1>
                <p className="text-neutral-700 text-lg md:text-xl">
                    تصفح كل الأعمال الفنية التي أضافها طلابنا الموهوبون
                </p>
            </div>

            {loading && <Spinner />}
            {error && (
                <p className="text-center text-red-500 font-semibold">{error}</p>
            )}

            {!loading && artworks.length === 0 && !error && (
                <p className="text-center text-neutral-500 text-lg">
                    لا توجد أعمال فنية متاحة حاليًا.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {!loading &&
                    artworks.map((artwork) => (
                        <div
                            key={artwork._id}
                            className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="w-full h-60 object-cover"
                            />
                            <div className="p-5 flex flex-col">
                                <h3 className="text-lg font-bold text-neutral-900 truncate mb-1">
                                    {artwork.title}
                                </h3>
                                {artwork.student && (
                                    <Link to={`/students/${artwork.student._id}`}>
                                        <p className="text-sm text-neutral-700 hover:text-primary transition-colors">
                                            بواسطة {artwork.student.name}
                                        </p>
                                    </Link>
                                )}
                                <div className="mt-auto pt-3">
                                    <ArtworkStatusBadge artwork={artwork} />
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

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
