import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { FiMenu } from "react-icons/fi";

// المكونات
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import MobileMenu from "./components/MobileMenu";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingActionButton from "./components/FloatingActionButton";

// الصفحات
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
import ProfileEditor from "./components/ProfileEditor";
import PasswordEditor from "./components/PasswordEditor";
import MyArtworksList from "./components/MyArtworksList";
import WonArtworks from "./components/WonArtworks";
import ActiveBids from "./components/ActiveBids";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="bg-primary-50 min-h-screen font-sans text-gray-800" dir="rtl">
      <Toaster position="top-center" />

      {/* الشريط الجانبي */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* رأس الصفحة للجوال */}
      <header className="md:hidden bg-white/90 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-primary-600">
            <FiMenu size={24} />
          </button>
          <Link to="/">
            <img src="/logo.svg" alt="Fanan Logo" className="h-14" />
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className="w-10 h-10">
            {user && (
              <img
                src={
                  user.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=80CBC4&color=004D40&size=128`
                }
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-2 border-primary-300"
              />
            )}
          </Link>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main
        className={`transition-all duration-300 pb-24 md:pb-8 pt-24 md:pt-8 px-4 ${isSidebarOpen ? "md:mr-64" : "md:mr-20"
          }`}
      >
        <Routes>
          {/* مسارات عامة */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* مسارات محمية */}
          <Route
            path="/artworks/new"
            element={
              <ProtectedRoute roles={["STUDENT"]}>
                <CreateArtworkPage />
              </ProtectedRoute>
            }
          />

          <Route path="/dashboard">
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="password" element={<PasswordEditor />} />
            <Route path="my-artworks" element={<MyArtworksList />} />
            <Route path="won-auctions" element={<WonArtworks />} />
            <Route path="active-bids" element={<ActiveBids />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <BottomNav />
      <FloatingActionButton />
    </div>
  );
}

export default App;
