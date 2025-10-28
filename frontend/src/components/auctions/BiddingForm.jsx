import { useState } from 'react';
import { placeBid } from '../../services/api';
import toast from 'react-hot-toast';

function BiddingForm({ auctionId, currentPrice }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await placeBid(auctionId, parseFloat(amount));
      setAmount('');
      // The priceUpdate socket event will handle the success feedback
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشلت المزايدة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 border-t border-neutral-200">
      <form className="flex" onSubmit={handleSubmit}>
        {/* Input Field (Right Side) */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`عرضك (أعلى من ${currentPrice} ريال)`}
          required
          className="w-full appearance-none rounded-r-lg border border-neutral-200 px-3 py-3 text-neutral-900 placeholder-neutral-700 focus:z-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm text-right"
        />

        {/* Submit Button (Left Side) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-l-lg border border-transparent bg-primary py-3 px-6 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isSubmitting ? '...' : 'مزايدة'}
        </button>
      </form>
    </div>
  );
}

export default BiddingForm;