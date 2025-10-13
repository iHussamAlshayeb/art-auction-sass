import { Routes, Route, Link, } from 'react-router-dom';
import { useAuth } from './context/AuthContext';


import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateArtworkPage from './pages/CreateArtworkPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutButton from './components/LogoutButton';
import SsoHandler from './components/SsoHandler';
// import './App.css';

function App() {
  const { user } = useAuth();

  return (

    <div className="bg-gray-100 min-h-screen">
      <SsoHandler />
      <header className="bg-gray-800 text-white shadow-md">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-indigo-400 transition-colors">
            Art Auction
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">My Dashboard</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/artworks/new"
            element={<ProtectedRoute roles={['STUDENT']}><CreateArtworkPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
