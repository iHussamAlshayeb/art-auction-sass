import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudentProfile } from "../services/api";
import Spinner from "../components/ui/Spinner";
import { motion } from "framer-motion";

function StudentProfilePage() {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getStudentProfile(id);
                setArtist(res.data.student || res.data);
                setArtworks(res.data.artworks || []);
            } catch (err) {
                console.error("❌ Failed to fetch artist:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <Spinner />;
    if (!artist)
        return <p className="text-center text-gray-500 mt-8">الفنان غير موجود.</p>;

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* ====== العمود الجانبي (معلومات الفنان) ====== */}
            <aside className="bg-white rounded-2xl shadow-md border border-neutral-200 p-8 flex flex-col items-center text-center md:sticky md:top-24 self-start">
                <img
                    src={
                        artist.profileImageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            artist.name
                        )}&background=E0F2F1&color=00796B&size=200`
                    }
                    alt={artist.name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                />

                <h1 className="mt-4 text-2xl font-bold text-primary-dark">
                    {artist.name}
                </h1>

                <div className="mt-3 text-neutral-700 space-y-1">
                    {artist.schoolName && (
                        <p className="text-sm">{artist.schoolName}</p>
                    )}
                    {artist.gradeLevel && (
                        <p className="text-sm text-neutral-600">{artist.gradeLevel}</p>
                    )}
                    <p className="text-sm text-neutral-800">
                        عدد الأعمال:{" "}
                        <span className="font-semibold text-primary-dark">
                            {artist.artworksCount || artworks.length}
                        </span>
                    </p>
                </div>

                {artist.bio && (
                    <p className="mt-4 text-neutral-600 leading-relaxed text-sm border-t border-neutral-200 pt-4">
                        {artist.bio}
                    </p>
                )}

                <Link
                    to="/artists"
                    className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-all text-sm font-semibold"
                >
                    ← عودة إلى قائمة الفنانين
                </Link>
            </aside>

            {/* ====== قسم الأعمال الفنية ====== */}
            <section className="md:col-span-2">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    أعمال {artist.name}
                </h2>

                {artworks.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                        {artworks.map((art) => (
                            <motion.div
                                key={art._id}
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="rounded-xl overflow-hidden shadow-md border border-neutral-200 bg-white"
                            >
                                <img
                                    src={art.imageUrl}
                                    alt={art.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4 text-center">
                                    <h3 className="font-semibold text-neutral-900">
                                        {art.title}
                                    </h3>
                                    {art.description && (
                                        <p className="text-sm text-neutral-600 line-clamp-2">
                                            {art.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-500 text-center py-10">
                        لا توجد أعمال لهذا الفنان حالياً.
                    </p>
                )}
            </section>
        </motion.div>
    );
}

export default StudentProfilePage;
