import { useState, useEffect } from 'react';
import { fetchAllAuctions } from './services/api'; // استيراد الدالة
import './App.css'; // يمكنك تعديل التنسيقات لاحقًا

function App() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAuctions = async () => {
      try {
        setLoading(true);
        const response = await fetchAllAuctions();
        setAuctions(response.data.auctions); // البيانات موجودة في response.data.auctions
        setError(null);
      } catch (err) {
        setError('Failed to fetch auctions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getAuctions();
  }, []); // [] تعني أن هذا التأثير سيعمل مرة واحدة فقط عند تحميل المكون

  return (
    <div className="App">
      <header className="App-header">
        <h1>Art Auction Platform</h1>
      </header>
      <main>
        <h2>Live Auctions</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="auction-list">
          {auctions.map((auction) => (
            <div key={auction.id} className="auction-card">
              <img src={auction.artwork.imageUrl} alt={auction.artwork.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <h3>{auction.artwork.title}</h3>
              <p>by {auction.artwork.student.name}</p>
              <p>Current Price: {auction.currentPrice} SAR</p>
              <p>Ends at: {new Date(auction.endTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;