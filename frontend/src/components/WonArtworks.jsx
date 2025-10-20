import { useState, useEffect } from 'react';
import { getMyWonArtworks, createPayment } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';

function WonArtworks() {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWins = async () => {
      try {
        setLoading(true);
        const res = await getMyWonArtworks();
        setWins(res.data.wonAuctions);
        setError(null);
      } catch (err) {
        setError("فشل في تحميل المزادات الفائزة.");
        console.error("Failed to fetch won artworks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWins();
  }, []);

  const handlePay = async (auctionId) => {
    try {
      const response = await createPayment(auctionId);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Payment creation failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'فشلت عملية بدء الدفع. الرجاء المحاولة مرة أخرى.');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-3">
        الأعمال الفنية التي فزت بها
      </h3>
      {wins.length === 0 ? (
        <p className="text-neutral-700 text-center py-4">لم تفز بأي مزادات بعد.</p>
      ) : (
        <div className="space-y-4">
          {wins.map(auction => (
            <div key={auction.id} className="bg-primary/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h5 className="font-bold text-neutral-900">{auction.artwork.title}</h5>
                <p className="text-sm text-neutral-700">السعر النهائي: <span className="font-semibold">{auction.currentPrice} ريال</span></p>
              </div>
              {auction.payment ? (
                <p className="text-sm font-bold text-primary-dark px-4">✓ مدفوع</p>
              ) : (
                <button
                  onClick={() => handlePay(auction.id)}
                  className="w-full sm:w-auto bg-secondary hover:bg-secondary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
                >
                  ادفع الآن
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default WonArtworks;