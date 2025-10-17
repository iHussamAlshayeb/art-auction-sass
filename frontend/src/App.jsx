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
import Sidebar from "./components/Sidebar";

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
      <Sidebar />

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
