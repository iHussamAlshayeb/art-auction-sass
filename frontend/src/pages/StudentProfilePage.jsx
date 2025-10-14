import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentProfile } from '../services/api';
import AuctionCardTimer from '../components/AuctionCardTimer';

function StudentProfilePage() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getStudentProfile(id);
                setStudent(res.data.student);
            } catch (error) {
                console.error("Failed to fetch student profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) {
        return <p className="text-center p-10">جاري تحميل ملف الفنان...</p>;
    }

    if (!student) {
        return <p className="text-center p-10">لم يتم العثور على الفنان.</p>;
    }

    return (
        <div className="space-y-12">
            {/* قسم معلومات الفنان */}
            <div className="text-center">
                <h1 className="text-5xl font-extrabold text-orange-600">{student.name}</h1>
                <p className="text-xl text-gray-500 mt-2">فنان / طالب</p>
            </div>

            {/* معرض الأعمال */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">معرض الأعمال</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {student.artworks.map(artwork => (
                        <Link key={artwork.id} to={`/auctions/${artwork.auction?.id || ''}`}>
                            <div className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-60 object-cover" />
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-800 truncate">{artwork.title}</h3>
                                    {artwork.auction ? (
                                        <div className="mt-4">
                                            <p className="text-xs text-gray-500">السعر الحالي</p>
                                            <p className="text-2xl font-extrabold text-orange-600">{artwork.auction.currentPrice} ر.س</p>
                                            <div className="mt-2">
                                                <AuctionCardTimer endTime={artwork.auction.endTime} />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm font-semibold text-gray-500 bg-gray-100 p-2 rounded-md text-center">غير معروض في مزاد</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;