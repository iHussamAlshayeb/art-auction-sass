import { useState, useEffect } from 'react';
import { fetchAllArtworks } from '../services/api';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import ArtworkStatusBadge from '../components/ArtworkStatusBadge';

function GalleryPage() {
    const [artworks, setArtworks] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getArtworks = async () => {
            try {
                setLoading(true);
                const response = await fetchAllArtworks(currentPage);
                setArtworks(response.data.artworks);
                setPagination(response.data.pagination);
            } catch (err) {
                console.error("Failed to fetch artworks", err);
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
                <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-4 tracking-tight">
                    المعرض الفني
                </h1>
                <p className="text-gray-600 text-lg md:text-xl">
                    تصفح كل الأعمال الفنية التي أضافها طلابنا الموهوبون
                </p>
            </div>

            {loading && <Spinner />}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {!loading && artworks.map((artwork) => (
                    <div key={artwork.id} className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-60 object-cover"
                        />
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                                {artwork.title}
                            </h3>
                            <Link to={`/students/${artwork.student.id}`}>
                                <p className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
                                    بواسطة {artwork.student.name}
                                </p>
                            </Link>
                            <ArtworkStatusBadge />
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