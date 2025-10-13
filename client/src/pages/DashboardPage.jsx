import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MyArtworksList from '../components/MyArtworksList';
import ActiveBids from '../components/ActiveBids';
import WonArtworks from '../components/WonArtworks';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-3xl font-bold text-gray-800">My Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Welcome back! Your role is: <span className="font-semibold text-indigo-600 capitalize">{user.role.toLowerCase()}</span>
        </p>
      </div>

      {user.role === 'STUDENT' && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">Student Actions</h3>
            <Link to="/artworks/new">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">
                + Add New Artwork
              </button>
            </Link>
          </div>
          <MyArtworksList />
        </div>
      )}

      {user.role === 'BUYER' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <WonArtworks />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ActiveBids />
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;