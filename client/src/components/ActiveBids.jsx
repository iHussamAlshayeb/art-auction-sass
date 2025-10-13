import { useState, useEffect } from 'react';
import { getMyActiveBids } from '../services/api';
import { Link } from 'react-router-dom';

function ActiveBids() {
  const [bids, setBids] = useState([]);
  useEffect(() => {
    getMyActiveBids().then(res => setBids(res.data.auctions));
  }, []);

  if (bids.length === 0) return <p>You are not currently bidding on any active auctions.</p>;

 return (
    <div className="space-y-4">
      <h4 className="text-xl font-semibold text-gray-700">Auctions You're Bidding On</h4>
      {bids.map(auction => (
        <div key={auction.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <h5 className="font-bold text-gray-800">{auction.artwork.title}</h5>
            <p className="text-sm text-gray-600">Current Price: <span className="font-semibold">{auction.currentPrice} SAR</span></p>
          </div>
          <Link to={`/auctions/${auction.id}`}>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
              Go to Auction
            </button>
          </Link>
        </div>
      ))}
    </div>
);
}
export default ActiveBids;