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
      setAmount(''); // Clear input on successful bid
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid.');
    }
  };

  return (
    <div className="mt-6">
      <form className="flex" onSubmit={handleSubmit}>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Your bid ( > ${currentPrice} SAR)`}
          required 
          className="w-full appearance-none rounded-l-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        />
        <button 
          type="submit"
          className="rounded-r-md border border-transparent bg-indigo-600 py-3 px-6 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Place Bid
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default BiddingForm;