import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from './src/context/AuthContext';

// استيراد المكونات والتخطيطات
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import ArtistsPage from "./pages/ArtistsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import ProfileEditor from './components/ProfileEditor';
import PasswordEditor from './components/PasswordEditor';
import MyArtworksList from './components/MyArtworksList';
import WonArtworks from './components/WonArtworks';
import ActiveBids from './components/ActiveBids';
import MobileMenu from './components/MobileMenu';
import { FiMenu } from 'react-icons/fi';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // 2. الحالة الافتراضية "مفتوح"

  // const toggleSidebar = () => {
  //   setSidebarOpen(!isSidebarOpen);
  // };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="bg-orange-50 min-h-screen" dir="rtl">
      <Toaster position="top-center" />
      {/* <Header toggleSidebar={toggleSidebar} /> */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} /> {/* Mobile-only menu */}


      <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
            <FiMenu size={24} className="text-gray-600" />
          </button>
          <Link to="/">
            <img src="/logo.svg" alt="Fanan Logo" className="h-14" />
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className="w-10 h-10">
            {user && (
              <img
                src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=f97316&size=128`}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </Link>
        </div>
      </header>

      {/* المحتوى الرئيسي الآن يأخذ هامشًا ديناميكيًا */}
      <main className={`transition-all duration-300 pb-24 md:pb-8 pt-24 md:pt-8 px-4 ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
        <Routes>
          {/* المسارات العامة */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* المسارات المحمية */}
          <Route path="/artworks/new" element={<ProtectedRoute roles={["STUDENT"]}><CreateArtworkPage /></ProtectedRoute>} />

          <Route path="/dashboard">
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="password" element={<PasswordEditor />} />
            <Route path="my-artworks" element={<MyArtworksList />} />
            <Route path="won-auctions" element={<WonArtworks />} />
            <Route path="active-bids" element={<ActiveBids />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;