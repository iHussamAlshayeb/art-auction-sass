import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import { FiMenu, FiX } from 'react-icons/fi';

// استيراد الصفحات والمكونات
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import DashboardLayout from './layouts/DashboardLayout'; // استيراد التخطيط الجديد
import ProfileEditor from './components/ProfileEditor';
import PasswordEditor from './components/PasswordEditor';
import MyArtworksList from './components/MyArtworksList';
import WonArtworks from './components/WonArtworks';
import ActiveBids from './components/ActiveBids';
import FloatingActionButton from './components/FloatingActionButton';
import GalleryPage from './pages/GalleryPage';
import ArtistsPage from './pages/ArtistsPage';
import BottomNav from './components/BottomNav';

function App() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-orange-50">
      <Toaster position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-40">

        <nav className="hidden md:flex w-full justify-between items-center h-full">
          {/* الشعار */}
          <Link to="/">
            <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
          </Link>

          {/* روابط الشاشات الكبيرة */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/gallery" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">المعرض</Link>
            <Link to="/artists" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">الفنانون</Link>
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="font-bold text-red-500 hover:text-red-700">لوحة الإدارة</Link>
                )}
                <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 font-medium">لوحة التحكم</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-orange-600 font-medium">تسجيل الدخول</Link>
                <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* زر قائمة الهامبرغر للشاشات الصغيرة */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </nav>

        {/* القائمة المنسدلة للشاشات الصغيرة */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg py-4">
            <div className="flex flex-col items-center gap-4">
              <Link to="/gallery" className="text-gray-700 hover:text-orange-600 font-medium" onClick={() => setIsMenuOpen(false)}>المعرض</Link>
              <Link to="/artists" className="text-gray-700 hover:text-orange-600 font-medium" onClick={() => setIsMenuOpen(false)}>الفنانون</Link>
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="font-bold text-red-500 hover:text-red-700" onClick={() => setIsMenuOpen(false)}>لوحة الإدارة</Link>
                  )}
                  <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 font-medium" onClick={() => setIsMenuOpen(false)}>لوحة التحكم</Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-orange-600 font-medium" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
                  <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full shadow-md w-auto" onClick={() => setIsMenuOpen(false)}>
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 pb-8 md:px-8 md:pb-12 pt-32">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artworks/new"
            element={
              <ProtectedRoute roles={["STUDENT"]}>
                <CreateArtworkPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route index element={<DashboardPage />} /> {/* الصفحة الرئيسية للوحة التحكم */}
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="password" element={<PasswordEditor />} />
            <Route path="my-artworks" element={<MyArtworksList />} />
            <Route path="won-auctions" element={<WonArtworks />} />
            <Route path="active-bids" element={<ActiveBids />} />
          </Route>
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/artists" element={<ArtistsPage />} />

        </Routes>
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}

export default App;