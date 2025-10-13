import { useState, useEffect } from 'react';
import { fetchAllAuctions } from '../services/api';
import { Link } from 'react-router-dom';

function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // This is the function that fetches the data from the API
  const getAuctions = async () => {
    try {
      setLoading(true);
      const params = { sortBy, search: searchTerm };
      const response = await fetchAllAuctions(params);
      setAuctions(response.data.auctions);
      setError(null);
    } catch (err) {
      // ## MODIFY THIS BLOCK ##
      if (err.code === 'ECONNABORTED') {
        setError('The server is taking too long to respond. Please wait a moment and refresh the page.');
      } else {
        setError('Failed to fetch auctions.');
      }
      console.error(err);
      // ## END MODIFICATION ##
    } finally {
      setLoading(false);
    }
  };

  // Run once when the component loads, and again when sortBy changes
  useEffect(() => {
    getAuctions();
  }, [sortBy]);

  // It runs when the search form is submitted
  const handleSearch = (e) => {
    e.preventDefault();
    getAuctions(); // Re-fetch the auctions with the new search term
  };

   return (
    // لم نعد بحاجة لـ <main> هنا لأن <App> يوفرها
    <div>
      {/* قسم الفلاتر والبحث داخل بطاقة خاصة به */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Your Masterpiece</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="flex-grow w-full sm:w-auto">
            <input 
              type="text"
              placeholder="Search by artwork title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </form>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="w-full sm:w-auto p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="newest">Newest First</option>
            <option value="ending_soon">Ending Soon</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading auctions...</p>}
      {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

      {/* استخدام Grid لعرض الكروت بشكل منظم */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {!loading && auctions.map((auction) => (
          <Link key={auction.id} to={`/auctions/${auction.id}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
              <div className="relative">
                <img src={auction.artwork.imageUrl} alt={auction.artwork.title} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">{auction.artwork.title}</h3>
                <p className="text-sm text-gray-600 mb-3">by {auction.artwork.student.name}</p>
                
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-gray-500">Current Price</p>
                  <p className="text-xl font-bold text-indigo-600">{auction.currentPrice} SAR</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {!loading && auctions.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-2xl">No auctions found.</p>
          <p>Try adjusting your search or check back later!</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;