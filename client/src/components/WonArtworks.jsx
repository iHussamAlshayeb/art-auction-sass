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
      // توجيه المستخدم إلى صفحة الدفع
      window.location.href = response.data.url;
    } catch (error) {
    console.error("Payment creation failed:", error.response?.data || error.message);
    alert(error.response?.data?.message || 'Failed to start payment process. Please try again.');
    }
  };

  if (wins.length === 0) return <p>You have not won any auctions yet.</p>;

  return (
    <div className="space-y-4">
      <h4 className="text-xl font-semibold text-gray-700">Artworks You've Won</h4>
      {wins.map(auction => (
        <div key={auction.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <h5 className="font-bold text-gray-800">{auction.artwork.title}</h5>
            <p className="text-sm text-gray-600">Final Price: <span className="font-semibold">{auction.currentPrice} SAR</span></p>
          </div>
          {auction.payment ? (
            <p className="text-sm font-bold text-green-600">✓ Paid</p>
          ) : (
            <button onClick={() => handlePay(auction.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
              Pay Now
            </button>
          )}
        </div>
      ))}
    </div>
);
}
export default WonArtworks;