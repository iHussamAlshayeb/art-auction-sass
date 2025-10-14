import { useState } from 'react';
import { placeBid } from '../services/api';

function BiddingForm({ auctionId, currentPrice }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await placeBid(auctionId, parseFloat(amount));
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشلت المزايدة.');
    }
  };

  return (
    <div className="pt-4 border-t border-orange-100">
      <form className="flex" onSubmit={handleSubmit}>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`عرضك (أعلى من ${currentPrice} ريال)`}
          required 
          className="w-full appearance-none rounded-l-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
        />
        <button 
          type="submit"
          className="rounded-r-lg border border-transparent bg-orange-500 py-3 px-6 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          زايد
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default BiddingForm;