import { useState, useEffect } from 'react';
import { getMyActiveBids } from '../../services/api';
import { Link } from 'react-router-dom';
// import Spinner from './Spinner';
// import { Spinner } from "../components";
import { Spinner } from "../";


function ActiveBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const res = await getMyActiveBids();
        setBids(res.data.auctions);
        setError(null);
      } catch (err) {
        setError("فشل في تحميل عروضك النشطة.");
        console.error("Failed to fetch active bids", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-3">
        عروضك النشطة
      </h3>
      {bids.length === 0 ? (
        <p className="text-neutral-700 text-center py-4">أنت لا تزايد حاليًا على أي مزادات نشطة.</p>
      ) : (
        <div className="space-y-4">
          {bids.map(auction => (
            <div key={auction.id} className="bg-primary/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h5 className="font-bold text-neutral-900">{auction.artwork.title}</h5>
                <p className="text-sm text-neutral-700">السعر الحالي: <span className="font-semibold">{auction.currentPrice} ريال</span></p>
              </div>
              <Link to={`/auctions/${auction.id}`} className="w-full sm:w-auto">
                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                  الانتقال للمزاد
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default ActiveBids;