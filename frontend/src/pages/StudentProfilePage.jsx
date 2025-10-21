import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentProfile } from '../services/api';
import AuctionCardTimer from '../components/AuctionCardTimer';
import Spinner from '../components/Spinner';

function StudentProfilePage() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!id) {
                    setError("معرّف الفنان غير صالح.");
                    return;
                }
                const res = await getStudentProfile(id);
                setStudent(res.data.student || null);
            } catch (error) {
                console.error("Failed to fetch student profile", error);
                setError("فشل في جلب بيانات الفنان. تأكد من صحة الرابط.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    // حالة التحميل
    if (loading) {
        return <Spinner />;
    }

    // حالة الخطأ أو عدم وجود الطالب
    if (error || !student) {
        return (
            <div className="text-center py-16">
                <p className="text-xl text-red-500 font-semibold mb-4">
                    {error || "لم يتم العثور على الفنان."}
                </p>
                <Link
                    to="/artists"
                    className="text-primary font-bold underline hover:text-primary-dark"
                >
                    العودة إلى قائمة الفنانين
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* ===== بيانات الفنان ===== */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 text-center">
                <img
                    src={
                        student.profileImageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            student.name || "فنان"
                        )}&background=f97316&color=fff&size=128`
                    }
                    alt={student.name || "فنان"}
                    className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-orange-200 shadow-md"
                />

                <h1 className="text-5xl font-extrabold text-orange-600">
                    {student.name || "فنان غير معروف"}
                </h1>

                {(student.gradeLevel || student.schoolName) && (
                    <p className="text-xl text-gray-500 mt-2">
                        {student.gradeLevel}
                        {student.schoolName && `، ${student.schoolName}`}
                    </p>
                )}

                {student.bio && (
                    <p className="text-gray-700 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
                        {student.bio}
                    </p>
                )}
            </div>

            {/* ===== معرض الأعمال ===== */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">معرض الأعمال</h2>

                {!student.artworks || student.artworks.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">
                        لا توجد أعمال فنية لهذا الفنان بعد.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {student.artworks
                            .filter((art) => art && (art._id || art.id))
                            .map((artwork) => {
                                const artworkId = artwork._id || artwork.id;
                                const auction = artwork.auction;
                                const auctionId = auction?._id || auction?.id;

                                const ArtworkCard = (
                                    <div
                                        key={artworkId}
                                        className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full"
                                    >
                                        <img
                                            src={
                                                artwork.imageUrl ||
                                                "https://via.placeholder.com/400x300?text=No+Image"
                                            }
                                            alt={artwork.title || "عمل فني"}
                                            className="w-full h-60 object-cover"
                                        />
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-800 truncate">
                                                {artwork.title || "عمل فني بدون عنوان"}
                                            </h3>

                                            {auction ? (
                                                <div className="mt-4">
                                                    <p className="text-xs text-gray-500">السعر الحالي</p>
                                                    <p className="text-2xl font-extrabold text-orange-600">
                                                        {auction.currentPrice} ر.س
                                                    </p>
                                                    <div className="mt-2">
                                                        <AuctionCardTimer endTime={auction.endTime} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="mt-4 text-sm font-semibold text-gray-500 bg-gray-100 p-2 rounded-md text-center">
                                                    غير معروض في مزاد
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );

                                // إذا العمل في مزاد، نخلي الكرت قابل للنقر
                                return auctionId ? (
                                    <Link key={artworkId} to={`/auctions/${auctionId}`}>
                                        {ArtworkCard}
                                    </Link>
                                ) : (
                                    <div key={artworkId}>{ArtworkCard}</div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentProfilePage;
