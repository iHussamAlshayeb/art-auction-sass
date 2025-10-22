import { useEffect, useState } from "react";
import { getMyWonArtworks } from "../services/api";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";

function WonArtworks() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWins = async () => {
      try {
        const res = await getMyWonArtworks();
        setArtworks(res.data.wins || []);
      } catch {
        console.error("Failed to fetch won artworks");
      } finally {
        setLoading(false);
      }
    };
    fetchWins();
  }, []);

  if (loading) return <Spinner />;

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-10 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-primary-dark text-center">
        أعمالي الفائزة 🏆
      </h1>

      {artworks.length === 0 ? (
        <p className="text-center text-neutral-500">لم تفز بأي عمل بعد.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {artworks.map((art) => (
            <div
              key={art._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-neutral-200 hover:shadow-lg transition-all"
            >
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900">{art.title}</h3>
                <p className="text-sm text-neutral-700 mt-1">
                  السعر النهائي:{" "}
                  <span className="font-bold text-secondary">
                    {art.finalPrice?.toLocaleString()} ر.س
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default WonArtworks;
