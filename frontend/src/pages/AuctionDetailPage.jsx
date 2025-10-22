import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { fetchAuctionById, placeBid } from "../services/api";
import Spinner from "../components/Spinner";
import AuctionCardTimer from "../components/AuctionCardTimer";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { DollarSign, Send, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AuctionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState([]);
  const socketRef = useRef(null);

  // 🎯 جلب بيانات المزاد
  useEffect(() => {
    const loadAuction = async () => {
      try {
        const res = await fetchAuctionById(id);
        setAuction(res.data.auction);
        setBids(res.data.bids || []);
      } catch (err) {
        toast.error("فشل في تحميل بيانات المزاد");
      } finally {
        setLoading(false);
      }
    };
    loadAuction();
  }, [id]);

  // 🔌 Socket.io: متابعة المزاد لحظيًا
  useEffect(() => {
    if (!id) return;

    const socket = io(import.meta.env.VITE_API_URL || "https://api.fanan3.com", {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });

    socket.emit("joinAuctionRoom", id);

    socket.on("bid:new", (newBid) => {
      setBids((prev) => [newBid, ...prev]);
      setAuction((prev) =>
        prev ? { ...prev, currentPrice: newBid.amount } : prev
      );
      toast.success("💰 مزايدة جديدة تم تسجيلها!");
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [id]);

  // 📤 تقديم مزايدة
  const handlePlaceBid = async () => {
    if (!user) return toast.error("يرجى تسجيل الدخول للمزايدة.");
    if (!bidAmount || bidAmount <= auction.currentPrice)
      return toast.error("المبلغ يجب أن يكون أعلى من السعر الحالي.");

    try {
      const res = await placeBid(id, bidAmount);
      toast.success("✅ تمت المزايدة بنجاح!");
      setBidAmount("");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل في تقديم المزايدة.");
    }
  };

  if (loading) return <Spinner />;
  if (!auction)
    return (
      <p className="text-center text-gray-500 mt-10">
        المزاد غير موجود أو تم إنهاؤه.
      </p>
    );

  const { artwork, endTime, currentPrice, highestBidder } = auction;
  const artist = artwork?.student || {};

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-10 space-y-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🖼️ صورة العمل الفني */}
      <div className="grid md:grid-cols-2 gap-10">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-neutral-200 shadow-lg"
          whileHover={{ scale: 1.01 }}
        >
          <img
            src={artwork?.imageUrl}
            alt={artwork?.title}
            className="object-cover w-full h-[420px]"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </motion.div>

        {/* 🧾 تفاصيل العمل والمزاد */}
        <div className="space-y-5">
          <h1 className="text-3xl font-extrabold text-primary-dark">
            {artwork?.title}
          </h1>
          <p className="text-neutral-700 leading-relaxed">{artwork?.description}</p>

          <div className="flex flex-col gap-2">
            <p className="font-semibold">
              🎨 الفنان:{" "}
              <span className="text-primary-dark">{artist.name}</span>
            </p>
            <p className="text-sm text-neutral-600">
              {artist.schoolName && `${artist.schoolName} - ${artist.gradeLevel}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <AuctionCardTimer endTime={endTime} />
            <span className="text-2xl font-bold text-secondary">
              {currentPrice?.toLocaleString()} ر.س
            </span>
          </div>

          {/* 💰 المزايدة */}
          <div className="flex items-center gap-3 pt-4">
            <input
              type="number"
              placeholder="أدخل المبلغ الجديد..."
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="flex-grow p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
            <button
              onClick={handlePlaceBid}
              className="bg-secondary text-white font-semibold px-6 py-3 rounded-lg hover:bg-secondary/80 flex items-center gap-2 transition-all"
            >
              <Send size={18} />
              مزايدة
            </button>
          </div>

          {highestBidder && (
            <p className="text-sm text-neutral-600 pt-2">
              أعلى مزايد حاليًا:{" "}
              <span className="font-semibold text-primary-dark">
                {highestBidder.name}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* 🧾 سجل المزايدات */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2 mb-4">
          <Users size={18} className="text-primary" />
          سجل المزايدات
        </h2>

        {bids.length === 0 ? (
          <p className="text-neutral-600 text-sm">لا توجد مزايدات حتى الآن.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {bids.map((bid, i) => (
              <li
                key={i}
                className="flex justify-between items-center py-2 text-sm"
              >
                <span className="font-semibold text-neutral-900">
                  {bid.user?.name || "مزايد مجهول"}
                </span>
                <span className="text-secondary font-bold">
                  {bid.amount.toLocaleString()} ر.س
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AuctionDetailPage;
