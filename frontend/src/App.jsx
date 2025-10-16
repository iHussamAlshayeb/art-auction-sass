import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FiMenu, FiX } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

// استيراد الصفحات والمكونات
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import ArtistsPage from "./pages/ArtistsPage";
import GalleryPage from "./pages/GalleryPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import BottomNav from './components/BottomNav';
import FloatingActionButton from './components/FloatingActionButton';
import DashboardLayout from "./layouts/DashboardLayout";

// مكونات لوحة التحكم المتداخلة
import ProfileEditor from './components/ProfileEditor';
import PasswordEditor from './components/PasswordEditor';
import MyArtworksList from './components/MyArtworksList';
import WonArtworks from './components/WonArtworks';
import ActiveBids from './components/ActiveBids';


function App() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-orange-50">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-4 h-24">

          {/* تخطيط الجوال (يختفي على الشاشات الكبيرة) */}
          <div className="md:hidden grid grid-cols-3 w-full items-center h-full">
            <div className="flex justify-start">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
            <div className="flex justify-center">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
              </Link>
            </div>
            <div className="flex justify-end"></div> {/* فراغ للموازنة */}
          </div>

          {/* تخطيط سطح المكتب (يظهر على الشاشات الكبيرة) */}
          <nav className="hidden md:flex w-full justify-between items-center h-full">
            <Link to="/">
              <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/gallery" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">المعرض</Link>
              <Link to="/artists" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">الفنانون</Link>
              {user ? (
                <>
                  {user.role === 'ADMIN' && (<Link to="/admin" className="font-bold text-red-500 hover:text-red-700">لوحة الإدارة</Link>)}
                  <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 font-medium">لوحة التحكم</Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-orange-600 font-medium">تسجيل الدخول</Link>
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all">إنشاء حساب</Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* القائمة المنسدلة للجوال */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg py-4">
            <div className="flex flex-col items-center gap-4">
              <Link to="/gallery" className="text-gray-700 hover:text-orange-600 font-medium w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>المعرض</Link>
              <Link to="/artists" className="text-gray-700 hover:text-orange-600 font-medium w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>الفنانون</Link>
              {user ? (
                <>
                  {user.role === 'ADMIN' && (<Link to="/admin" className="font-bold text-red-500 hover:text-red-700 w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>لوحة الإدارة</Link>)}
                  <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 font-medium w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>لوحة التحكم</Link>
                  <div onClick={() => setIsMenuOpen(false)}><LogoutButton /></div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-orange-600 font-medium w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full shadow-md w-auto" onClick={() => setIsMenuOpen(false)}>إنشاء حساب</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow overflow-y-auto container mx-auto px-4 pb-24 pt-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="password" element={<PasswordEditor />} />
            <Route path="my-artworks" element={<MyArtworksList />} />
            <Route path="won-auctions" element={<WonArtworks />} />
            <Route path="active-bids" element={<ActiveBids />} />
          </Route>

          <Route path="/artworks/new" element={<ProtectedRoute roles={["STUDENT"]}><CreateArtworkPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
        </Routes>
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}

export default App;

