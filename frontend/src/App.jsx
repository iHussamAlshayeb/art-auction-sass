import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// استيراد مكونات التخطيط الرئيسية
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingActionButton from "./components/FloatingActionButton";

// استيراد الصفحات
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import ArtistsPage from "./pages/ArtistsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

// استيراد تخطيط ومكونات لوحة التحكم
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfileEditor from './components/ProfileEditor';
import PasswordEditor from './components/PasswordEditor';
import MyArtworksList from './components/MyArtworksList';
import WonArtworks from './components/WonArtworks';
import ActiveBids from './components/ActiveBids';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // الحالة الافتراضية "مفتوح"

  // دالة لتبديل حالة القائمة الجانبية
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-orange-50 min-h-screen" dir="rtl">
      <Toaster position="top-center" />

      {/* 1. الشريط العلوي والقائمة الجانبية (لجميع الشاشات) */}
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 2. المحتوى الرئيسي مع هامش ديناميكي */}
      <main className={`transition-all duration-300 pb-24 md:pb-8 pt-24 md:pt-20 px-4 ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
        <div className="container mx-auto">
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

            {/* مسارات لوحة التحكم الآن مستقلة */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileEditor /></ProtectedRoute>} />
            <Route path="/dashboard/password" element={<ProtectedRoute><PasswordEditor /></ProtectedRoute>} />
            <Route path="/dashboard/my-artworks" element={<ProtectedRoute roles={["STUDENT"]}><MyArtworksList /></ProtectedRoute>} />
            <Route path="/dashboard/won-auctions" element={<ProtectedRoute roles={["STUDENT"]}><WonArtworks /></ProtectedRoute>} />
            <Route path="/dashboard/active-bids" element={<ProtectedRoute roles={["STUDENT"]}><ActiveBids /></ProtectedRoute>} />

            {/* مسار لوحة تحكم المسؤول */}
            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>

      {/* 3. مكونات تظهر فقط في أماكن محددة */}
      <FloatingActionButton /> {/* يظهر فقط على سطح المكتب للطلاب */}
      <BottomNav /> {/* يظهر فقط على الجوال */}
    </div>
  );
}

export default App;