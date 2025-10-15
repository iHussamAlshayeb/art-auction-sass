import { useState, useEffect } from 'react';
import { getMyArtworks, cancelAuction } from '../services/api';
import StartAuctionModal from './StartAuctionModal';
import { Link } from 'react-router-dom'; // <-- 1. استيراد Link

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
        fetchArtworks();
      } catch (error) {
        alert(error.response?.data?.message || 'فشل في إلغاء المزاد.');
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
    fetchArtworks();
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 space-y-6">
      {/* --== 2. إضافة القسم العلوي هنا ==-- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-2xl font-bold text-gray-800">
          أعمالي الفنية
        </h3>
        <Link to="/artworks/new">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200">
            + إضافة عمل فني جديد
          </button>
        </Link>
      </div>

      {/* --== 3. قائمة الأعمال الفنية ==-- */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        {artworks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لم تقم بإضافة أي أعمال فنية بعد.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork.id} className="bg-orange-50/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <h5 className="font-bold text-gray-800">{artwork.title}</h5>
                <p className="text-sm text-gray-600">الحالة: <span className="font-semibold">{artwork.status}</span></p>
              </div>
              <div className="flex gap-2">
                {artwork.status === 'DRAFT' && (
                  <button onClick={() => handleOpenModal(artwork)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    بدء المزاد
                  </button>
                )}
                {artwork.status === 'ENDED' && (
                  <button onClick={() => handleOpenModal(artwork)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    إعادة المزاد
                  </button>
                )}
                {artwork.status === 'IN_AUCTION' && artwork.auction && (
                  <button onClick={() => handleCancelAuction(artwork.auction.id)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
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

