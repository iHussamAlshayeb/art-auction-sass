import React from 'react'
import { Link } from 'react-router'
import { Heart, Palette } from 'lucide-react'
// import ArtworkStatusBadge from "../components/ArtworkStatusBadge";
import { motion } from "framer-motion";
import { ArtworkStatusBadge } from "../";

const ArtworkCard = ({ artwork, handleLike, liked }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-neutral-100 transition-all duration-300 group"
        >
            <div className="relative">
                <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* زر الإعجاب */}
                <button
                    onClick={() => handleLike(artwork._id)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm border ${liked[artwork._id]
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white/80 text-neutral-700 border-neutral-200"
                        } hover:scale-110 transition-all`}
                    title={liked[artwork._id] ? "إزالة الإعجاب" : "إعجاب"}
                >
                    <Heart
                        size={18}
                        className={liked[artwork._id] ? "fill-white" : ""}
                    />
                </button>
            </div>

            <div className="p-5 flex flex-col">
                <h3 className="text-lg font-bold text-neutral-900 truncate mb-1">
                    {artwork.title}
                </h3>
                {artwork.student && (
                    <Link
                        to={`/students/${artwork.student._id}`}
                        className="text-sm text-neutral-700 hover:text-primary transition-colors"
                    >
                        بواسطة {artwork.student.name}
                    </Link>
                )}

                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {artwork.description?.slice(0, 100) || "عمل فني مميز"}
                </p>

                <div className="mt-auto pt-3">
                    <ArtworkStatusBadge artwork={artwork} />
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <Link
                        to={`/artwork/${artwork._id}`}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                    >
                        عرض التفاصيل
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Palette size={14} />
                        <span>{artwork.viewsCount || 0} مشاهدة</span>
                    </div>
                </div>
            </div>
        </motion.div>

    )
}



export default ArtworkCard