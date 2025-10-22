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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:gr
