import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';


// استيراد الصفحات والمكونات
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import SsoHandler from "./components/SsoHandler";
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const { user } = useAuth();

  return (
    <div className="bg-orange-50 min-h-screen">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <SsoHandler />
      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto p-4 flex justify-between items-center h-24">
          {/* الشعار (أصبح رابطًا) */}
          <Link to="/">
            <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
          </Link>

          {/* الروابط */}
          <div className="flex items-center gap-6">
            {/* --== تم إصلاح الخطأ المنطقي هنا ==-- */}
            {user ? (
              // حالة المستخدم المسجل دخوله
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="font-bold text-red-500 hover:text-red-700 transition-colors">لوحة الإدارة</Link>
                )}
                <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">الملف الشخصي</Link>
                <LogoutButton />
              </>
            ) : (
              // حالة الزائر
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </nav>
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
        </Routes>
      </main>
    </div>
  );
}

export default App;