import { useState, useEffect } from 'react';
import { getMyArtworks, cancelAuction } from '../services/api';
import StartAuctionModal from './StartAuctionModal';

function MyArtworksList() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const response = await getMyArtworks();
      setArtworks(response.data.artworks);
    } catch (err) {
      setError('Failed to load your artworks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAuction = async (auctionId) => {
    // عرض رسالة تأكيد قبل الإلغاء
    if (window.confirm('Are you sure you want to cancel this auction? This cannot be undone.')) {
      try {
        await cancelAuction(auctionId);
        fetchArtworks(); // إعادة تحميل القائمة لإظهار التغيير
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel auction.');
      }
    }


    useEffect(() => {
      fetchArtworks();
    }, []);

    const handleOpenModal = (artwork) => {
      setSelectedArtwork(artwork);
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedArtwork(null);
    };

    const handleAuctionCreated = () => {
      handleCloseModal();
      fetchArtworks(); // إعادة تحميل القائمة لتحديث الحالة
    };

    if (loading) return <p>Loading your artworks...</p>;
    // ...

    return (
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-gray-700">My Artworks</h4>
        {artworks.length === 0 ? (
          <p className="text-gray-500">You haven't added any artwork yet.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <h5 className="font-bold text-gray-800">{artwork.title}</h5>
                <p className="text-sm text-gray-600">Status: <span className="font-semibold">{artwork.status}</span></p>
              </div>
              {artwork.status === 'DRAFT' && (
                <button onClick={() => handleOpenModal(artwork)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                  Start Auction
                </button>
              )}

              {artwork.status === 'IN_AUCTION' && (
              <button onClick={() => handleCancelAuction(artwork.auction.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                Cancel Auction
              </button>
            )}
            </div>
          ))
        )}

        {selectedArtwork && (
          <StartAuctionModal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            artwork={selectedArtwork}
            onAuctionCreated={handleAuctionCreated}
          />
        )}
      </div>
    );
  }

  export default MyArtworksList;