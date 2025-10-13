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
// import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-100 min-h-screen">
      <SsoHandler />
      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          {/* الشعار */}
          <img src="/logo.svg" alt="Logo" className="h-20 w-full" />
          <Link
            to="/"
            className="text-2xl font-extrabold text-orange-600 hover:text-orange-700 transition-colors tracking-wide"
          >
            Art Auction
          </Link>

          {/* الروابط */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  لوحة التحكم
                </Link>
                <LogoutButton />
              </>
            ) : (
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

      <main className="container mx-auto p-4 md:p-8">
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
