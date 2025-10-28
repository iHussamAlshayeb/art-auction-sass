import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArtworksById } from "../services/api";
import Spinner from "../components/ui/Spinner";
import { motion } from "framer-motion";
import { Clock, ArrowRight, ChevronLeft } from "lucide-react";

function ArtworkDetailsPage() {
    const { id } = useParams();
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArtwork = async () => {
            try {
                const res = await fetchArtworksById(id);
                setArtwork(res.data.artworks || res.data);
            } catch {
                console.error("Failed to fetch artwork");
            } finally {
                setLoading(false);
            }
        };
        loadArtwork();
    }, [id]);

    if (loading) return <Spinner />;

    if (!artwork)
        return (
            <p className="text-center text-gray-500 mt-8">العمل الفني غير موجود.</p>
        );

    return (
        <motion.div
            className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* ====== القسم الأيسر: الصورة والوصف ====== */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden border border-neutral-200">
                <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-[420px] object-cover"
                />

                <div className="p-6 space-y-4">
                    <h1 className="text-3xl font-bold text-primary-dark">
                        {artwork.title}
                    </h1>
                    <p className="text-neutral-700 leading-relaxed">
                        {artwork.description || "لا يوجد وصف متاح لهذا العمل الفني."}
                    </p>

                    {artwork.status === "IN_AUCTION" ? (
                        <Link
                            to={`/auctions/${artwork.auctionId}`}
                            className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary-dark transition-all"
                        >
                            <Clock size={18} />
                            انتقل إلى المزاد
                            <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <p className="text-sm text-neutral-500 italic">
                            هذا العمل غير متاح في مزاد حاليًا.
                        </p>
                    )}
                </div>
            </div>

            {/* ====== القسم الجانبي: معلومات الفنان ====== */}
            <aside className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                    {artwork.student && (
                        <>
                            <h2 className="text-xl font-semibold text-primary-dark">
                                الفنان
                            </h2>
                            <Link
                                to={`/students/${artwork.student._id}`}
                                className="block text-lg font-medium text-primary hover:underline"
                            >
                                {artwork.student.name}
                            </Link>
                            {artwork.student.bio && (
                                <p className="text-neutral-600 leading-relaxed text-sm">
                                    {artwork.student.bio}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-8 border-t border-neutral-200 pt-4">
                    <Link
                        to="/gallery"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-all text-sm font-medium"
                    >
                        <ChevronLeft size={16} />
                        العودة إلى المعرض
                    </Link>
                </div>
            </aside>
        </motion.div>
    );
}

export default ArtworkDetailsPage;
