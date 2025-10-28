import { useState, useEffect } from "react";
import { getMyWonArtworks, createPayment } from "../../services/api";
import toast from "react-hot-toast";
// import Spinner from "./Spinner";
import { FiCreditCard, FiCheckCircle, FiRefreshCcw } from "react-icons/fi";
import { Spinner } from "../";

function WonArtworks() {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const fetchWins = async () => {
      try {
        setLoading(true);
        const res = await getMyWonArtworks();
        setWins(res.data.wonAuctions || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch won artworks", err);
        setError("فشل في تحميل الأعمال الفائزة.");
      } finally {
        setLoading(false);
      }
    };
    const query = new URLSearchParams(window.location.search);
    if (query.get("status") === "paid") {
      toast.success("تم الدفع بنجاح ✅");
    };
    fetchWins();
  }, []);

  // ✅ إنشاء دفع جديد
  const handlePay = async (auctionId) => {
    try {
      setPayingId(auctionId);
      const response = await createPayment(auctionId);
      if (response?.data?.url) {
        toast.success("جارٍ تحويلك إلى صفحة الدفع...");
        window.location.href = response.data.url;
      } else {
        throw new Error("لم يتم استلام رابط الدفع.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(error.response?.data?.message || "فشل إنشاء عملية الدفع.");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <Spinner />;
  if (error)
    return (
      <p className="text-center text-red-500 py-6 text-lg font-semibold">
        {error}
      </p>
    );

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
          الأعمال الفنية التي فزت بها
        </h3>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition"
        >
          <FiRefreshCcw /> تحديث القائمة
        </button>
      </div>

      {wins.length === 0 ? (
        <p className="text-neutral-700 text-center py-8 text-lg">
          لم تفز بأي مزادات بعد 🎨
        </p>
      ) : (
        <div className="space-y-5">
          {wins.map((auction) => {
            const paymentStatus = auction.payment?.status || "UNPAID";
            const isPaid = paymentStatus === "SUCCESS";

            return (
              <div
                key={auction._id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-5 hover:shadow-md transition-all"
              >
                {/* تفاصيل العمل */}
                <div className="flex items-center gap-4">
                  <img
                    src={
                      auction.artwork?.imageUrl ||
                      "https://via.placeholder.com/80x80.png?text=Artwork"
                    }
                    alt={auction.artwork?.title || "عمل فني"}
                    className="w-20 h-20 rounded-xl object-cover border border-white shadow-sm"
                  />
                  <div>
                    <h5 className="text-lg font-bold text-neutral-900">
                      {auction.artwork?.title || "عمل فني غير معروف"}
                    </h5>
                    <p className="text-sm text-neutral-600">
                      السعر النهائي:{" "}
                      <span className="font-semibold text-secondary">
                        {auction.currentPrice} ر.س
                      </span>
                    </p>
                  </div>
                </div>

                {/* حالة الدفع */}
                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                      <FiCheckCircle size={16} />
                      <span>تم الدفع بنجاح</span>
                    </div>
                  ) : paymentStatus === "PENDING" ? (
                    <div className="text-yellow-600 font-medium text-sm">
                      بانتظار الدفع...
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePay(auction._id || auction.id)}
                      disabled={payingId === auction._id}
                      className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-5 rounded-xl text-sm shadow transition-all disabled:opacity-50"
                    >
                      {payingId === auction._id ? (
                        "جارٍ المعالجة..."
                      ) : (
                        <>
                          <FiCreditCard size={16} />
                          ادفع الآن
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WonArtworks;
