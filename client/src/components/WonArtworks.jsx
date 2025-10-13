import { useState, useEffect } from 'react';
import { getMyWonArtworks, createPayment } from '../services/api';

function WonArtworks() {
  const [wins, setWins] = useState([]);

  useEffect(() => {
    getMyWonArtworks().then(res => setWins(res.data.wonAuctions));
  }, []);

  const handlePay = async (auctionId) => {
    try {
      const response = await createPayment(auctionId);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Payment creation failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || 'فشلت عملية بدء الدفع. الرجاء المحاولة مرة أخرى.');
    }
  };

  if (wins.length === 0) {
    return <p className="text-gray-500 text-center py-4">لم تفز بأي مزادات بعد.</p>;
  }

  return (
    <div className="space-y-4">
      {wins.map(auction => (
        <div key={auction.id} className="bg-orange-50/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h5 className="font-bold text-gray-800">{auction.artwork.title}</h5>
            <p className="text-sm text-gray-600">السعر النهائي: <span className="font-semibold">{auction.currentPrice} ريال</span></p>
          </div>
          {auction.payment ? (
            <p className="text-sm font-bold text-green-600 px-4">✓ مدفوع</p>
          ) : (
            <button 
              onClick={() => handlePay(auction.id)} 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
            >
              ادفع الآن
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
export default WonArtworks;
