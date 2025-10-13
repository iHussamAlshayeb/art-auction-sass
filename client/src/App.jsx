import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

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
// import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-100 min-h-screen">
      <SsoHandler />
      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          {/* الشعار */}
          
          <Link
            to="/">
            <img src="/logo.svg" alt="Logo" className="h-20 w-20" />
          </Link>

          {/* الروابط */}
          <div className="flex items-center gap-4">
              {user && (
              <>
                {/* الرابط الجديد: يظهر فقط إذا كان المستخدم ADMIN */}
                {user.role === 'ADMIN' && (
                   <Link to="/admin" className="font-bold text-red-500 hover:text-red-700">لوحة التحكم</Link>
                )}
                <Link to="/dashboard">ملفي الشخصي</Link>
                <LogoutButton />
              </>
            )} : (
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

      <main className="container mx-auto px-4 pb-4 md:px-8 md:pb-8 pt-32">
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
