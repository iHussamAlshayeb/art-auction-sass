import Modal from 'react-modal';
import { useState } from 'react';
import { createAuction } from '../services/api';

// يجب استدعاء هذا السطر مرة واحدة في تطبيقك (يفضل في App.jsx)
// بما أنه موجود هنا، لا مشكلة
Modal.setAppElement('#root');

function StartAuctionModal({ isOpen, onRequestClose, artwork, onAuctionCreated }) {
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // تحويل التاريخ والوقت المحلي إلى صيغة ISO القياسية (UTC)
      const isoEndTime = new Date(endTime).toISOString();
      
      await createAuction({
        artworkId: artwork.id,
        startPrice: parseFloat(startPrice),
        endTime: isoEndTime,
      });
      onAuctionCreated(); // لتحديث القائمة بعد النجاح
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start auction.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      contentLabel="Start Auction"
      // فئات Tailwind لتنسيق النافذة
      className="absolute top-1/2 left-1/2 right-auto bottom-auto -mr-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white p-8 rounded-xl shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Start Auction for "{artwork.title}"
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Starting Price (SAR)</label>
          <input 
            type="number" 
            placeholder="e.g., 150.00" 
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            required 
            className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Auction End Time</label>
          <input 
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required 
            className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {/* أزرار التحكم */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            className="flex-1 justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Auction
          </button>
          <button 
            type="button" 
            onClick={onRequestClose}
            className="flex-1 justify-center rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StartAuctionModal;