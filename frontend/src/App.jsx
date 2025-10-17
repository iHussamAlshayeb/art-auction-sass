import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// الصفحات
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import ArtistsPage from "./pages/ArtistsPage";
import GalleryPage from "./pages/GalleryPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import BottomNav from "./components/BottomNav";
import FloatingActionButton from "./components/FloatingActionButton";
import DashboardLayout from "./layouts/DashboardLayout";

import ProfileEditor from "./components/ProfileEditor";
import PasswordEditor from "./components/PasswordEditor";
import MyArtworksList from "./components/MyArtworksList";
import WonArtworks from "./components/WonArtworks";
import ActiveBids from "./components/ActiveBids";

function App() {
  const { user } = useAuth();
  const [activeLink, setActiveLink] = useState("/");

  const navLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/gallery", label: "المعرض" },
    { to: "/artists", label: "الفنانون" },
  ];

  return (
    <div className="flex h-screen bg-orange-50">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* ======= الشريط الجانبي (يظهر فقط في سطح المكتب) ======= */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 shadow-sm fixed right-0 top-0 bottom-0 z-30">
        <div className="flex flex-col h-full">
          {/* الشعار */}
          <div className="flex justify-center py-6 border-b">
            <Link to="/" onClick={() => setActiveLink("/")}>
              <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
            </Link>
          </div>

          {/* الروابط */}
          <nav className="flex flex-col flex-grow p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setActiveLink(link.to)}
                className={`rounded-lg px-4 py-2 font-medium transition-all ${activeLink === link.to
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`rounded-lg px-4 py-2 font-medium transition-all ${activeLink === "/dashboard"
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  onClick={() => setActiveLink("/dashboard")}
                >
                  لوحة التحكم
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className={`rounded-lg px-4 py-2 font-medium transition-all ${activeLink === "/admin"
                        ? "bg-red-100 text-red-600"
                        : "text-red-500 hover:bg-red-50 hover:text-red-700"
                      }`}
                    onClick={() => setActiveLink("/admin")}
                  >
                    لوحة الإدارة
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* تسجيل الدخول / الخروج */}
          <div className="border-t p-4">
            {user ? (
              <LogoutButton />
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-600 font-medium text-center"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full text-center shadow-md transition-all"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ======= المحتوى الرئيسي ======= */}
      <main className="flex-1 overflow-y-auto md:mr-64 pb-24 pt-8 px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="password" element={<PasswordEditor />} />
            <Route path="my-artworks" element={<MyArtworksList />} />
            <Route path="won-auctions" element={<WonArtworks />} />
            <Route path="active-bids" element={<ActiveBids />} />
          </Route>

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
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* الجوال فقط */}
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}

export default App;
