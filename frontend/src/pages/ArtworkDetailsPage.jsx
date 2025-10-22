import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAuctionById } from "../services/api";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";

function ArtworkDetailsPage() {
    const { id } = useParams();
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArtwork = async () => {
            try {
                const res = await fetchAuctionById(id); // يمكن تغييره لدالة artwork مخصصة
                setArtwork(res.data.artwork || res.data);
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
        return <p className="text-center text-gray-500 mt-8">العمل غير موجود.</p>;

    return (
        <motion.div
            className="max-w-6xl mx-auto px-4 py-10 space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* الصورة */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-neutral-200">
                <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-[480px] object-cover"
                />
            </div>

            {/* التفاصيل */}
            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-primary-dark">{artwork.title}</h1>
                <p className="text-neutral-700 leading-relaxed">{artwork.description}</p>

                {artwork.student && (
                    <Link
                        to={`/students/${artwork.student._id}`}
                        className="text-primary font-semibold hover:underline"
                    >
                        الفنان: {artwork.student.name}
                    </Link>
                )}

                {artwork.status === "IN_AUCTION" && (
                    <Link
                        to={`/auctions/${artwork.auctionId}`}
                        className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-all"
                    >
                        <Clock size={18} />
                        انتقل إلى المزاد
                        <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </motion.div>
    );
}

export default ArtworkDetailsPage;
