import Modal from 'react-modal';
import { useState } from 'react';
import { createAuction } from '../services/api';
import toast from 'react-hot-toast';

Modal.setAppElement('#root');

function StartAuctionModal({ isOpen, onRequestClose, artwork, onAuctionCreated }) {
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const isoEndTime = new Date(endTime).toISOString();
      await createAuction({
        artworkId: artwork.id,
        startPrice: parseFloat(startPrice),
        endTime: isoEndTime,
      });
      onAuctionCreated(); // This function will show its own toast message
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to start auction.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Start Auction"
      className="absolute top-1/2 left-1/2 right-auto bottom-auto -mr-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-neutral-200"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
    >
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
        بدء المزاد لـ "{artwork.title}"
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-neutral-700">السعر المبدئي (ريال)</label>
          <input
            type="number"
            placeholder="مثال: 150.00"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            required
            className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">وقت انتهاء المزاد</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 justify-center rounded-lg border border-transparent bg-primary hover:bg-primary-dark py-3 px-4 text-sm font-medium text-white shadow-sm transition-all disabled:bg-gray-400"
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المزاد'}
          </button>
          <button
            type="button"
            onClick={onRequestClose}
            className="flex-1 justify-center rounded-lg border border-neutral-300 bg-white py-3 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-all"
          >
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StartAuctionModal;