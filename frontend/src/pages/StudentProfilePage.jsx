import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentProfile } from "../services/api";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";

function StudentProfilePage() {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getStudentProfile(id);
                setArtist(res.data.student || res.data);
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
            className="max-w-5xl mx-auto px-4 py-10 space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* 🧑‍🎨 بطاقة الفنان */}
            <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col sm:flex-row items-center gap-8 border border-neutral-200">
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
                <div className="text-center sm:text-right space-y-2">
                    <h1 className="text-3xl font-bold text-primary-dark">{artist.name}</h1>
                    <p className="text-neutral-700">{artist.schoolName}</p>
                    <p className="text-sm text-neutral-600">{artist.gradeLevel}</p>
                    <p className="text-neutral-800">
                        عدد الأعمال:{" "}
                        <span className="font-semibold text-primary-dark">
                            {artist.artworksCount || 0}
                        </span>
                    </p>
                </div>
            </div>

            {/* 🖼️ أعمال الفنان */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    أعمال {artist.name}
                </h2>
                {artist.artworks?.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {artist.artworks.map((art) => (
                            <motion.div
                                key={art._id}
                                whileHover={{ scale: 1.03 }}
                                className="rounded-xl overflow-hidden shadow-md border border-neutral-200"
                            >
                                <img
                                    src={art.imageUrl}
                                    alt={art.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-3 text-center">
                                    <h3 className="font-semibold text-neutral-900">{art.title}</h3>
                                    <p className="text-sm text-neutral-600 line-clamp-2">
                                        {art.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-500 text-center py-10">
                        لا توجد أعمال لهذا الفنان حالياً.
                    </p>
                )}
            </div>
        </motion.div>
    );
}

export default StudentProfilePage;
