import { useState, useEffect } from 'react';
import { getMyActiveBids } from '../services/api';
import { Link } from 'react-router-dom';

function ActiveBids() {
  const [bids, setBids] = useState([]);
  useEffect(() => {
    getMyActiveBids().then(res => setBids(res.data.auctions));
  }, []);

  if (bids.length === 0) {
    return <p className="text-gray-500 text-center py-4">أنت لا تزايد حاليًا على أي مزادات نشطة.</p>;
  }

  return (
    <div className="space-y-4">
      {bids.map(auction => (
        <div key={auction.id} className="bg-orange-50/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h5 className="font-bold text-gray-800">{auction.artwork.title}</h5>
            <p className="text-sm text-gray-600">السعر الحالي: <span className="font-semibold">{auction.currentPrice} ريال</span></p>
          </div>
          <Link to={`/auctions/${auction.id}`} className="w-full sm:w-auto">
            <button className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
              الانتقال للمزاد
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
export default ActiveBids;
