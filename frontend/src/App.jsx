import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { FiMenu } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { connectSocket, getSocket } from "./socket";

// 🧩 استيراد المكونات والتخطيطات
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import MobileMenu from "./components/MobileMenu";
import FloatingActionButton from "./components/FloatingActionButton";
import ProtectedRoute from "./components/ProtectedRoute";

// 🖼️ الصفحات العامة
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import ArtistsPage from "./pages/ArtistsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

// 🎨 الصفحات المحمية (الطالب)
import DashboardPage from "./pages/DashboardPage";
import CreateArtworkPage from "./pages/CreateArtworkPage";
import ProfileEditor from "./components/ProfileEditor";
import PasswordEditor from "./components/PasswordEditor";
import MyArtworksList from "./components/MyArtworksList";
import WonArtworks from "./components/WonArtworks";
import ActiveBids from "./components/ActiveBids";
import NotificationsPage from "./pages/NotificationsPage";

// 🧑‍💼 صفحة المسؤول
import AdminDashboardPage from "./pages/AdminDashboardPage";

// 💳 صفحات الدفع (جديدة)
function PaymentSuccessPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-green-600 mb-4">✅ تم الدفع بنجاح</h1>
      <p className="text-neutral-700 mb-6">شكراً لدعمك للفنانين الطلاب ❤️</p>
      <Link
        to="/dashboard/won-auctions"
        className="text-primary font-semibold underline"
      >
        عرض المشتريات
      </Link>
    </div>
  );
}

function PaymentFailedPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-red-600 mb-4">❌ فشلت عملية الدفع</h1>
      <p className="text-neutral-700 mb-6">حدث خطأ أثناء تنفيذ العملية.</p>
      <Link to="/dashboard/won-auctions" className="text-primary underline">
        العودة إلى المشتريات
      </Link>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // ⚡️ تفعيل Socket.io عند تسجيل الدخول
  useEffect(() => {
    if (!user) return;

    connectSocket(user.token);
    const socket = getSocket();

    socket.on("connect", () => console.log("🟢 Socket connected"));
    socket.on("disconnect", () => console.log("🔴 Socket disconnected"));

    // 📩 إشعار جديد
    socket.on("notification:new", (data) => {
      toast.success(data.message || "إشعار جديد 📬");
    });

    // 💳 إشعار نجاح الدفع
    socket.on("payment:success", (data) => {
      toast.success("✅ تم تأكيد الدفع بنجاح!");
    });

    // 💰 تحديث فوري للمزايدة (اختياري)
    socket.on("priceUpdate", (data) => {
      console.log("📈 تحديث سعر المزاد:", data);
    });

    // 💥 إشعار التفوق في المزايدة
    socket.on("outbid", (data) => {
      toast(data.message || "تمت المزايدة بسعر أعلى منك!", { icon: "⚠️" });
    });

    return () => {
      socket.off("notification:new");
      socket.off("payment:success");
      socket.off("priceUpdate");
      socket.off("outbid");
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="bg-orange-50 min-h-screen" dir="rtl">
      <Toaster position="top-center" />

      {/* ===== الشريط الجانبي (سطح المكتب) ===== */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* ===== القائمة الجانبية (الجوال) ===== */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* ===== الهيدر للجوال ===== */}
      <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
            <FiMenu size={24} className="text-gray-600" />
          </button>
          <Link to="/">
            <img src="/logo.svg" alt="Fanan Logo" className="h-14" />
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className="w-10 h-10">
            {user && (
              <img
                src={
                  user.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=ffedd5&color=f97316&size=128`
                }
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </Link>
        </div>
      </header>

      {/* ===== المحتوى الرئيسي ===== */}
      <main
        className={`transition-all duration-300 pb-24 md:pb-8 pt-24 md:pt-20 px-4 ${isSidebarOpen ? "md:mr-64" : "md:mr-20"
          }`}
      >
        <div className="container mx-auto">
          <Routes>
            {/* 🏠 المسارات العامة */}
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/students/:id" element={<StudentProfilePage />} />
            <Route path="/auctions/:id" element={<AuctionDetailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 🎨 المسارات المحمية (الطالب) */}
            <Route
              path="/artworks/new"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <CreateArtworkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <ProfileEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/password"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <PasswordEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-artworks"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <MyArtworksList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/won-auctions"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <WonArtworks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/active-bids"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <ActiveBids />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute roles={["STUDENT"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* 🧾 صفحات الدفع */}
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />

            {/* 🧑‍💼 لوحة تحكم المسؤول */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>

      {/* 🚀 المكونات السفلية */}
      <BottomNav />
      {user && <FloatingActionButton />}
    </div>
  );
}

export default App;
