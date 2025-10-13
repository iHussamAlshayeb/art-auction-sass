import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchAuctionById, fetchAuctionBids } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BiddingForm from '../components/BiddingForm';
import AuctionTimer from '../components/AuctionTimer';
import BidHistory from '../components/BidHistory';
import CountdownTimer from '../components/CountdownTimer';


const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

function AuctionDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]); 

const getBids = async (auctionId) => {
    try {
      const response = await fetchAuctionBids(auctionId);
      setBids(response.data.bids);
    } catch (error) {
      console.error("Failed to fetch bids", error);
    }
  };

useEffect(() => {
    fetchAuctionById(id)
      .then(response => setAuction(response.data.auction))
      .finally(() => setLoading(false));

      const fetchInitialData = async () => {
      try {
        const auctionRes = await fetchAuctionById(id);
        setAuction(auctionRes.data.auction);
        await getBids(id);
      } catch (error) {
        console.error("Failed to load auction page", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinAuctionRoom', id);
    });

    socket.on('priceUpdate', (data) => {
      setAuction(prevAuction => ({
        ...prevAuction,
        currentPrice: data.newPrice,
      }));
      getBids(id);
    });
    
    socket.on('outbid', (data) => {
      alert(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  if (loading) return <p className="text-center p-10">Loading auction details...</p>;
  if (!auction) return <p className="text-center p-10">Auction not found.</p>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column: Image */}
      <div className="w-full">
        <img 
          src={auction.artwork.imageUrl} 
          alt={auction.artwork.title} 
          className="w-full h-auto object-cover rounded-lg shadow-xl" 
        />
      </div>

      {/* Right Column: Details */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{auction.artwork.title}</h1>
          <p className="text-lg text-gray-600 mt-2">by {auction.artwork.student.name}</p>
        </div>

        <p className="text-gray-700 leading-relaxed">{auction.artwork.description}</p>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-lg">Current Price</span>
            <span className="text-4xl font-bold text-indigo-600">{auction.currentPrice.toFixed(2)} SAR</span>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Auction ends: {new Date(auction.endTime).toLocaleString()}
          </div>

          {/* <AuctionTimer endTime={auction.endTime} /> */}
          <div>
            <h4 className="text-center text-gray-500 text-sm mb-2">Auction Ends In</h4>
            <CountdownTimer endTime={auction.endTime} />
          </div>
          {/* Bidding Form */}
          {user && user.role === 'BUYER' ? (
            <BiddingForm auctionId={id} currentPrice={auction.currentPrice} />
          ) : (
            <div className="mt-6 text-center text-gray-600 bg-gray-100 p-4 rounded-md">
              <p>Please <Link to="/login" className="font-bold text-indigo-600">log in</Link> as a buyer to place a bid.</p>
            </div>
          )}

            <BidHistory bids={bids} />
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;