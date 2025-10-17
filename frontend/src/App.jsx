import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// استيراد المكونات والتخطيطات
import UnifiedSidebar from './components/UnifiedSidebar';
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
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfileEditor from './components/ProfileEditor';
import PasswordEditor from './components/PasswordEditor';
import MyArtworksList from './components/MyArtworksList';
import WonArtworks from './components/WonArtworks';
import ActiveBids from './components/ActiveBids';
import Header from "./components/Header";

function App() {
  return (
    <div className="bg-orange-50 min-h-screen" dir="rtl">
      <Toaster position="top-center" />
      <Header />
      <UnifiedSidebar /> {/* الشريط الجانبي الثابت لسطح المكتب */}

      {/* المحتوى الرئيسي يأخذ هامشًا لترك مساحة للشريط الجانبي */}
      <main className="transition-all duration-300 md:mr-64 pb-24 md:pb-8 pt-8 px-4">
        <Routes>
          {/* ... (كل مساراتك تبقى كما هي) ... */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/artworks/new" element={<ProtectedRoute roles={["STUDENT"]}><CreateArtworkPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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

      <BottomNav /> {/* الشريط السفلي للجوال */}
    </div>
  );
}

export default App;