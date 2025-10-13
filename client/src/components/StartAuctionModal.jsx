import Modal from 'react-modal';
import { useState } from 'react';
import { createAuction } from '../services/api';

// يجب استدعاء هذا السطر مرة واحدة في تطبيقك
Modal.setAppElement('#root');

function StartAuctionModal({ isOpen, onRequestClose, artwork, onAuctionCreated }) {
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createAuction({
        artworkId: artwork.id,
        startPrice: parseFloat(startPrice),
        endTime,
      });
      onAuctionCreated(); // لتحديث القائمة بعد النجاح
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start auction.');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Start Auction">
      <h2>Start Auction for "{artwork.title}"</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="number" 
          placeholder="Starting Price (SAR)" 
          value={startPrice}
          onChange={(e) => setStartPrice(e.target.value)}
          required 
        />
        <input 
          type="datetime-local" 
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required 
        />
        <button type="submit">Create Auction</button>
        <button type="button" onClick={onRequestClose}>Cancel</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Modal>
  );
}

export default StartAuctionModal;