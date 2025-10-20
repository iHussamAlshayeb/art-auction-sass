import { useState, useEffect } from 'react';
import { getMyArtworks, cancelAuction } from '../services/api';
import StartAuctionModal from './StartAuctionModal';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

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
      setError('فشل في تحميل أعمالك الفنية.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAuction = async (auctionId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا المزاد؟')) {
      try {
        await cancelAuction(auctionId);
        toast.success("تم إلغاء المزاد بنجاح.");
        fetchArtworks();
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل في إلغاء المزاد.');
      }
    }
  };

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
    toast.success("تم بدء المزاد بنجاح!");
    fetchArtworks();
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-2xl font-bold text-neutral-900">
          أعمالي الفنية
        </h3>
        <Link to="/artworks/new">
          <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200">
            + إضافة عمل فني جديد
          </button>
        </Link>
      </div>

      <div className="border-t border-neutral-200 pt-4 space-y-4">
        {artworks.length === 0 ? (
          <p className="text-neutral-700 text-center py-4">لم تقم بإضافة أي أعمال فنية بعد.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork.id} className="bg-primary/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h5 className="font-bold text-neutral-900">{artwork.title}</h5>
                <p className="text-sm text-neutral-700">الحالة: <span className="font-semibold">{artwork.status}</span></p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {(artwork.status === 'DRAFT' || artwork.status === 'ENDED') && (
                  <button onClick={() => handleOpenModal(artwork)} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    {artwork.status === 'DRAFT' ? 'بدء المزاد' : 'إعادة المزاد'}
                  </button>
                )}
                {artwork.status === 'IN_AUCTION' && artwork.auction && (
                  <button onClick={() => handleCancelAuction(artwork.auction.id)} className="w-full bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    إلغاء المزاد
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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