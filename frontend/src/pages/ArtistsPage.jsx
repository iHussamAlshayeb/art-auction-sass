import { useState, useEffect } from 'react';
import { fetchAllStudents } from '../services/api';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

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
                const response = await fetchAllStudents(currentPage);
                setArtists(response.data.students);
                setPagination(response.data.pagination);
                setError(null);
            } catch (err) {
                setError("فشل في تحميل قائمة الفنانين.");
                console.error("Failed to fetch artists", err);
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
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4 tracking-tight">
                    الفنانون
                </h1>
                <p className="text-neutral-700 text-lg md:text-xl">
                    اكتشف المواهب الطلابية في منصتنا
                </p>
            </div>

            {loading && <Spinner />}
            {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {!loading && artists.map((artist) => (
                    <Link
                        key={artist._id}
                        to={`/students/${artist._id}`}
                        className="group flex flex-col items-center text-center space-y-3"
                    >
                        <img
                            src={artist.profileImageUrl || `https://ui-avatars.com/api/?name=${artist.name}&background=E0F2F1&color=00796B&size=128`}
                            alt={artist.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-primary/20 transition-all duration-300"
                        />
                        <div>
                            <h3 className="font-bold text-neutral-900 group-hover:text-primary transition-colors">
                                {artist.name}
                            </h3>
                            <p className="text-xs text-neutral-700">{artist._count.artworks} عمل فني</p>
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
        </div>
    );
}

export default ArtistsPage;

