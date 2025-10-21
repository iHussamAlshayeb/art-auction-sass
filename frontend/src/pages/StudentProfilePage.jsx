import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentProfile } from '../services/api';
import AuctionCardTimer from '../components/AuctionCardTimer';
import Spinner from '../components/Spinner';

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
        return <Spinner />;
    }

    if (!student) {
        return <p className="text-center p-10 text-xl">لم يتم العثور على الفنان.</p>;
    }

    return (
        <div className="space-y-12">
            {/* قسم معلومات الفنان مع الصورة الشخصية */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 text-center">

                {/* === الجزء الجديد: عرض الصورة الشخصية === */}
                <img
                    src={student.profileImageUrl || `https://ui-avatars.com/api/?name=${student.name}&background=f97316&color=fff&size=128`}
                    alt={student.name}
                    className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-orange-200 shadow-md"
                />
                {/* === نهاية الجزء الجديد === */}

                <h1 className="text-5xl font-extrabold text-orange-600">{student.name}</h1>
                {(student.gradeLevel || student.schoolName) && (
                    <p className="text-xl text-gray-500 mt-2">
                        {student.gradeLevel}{student.schoolName && `, ${student.schoolName}`}
                    </p>
                )}
                {student.bio && (
                    <p className="text-gray-700 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
                        {student.bio}
                    </p>
                )}
            </div>

            {/* معرض الأعمال */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">معرض الأعمال</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {student.artworks.map(artwork => {
                        // ---== الحل هنا: فصل منطق الرابط عن العرض ==---
                        const ArtworkCard = (
                            <div className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full">
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
                        );

                        // إذا كان هناك مزاد، اجعل الكرت رابطًا، وإلا، اعرضه كـ div عادي
                        return artwork.auction ? (
                            <Link key={artwork.id} to={`/auctions/${artwork.auction.id}`}>
                                {ArtworkCard}
                            </Link>
                        ) : (
                            <div key={artwork.id}>
                                {ArtworkCard}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;