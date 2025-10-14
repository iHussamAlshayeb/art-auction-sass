import Modal from 'react-modal';
import { useState } from 'react';
import { createAuction } from '../services/api';

Modal.setAppElement('#root');

function StartAuctionModal({ isOpen, onRequestClose, artwork, onAuctionCreated }) {
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const isoEndTime = new Date(endTime).toISOString();
      await createAuction({
        artworkId: artwork.id,
        startPrice: parseFloat(startPrice),
        endTime: isoEndTime,
      });
      onAuctionCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في بدء المزاد.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      contentLabel="Start Auction"
      className="absolute top-1/2 left-1/2 right-auto bottom-auto -mr-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        بدء المزاد لـ "{artwork.title}"
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">السعر المبدئي (ريال)</label>
          <input 
            type="number" 
            placeholder="مثال: 150.00" 
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            required 
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">وقت انتهاء المزاد</label>
          <input 
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required 
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            className="flex-1 justify-center rounded-xl border border-transparent bg-orange-500 py-3 px-4 text-sm font-medium text-white hover:bg-orange-600 shadow-sm transition-all"
          >
            إنشاء المزاد
          </button>
          <button 
            type="button" 
            onClick={onRequestClose}
            className="flex-1 justify-center rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StartAuctionModal;
