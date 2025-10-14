import { useState } from 'react';
import { placeBid } from '../services/api';

function BiddingForm({ auctionId, currentPrice }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await placeBid(auctionId, parseFloat(amount));
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشلت المزايدة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 border-t border-orange-100">
      <form className="flex" onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-l-lg border border-transparent bg-orange-500 py-3 px-6 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isSubmitting ? '...' : 'مزايدة'}
        </button>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`عرضك (أعلى من ${currentPrice} ريال)`}
          required
          className="w-full appearance-none rounded-r-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm text-right"
        />
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default BiddingForm;